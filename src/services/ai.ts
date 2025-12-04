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

export async function analyzeImage(imageFile: File, mode: 'diagnostics' | 'design' = 'design'): Promise<ServiceSelection> {
  try {


    // 1. Upload to Firebase Storage

    // 1. Rate Limiting (Firestore) - DISABLED FOR TESTING
    /*
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const { doc, getDoc, setDoc, updateDoc, increment } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');

        const today = new Date().toISOString().split('T')[0];
        const usageRef = doc(db, 'users', userId, 'usage', 'daily');
        const usageSnap = await getDoc(usageRef);

        let currentCount = 0;
        if (usageSnap.exists()) {
          const data = usageSnap.data();
          if (data.date === today) currentCount = data.count;
          else await setDoc(usageRef, { date: today, count: 0 });
        } else {
          await setDoc(usageRef, { date: today, count: 0 });
        }

        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const isPro = userSnap.data()?.subscription === 'pro';

        if (!isPro && currentCount >= 5) {
           // throw new Error("Daily scan limit reached (5/5). Upgrade to Pro.");
        }

        await updateDoc(usageRef, { count: increment(1), date: today });
      }
    } catch (fsError: any) {
      // throw new Error(`FIRESTORE_ERROR: ${fsError.message}`);
      console.warn("Rate limit check failed:", fsError);
    }
    */

    // 2. Upload to Storage
    let downloadURL = "";
    let storageRef;
    let modalResult: any = {};
    try {
      const userId = auth.currentUser?.uid;
      const timestamp = Date.now();
      storageRef = ref(storage, `scans/${userId || 'anonymous'}/${timestamp}.jpg`);

      await uploadBytes(storageRef, imageFile);
      downloadURL = await getDownloadURL(storageRef);
    } catch (stError: any) {
      throw new Error(`STORAGE_ERROR: ${stError.message}`);
    }


    // 2. Parallel Execution: Modal (YOLO/Florence) + Gemini (Vision)


    try {
      const modalResponse = await fetch(MODAL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: downloadURL })
      });

      if (!modalResponse.ok) {
        console.error(`❌ Modal Error: ${modalResponse.status} ${modalResponse.statusText}`);
        // Fallback: Proceed with empty Modal result, relying on Gemini
      } else {
        modalResult = await modalResponse.json();
      }
    } catch (fetchError: any) {
      console.error("❌ Modal Fetch Failed (Network Error):", fetchError);
      // Fallback: Proceed with empty Modal result
    }


    // Safe access to Modal data
    const florenceData = modalResult.florence || {};
    const objectData = modalResult.objects || [];

    const geminiPromise = analyzeWithGemini(imageFile, mode, florenceData);
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
      reasoning: geminiResult?.reasoning_steps
        ? geminiResult.reasoning_steps.join('\n')
        : `Analyzed by Gemini & YOLO in ${mode} mode.`,
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
      aiDescription: geminiResult?.vibe || `DEBUG ERROR: Gemini failed. Check logs.`,
      visual_description: geminiResult?.vibe // Map for UI compatibility
    };

  } catch (error: any) {
    console.error("❌ Analysis Failed:", error);

    const errorMessage = `Analysis Error: ${error.message || "Unknown error occurred."}`;

    // Return a valid selection with the ERROR as the description so the user can see it
    return {
      ...mapDetectionsToSelection([], undefined, undefined, undefined),
      confidence: 0,
      reasoning: "Analysis Failed",
      estimatedPrice: 0,
      pricingDetails: { totalPrice: 0, breakdown: { basePrice: 0, lengthCharge: 0, densityCharge: 0, artTierCharge: 0, materialCharge: 0, complexitySurcharge: 0 }, details: { lengthTier: "Short", densityTier: "None", artTier: "None", materialNotes: [] } },
      modalResult: {},
      aiDescription: errorMessage,
      visual_description: errorMessage // Ensure it shows in UI
    };
  }
}

