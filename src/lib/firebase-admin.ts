import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        console.log('Firebase Admin Initialized');
    } catch (error: any) {
        console.error('Firebase admin initialization error', error.stack);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
