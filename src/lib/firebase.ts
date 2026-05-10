import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.trim().length > 0);
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) return null;
  try {
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
  } catch {
    return null;
  }
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch {
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    return getAuth(app);
  } catch {
    return null;
  }
}

export const firebaseApp = getFirebaseApp();
export const db: Firestore | null = firebaseApp ? getFirebaseDb() : null;
export const auth: Auth | null = firebaseApp ? getFirebaseAuth() : null;

export async function ensureAnonymousUser(): Promise<User> {
  if (typeof window === 'undefined') throw new Error('Anonymous auth is only available in the browser.');
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) throw new Error('Firebase is not configured.');
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  try {
    const existingUser = await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
    if (existingUser) return existingUser;
    const credential = await signInAnonymously(firebaseAuth);
    return credential.user;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Anonymous auth failed.');
  }
}
