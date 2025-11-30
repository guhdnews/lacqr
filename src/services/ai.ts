import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../lib/firebase";
import { calculatePrice } from "../utils/pricingCalculator";
import { DEFAULT_MENU } from "../types/serviceSchema";
import type { ServiceSelection } from '../types/serviceSchema';
import { mapDetectionsToSelection, type GeminiAnalysis } from "../utils/aiMapping";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Placeholder - Update this after 'modal deploy'
const MODAL_ENDPOINT = "https://upfacedevelopment--lacqr-brain-analyze-image.modal.run";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY");

export async function analyzeImage(imageFile: File): Promise<ServiceSelection> {
  try {


    // 1. Upload to Firebase Storage

    const userId = auth.currentUser?.uid;

    // Rate Limiting Check
    if (userId) {
      const { doc, getDoc, setDoc, updateDoc, increment } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const usageRef = doc(db, 'users', userId, 'usage', 'daily');
      const usageSnap = await getDoc(usageRef);

      let currentCount = 0;

      if (usageSnap.exists()) {
        const data = usageSnap.data();
        if (data.date === today) {
          currentCount = data.count;
        } else {
          // Reset for new day
          await setDoc(usageRef, { date: today, count: 0 });
        }
      } else {
        await setDoc(usageRef, { date: today, count: 0 });
      }

      // Check User Subscription Status
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const isPro = userSnap.data()?.subscription === 'pro';

      if (!isPro && currentCount >= 5) {
        throw new Error("Daily scan limit reached (5/5). Upgrade to Pro for unlimited scans.");
      }

      // Increment count (optimistic)
      await updateDoc(usageRef, {
        count: increment(1),
        date: today // Ensure date is set
      });
    }

    const timestamp = Date.now();
    const storageRef = ref(storage, `scans/${userId || 'anonymous'}/${timestamp}.jpg`);

    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);


    // 2. Parallel Execution: Modal (YOLO/Florence) + Gemini (Vision)


    const modalResponse = await fetch(MODAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: downloadURL })
    });

    if (!modalResponse.ok) {
      console.error(`❌ Modal Error: ${modalResponse.status} ${modalResponse.statusText}`);
      // Fallback: Proceed with empty Modal result, relying on Gemini
    }

    const modalResult = modalResponse.ok ? await modalResponse.json() : {};


    // Safe access to Modal data
    const florenceData = modalResult.florence || {};
    const objectData = modalResult.objects || [];

    const geminiPromise = analyzeWithGemini(imageFile, florenceData);
    const geminiResult = await geminiPromise;


    // 3. Map Detections to Service Selection (Merging YOLO + Gemini)
    // Find nail plate for length calculation
    const nailPlate = objectData.find((obj: any) => obj.label === "nail_plate" || obj.label === "nail");
    const nailPlateBox = nailPlate ? nailPlate.box : undefined;

    const selection = mapDetectionsToSelection(objectData, nailPlateBox, geminiResult, florenceData);

    // 4. Calculate Price using Shared Calculator
    const priceResult = calculatePrice(selection, DEFAULT_MENU);
    const estimatedPrice = priceResult.total;

    // 5. Enrich Selection with Metadata
    return {
      ...selection,
      confidence: 0.95,
      reasoning: `Analyzed by Gemini & YOLO. Shape: ${selection.base.shape}. System: ${selection.base.system}. Detected ${modalResult.objects?.length || 0} objects.`,
      estimatedPrice: estimatedPrice,
      // Create a pricingDetails object that matches what the UI expects (simplified)
      pricingDetails: {
        totalPrice: estimatedPrice,
        breakdown: {
          basePrice: priceResult.breakdown.base,
          lengthCharge: priceResult.breakdown.length,
          densityCharge: priceResult.breakdown.bling,
          artTierCharge: priceResult.breakdown.art,
          materialCharge: 0, // Placeholder
          complexitySurcharge: priceResult.breakdown.complexitySurcharge
        },
        details: {
          lengthTier: selection.base?.length || 'Short',
          densityTier: selection.bling.density,
          artTier: selection.art.level || 'None',
          materialNotes: []
        }
      },
      modalResult: {
        ...modalResult,
        gemini_debug: geminiResult // Expose raw Gemini data for Admin Inspector
      },
      aiDescription: geminiResult?.vibe || `DEBUG ERROR: Gemini failed. Check logs.`
    };

  } catch (error: any) {
    console.error("❌ Analysis Failed:", error);
    // Return a valid selection with the ERROR as the description so the user can see it
    return {
      ...mapDetectionsToSelection([], undefined, undefined, undefined),
      confidence: 0,
      reasoning: "Analysis Failed",
      estimatedPrice: 0,
      pricingDetails: { totalPrice: 0, breakdown: { basePrice: 0, lengthCharge: 0, densityCharge: 0, artTierCharge: 0, materialCharge: 0, complexitySurcharge: 0 }, details: { lengthTier: "Short", densityTier: "None", artTier: "None", materialNotes: [] } },
      modalResult: {},
      aiDescription: `DEBUG ERROR: ${error.message || JSON.stringify(error)}`
    };
  }
}

