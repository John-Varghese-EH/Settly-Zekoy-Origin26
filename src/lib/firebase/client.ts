import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB9A_1ADbrTh60mFfgI-mFBv1bYSM42fsQ",
  authDomain: "settly-999ac.firebaseapp.com",
  projectId: "settly-999ac",
  storageBucket: "settly-999ac.firebasestorage.app",
  messagingSenderId: "508930654157",
  appId: "1:508930654157:web:58759e7c3026db42368e84",
  measurementId: "G-CB9QMPEJTV"
};

export function getApp(): FirebaseApp {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

export function getAuthInstance(): Auth {
  return getAuth(getApp());
}

export function signInWithGoogle() {
  return signInWithPopup(getAuthInstance(), new GoogleAuthProvider());
}

export function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(getAuthInstance(), email, password);
}

export function signOutUser() {
  return signOut(getAuthInstance());
}

export function onAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(getAuthInstance(), cb);
}

export type { User };
