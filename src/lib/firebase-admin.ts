import * as admin from 'firebase-admin';

export function getAdminAuth() {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        } catch (error) {
            console.error('Firebase admin initialization error', error);
            return null;
        }
    }
    return admin.auth();
}

export function getAdminDb() {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        } catch (error) {
            console.error('Firebase admin initialization error', error);
            return null;
        }
    }
    return admin.firestore();
}