async function analyzeWithGemini(file: File, florenceCaptions?: any): Promise<GeminiAnalysis | undefined> {
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest"
  ];

  let lastError: any = null;

  // Helper to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Trying Gemini Model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Convert file to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64Image = base64Data.split(',')[1];

      let prompt = `
        You are an expert Nail Technician and Pricing Specialist. 
        Analyze this nail art image with extreme attention to detail.
        `;

      if (florenceCaptions) {
        prompt += `
        Computer Vision Insights (Use these as hints for ART/TEXTURE, but IGNORE them for SHAPE):
        - Dense Caption: "${florenceCaptions.dense}"
        - Object Detection: "${JSON.stringify(florenceCaptions.od)}"
        *WARNING: The Computer Vision model often mistakes Coffin/Square for Stiletto. DO NOT TRUST IT FOR SHAPE. Use the Visual Rules below.*
        `;
      }

      prompt += `
        Provide a JSON response with the following fields:
        {
            "shape": "Coffin, Stiletto, Almond, Square, or Oval",
            "system": "Acrylic, Gel-X, Hard Gel, or Structure Gel (look for thickness/apex)",
            "vibe": "A detailed, factual visual description of the nails. Start with length and shape, then describe color, design, and texture. Do NOT use flowery or poetic language. (e.g. 'Long coffin nails painted in a pink and white ombre with silver chrome stars on the ring finger').",
            "art_notes": "List EVERY technique seen. Look for: 3d charms, hand painted character, french tip, ombre, encapsulated, chrome, cat eye, airbrush, blooming gel.",
            "estimated_length": "Short (sport), Medium, Long, XL, or XXL (extendo)",
            "estimated_time_minutes": 120,
            "foreign_work": "None, Foreign Fill, or Foreign Removal (look for growth gap at cuticle or lifting)"
        }
        IMPORTANT PRICING RULES:
        1. **ART LEVEL (INDUSTRY STANDARD TIERS):**
           - **Level 1 (Simple):** Solid color (including white), simple glitter, or 1-2 accent nails.
           - **Level 2 (Moderate):** French tip (must have distinct tip color), Ombre, Chrome, Cat Eye, or simple lines.
           - **Level 3 (Complex):** Intricate hand-painted art, 3D charms, blooming gel, or mixed media.
           - **Level 4 (Masterpiece):** Encapsulated art, heavy bling, detailed character art.
           *Rule: If the nail is ONE solid color (even white), it is Level 1. It is NOT French Tip unless there is a distinct line.*
        2. **LENGTH:** VISUAL RULE: Compare the free edge (tip) to the nail bed (pink part).
           - If free edge < 50% of nail bed = Short.
           - If free edge is ~50-80% of nail bed = Medium.
           - If free edge is ~100% (equal to) nail bed = Long.
           - If free edge is > 100% of nail bed = XL.
           - If free edge is > 150% of nail bed = XXL.
           - If shape is Stiletto/Duck, bias towards XL/XXL.
        3. **SHAPE (TIP GEOMETRY RULE):** Look at the *corners* of the tip.
           - **COFFIN:** Tapered sides but has **TWO SHARP CORNERS** at the tip (flat edge).
           - **STILETTO:** Tapered sides and comes to a **SINGLE SHARP POINT** (no flat edge).
           - **SQUARE:** Straight sides and **TWO SHARP CORNERS** (flat edge).
           - **ALMOND:** Tapered sides and **ROUNDED TIP** (no corners).
        4. **TIME:** Estimate the time for a **FAST, EFFICIENT** professional. 
           - If "intricate", "pattern", or "detailed" is present, time MUST be > 150 mins.
           - Do not pad the time, but do not undercharge for complexity.
        5. **FOREIGN WORK:** Look closely at the cuticle area. If there is a visible gap (growth) or lifting, mark as "Foreign Fill" or "Foreign Removal".
        6. **CONTEXT:** Trust the "Dense Caption" for PATTERNS (checkered, swirls) but IGNORE it for background/scene descriptions.
        7. **FOCUS:** Describe the nails FACTUALLY. Start with the physical attributes (shape, length) then move to the design details (color, pattern, texture). Avoid metaphors like 'winter wonderland' or 'sugarplum fairy'. Be precise and descriptive.
        `;

      const result = await model.generateContent([
        prompt,
        { inlineData: { data: base64Image, mimeType: file.type } }
      ]);
      const response = result.response;
      const text = response.text();

      // Robust JSON Extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      return JSON.parse(jsonMatch[0]) as GeminiAnalysis;

    } catch (e: any) {
      console.warn(`⚠️ Model ${modelName} failed:`, e.message);
      lastError = e;
      // Wait 1 second before trying next model (Backoff)
      await delay(1000);
    }
  }

  console.error("❌ All Gemini Models Failed:", lastError);
  // Return a dummy object with the error message so the user sees it
  return {
    shape: "", // Let aiMapping decide (will fallback to Florence)
    system: "",
    vibe: `⚠️ SYSTEM ERROR: All models failed. Last error: ${lastError?.message || JSON.stringify(lastError)}. API Key: Present. Falling back to Computer Vision.`,
    art_notes: "Analysis failed.",
    estimated_length: "",
    estimated_time_minutes: 0,
    foreign_work: "None"
  };
}

export async function recommendService(_file: File, _textInput?: string): Promise<any> {
  return {
    booking_codes: ["Consultation"],
    estimated_duration_minutes: 60,
    upsell_suggestion: "None",
    reasoning: "Service Sorter is being updated to new schema.",
    draft_reply: "Please contact us for a quote."
  };
}

export const AI_SERVICE = {
  analyzeImage,
  recommendService
};
