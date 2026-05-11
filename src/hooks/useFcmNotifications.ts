'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { disableFcmToken, getFcmSupport, listenForForegroundMessages, requestAndSaveFcmToken } from '@/src/lib/fcm';

type TokenStatus = 'not_created' | 'saved' | 'failed';

export function useFcmNotifications(uid: string | null, onToast?: (message: string, type?: 'success' | 'warning' | 'info') => void) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('not_created');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const support = useMemo(() => getFcmSupport(), []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    void listenForForegroundMessages((payload) => onToast?.(`${payload.title}: ${payload.body}`, 'info')).then((fn) => { unsubscribe = fn; });
    return () => { unsubscribe?.(); };
  }, [onToast]);

  const enable = useCallback(async () => {
    if (!uid) { onToast?.('Please sign in before enabling notifications.', 'warning'); return; }
    setLoading(true);
    setError(null);
    try {
      const nextToken = await requestAndSaveFcmToken(uid);
      setToken(nextToken);
      setTokenStatus('saved');
      if ('Notification' in window) setPermission(Notification.permission);
      onToast?.('Notifications enabled!', 'success');
    } catch (enableError) {
      const message = enableError instanceof Error ? enableError.message : 'Could not enable notifications.';
      setError(message);
      setTokenStatus('failed');
      if (typeof window !== 'undefined' && 'Notification' in window) setPermission(Notification.permission);
      onToast?.(message, message.includes('blocked') ? 'warning' : 'warning');
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
      const message = disableError instanceof Error ? disableError.message : 'Could not disable notifications.';
      setError(message);
      onToast?.(message, 'warning');
    } finally {
      setLoading(false);
    }
  }, [onToast, token, uid]);

  const test = useCallback(() => onToast?.('Test notification: Pixel Paws can show in-app messages.', 'info'), [onToast]);

  return { supported: support.supported, disabledReason: support.reason, permission, token, tokenStatus, loading, error, enable, disable, test };
}
