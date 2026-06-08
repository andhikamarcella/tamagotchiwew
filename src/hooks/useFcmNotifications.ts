'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { disableFcmToken, getFcmFriendlyError, getFcmSupport, listenForForegroundMessages, requestAndSaveFcmToken, requestFcmToken, resetNotificationServiceWorker } from '@/src/lib/fcm';
import { getFirebasePublicConfigDebug } from '@/src/lib/firebase';

type TokenStatus = 'not_created' | 'saved' | 'failed';

export function useFcmNotifications(uid: string | null, onToast?: (message: string, type?: 'success' | 'warning' | 'info') => void) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('not_created');
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const support = useMemo(() => getFcmSupport(), []);
  const diagnostics = useMemo(() => getFirebasePublicConfigDebug(), []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) setPermission(Notification.permission);
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistrations().then((regs) => setServiceWorkerRegistered(regs.some((reg) => reg.active?.scriptURL.includes('/sw.js') || reg.active?.scriptURL.includes('firebase-messaging-sw.js') || reg.scope === `${window.location.origin}/`))).catch(() => setServiceWorkerRegistered(false));
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    void listenForForegroundMessages((payload) => onToast?.(`${payload.title}: ${payload.body}`, 'info')).then((fn) => { unsubscribe = fn; });
    return () => { unsubscribe?.(); };
  }, [onToast]);

  const enable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = uid ? await requestAndSaveFcmToken(uid) : { token: await requestFcmToken(), savedToFirestore: false };
      setToken(result.token);
      setTokenStatus('saved');
      if ('Notification' in window) setPermission(Notification.permission);
      if ('serviceWorker' in navigator) setServiceWorkerRegistered(true);
      if (result.savedToFirestore) onToast?.('Notifications enabled!', 'success');
      else onToast?.(uid ? 'Token created, but cloud sync failed.' : 'Notifications enabled on this device. Sign in to sync the token to cloud.', uid ? 'warning' : 'success');
    } catch (enableError) {
      const message = getFcmFriendlyError(enableError);
      setError(message);
      setTokenStatus('failed');
      if (typeof window !== 'undefined' && 'Notification' in window) setPermission(Notification.permission);
      onToast?.(message, 'warning');
    } finally {
      setLoading(false);
    }
  }, [onToast, uid]);

  const disable = useCallback(async () => {
    if (!uid || !token) { setToken(null); setTokenStatus('not_created'); return; }
    setLoading(true);
    setError(null);
    try {
      await disableFcmToken(uid, token);
      setTokenStatus('not_created');
      setToken(null);
      onToast?.('Notifications disabled for this device.', 'success');
    } catch (disableError) {
      const message = getFcmFriendlyError(disableError);
      setError(message);
      onToast?.(message, 'warning');
    } finally {
      setLoading(false);
    }
  }, [onToast, token, uid]);

  const test = useCallback(() => onToast?.('Test notification: Pixel Paws can show in-app messages.', 'info'), [onToast]);
  const resetServiceWorker = useCallback(async () => {
    setLoading(true);
    try {
      await resetNotificationServiceWorker();
    } catch (resetError) {
      const message = getFcmFriendlyError(resetError);
      setError(message);
      onToast?.(message, 'warning');
      setLoading(false);
    }
  }, [onToast]);

  return { supported: support.supported, disabledReason: support.reason, permission, token, tokenStatus, serviceWorkerRegistered, diagnostics, loading, error, enable, disable, test, resetServiceWorker };
}
