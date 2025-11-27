export interface PricingResult {
    totalPrice: number;
    breakdown: {
        basePrice: number;
        lengthCharge: number;
        densityCharge: number;
        artTierCharge: number;
        materialCharge: number;
    };
    details: {
        lengthTier: string;
        densityTier: string;
        artTier: string;
        materialNotes: string[];
    };
}

export interface DetectedObject {
    label: string;
    box: number[]; // [x1, y1, x2, y2]
    material?: string;
    confidence: number;
}

export function calculatePrice(objects: DetectedObject[], nailPlateBox?: number[]): PricingResult {
    // Constants
    const BASE_PRICE = 40; // Standard set

    // 1. Length Calculation (Aspect Ratio)
    let lengthCharge = 0;
    let lengthTier = "Short";

    if (nailPlateBox) {
        const [x1, y1, x2, y2] = nailPlateBox;
        const width = x2 - x1;
        const height = y2 - y1;
        const ratio = height / width;

        if (ratio < 1.1) {
            lengthTier = "Short";
            lengthCharge = 0;
        } else if (ratio < 1.5) {
            lengthTier = "Medium";
            lengthCharge = 5;
        } else if (ratio < 2.0) {
            lengthTier = "Long";
            lengthCharge = 10;
        } else {
            lengthTier = "XL";
            lengthCharge = 15;
        }
    }

    // 2. Bling Density
    // Note: Without actual masks from SAM 2 in the frontend, we approximate using box area.
    // In a real integration, the backend would send the density score.
    // Here we simulate it based on object count/area relative to nail.
    let densityCharge = 0;
    let densityTier = "Minimal";

    let totalGemArea = 0;
    const nailArea = nailPlateBox ? (nailPlateBox[2] - nailPlateBox[0]) * (nailPlateBox[3] - nailPlateBox[1]) : 100000; // Fallback

    objects.forEach(obj => {
        if (obj.label === "gem" || obj.label === "charm") {
            const w = obj.box[2] - obj.box[0];
            const h = obj.box[3] - obj.box[1];
            totalGemArea += w * h;
        }
    });

    const density = (totalGemArea / nailArea) * 100;

    if (density < 5) {
        densityTier = "Minimal";
        densityCharge = 10;
    } else if (density < 20) {
        densityTier = "Moderate";
        densityCharge = 25;
    } else {
        densityTier = "Heavy";
        densityCharge = 50;
    }

    // 3. Art Tiering
    let artTierCharge = 0;
    let artTier = "Tier 1 (Simple)";
    const uniqueLabels = new Set(objects.map(o => o.label));
    const charmCount = objects.filter(o => o.label === "charm" || o.label === "gem").length;

    if (uniqueLabels.has("encapsulated") || charmCount > 5) {
        artTier = "Tier 4 (Extreme)";
        artTierCharge = 100; // Example
    } else if (uniqueLabels.has("3d_art") || charmCount > 2 || uniqueLabels.has("hand_painted")) {
        artTier = "Tier 3 (Complex)";
        artTierCharge = 60;
    } else if (uniqueLabels.has("french") || uniqueLabels.has("ombre") || charmCount > 0) {
        artTier = "Tier 2 (Intermediate)";
        artTierCharge = 30;
    } else {
        artTier = "Tier 1 (Simple)";
        artTierCharge = 10;
    }

    // 4. Material Valuation
    let materialCharge = 0;
    const materialNotes: string[] = [];

    objects.forEach(obj => {
        if (obj.label === "gem" && obj.material === "Crystal/Glass") {
            materialCharge += 5; // Per crystal charge? Or flat fee?
            if (!materialNotes.includes("Swarovski/Glass Detected")) {
                materialNotes.push("Swarovski/Glass Detected");
            }
        }
    });

    return {
        totalPrice: BASE_PRICE + lengthCharge + densityCharge + artTierCharge + materialCharge,
        breakdown: {
            basePrice: BASE_PRICE,
            lengthCharge,
            densityCharge,
            artTierCharge,
            materialCharge
        },
        details: {
            lengthTier,
            densityTier,
            artTier,
            materialNotes
        }
    };
}
