export type ServiceCategory = 'Extension' | 'Manicure' | 'Pedicure' | 'Removal';
export type ServiceTier = 'Full Set' | 'Fill' | 'Overlay';
export type ArtLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
export type NailLength = 'Short' | 'Medium' | 'Long' | 'XL' | 'XXL';
export type NailShape = 'Square' | 'Coffin' | 'Stiletto' | 'Almond' | 'Squoval';

export interface BaseService {
    id: string;
    name: string;
    category: ServiceCategory;
    tier: ServiceTier;
    basePrice: number;
    durationMinutes: number;
    description?: string;
    ai_tags?: string[]; // Keywords for AI matching (e.g. ["gel x", "soft gel", "apres"])
}

export interface AddOn {
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
    keywords: string[]; // For fuzzy matching (e.g. ["sparkle", "glitter", "shimmer"] -> "Chrome")
    pricing_unit?: 'per_nail' | 'flat_rate'; // Default to flat_rate if undefined
}

export interface LengthUpcharge {
    length: NailLength;
    price: number;
}

export interface MasterServiceMenu {
    services: BaseService[];
    addOns: AddOn[];
    lengthUpcharges: LengthUpcharge[];
    shapeUpcharges: { shape: NailShape; price: number }[];
}

export const DEFAULT_MENU: MasterServiceMenu = {
    services: [
        { id: 's1', name: 'Gel-X Full Set', category: 'Extension', tier: 'Full Set', basePrice: 65, durationMinutes: 90 },
        { id: 's2', name: 'Acrylic Full Set', category: 'Extension', tier: 'Full Set', basePrice: 55, durationMinutes: 90 },
        { id: 's3', name: 'Structured Gel Mani', category: 'Manicure', tier: 'Overlay', basePrice: 50, durationMinutes: 60 },
        { id: 's4', name: 'Gel Manicure', category: 'Manicure', tier: 'Overlay', basePrice: 40, durationMinutes: 45 },
    ],
    addOns: [
        { id: 'a1', name: 'French Tip', price: 15, durationMinutes: 15, keywords: ['french', 'white tip', 'smile line'] },
        { id: 'a2', name: 'Chrome / Glazed', price: 15, durationMinutes: 10, keywords: ['chrome', 'metallic', 'mirror', 'glazed', 'pearlescent', 'shimmer'] },
        { id: 'a3', name: 'Nail Art (Level 1)', price: 5, durationMinutes: 15, keywords: ['simple lines', 'dots', 'minimalist'] },
        { id: 'a4', name: 'Nail Art (Level 2)', price: 15, durationMinutes: 30, keywords: ['swirls', 'blooming gel', 'aura', 'ombre'] },
        { id: 'a5', name: 'Nail Art (Level 3)', price: 30, durationMinutes: 45, keywords: ['characters', 'detailed', 'complex', 'hand painted'] },
        { id: 'a6', name: '3D Charms (Per Nail)', price: 5, durationMinutes: 5, keywords: ['charm', 'bow', 'gem', 'stone', 'rhinestone', 'crystal'] },
    ],
    lengthUpcharges: [
        { length: 'Short', price: 0 },
        { length: 'Medium', price: 0 },
        { length: 'Long', price: 10 },
        { length: 'XL', price: 15 },
        { length: 'XXL', price: 25 },
    ],
    shapeUpcharges: [
        { shape: 'Square', price: 0 },
        { shape: 'Coffin', price: 0 },
        { shape: 'Stiletto', price: 0 },
        { shape: 'Almond', price: 0 },
        { shape: 'Squoval', price: 0 },
    ]
};
