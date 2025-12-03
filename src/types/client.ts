import { Timestamp } from 'firebase/firestore';

export interface NailProfile {
    bedSize: 'Small' | 'Medium' | 'Large' | 'Unknown';
    bedShape: 'Flat' | 'Curved' | 'Ski Jump' | 'Unknown';
    cuticleType: 'Dry' | 'Oily' | 'Normal' | 'Unknown';
    naturalNailHealth: 'Strong' | 'Brittle' | 'Peeling' | 'Bitten' | 'Unknown';
    notes: string;
}

export interface ClientPreferences {
    preferredShapes: string[];
    preferredLengths: string[];
    favoriteColors: string[];
    dislikes: string[];
}

export interface ClientStats {
    totalSpend: number;
    visitCount: number;
    averageTicket: number;
    averageTipPercent: number;
    noShowCount: number;
    cancellationCount: number;
    clientGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'New';
    firstVisitDate?: Timestamp;
    lastVisitDate?: Timestamp;
}

export interface ClientLifecycle {
    predictedNextVisit?: Timestamp;
    avgIntervalDays: number;
    churnRisk: boolean;
}

export interface Client {
    id: string;
    userId: string; // The tech who owns this client
    name: string;
    phone?: string;
    email?: string;
    instagram?: string;
    dob?: string; // YYYY-MM-DD
    notes?: string;

    // Dealership Model Extensions
    nailProfile?: NailProfile;
    preferences?: ClientPreferences;
    stats?: ClientStats;
    lifecycle?: ClientLifecycle;

    createdAt: any; // Timestamp
    updatedAt?: any; // Timestamp
}
