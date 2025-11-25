import { GoogleGenerativeAI } from "@google/generative-ai";
import type { QuoteAnalysis, ServiceRecommendation } from '../types/ai';
import { DEFAULT_MENU, type MasterServiceMenu } from '../types/serviceSchema';
import Fuse from 'fuse.js';

// Initialize Standard Google Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("Missing VITE_GEMINI_API_KEY for AI Service");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Helper: Convert File to GenerativePart
 */
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

/**
 * QuoteCam: Forensic Scan Logic
 */
export async function analyzeImage(file: File, userMenu: MasterServiceMenu = DEFAULT_MENU): Promise<QuoteAnalysis> {
    try {
        const imagePart = await fileToGenerativePart(file);

        const prompt = `
            Analyze this nail image for pricing. 
            Return a JSON object with the following structure:
            {
                "shape": "Square" | "Coffin" | "Almond" | "Stiletto" | "Oval",
                "serviceType": "string" (e.g. "Gel-X", "Acrylic", "Structured Gel", "Manicure"),
                "detectedAddOns": [
                    { "name": "string", "count": number }
                ],
                "detectedColors": ["string"],
                "designComplexity": "Simple" | "Moderate" | "Intricate",
                "visual_description": "string" (A 1-2 sentence description of the nails, e.g. "Long coffin nails with a soft pink ombre and crystal accents on the ring finger.")
            }
            Be precise. Count specific items like charms or fingers with specific designs.
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        let detectedAttributes;
        try {
            let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const firstBrace = jsonString.indexOf('{');
            const lastBrace = jsonString.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonString = jsonString.substring(firstBrace, lastBrace + 1);
            }

            detectedAttributes = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse AI response. Raw text:", text);
            throw new Error("AI Response Error: Could not parse analysis results.");
        }

        // CALCULATOR LOGIC
        const serviceFuse = new Fuse(userMenu.services, { keys: ['name', 'ai_tags'], includeScore: true });
        const bestServiceMatch = serviceFuse.search(detectedAttributes.serviceType)[0];
        const baseService = bestServiceMatch?.item || userMenu.services[0];

        let totalPrice = baseService.basePrice;

        const lengthCharge = userMenu.lengthUpcharges.find(l => l.length === detectedAttributes.length)?.price || 0;
        totalPrice += lengthCharge;

        const addOnOptions = { includeScore: true, keys: ['name', 'keywords'] };
        const fuse = new Fuse(userMenu.addOns, addOnOptions);

        const matchedAddOns = detectedAttributes.detectedAddOns.map((detected: any) => {
            const match = fuse.search(detected.name)[0];
            if (match && match.item) {
                const item = match.item;
                let cost = 0;

                if (item.pricing_unit === 'per_nail') {
                    cost = item.price * detected.count;
                } else {
                    cost = item.price;
                }

                totalPrice += cost;
                return {
                    name: item.name,
                    type: 'design' as const,
                    count: detected.count,
                    estimated_price: cost,
                    confidence: 0.95
                };
            }
            return null;
        }).filter(Boolean) as any[];

        return {
            total_estimated_price: totalPrice,
            confidence_score: 0.92,
            breakdown: {
                base_service: {
                    name: `${baseService.name} (${detectedAttributes.length})`,
                    price: baseService.basePrice + lengthCharge,
                    confidence: 0.98
                },
                add_ons: matchedAddOns,
                shape: detectedAttributes.shape,
                length: detectedAttributes.length,
                detected_colors: detectedAttributes.detectedColors || [],
                design_complexity: detectedAttributes.designComplexity || 'Moderate'
            },
            reasoning: `Detected ${detectedAttributes.length} ${detectedAttributes.shape} nails. Identified service as ${detectedAttributes.serviceType} (Matched to: ${baseService.name}). AI Analysis: ${text.substring(0, 50)}...`,
            visual_description: detectedAttributes.visual_description
        };
    } catch (error: any) {
        console.error("AI Error:", error);
        throw new Error(error.message || "Unknown AI Error");
    }
}

/**
 * Service Sorter: Booking Translator
 */
export async function recommendService(file: File, textInput?: string, userMenu: MasterServiceMenu = DEFAULT_MENU): Promise<ServiceRecommendation> {
    try {
        const imagePart = await fileToGenerativePart(file);
        const prompt = `
            Analyze this nail image and the client's request: "${textInput || ''}".
            Suggest the best booking codes based on visual complexity.
            Return JSON:
        {
            "serviceName": "string",
                "addOns": ["string"],
                    "reasoning": "string",
                        "upsell": "string"
        }
        `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(jsonString);

        const serviceFuse = new Fuse(userMenu.services, { keys: ['name', 'category'] });
        const addOnFuse = new Fuse(userMenu.addOns, { keys: ['name', 'keywords'] });

        const bestService = serviceFuse.search(aiResult.serviceName)[0]?.item || userMenu.services[0];

        const bookingCodes = [bestService.name];
        let totalDuration = bestService.durationMinutes;

        aiResult.addOns.forEach((addOnName: string) => {
            const match = addOnFuse.search(addOnName)[0]?.item;
            if (match) {
                bookingCodes.push(match.name);
                totalDuration += match.durationMinutes;
            }
        });

        return {
            booking_codes: bookingCodes,
            estimated_duration_minutes: totalDuration,
            upsell_suggestion: aiResult.upsell,
            reasoning: aiResult.reasoning,
            draft_reply: `Hey! For this look, please book: ${bookingCodes.join(' + ')}. It should take about ${totalDuration / 60} hours. Can't wait to see you! ✨`
        };

    } catch (error) {
        console.error("AI Error:", error);
        return {
            booking_codes: ["Consultation Required"],
            estimated_duration_minutes: 60,
            upsell_suggestion: "None",
            reasoning: "AI Service Unavailable",
            draft_reply: "Please contact for a custom quote."
        };
    }
}

export const AI_SERVICE = {
    analyzeImage,
    recommendService
};
