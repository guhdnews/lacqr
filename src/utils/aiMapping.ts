import type { ServiceSelection, NailLength, BlingDensity, ArtLevel, NailShape, SystemType, ForeignWork, FinishType, SpecialtyEffect, ClassicDesign, PedicureType } from '../types/serviceSchema';

export interface GeminiAnalysis {
    shape: string;
    system: string;
    vibe: string;
    art_notes: string;
    estimated_length: string;
    estimated_time_minutes?: number;
    foreign_work?: string;
    reasoning_steps?: string[]; // Added Chain of Thought
    // Diagnostics Mode Fields
    conditions?: string[];
    recommended_services?: string[];
    repairs_needed?: number;
    growth_weeks?: number;
}

export function mapDetectionsToSelection(objects: any[], nailPlateBox?: number[], gemini?: GeminiAnalysis, florence?: any): ServiceSelection {
    // --- 1. Length Calculation ---
    let length: NailLength = "Short";

    if (gemini?.estimated_length) {
        const gLen = gemini.estimated_length.toLowerCase();
        if (gLen.includes("xxl") || gLen.includes("extendo")) length = "XXL";
        else if (gLen.includes("xl") || gLen.includes("extra")) length = "XL";
        else if (gLen.includes("long")) length = "Long";
        else if (gLen.includes("medium")) length = "Medium";
        else if (gLen.includes("short") || gLen.includes("sport") || gLen.includes("active")) length = "Short";
    } else if (nailPlateBox && nailPlateBox.length === 4) {
        // Fallback to YOLO aspect ratio
        const [x1, y1, x2, y2] = nailPlateBox;
        const width = x2 - x1;
        const height = y2 - y1;
        const ratio = height / width;

        if (ratio < 1.1) length = "Short";
        else if (ratio < 1.5) length = "Medium";
        else if (ratio < 2.0) length = "Long";
        else if (ratio < 2.5) length = "XL";
        else length = "XXL";
    }

    // --- 2. Shape Detection ---
    let shape: NailShape = "Coffin"; // Default

    // PRIORITY 1: Trust Gemini (High IQ)
    if (gemini?.shape) {
        const gShape = gemini.shape.toLowerCase();
        if (gShape.includes("lipstick")) shape = "Lipstick";
        else if (gShape.includes("duck") || gShape.includes("flare") || gShape.includes("fan") || gShape.includes("triangle")) shape = "Duck";
        else if (gShape.includes("coffin") || gShape.includes("tapered square")) shape = "Coffin";
        else if (gShape.includes("stiletto") || gShape.includes("pointed") || gShape.includes("sharp")) shape = "Stiletto";
        else if (gShape.includes("ballerina")) shape = "Ballerina";
        else if (gShape.includes("almond")) shape = "Almond";
        else if (gShape.includes("squoval") || (gShape.includes("square") && gShape.includes("round"))) shape = "Squoval";
        else if (gShape.includes("square")) shape = "Square";

        // DOUBLE CHECK: If reasoning mentions "flare", "wider tip", "fan", or "triangle", FORCE DUCK
        if (gemini.reasoning_steps?.some(step =>
            step.toLowerCase().includes("flare") ||
            step.toLowerCase().includes("wider than cuticle") ||
            step.toLowerCase().includes("wider at the tip") ||
            step.toLowerCase().includes("fan out") ||
            step.toLowerCase().includes("triangle shape")
        )) {
            shape = "Duck";
        }
    }
    // PRIORITY 2: Fallback to Florence (Low IQ, prone to bias)
    else if (florence?.dense) {
        const fShape = florence.dense.toLowerCase();
        if (fShape.includes("lipstick")) shape = "Lipstick";
        else if (fShape.includes("duck")) shape = "Duck";
        else if (fShape.includes("stiletto") || fShape.includes("pointed")) shape = "Stiletto";
        else if (fShape.includes("ballerina")) shape = "Ballerina";
        else if (fShape.includes("almond")) shape = "Almond";
        else if (fShape.includes("square")) shape = "Square";
    }

    // --- 3. System Detection ---
    let system: SystemType = "Acrylic"; // Default
    if (gemini?.system) {
        const gSys = gemini.system.toLowerCase();
        if (gSys.includes("soft") || gSys.includes("x") || gSys.includes("gel-x")) system = "Gel-X";
        else if (gSys.includes("gel") && !gSys.includes("polish")) system = "Hard Gel";
        else if (gSys.includes("acrylic")) system = "Acrylic";
    }

    // --- 4. Finish & Add-ons ---
    let finish: FinishType = "Glossy";
    let specialty: SpecialtyEffect = "None";
    let classic: ClassicDesign = "None";

    const allText = ((gemini?.art_notes || "") + " " + (florence?.dense || "") + " " + (gemini?.vibe || "")).toLowerCase();

    // Finish
    if (allText.includes("matte") || allText.includes("velvet") || allText.includes("frosted") || allText.includes("no shine") || allText.includes("dull")) {
        finish = "Matte";
    }

    // Specialty Effects
    if (allText.includes("cat eye") || allText.includes("magnetic") || allText.includes("velvet effect")) specialty = "Cat Eye";
    else if (allText.includes("holo") || allText.includes("holographic") || allText.includes("rainbow")) specialty = "Holo";
    else if (allText.includes("chrome") || allText.includes("metallic") || allText.includes("mirror")) specialty = "Chrome";

    // Classic Designs
    if (allText.includes("ombre") || allText.includes("gradient") || allText.includes("fading")) classic = "Ombre";
    else if (allText.includes("french tip") || (allText.includes("french") && !allText.includes("solid"))) classic = "French Tip";

    // --- 5. Charm Calculation (Moved Up) ---
    let xlCharmsCount = 0;

    // 1. Count from YOLO (if specific labels exist)
    const charmObjects = objects.filter(obj => ["charm", "bow", "flower", "butterfly", "heart", "cross"].includes(obj.label));
    xlCharmsCount += charmObjects.length;

    // 2. Fallback to Text Analysis if YOLO missed them
    if (xlCharmsCount === 0) {
        if (allText.includes("3d") || allText.includes("charm") || allText.includes("bow") || allText.includes("large gem")) {
            // Heuristic: "Each nail" = 10, "Accent" = 2, Default = 2
            if (allText.includes("each nail") || allText.includes("every nail") || allText.includes("all nails")) {
                xlCharmsCount = 10;
            } else if (allText.includes("ring finger") || allText.includes("accent nail") || allText.includes("two nails")) {
                xlCharmsCount = 2;
            } else {
                // Default assumption: If charms are mentioned, usually at least 2 (one per hand)
                xlCharmsCount = 2;
            }
        }
    }

    // --- 6. Bling Density ---
    let density: BlingDensity = "None";
    let totalGemArea = 0;
    const nailArea = nailPlateBox ? (nailPlateBox[2] - nailPlateBox[0]) * (nailPlateBox[3] - nailPlateBox[1]) : 100000;

    const gems = objects.filter(obj =>
        ["gem", "stone", "pearl"].includes(obj.label) &&
        !["charm", "bow", "flower", "butterfly", "heart", "cross"].includes(obj.label)
    );

    gems.forEach(obj => {
        const w = obj.box[2] - obj.box[0];
        const h = obj.box[3] - obj.box[1];
        totalGemArea += w * h;
    });

    const densityPercentage = (totalGemArea / nailArea) * 100;

    if (gems.length === 0) {
        // Fallback: Check Gemini text for keywords if YOLO missed them
        if (allText.includes("rhinestone") || allText.includes("gem") || allText.includes("crystal") || allText.includes("charm") || allText.includes("bling")) {
            if (allText.includes("heavy") || allText.includes("covered") || allText.includes("large") || allText.includes("cluster")) {
                density = "Heavy";
            } else {
                density = "Moderate";
            }
        } else {
            density = "None";
        }
    }
    else if (densityPercentage < 5) density = "Minimal";
    else if (densityPercentage < 20) density = "Moderate";
    else density = "Heavy";

    // --- 7. Art Level Calculation ---
    let artLevel: ArtLevel | null = null;
    const uniqueLabels = new Set(objects.map(o => o.label));
    const charmCount = gems.length + xlCharmsCount; // Include XL charms in total count for Art Level

    // Base Level from Object Detection
    if (uniqueLabels.has("encapsulated") || charmCount > 10) artLevel = "Level 4";
    else if (uniqueLabels.has("3d_art") || charmCount > 5 || uniqueLabels.has("hand_painted")) artLevel = "Level 3";
    else if (uniqueLabels.has("french") || uniqueLabels.has("ombre") || charmCount > 2) artLevel = "Level 2";
    else if (charmCount > 0 || uniqueLabels.has("sticker")) artLevel = "Level 1";

    // Upgrade based on Keywords (Gemini & Florence)
    let keywordLevel: ArtLevel | null = null;

    // Level 4 Keywords (Masterpiece)
    if (allText.includes("intricate") && (allText.includes("pattern") || allText.includes("detailed") || allText.includes("character") || allText.includes("portrait"))) {
        keywordLevel = "Level 4";
    }
    // Level 3 Keywords (Complex)
    else if (allText.includes("complex") || allText.includes("3d") || allText.includes("encapsulated") || allText.includes("airbrush") || allText.includes("blooming") || allText.includes("detailed")) {
        keywordLevel = "Level 3";
    }
    // Level 2 Keywords (Moderate - including "Elegant")
    else if (allText.includes("french") || allText.includes("ombre") || allText.includes("chrome") || allText.includes("cat eye") || allText.includes("glitter") || allText.includes("sparkle") || allText.includes("decorated") || allText.includes("design") || allText.includes("swirls") || allText.includes("checkered")) {
        keywordLevel = "Level 2";
    }
    // Level 1 Keywords (Simple)
    else if (allText.includes("simple") || allText.includes("sticker") || allText.includes("minimal")) {
        keywordLevel = "Level 1";
    }

    // Apply Upgrade
    if (keywordLevel) {
        const levels = [null, "Level 1", "Level 2", "Level 3", "Level 4"];
        const currentIdx = levels.indexOf(artLevel);
        const newIdx = levels.indexOf(keywordLevel);
        if (newIdx > currentIdx) {
            artLevel = keywordLevel;
        }
    }

    // --- 8. Pedicure Detection ---
    let pedicureType: PedicureType = "None";
    if (allText.includes("toe") || allText.includes("feet") || allText.includes("pedicure") || allText.includes("sandal")) {
        pedicureType = (artLevel || density !== "None") ? "Gel" : "Classic";
    }

    // --- 9. Foreign Work & Diagnostics ---
    let foreignWork: ForeignWork = "None";
    let repairsCount = 0;
    let extras: { name: string; price: number }[] = [];
    let isFill = false;

    if (gemini) {
        // Foreign Work
        if (gemini.foreign_work) {
            const fw = gemini.foreign_work.toLowerCase();
            if (fw.includes("removal")) foreignWork = "Foreign Removal";
            else if (fw.includes("fill")) foreignWork = "Foreign Fill";
        }

        // Diagnostics: Repairs
        if (gemini.repairs_needed && gemini.repairs_needed > 0) {
            repairsCount = gemini.repairs_needed;
        }

        // Diagnostics: Growth (Implies Fill)
        if (gemini.growth_weeks && gemini.growth_weeks >= 2) {
            isFill = true;
        }

        // Diagnostics: Recommended Services (Extras)
        if (gemini.recommended_services) {
            gemini.recommended_services.forEach(service => {
                if (service.includes("Oil") || service.includes("Treatment")) {
                    extras.push({ name: "Oil Treatment", price: 5 });
                }
                // Add more mappings as needed
            });
        }
    }

    // --- 10. Time Estimation (Sanity Check) ---
    let estimatedTime = gemini?.estimated_time_minutes || 0;

    // Force minimums based on Art Level
    if (artLevel === "Level 4" && estimatedTime < 150) estimatedTime = 150;
    else if (artLevel === "Level 3" && estimatedTime < 120) estimatedTime = 120;
    else if (artLevel === "Level 2" && estimatedTime < 90) estimatedTime = 90;

    return {
        base: {
            system: system,
            shape: shape,
            length: length,
            isFill: isFill
        },
        addons: {
            finish: finish,
            specialtyEffect: specialty,
            classicDesign: classic
        },
        art: {
            level: artLevel
        },
        bling: {
            density: density,
            xlCharmsCount: xlCharmsCount,
            piercingsCount: 0
        },
        modifiers: {
            foreignWork: foreignWork,
            repairsCount: repairsCount,
            soakOffOnly: false
        },
        pedicure: {
            type: pedicureType,
            toeArtMatch: false
        },
        extras: extras,
        estimatedDuration: estimatedTime
    };
}




