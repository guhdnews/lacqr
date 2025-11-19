import type { QuoteAnalysis, ServiceRecommendation } from '../types/ai';

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AI_SERVICE = {
    analyzeImage: async (_file: File): Promise<QuoteAnalysis> => {
        await delay(2500); // Simulate API latency

        // Mock logic based on random seed or file name could go here
        // For now, return a complex, realistic "Maximalist" set
        return {
            shape: 'Coffin',
            length: 'XL',
            base_service: 'Full Set Gel-X',
            add_ons: [
                { name: 'Chrome Powder (All Nails)', type: 'finish', confidence: 0.98, estimated_price: 15 },
                { name: '3D Hello Kitty Charm', type: 'charm', count: 2, confidence: 0.95, estimated_price: 10 },
                { name: 'Swarovski Crystals', type: 'gem', count: 12, confidence: 0.85, estimated_price: 12 },
                { name: 'French Tip Outline', type: 'art', confidence: 0.90, estimated_price: 15 }
            ],
            total_estimated_price: 117, // Base 65 + 15 + 10 + 12 + 15
            confidence_score: 0.92,
            reasoning: "Detected XL Coffin shape with full chrome finish. Identified 2 large 3D charms and scattered crystal placement on ring fingers."
        };
    },

    recommendService: async (_file: File, _text?: string): Promise<ServiceRecommendation> => {
        await delay(2000);

        return {
            booking_codes: ['GEL-X-XL', 'ART-TIER-3', 'ADD-ON-CHARM'],
            reasoning: "The inspo pic shows complex hand-painted character art and 3D elements. This falls under Tier 3 Art.",
            estimated_duration_minutes: 150,
            upsell_suggestion: "Suggest adding a 'Hard Gel Overlay' for extra durability with this length.",
            draft_reply: "Hey babe! I love this set 😍. For this look, please book a 'Gel-X Full Set (XL)' and select 'Tier 3 Art' add-on so we have enough time for those characters!"
        };
    }
};
