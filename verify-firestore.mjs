import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, deleteDoc, doc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env file
const envPath = path.resolve(__dirname, '.env');
let envConfig = {};

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.error("Could not read .env file:", e);
    process.exit(1);
}

const firebaseConfig = {
    apiKey: envConfig.VITE_FIREBASE_API_KEY,
    authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envConfig.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase with config for project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyConnection() {
    try {
        console.log("Attempting to write to Firestore...");
        const testCollection = collection(db, 'verification_test');
        const docRef = await addDoc(testCollection, {
            timestamp: new Date().toISOString(),
            test: "Verification Script"
        });
        console.log("Document written with ID: ", docRef.id);

        console.log("Attempting to read from Firestore...");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
        } else {
            console.log("No such document!");
            throw new Error("Read failed");
        }

        console.log("Attempting to delete test document...");
        await deleteDoc(docRef);
        console.log("Document deleted successfully.");

        console.log("\nSUCCESS: Firestore is connected and writable.");
    } catch (e) {
        console.error("Error adding document: ", e);
        process.exit(1);
    }
}

verifyConnection();
