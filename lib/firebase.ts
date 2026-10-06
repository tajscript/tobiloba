// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDL1Zy3BiZfA5Ehcbk7kp7IhPh-wQ9p1Ns",
  authDomain: "tobitheartist-5bd70.firebaseapp.com",
  projectId: "tobitheartist-5bd70",
  storageBucket: "tobitheartist-5bd70.firebasestorage.app",
  messagingSenderId: "417509532418",
  appId: "1:417509532418:web:4e0b15a51b4b95a1a4981b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
