import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8iFF1Y_jzmVS0vA8MadGJHecGR86ckjM",
  authDomain: "rycreo.shop",
  projectId: "rycreoshop-d2e40",
  storageBucket: "rycreoshop-d2e40.firebasestorage.app",
  messagingSenderId: "825596692000",
  appId: "1:825596692000:web:e4b232beed18ae2f1e1e45"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);
export const storage = getStorage(app);
