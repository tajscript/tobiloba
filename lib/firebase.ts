// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyADJeIyrTm63oddB-8Nul6OposwMzRDeUg",
  authDomain: "tobiadetimehin-bb367.firebaseapp.com",
  projectId: "tobiadetimehin-bb367",
  storageBucket: "tobiadetimehin-bb367.firebasestorage.app",
  messagingSenderId: "197811884438",
  appId: "1:197811884438:web:01e478e04dd5ad19754db7",
  measurementId: "G-2G01KTWG75"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;