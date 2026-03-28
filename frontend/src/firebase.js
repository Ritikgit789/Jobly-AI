import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Firebase configuration - Replace with your own config from Firebase Console
// For demo purposes, using a test project
const firebaseConfig = {
    apiKey: "AIzaSyDemo_Replace_With_Your_Key",
    authDomain: "jobly-ai-demo.firebaseapp.com",
    projectId: "jobly-ai-demo",
    storageBucket: "jobly-ai-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };
