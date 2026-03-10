import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpxCZ_FrLobvFnBV0bBVkGEPwm7CUizes",
  authDomain: "nexus-coding-club.firebaseapp.com",
  projectId: "nexus-coding-club",
  storageBucket: "nexus-coding-club.firebasestorage.app",
  messagingSenderId: "1026752091830",
  appId: "1:1026752091830:web:0301ab106c94372696f817",
  measurementId: "G-ERXN0KJW3N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
