import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD9eXwSKq_edLZ3VibE-Ow_9wJ4YtcUte8",
    authDomain: "moja-4ca11.firebaseapp.com",
    projectId: "moja-4ca11",
    storageBucket: "moja-4ca11.firebasestorage.app",
    messagingSenderId: "897872936744",
    appId: "1:897872936744:web:aae0bcbb4b9bb9c9719a1d",
    measurementId: "G-7RB7D1F7B9"
};

// Initialize Firebase (Singleton pattern to avoid re-initialization on hot-reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
