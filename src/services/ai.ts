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
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "YOUR_API_KEY");

export async function analyzeImage(imageFile: File): Promise<ServiceSelection> {
  try {
    console.log("🚀 Starting Analysis Pipeline...");

    // 1. Upload to Firebase Storage
    console.log("📤 Uploading to Firebase...");
    const userId = auth.currentUser?.uid || "anonymous";
    const timestamp = Date.now();
    const storageRef = ref(storage, `scans/${userId}/${timestamp}.jpg`);

    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    console.log("✅ Uploaded:", downloadURL);

    // 2. Parallel Execution: Modal (YOLO/Florence) + Gemini (Vision)
    console.log("🧠 Calling Modal Brain & Gemini...");

    const modalPromise = fetch(MODAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: downloadURL })
    }).then(res => res.json());

    // We start Gemini, but we might need to wait for Modal if we want to pass Florence captions.
    // However, to keep it fast, we can try to run them in parallel. 
    // BUT, the user requested using Florence captions to help Gemini.
    // So we must wait for Modal BEFORE calling Gemini if we want to pass captions.
    // OR we can call them in parallel and if Modal finishes first, we use it? No, that's complex.
    // Let's wait for Modal first to get the captions, then call Gemini.
    // This adds latency but improves accuracy as requested.

    const modalResult = await modalPromise;
    console.log("✅ Modal Result:", modalResult);

    const geminiPromise = analyzeWithGemini(imageFile, modalResult?.florence);
    const geminiResult = await geminiPromise;
    console.log("✨ Gemini Result:", geminiResult);

    // 3. Map Detections to Service Selection (Merging YOLO + Gemini)
    // Find nail plate for length calculation
    const nailPlate = modalResult.objects?.find((obj: any) => obj.label === "nail_plate" || obj.label === "nail");
    const nailPlateBox = nailPlate ? nailPlate.box : undefined;

    const selection = mapDetectionsToSelection(modalResult.objects || [], nailPlateBox, geminiResult);

    // 4. Calculate Price using Shared Calculator
    const estimatedPrice = calculatePrice(selection, DEFAULT_MENU);

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
          basePrice: DEFAULT_MENU.basePrices[selection.base.system],
          lengthCharge: DEFAULT_MENU.lengthSurcharges[selection.base.length],
          densityCharge: DEFAULT_MENU.blingDensityPrices[selection.bling.density],
          artTierCharge: selection.art.level ? DEFAULT_MENU.artLevelPrices[selection.art.level] : 0,
          materialCharge: 0 // Placeholder
        },
        details: {
          lengthTier: selection.base.length,
          densityTier: selection.bling.density,
          artTier: selection.art.level || 'None',
          materialNotes: []
        }
      },
      modalResult: modalResult,
      aiDescription: geminiResult?.vibe || modalResult.florence?.dense || "Analysis complete."
    };

  } catch (error: any) {
    console.error("❌ Analysis Failed:", error);
    throw error; // CRITICAL: Throw error to UI instead of simulating
  }
}

async function analyzeWithGemini(file: File, florenceCaptions?: any): Promise<GeminiAnalysis | undefined> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn("⚠️ No Gemini API Key found. Skipping Gemini analysis.");
      return undefined;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        Computer Vision Insights (Use these as hints, but trust your eyes more):
        - Dense Caption: "${florenceCaptions.dense}"
        - Object Detection: "${JSON.stringify(florenceCaptions.od)}"
        `;
    }

    prompt += `
        Provide a JSON response with the following fields:
        {
            "shape": "Coffin, Stiletto, Almond, Square, or Oval",
            "system": "Acrylic, Gel-X, Hard Gel, or Structure Gel (look for thickness/apex)",
            "vibe": "A creative, artistic description of the style (e.g. 'Y2K Cyberpunk with chrome drip', 'Elegant bridal with 3D flowers'). BE SPECIFIC.",
            "art_notes": "List EVERY technique seen. Look for: 3d charms, hand painted character, french tip, ombre, encapsulated, chrome, cat eye, airbrush, blooming gel.",
            "estimated_length": "Short (sport), Medium, Long, XL, or XXL (extendo)"
        }
        IMPORTANT: 
        1. If you see ANY 3D art, charms, or complex painting, mention it in 'art_notes'.
        2. Be generous with 'estimated_length' - if it looks long, call it Long or XL.
        `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: file.type } }
    ]);

    const response = result.response;
    const text = response.text();

    // Clean markdown code blocks if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString) as GeminiAnalysis;

  } catch (e) {
    console.error("Gemini Analysis Failed:", e);
    return undefined;
  }
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
