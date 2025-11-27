import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No API Key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Try to list models directly first
        try {
            const modelManager = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy to get access? No, SDK has no direct listModels on client.
            // Actually, the Node SDK *does* have a GoogleGenerativeAI.getGenerativeModel, but listing is usually via a different manager or REST.
            // Let's try a direct REST call to list models to be 100% sure.
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();
            if (data.error) {
                console.error("❌ ListModels API Error:", data.error);
            } else {
                console.log("✅ Available Models (via REST):");
                data.models.forEach(m => console.log(` - ${m.name}`));
            }
        } catch (e) {
            console.error("❌ REST ListModels Failed:", e);
        }

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-pro-vision" // Legacy
        ];

        for (const modelName of candidates) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // Simple text prompt
                const result = await model.generateContent("Hello, are you there?");
                const response = await result.response;
                console.log(`✅ SUCCESS!`);
            } catch (error) {
                console.log(`❌ FAILED:`);
                console.error(error); // Print full error
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
