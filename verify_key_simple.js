import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD3-f3MOh0Ln0pARYoqntfJZO0YW-KBvjE"; // The key from .env

async function testKey() {
    console.log("Testing API Key...");
    try {
        console.log("Listing models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:", data.models.map(m => m.name));
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("❌ API Key Failed:", error.message);
    }
}

testKey();
