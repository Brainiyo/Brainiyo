/**
 * firebase.js — Brainiyo Mobile App (React Native)
 *
 * Initializes the Firebase Client SDK for:
 *   - Google Sign-In
 *   - Phone (OTP) Authentication
 *   - Firebase Analytics (optional)
 *
 * After sign-in, call ApiService.verifyToken(idToken) to exchange
 * the Firebase ID token for a Brainiyo JWT.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  PhoneAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDCX_nsfnQHwJzvGtcsp-Hy5VXcgV2pcAg",
  authDomain: "brainiy0.firebaseapp.com",
  projectId: "brainiy0",
  storageBucket: "brainiy0.firebasestorage.app",
  messagingSenderId: "390901315850",
  appId: "1:390901315850:web:ce04cbfb8f98ae13dc62f3",
  measurementId: "G-XHXW6VDGQG"
};

// Prevent re-initialising on hot reload
const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth             = getAuth(firebaseApp);
export const googleProvider   = new GoogleAuthProvider();
export const phoneProvider    = new PhoneAuthProvider(auth);

export { signInWithCredential, signInWithPhoneNumber };
export default firebaseApp;
