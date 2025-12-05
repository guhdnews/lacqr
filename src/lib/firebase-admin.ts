export function getAdminAuth() {
    const admin = require('firebase-admin');
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
    const admin = require('firebase-admin');
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
