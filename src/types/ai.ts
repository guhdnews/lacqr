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
    raw_bom?: BOM;
}

export interface ServiceRecommendation {
    booking_codes: string[];
    estimated_duration_minutes: number;
    upsell_suggestion?: string;
    reasoning: string;
    draft_reply: string;
}

export interface MasterAttributeSchema {
    canvas: {
        foundation: 'Natural' | 'Acrylic' | 'Gel-X' | 'Dip' | 'Polygel';
        length: 'Short' | 'Medium' | 'Long' | 'XL' | 'XXL';
        shape: 'Square' | 'Almond' | 'Coffin' | 'Stiletto' | 'Duck';
    };
    design: {
        complexity_tier: 1 | 2 | 3 | 4;
        finish: 'Glossy' | 'Matte' | 'Chrome' | 'Cat-Eye';
        hand_painted: boolean;
    };
    inventory: {
        gem_count: number;
        charm_count: number;
        piercing_count: number;
    };
}

// Alias BOM to the new schema for now, but we will migrate to using MasterAttributeSchema directly
export type BOM = MasterAttributeSchema;
