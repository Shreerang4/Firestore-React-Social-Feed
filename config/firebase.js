// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseApiKey } from '../passwords';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: "fir-proj-caacc.firebaseapp.com",
    projectId: "fir-proj-caacc",
    storageBucket: "fir-proj-caacc.firebasestorage.app",
    messagingSenderId: "138835596427",
    appId: "1:138835596427:web:ecf0e2172335e467a5308e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);