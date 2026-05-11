import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function isFirebaseConfigured(): boolean {
  const required = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.storageBucket, firebaseConfig.messagingSenderId, firebaseConfig.appId];
  return required.every((value) => typeof value === 'string' && value.trim().length > 0);
}

export function getFirebasePublicConfigDebug() {
  return {
    apiKeyPresent: Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    apiKeyLength: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length ?? 0,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appIdPresent: Boolean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
    appIdLength: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.length ?? 0,
    fcmEnabled: process.env.NEXT_PUBLIC_ENABLE_FCM,
    vapidKeyPresent: Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY),
    vapidKeyLength: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim().length ?? 0,
  };
}

export function isFcmEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_FCM === 'true' && Boolean(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim()) && isFirebaseConfigured();
}

export function isRemoteConfigEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_REMOTE_CONFIG === 'true' && isFirebaseConfigured();
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

export async function getAnalyticsSafe() {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    const analytics = await import('firebase/analytics');
    if (!(await analytics.isSupported())) return null;
    return analytics.getAnalytics(app);
  } catch {
    return null;
  }
}
