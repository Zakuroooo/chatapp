import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhCbxf2O6YAtg9H46agO4FweI-Ai2kSaI",
    authDomain: "reactchat-64079.firebaseapp.com",
    projectId: "reactchat-64079",
    storageBucket: "reactchat-64079.appspot.com",
    messagingSenderId: "554670324902",
    appId: "1:554670324902:web:3606e016ba865f3727c867"
  };



// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app); 
export const db = getFirestore(app);
export const storage = getStorage(app);
