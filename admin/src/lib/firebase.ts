import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCX_nsfnQHwJzvGtcsp-Hy5VXcgV2pcAg",
  authDomain: "brainiy0.firebaseapp.com",
  projectId: "brainiy0",
  storageBucket: "brainiy0.firebasestorage.app",
  messagingSenderId: "390901315850",
  appId: "1:390901315850:web:ce04cbfb8f98ae13dc62f3",
  measurementId: "G-XHXW6VDGQG"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
