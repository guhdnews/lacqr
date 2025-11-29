import type { ServiceSelection } from './serviceSchema';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
    id: string;
    clientId: string;
    clientName: string;
    date: any; // Firestore Timestamp
    serviceDetails: ServiceSelection;
    totalPrice: number;
    status: AppointmentStatus;
    notes?: string;
    createdAt: any;
}
