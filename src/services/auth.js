// services/auth.js
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDGctsjwdsE3EfUIYNb3EzVdCyChMpv4To",
  authDomain: "cravio-dashboard.firebaseapp.com",
  projectId: "cravio-dashboard",
  storageBucket: "cravio-dashboard.firebasestorage.app",
  messagingSenderId: "433031056012",
  appId: "1:433031056012:web:b25a52bd95d45667b649a9"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
