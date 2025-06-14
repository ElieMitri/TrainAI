// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbPzIFqRc3-JZHbUXqDxCXxpVqyDkVF64",
  authDomain: "getfitai-32362.firebaseapp.com",
  projectId: "getfitai-32362",
  storageBucket: "getfitai-32362.firebasestorage.app",
  messagingSenderId: "764257480188",
  appId: "1:764257480188:web:b9de0039eee1c0a4ae1679",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
