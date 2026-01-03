import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDGctsjwdsE3EfUIYNb3EzVdCyChMpv4To",
  authDomain: "cravio-dashboard.firebaseapp.com",
  projectId: "cravio-dashboard",
  storageBucket: "cravio-dashboard.firebasestorage.app",
  messagingSenderId: "433031056012",
  appId: "1:433031056012:web:b25a52bd95d45667b649a9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
