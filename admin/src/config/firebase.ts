import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB40rs2AS30p35OAViEg4DQ45oudpZdgHE",
  authDomain: "brainiyo-1c200.firebaseapp.com",
  projectId: "brainiyo-1c200",
  storageBucket: "brainiyo-1c200.firebasestorage.app",
  messagingSenderId: "337029153114",
  appId: "1:337029153114:web:a0b113f23edb097c317363",
  measurementId: "G-DPHML0WFBT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
