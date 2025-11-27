import type { ServiceSelection, NailLength, BlingDensity, ArtLevel, NailShape, SystemType } from '../types/serviceSchema';

export interface GeminiAnalysis {
    shape: string;
    system: string;
    vibe: string;
    art_notes: string;
    estimated_length: string;
}

export function mapDetectionsToSelection(objects: any[], nailPlateBox?: number[], gemini?: GeminiAnalysis): ServiceSelection {
    // 1. Length Calculation (Aspect Ratio + Gemini Validation)
    let length: NailLength = "Short";

    // Use YOLO box if available, otherwise fallback to Gemini's estimate or default
    if (nailPlateBox && nailPlateBox.length === 4) {
        const [x1, y1, x2, y2] = nailPlateBox;
        const width = x2 - x1;
        const height = y2 - y1;
        const ratio = height / width;

        if (ratio < 1.1) length = "Short";
        else if (ratio < 1.5) length = "Medium";
        else if (ratio < 2.0) length = "Long";
        else if (ratio < 2.5) length = "XL";
        else length = "XXL";
    } else if (gemini?.estimated_length) {
        // Map Gemini's string to NailLength
        const gLen = gemini.estimated_length.toLowerCase();
        if (gLen.includes("short")) length = "Short";
        else if (gLen.includes("medium")) length = "Medium";
        else if (gLen.includes("long")) length = "Long";
        else if (gLen.includes("xl") || gLen.includes("extra")) length = "XL";
        else if (gLen.includes("xxl")) length = "XXL";
    }

    // 2. Bling Density (Area Coverage)
    let density: BlingDensity = "None";
    let totalGemArea = 0;
    const nailArea = nailPlateBox ? (nailPlateBox[2] - nailPlateBox[0]) * (nailPlateBox[3] - nailPlateBox[1]) : 100000;

    const gems = objects.filter(obj => ["gem", "charm", "stone", "pearl"].includes(obj.label));
    gems.forEach(obj => {
        const w = obj.box[2] - obj.box[0];
        const h = obj.box[3] - obj.box[1];
        totalGemArea += w * h;
    });

    const densityPercentage = (totalGemArea / nailArea) * 100;

    if (gems.length === 0) density = "None";
    else if (densityPercentage < 5) density = "Minimal";
    else if (densityPercentage < 20) density = "Moderate";
    else density = "Heavy";

    // 3. Art Level
    let artLevel: ArtLevel | null = null;
    const uniqueLabels = new Set(objects.map(o => o.label));
    const charmCount = gems.length;

    if (uniqueLabels.has("encapsulated") || charmCount > 10) {
        artLevel = "Level 4";
    } else if (uniqueLabels.has("3d_art") || charmCount > 5 || uniqueLabels.has("hand_painted")) {
        artLevel = "Level 3";
    } else if (uniqueLabels.has("french") || uniqueLabels.has("ombre") || charmCount > 2) {
        artLevel = "Level 2";
    } else if (charmCount > 0 || uniqueLabels.has("sticker")) {
        artLevel = "Level 1";
    }

    // Gemini Art Override (Upgrade only)
    if (gemini?.art_notes) {
        const notes = gemini.art_notes.toLowerCase();
        let geminiLevel: ArtLevel | null = null;

        if (notes.includes("complex") || notes.includes("character") || notes.includes("3d") || notes.includes("encapsulated")) geminiLevel = "Level 3"; // Encapsulated is usually L4 but mapping to L3/L4 based on keywords
        else if (notes.includes("french") || notes.includes("ombre") || notes.includes("chrome") || notes.includes("cat eye")) geminiLevel = "Level 2";
        else if (notes.includes("simple") || notes.includes("sticker")) geminiLevel = "Level 1";

        // Upgrade if Gemini detects higher level
        if (geminiLevel) {
            const levels = [null, "Level 1", "Level 2", "Level 3", "Level 4"];
            const currentIdx = levels.indexOf(artLevel);
            const newIdx = levels.indexOf(geminiLevel);
            if (newIdx > currentIdx) {
                artLevel = geminiLevel;
            }
        }
    }

    // 4. Shape & System (Gemini Primary)
    let shape: NailShape = "Coffin"; // Default
    if (gemini?.shape) {
        const gShape = gemini.shape.toLowerCase();
        if (gShape.includes("stiletto")) shape = "Stiletto";
        else if (gShape.includes("almond")) shape = "Almond";
        else if (gShape.includes("square")) shape = "Square";
    }

    let system: SystemType = "Acrylic"; // Default
    if (gemini?.system) {
        const gSys = gemini.system.toLowerCase();
        // Check specific types first
        if (gSys.includes("soft") || gSys.includes("x") || gSys.includes("gel-x")) system = "Gel-X";
        else if (gSys.includes("gel") && !gSys.includes("polish")) system = "Hard Gel";
        else if (gSys.includes("acrylic")) system = "Acrylic";
    }

    return {
        base: {
            system: system,
            shape: shape,
            length: length
        },
        addons: {
            finish: "Glossy",
            specialtyEffect: "None",
            classicDesign: "None"
        },
        art: {
            level: artLevel
        },
        bling: {
            density: density,
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
        }
    };
}
