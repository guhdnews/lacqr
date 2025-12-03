import { Timestamp } from 'firebase/firestore';

export interface ProductUsed {
    category: 'Base' | 'Color' | 'Top' | 'Builder' | 'Effect';
    brand: string;
    code: string;
    name: string;
}

export interface ServiceRecord {
    id: string;
    clientId: string;
    userId: string; // Tech ID
    date: Timestamp;

    // Service Details
    serviceType: string; // e.g., "Gel Manicure"
    shape: string;
    length: string;

    // The "Repair Order" (RO)
    productsUsed: ProductUsed[];
    addons: string[];

    // Financials
    price: number;
    tip: number;

    // Visuals (The "Sold Log")
    photos: {
        before?: string[];
        after?: string[];
    };

    techNotes: string;

    createdAt: Timestamp;
}
