import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseApp, getFirebaseDb, isFcmEnabled } from '@/src/lib/firebase';

export type FcmSupport = { supported: boolean; reason?: string };

export function getFcmVapidKey(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? '';
}

export function getFcmSupport(): FcmSupport {
  if (typeof window === 'undefined') return { supported: false, reason: 'Push notifications are only available in the browser.' };
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return { supported: false, reason: 'Push notifications are not supported in this browser.' };
  if (process.env.NEXT_PUBLIC_ENABLE_FCM !== 'true') return { supported: false, reason: 'Push notifications are disabled.' };
  if (!getFcmVapidKey()) return { supported: false, reason: 'FCM VAPID key is not configured.' };
  if (!isFcmEnabled()) return { supported: false, reason: 'Firebase is not configured.' };
  return { supported: true };
}

export async function requestAndSaveFcmToken(uid: string): Promise<string> {
  const support = getFcmSupport();
  if (!support.supported) throw new Error(support.reason ?? 'Push notifications are unavailable.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications are blocked. Enable them in browser settings.');
  const app = getFirebaseApp();
  const db = getFirebaseDb();
  if (!app || !db) throw new Error('Firebase is not configured.');
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const messaging = await import('firebase/messaging');
  if (!(await messaging.isSupported())) throw new Error('Push notifications are not supported in this browser.');
  const token = await messaging.getToken(messaging.getMessaging(app), { vapidKey: getFcmVapidKey(), serviceWorkerRegistration: registration });
  if (!token) throw new Error('FCM token was not created. Please try again.');
  const tokenId = encodeURIComponent(token).replaceAll('.', '%2E').slice(0, 1400);
  await setDoc(doc(db, 'users', uid, 'notificationTokens', tokenId), {
    token,
    platform: 'web',
    userAgent: navigator.userAgent,
    enabled: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return token;
}

export async function disableFcmToken(uid: string, token: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured.');
  const tokenId = encodeURIComponent(token).replaceAll('.', '%2E').slice(0, 1400);
  await setDoc(doc(db, 'users', uid, 'notificationTokens', tokenId), { enabled: false, updatedAt: serverTimestamp() }, { merge: true });
}

export async function listenForForegroundMessages(onMessage: (payload: { title: string; body: string }) => void): Promise<() => void> {
  if (typeof window === 'undefined' || !isFcmEnabled() || !getFcmVapidKey()) return () => undefined;
  const app = getFirebaseApp();
  if (!app) return () => undefined;
  try {
    const messaging = await import('firebase/messaging');
    if (!(await messaging.isSupported())) return () => undefined;
    return messaging.onMessage(messaging.getMessaging(app), (payload) => {
      onMessage({ title: payload.notification?.title ?? 'Pixel Paws', body: payload.notification?.body ?? 'New notification received.' });
    });
  } catch {
    return () => undefined;
  }
}
