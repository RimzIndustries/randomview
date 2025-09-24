
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCC_eSsGc4l4x7nllKCzvv0t5ofE0UhKLI",
  authDomain: "randomview-ce4b6.firebaseapp.com",
  projectId: "randomview-ce4b6",
  storageBucket: "randomview-ce4b6.firebasestorage.app",
  messagingSenderId: "240811585287",
  appId: "1:240811585287:web:0e989a03931ae74808dfa2",
  measurementId: "G-WZFYC0FZC7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
