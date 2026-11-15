// Owner: Karen. Firebase client initialization and services.
// Lazy and optional: nothing runs at import time, and every getter returns null until all four NEXT_PUBLIC_FIREBASE_* values exist.
// Without config the app uses its local fallback (src/app/api/vote, an in-memory store on one server), so `next build` and local
// demos work with a blank .env.local.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// NEXT_PUBLIC_ values are inlined at build time, so each one must be written out in full here.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** True when every Firebase value is filled in (.env.local, or the Vercel project's env vars). */
export const firebaseConfigured = Object.values(firebaseConfig).every((v) => v.trim().length > 0);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfigured) return null;
  if (!app) app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/** Firestore, or null without config. */
export function getDb(): Firestore | null {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}

/** Firebase Auth, browser only (sign-in needs a window), or null without config. */
export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  const a = getFirebaseApp();
  if (!a) return null;
  if (!auth) auth = getAuth(a);
  return auth;
}

export const googleProvider = new GoogleAuthProvider();
