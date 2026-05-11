import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseApp, getFirebaseDb, getFirebasePublicConfigDebug, isFcmEnabled } from '@/src/lib/firebase';

export const EXPECTED_FCM_PROJECT_ID = 'pixel-paws-tamagotchi';
export const EXPECTED_FCM_SENDER_ID = '330948794614';
export const FCM_TOKEN_KEY = 'pixel-paws-fcm-token';
export const FCM_STATUS_KEY = 'pixel-paws-fcm-status';

export type FcmSupport = { supported: boolean; reason?: string };
export type FcmTokenResult = { token: string; savedToFirestore: boolean; saveError?: string };

export function getFcmVapidKey(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? '';
}

export function getFcmSupport(): FcmSupport {
  if (typeof window === 'undefined') return { supported: false, reason: 'Push notifications are only available in the browser.' };
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return { supported: false, reason: 'Push notifications are not supported in this browser.' };
  if (process.env.NEXT_PUBLIC_ENABLE_FCM !== 'true') return { supported: false, reason: 'Push notifications are disabled.' };
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';
  if (!vapidKey.trim()) return { supported: false, reason: 'FCM VAPID key is missing.' };
  if (/\s/.test(vapidKey.trim())) return { supported: false, reason: 'FCM VAPID key contains spaces or line breaks.' };
  const debug = getFirebasePublicConfigDebug();
  if (!debug.apiKeyPresent) return { supported: false, reason: 'NEXT_PUBLIC_FIREBASE_API_KEY is missing in Vercel.' };
  if (debug.projectId !== EXPECTED_FCM_PROJECT_ID) return { supported: false, reason: 'Firebase projectId mismatch. Expected pixel-paws-tamagotchi.' };
  if (debug.messagingSenderId !== EXPECTED_FCM_SENDER_ID) return { supported: false, reason: 'Firebase messagingSenderId mismatch. Expected 330948794614.' };
  if (!debug.appIdPresent) return { supported: false, reason: 'NEXT_PUBLIC_FIREBASE_APP_ID is missing.' };
  if (!isFcmEnabled()) return { supported: false, reason: 'Firebase is not configured.' };
  return { supported: true };
}

export function getFcmFriendlyError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: string }).code) : '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (code === 'messaging/token-subscribe-failed' || message.includes('missing required authentication credential')) return 'FCM token request is missing Firebase credentials. Check NEXT_PUBLIC_FIREBASE_API_KEY, projectId, messagingSenderId, VAPID key, redeploy Vercel, then reset the notification service worker.';
  if (message === 'fcm-firebase-api-key-missing') return 'NEXT_PUBLIC_FIREBASE_API_KEY is missing in Vercel.';
  if (message === 'fcm-project-id-mismatch') return 'Firebase projectId mismatch. Expected pixel-paws-tamagotchi.';
  if (message === 'fcm-sender-id-mismatch') return 'Firebase messagingSenderId mismatch. Expected 330948794614.';
  if (message === 'fcm-app-id-missing') return 'NEXT_PUBLIC_FIREBASE_APP_ID is missing.';
  if (message === 'fcm-vapid-key-missing') return 'FCM VAPID key is missing.';
  if (message === 'fcm-vapid-key-whitespace') return 'FCM VAPID key contains spaces or line breaks.';
  if (message === 'fcm-vapid-key-too-short') return 'FCM VAPID key looks too short.';
  if (message === 'fcm-permission-not-granted') return 'Notifications are blocked. Enable them in browser settings.';
  if (message === 'fcm-service-worker-register-failed') return 'Notification service worker failed to register.';
  if (message === 'fcm-unsupported-browser' || message === 'fcm-unsupported') return 'Push notifications are not supported in this browser.';
  if (message === 'fcm-disabled') return 'Push notifications are disabled.';
  if (message === 'fcm-token-empty') return 'FCM token was not created. Please try again.';
  return message || 'Could not enable notifications.';
}

