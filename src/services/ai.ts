import { GoogleGenerativeAI } from "@google/generative-ai";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../lib/firebase";
import { calculatePrice, type PricingResult } from "../utils/pricing_engine";
import type { ServiceSelection } from '../types/serviceSchema';

// Placeholder - Update this after 'modal deploy'
const MODAL_ENDPOINT = "https://upfacedevelopment--lacqr-brain-analyze-image.modal.run";

// Initialize Standard Google Gemini API (Optional Fallback)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "dummy");

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

    // 2. Call Modal Backend
    console.log("🧠 Calling Modal Brain...");

    // Check if Modal URL is configured
    if (MODAL_ENDPOINT.includes("YOUR_MODAL_USERNAME")) {
      console.warn("⚠️ Modal Endpoint not configured. Using Simulation Mode.");
      return simulateAnalysis(imageFile);
    }

    const response = await fetch(MODAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: downloadURL })
    });

    if (!response.ok) {
      throw new Error(`Modal API Error: ${response.statusText}`);
    }

    const modalResult = await response.json();
    console.log("✅ Modal Result:", modalResult);

    // 3. Calculate Price
    // Note: Modal result structure matches what calculatePrice expects
    const pricing = calculatePrice(modalResult.objects);

    // 4. Map to ServiceSelection
    return {
      base: {
        system: "Acrylic", // Default or inferred
        shape: "Coffin", // Default or inferred from YOLO
        length: pricing.details.lengthTier as any
      },
      addons: {
        finish: "Glossy",
        specialtyEffect: "None",
        classicDesign: "None"
      },
      art: {
        level: pricing.details.artTier.includes("Tier 1") ? "Level 1" :
          pricing.details.artTier.includes("Tier 2") ? "Level 2" :
            pricing.details.artTier.includes("Tier 3") ? "Level 3" : "Level 4"
      },
      bling: {
        density: pricing.details.densityTier as any,
        xlCharmsCount: 0,
        piercingsCount: 0
      },
      modifiers: {
        foreignWork: "None",
        repairsCount: 0,
        soakOffOnly: false
      },
      pedicure: {
        type: "None",
        toeArtMatch: false
      },

      // AI Metadata
      confidence: 0.95,
      reasoning: `Detected ${modalResult.objects.length} objects. Length: ${pricing.details.lengthTier}. Density: ${pricing.details.densityTier}.`,
      estimatedPrice: pricing.totalPrice,
      pricingDetails: pricing,
      modalResult: modalResult
    };

  } catch (error: any) {
    console.error("❌ Analysis Failed:", error);
    // Fallback to simulation if everything fails
    return simulateAnalysis(imageFile);
  }
}

async function simulateAnalysis(imageFile: File): Promise<ServiceSelection> {
  return {
    base: { system: "Acrylic", shape: "Coffin", length: "Medium" },
    addons: { finish: "Glossy", specialtyEffect: "None", classicDesign: "None" },
    art: { level: "Level 1" },
    bling: { density: "Minimal", xlCharmsCount: 0, piercingsCount: 0 },
    modifiers: { foreignWork: "None", repairsCount: 0, soakOffOnly: false },
    pedicure: { type: "None", toeArtMatch: false },

    confidence: 0.8,
    reasoning: "Simulation Mode (Backend Unavailable)",
    estimatedPrice: 45
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
