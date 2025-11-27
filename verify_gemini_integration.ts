import { mapDetectionsToSelection, type GeminiAnalysis } from './src/utils/aiMapping';
import { calculatePrice } from './src/utils/pricingCalculator';
import { DEFAULT_MENU } from './src/types/serviceSchema';

console.log("🧪 Starting Gemini Integration Verification...");

const scenarios = [
    {
        name: "Scenario 1: Stiletto Shape (Gemini Override)",
        objects: [], // YOLO missed everything
        gemini: {
            shape: "Stiletto",
            system: "Acrylic",
            vibe: "Fierce red",
            art_notes: "None",
            estimated_length: "Long"
        } as GeminiAnalysis,
        nailPlate: [0, 0, 100, 200], // Ratio 2.0 -> XL in mapping logic
        expectedShape: "Stiletto",
        expectedSystem: "Acrylic",
        expectedLength: "XL"
    },
    {
        name: "Scenario 2: Gel-X with 3D Art (Gemini Art Detection)",
        objects: [], // YOLO missed the 3D art
        gemini: {
            shape: "Coffin",
            system: "Gel-X",
            vibe: "Kawaii",
            art_notes: "3d hello kitty charms, bow tie",
            estimated_length: "XL"
        } as GeminiAnalysis,
        nailPlate: [0, 0, 100, 250],
        expectedShape: "Coffin",
        expectedSystem: "Gel-X",
        expectedArtLevel: "Level 3"
    },
    {
        name: "Scenario 3: Untrained Vibe (Dynamic Description)",
        objects: [{ label: "gem", box: [0, 0, 10, 10] }],
        gemini: {
            shape: "Square",
            system: "Hard Gel",
            vibe: "Cyberpunk Y2K with chrome drip",
            art_notes: "chrome, drip",
            estimated_length: "Short"
        } as GeminiAnalysis,
        nailPlate: [0, 0, 100, 100],
        expectedShape: "Square",
        expectedSystem: "Hard Gel",
        expectedArtLevel: "Level 2"
    }
];

let passed = 0;
let failed = 0;

scenarios.forEach(scenario => {
    console.log(`\n📋 Testing: ${scenario.name}`);
    const selection = mapDetectionsToSelection(scenario.objects, scenario.nailPlate, scenario.gemini);

    let scenarioPassed = true;

    if (selection.base.shape !== scenario.expectedShape) {
        console.error(`❌ Shape Mismatch: Expected ${scenario.expectedShape}, Got ${selection.base.shape}`);
        scenarioPassed = false;
    }

    if (selection.base.system !== scenario.expectedSystem) {
        console.error(`❌ System Mismatch: Expected ${scenario.expectedSystem}, Got ${selection.base.system}`);
        scenarioPassed = false;
    }

    if (scenario.expectedLength && selection.base.length !== scenario.expectedLength) {
        console.error(`❌ Length Mismatch: Expected ${scenario.expectedLength}, Got ${selection.base.length}`);
        scenarioPassed = false;
    }

    if (scenario.expectedArtLevel && selection.art.level !== scenario.expectedArtLevel) {
        console.error(`❌ Art Level Mismatch: Expected ${scenario.expectedArtLevel}, Got ${selection.art.level}`);
        scenarioPassed = false;
    }

    if (scenarioPassed) {
        console.log("✅ Passed");
        passed++;
    } else {
        failed++;
    }
});

console.log(`\n🏁 Summary: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
