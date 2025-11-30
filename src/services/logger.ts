import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface LogEntry {
    timestamp: any; // Firestore timestamp or Date
    level: 'info' | 'warn' | 'error';
    message: string;
    stack?: string;
    userAgent: string;
    url: string;
    userId?: string;
}

export const logError = async (message: string, error?: any, userId?: string) => {
    try {
        const entry: LogEntry = {
            timestamp: new Date(),
            level: 'error',
            message: message,
            stack: error?.stack || JSON.stringify(error),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'server',
            userId: userId || 'anonymous'
        };

        // Fire and forget - don't await to avoid blocking UI
        addDoc(collection(db, 'app_logs'), entry).catch(e => console.error("Failed to write log to Firestore", e));

    } catch (e) {
        console.error("Logger failed:", e);
    }
};
