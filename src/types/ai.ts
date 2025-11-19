export type NailShape = 'Square' | 'Round' | 'Oval' | 'Almond' | 'Coffin' | 'Stiletto' | 'Duck' | 'Unknown';
export type NailLength = 'Natural' | 'Short' | 'Medium' | 'Long' | 'XL' | 'XXL' | 'Extendo';

export interface AddOn {
    name: string;
    type: 'charm' | 'gem' | 'art' | 'finish' | 'structural';
    count?: number; // For gems, charms
    confidence: number; // 0-1
    estimated_price?: number; // User's price list mapping
}

export interface QuoteAnalysis {
    shape: NailShape;
    length: NailLength;
    base_service: string; // e.g., "Full Set Gel-X"
    add_ons: AddOn[];
    total_estimated_price: number;
    confidence_score: number;
    reasoning: string; // AI explanation
}

export interface ServiceRecommendation {
    booking_codes: string[]; // e.g., ["GEL-X-FULL", "ART-LVL-2"]
    reasoning: string;
    estimated_duration_minutes: number;
    upsell_suggestion?: string;
    draft_reply: string; // Pre-written DM
}