export async function requestFcmToken(): Promise<string> {
  if (typeof window === 'undefined') throw new Error('fcm-client-only');
  if (process.env.NEXT_PUBLIC_ENABLE_FCM !== 'true') throw new Error('fcm-disabled');
  if (!('Notification' in window)) throw new Error('fcm-notification-unsupported');
  if (!('serviceWorker' in navigator)) throw new Error('fcm-service-worker-unsupported');

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim();
  if (!vapidKey) throw new Error('fcm-vapid-key-missing');
  if (/\s/.test(vapidKey)) throw new Error('fcm-vapid-key-whitespace');
  if (vapidKey.length < 40) throw new Error('fcm-vapid-key-too-short');

  const debug = getFirebasePublicConfigDebug();
  if (!debug.apiKeyPresent) throw new Error('fcm-firebase-api-key-missing');
  if (debug.projectId !== EXPECTED_FCM_PROJECT_ID) throw new Error('fcm-project-id-mismatch');
  if (debug.messagingSenderId !== EXPECTED_FCM_SENDER_ID) throw new Error('fcm-sender-id-mismatch');
  if (!debug.appIdPresent) throw new Error('fcm-app-id-missing');

  const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
  const supported = await isSupported();
  if (!supported) throw new Error('fcm-unsupported-browser');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('fcm-permission-not-granted');

  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase is not configured.');
  const messaging = getMessaging(app);

  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    await registration.update();
  } catch (error) {
    console.error('FCM service worker registration failed:', error);
    throw new Error('fcm-service-worker-register-failed');
  }

  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error('fcm-token-empty');
  window.localStorage.setItem(FCM_TOKEN_KEY, token);
  window.localStorage.setItem(FCM_STATUS_KEY, 'created');
  return token;
}

export async function requestAndSaveFcmToken(uid: string): Promise<FcmTokenResult> {
  const token = await requestFcmToken();
  const db = getFirebaseDb();
  if (!db) return { token, savedToFirestore: false, saveError: 'Firebase is not configured.' };
  const tokenId = encodeURIComponent(token).replaceAll('.', '%2E').slice(0, 1400);
  try {
    await setDoc(doc(db, 'users', uid, 'notificationTokens', tokenId), {
      token,
      platform: 'web',
      enabled: true,
      permission: 'granted',
      userAgent: navigator.userAgent,
      projectId: EXPECTED_FCM_PROJECT_ID,
      messagingSenderId: EXPECTED_FCM_SENDER_ID,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    }, { merge: true });
    window.localStorage.setItem(FCM_STATUS_KEY, 'saved');
    return { token, savedToFirestore: true };
  } catch (error) {
    console.error('FCM token Firestore save failed:', error);
    window.localStorage.setItem(FCM_STATUS_KEY, 'created-cloud-sync-failed');
    return { token, savedToFirestore: false, saveError: getFcmFriendlyError(error) };
  }
}

export async function disableFcmToken(uid: string, token: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase is not configured.');
  const tokenId = encodeURIComponent(token).replaceAll('.', '%2E').slice(0, 1400);
  await setDoc(doc(db, 'users', uid, 'notificationTokens', tokenId), { enabled: false, updatedAt: serverTimestamp() }, { merge: true });
  window.localStorage.setItem(FCM_STATUS_KEY, 'disabled');
}

export async function listenForForegroundMessages(callback: (payload: { title: string; body: string }) => void): Promise<() => void> {
  if (typeof window === 'undefined' || !isFcmEnabled() || !getFcmVapidKey()) return () => undefined;
  const app = getFirebaseApp();
  if (!app) return () => undefined;
  try {
    const messagingModule = await import('firebase/messaging');
    if (!(await messagingModule.isSupported())) return () => undefined;
    return messagingModule.onMessage(messagingModule.getMessaging(app), (payload) => {
      callback({ title: payload.notification?.title ?? 'Pixel Paws', body: payload.notification?.body ?? 'New notification received.' });
    });
  } catch {
    return () => undefined;
  }
}

export async function resetNotificationServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((reg) => reg.unregister()));
  window.localStorage.removeItem(FCM_TOKEN_KEY);
  window.localStorage.removeItem(FCM_STATUS_KEY);
  window.location.reload();
}
