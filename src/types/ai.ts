export type NailShape = 'Square' | 'Round' | 'Oval' | 'Almond' | 'Coffin' | 'Stiletto' | 'Duck' | 'Unknown';
export type NailLength = 'Natural' | 'Short' | 'Medium' | 'Long' | 'XL' | 'XXL' | 'Extendo';

export interface AddOn {
    name: string;
    type: 'charm' | 'gem' | 'art' | 'finish' | 'structural';
    upsell_suggestion?: string;
    draft_reply: string; // Pre-written DM
}
export interface QuoteAnalysis {
    total_estimated_price: number;
    confidence_score: number;
    breakdown: {
        base_service: {
            name: string;
            price: number;
            confidence: number;
        };
        add_ons: {
            name: string;
            type: 'design' | 'charm' | 'gem' | 'finish' | 'art' | 'custom';
            count: number;
            estimated_price: number;
            confidence: number;
        }[];
        shape: string;
        length: string;
        detected_colors?: string[];
        design_complexity?: 'Simple' | 'Moderate' | 'Intricate';
        notes?: string;
    };
    reasoning: string;
    visual_description?: string;
}

export interface ServiceRecommendation {
    booking_codes: string[];
    estimated_duration_minutes: number;
    upsell_suggestion?: string;
    reasoning: string;
    draft_reply: string;
}
