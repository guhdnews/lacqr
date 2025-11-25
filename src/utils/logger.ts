import { getFirestore, collection, addDoc } from 'firebase/firestore';

/**
 * Logs a system error to the 'system_logs' collection in Firestore.
 * @param error The error object or message.
 * @param context Additional context about where the error occurred.
 */
export const logSystemError = async (error: any, context: string) => {
    console.error(`[${context}]`, error);

    try {
        const db = getFirestore();
        await addDoc(collection(db, 'system_logs'), {
            timestamp: new Date().toISOString(),
            context,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            userAgent: navigator.userAgent,
        });
    } catch (loggingError) {
        console.error("Failed to log error to Firestore:", loggingError);
    }
};
