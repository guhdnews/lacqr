import { Timestamp } from 'firebase/firestore';

export type CorrectionType = 'missing_item' | 'wrong_price' | 'wrong_category' | 'blurry_image' | 'other';

export interface TrainingSample {
    id?: string;
    originalImage: string; // URL to storage
    aiPrediction: any; // The raw JSON from Gemini
    userCorrection: any; // The final state after user edits
    correctionType: CorrectionType[];
    timestamp: Timestamp;
    userId: string;
    salonId: string;
    deviceInfo: {
        userAgent: string;
        screenSize: string;
    };
    meta: {
        processingTimeMs: number;
        confidenceScore: number;
        isBlurry: boolean;
    };
}
