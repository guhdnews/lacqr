import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ServiceSelection } from '../types/serviceSchema';
import { preprocessImage } from '../utils/imageProcessing';
import { simulateYoloData } from '../utils/yoloSimulation';

// Initialize Standard Google Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing VITE_GEMINI_API_KEY for AI Service");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Helper: Convert File to GenerativePart
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeImage(file: File): Promise<ServiceSelection> {
  try {
    const processedFile = await preprocessImage(file);
    const imagePart = await fileToGenerativePart(processedFile);

    // Call Python Backend for YOLO Analysis
    let yoloData;
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Attempt to call local backend
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        yoloData = await response.json();
        console.log("YOLO Backend Success:", yoloData);
      } else {
        throw new Error("Backend returned error");
      }
    } catch (error) {
      console.warn("YOLO Backend unavailable, falling back to simulation:", error);
      // Fallback to simulation if backend is offline
      yoloData = simulateYoloData(1024, 1024);
    }

    const yoloJson = JSON.stringify(yoloData, null, 2);

    const prompt = `
            You are an expert Nail Technician Assistant. You are receiving two inputs:
            1. **Visual:** A raw image of a manicure.
            2. **Data:** \`yolo_mask_data\` (Provided below).

            **YOLO DATA:**
            ${yoloJson}

            **YOUR TASK:**
            Combine the strict geometric data from YOLO with your visual analysis of style/texture to output a JSON pricing object.

            **PROTOCOL:**

            **Step 1: Structural Analysis (Trust the Data)**
            * **Shape:** Look at the \`yolo_mask_data\`. If the polygon has sharp angles at the tip, it is **Stiletto** or **Coffin**. If it is rounded, it is **Almond** or **Round**.
            * **Length:** Use the provided pixel length to categorize:
                * < 300px = Short
                * 300-450px = Medium/Long
                * > 450px = XL/XXL

            **Step 2: Stylistic Analysis (Visual Reasoning)**
            * **Surface:** Distinguish between **Glossy** (shiny), **Matte** (dull), and **Chrome** (metallic reflection).
            * **Bling:** Do NOT count individual gems. Determine **Density**:
                * *Minimal:* Stones only at the cuticle.
                * *Moderate:* Stones scattered on the plate.
                * *Heavy:* The nail plate is encrusted/covered.

            **Step 3: Output Generation**
            Output strictly valid JSON with a \`_reasoning\` key first.

            **Example Output:**
            {
              "_reasoning": "[HYBRID ANALYSIS] YOLO masks indicate a flat tip (Coffin) with high pixel height (XL). Visual analysis shows a metallic finish (Chrome). Bling analysis shows scattered stones on the ring finger (Moderate Density).",
              "base": {
                "system": "Acrylic",
                "shape": "Coffin",
                "length": "XL"
              },
              "addons": {
                "finish": "Chrome",
                "specialtyEffect": "None",
                "classicDesign": "None"
              },
              "art": {
                "level": "Level 2"
              },
              "bling": {
                "density": "Moderate",
                "xlCharmsCount": 0,
                "piercingsCount": 0
              },
              "modifiers": {
                "foreignWork": "None",
                "repairsCount": 0,
                "soakOffOnly": false
              },
              "pedicure": {
                "type": "None",
                "toeArtMatch": false
              }
            }
        `;

    // List of models to try in order of preference
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];

    let lastError;
    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to generate content with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text();

        // Parse JSON
        let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }

        const selection: ServiceSelection = JSON.parse(jsonString);
        return selection; // Success! Return immediately.

      } catch (error: any) {
        console.warn(`Failed with ${modelName}:`, error.message);
        lastError = error;
        // Continue to next model
      }
    }

    // If all failed
    throw lastError || new Error("All AI models failed to respond.");

  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error(error.message || "Unknown AI Error");
  }
}

/**
 * Service Sorter (Recommendation Engine)
 * Kept simple for now, can be expanded later.
 */
export async function recommendService(_file: File, _textInput?: string): Promise<any> {
  // Placeholder for now, as the main focus is QuoteCam logic overhaul.
  // We can implement this properly in Part 2 if needed.
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