async function analyzeWithGemini(file: File, mode: 'diagnostics' | 'design', florenceCaptions?: any): Promise<GeminiAnalysis | undefined> {
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

      let prompt = "";

      if (mode === 'diagnostics') {
        prompt = `
        You are an expert Nail Technician specializing in Nail Health and Diagnostics.
        Analyze this image of a client's hand/nails to detect conditions and maintenance needs.
        
        Provide a JSON response with the following fields:
        {
            "reasoning_steps": [
                "Step 1: Check Growth - Look at the gap between cuticle and product...",
                "Step 2: Check Integrity - Look for lifting, cracks, or broken nails...",
                "Step 3: Check Skin Health - Look for dry cuticles, hangnails, or redness...",
                "Step 4: Recommend Services - Suggest fills, repairs, or treatments."
            ],
            "growth_weeks": 3, // Estimate weeks of growth based on gap size (0 if fresh, 2+ if gap visible)
            "repairs_needed": 1, // Count of broken or missing nails
            "conditions": ["4-week growth", "Broken index nail", "Dry cuticles", "Lifting detected", "Greenies (Pseudomonas) risk", "Trauma/Bruising"],
            "recommended_services": ["Rebalance/Fill", "Nail Repair", "Oil Treatment", "Deep Cuticle Clean", "IBX Treatment", "Soak Off"],
            "vibe": "Diagnostics Report: Detected 4-week growth and 1 broken nail. Cuticles appear dry. Lifting observed on middle finger.",
            // Fill these with defaults or detected values if applicable
            "shape": "Coffin", 
            "system": "Acrylic",
            "estimated_length": "Medium",
            "art_notes": "None",
            "foreign_work": "None"
        }
        
        CRITICAL: 
        - If you see green discoloration, flag "Greenies (Pseudomonas) risk".
        - If you see lifting (product separating from nail), flag "Lifting detected".
        - If cuticles are overgrown/dry, recommend "Deep Cuticle Clean".
        - If nails look weak/damaged, recommend "IBX Treatment".
        `;
      } else {
        // Design Mode (Original Prompt)
        prompt = `
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
            "reasoning_steps": [
                "Step 1: Analyze Shape - Looking at tip geometry...",
                "Step 2: SIDE WALL CHECK - Are the sides parallel (Square), tapering in (Coffin/Stiletto), or flaring out (Duck)?",
                "Step 3: WIDTH CHECK - Compare the width of the tip to the width of the cuticle. Is the tip WIDER? (Yes = Duck/Flare)",
                "Step 4: Analyze Length - Comparing free edge to nail bed (Tip > 1.3x Bed = XXL)...",
                "Step 5: Analyze Art - Listing every technique...",
                "Step 6: Count Charms - Counting specific 3D items...",
                "Step 7: Final Assessment - Combining factors..."
            ],
            "shape": "Coffin, Stiletto, Almond, Square, Oval, or Duck",
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
           - If free edge is ~80-100% of nail bed = Long.
           - If free edge is > 100% (equal to or longer) of nail bed = XL.
           - If free edge is > 150% of nail bed = XXL (Extendo).
           - *Bias towards XXL for very long nails. If it looks "Extendo", it is XXL.*
        3. **SHAPE (TIP GEOMETRY RULE):** Look at the *corners* of the tip.
           - **DUCK (FLARE):** Side walls flare OUTWARDS. Tip is WIDER than the cuticle. Looks like a triangle or fan. *CRITICAL: If the tip is wider than the base, it is DUCK. It is NOT Coffin or Square. Even if it looks square at the end, if it flares out, it is Duck.*
           - **SQUARE:** Straight sides (PARALLEL). The tip width is EQUAL to the cuticle width. *CRITICAL: If the sides flare out, it is NOT Square.*
           - **COFFIN:** Tapered sides (getting narrower) with a flat tip. *CRITICAL: If it gets wider, it is NOT Coffin.*
           - **STILETTO:** Tapered sides and comes to a **SINGLE SHARP POINT** (no flat edge).
           - **ALMOND:** Tapered sides and **ROUNDED TIP** (no corners).
        4. **CHARM COUNTING:**
           - Count distinct 3D items (bows, hearts, bears, crosses).
           - If many small gems are used, describe as "Heavy Bling" or "Cluster".
        5. **TIME:** Estimate the time for a **FAST, EFFICIENT** professional. 
           - If "intricate", "pattern", or "detailed" is present, time MUST be > 150 mins.
           - Duck Shape adds +30 mins automatically (forming the flare).
           - Do not pad the time, but do not undercharge for complexity.
        6. **FOREIGN WORK:** Look closely at the cuticle area. If there is a visible gap (growth) or lifting, mark as "Foreign Fill" or "Foreign Removal".
        7. **CONTEXT:** Trust the "Dense Caption" for PATTERNS (checkered, swirls) but IGNORE it for background/scene descriptions.
        8. **FOCUS:** Describe the nails FACTUALLY. Start with the physical attributes (shape, length) then move to the design details (color, pattern, texture). Avoid metaphors like 'winter wonderland' or 'sugarplum fairy'. Be precise and descriptive.
        `;
      }

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
