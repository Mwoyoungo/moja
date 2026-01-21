import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error("❌ Firebase configuration is missing required fields!");
    console.error("Please check your .env.local file");
}

// Initialize Firebase (Singleton pattern to avoid re-initialization on hot-reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore with better settings
let db: ReturnType<typeof getFirestore>;

if (!getApps().length || getApps().length === 1) {
    try {
        // Initialize with settings for better performance and offline support
        db = initializeFirestore(app, {
            experimentalForceLongPolling: true, // Helps with connectivity issues
            ignoreUndefinedProperties: true,
        });
        console.log("✅ Firestore initialized successfully");
    } catch (error) {
        console.error("❌ Error initializing Firestore:", error);
        db = getFirestore(app);
    }
} else {
    db = getFirestore(app);
}

// Initialize Storage
const storage = getStorage(app);

// Log connection status (only in development)
if (process.env.NODE_ENV === 'development') {
    console.log("🔥 Firebase initialized with project:", firebaseConfig.projectId);
}

export { app, auth, db, storage };
