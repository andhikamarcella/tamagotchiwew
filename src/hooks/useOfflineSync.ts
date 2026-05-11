'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Firestore } from 'firebase/firestore';
import { clearOfflineQueue, getOfflineQueue, processOfflineQueue } from '@/src/lib/offlineQueue';

export type OfflineSyncStatus = 'saved' | 'saved_offline' | 'syncing' | 'synced' | 'failed' | 'online';

export function useOfflineSync({ isOnline, uid, db, onToast }: { isOnline: boolean; uid: string | null; db: Firestore | null; onToast?: (message: string, type?: 'info' | 'success' | 'warning') => void }) {
  const [status, setStatus] = useState<OfflineSyncStatus>('online');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const syncingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const refreshCount = useCallback(() => setPendingCount(getOfflineQueue().filter((item) => !uid || !item.uid || item.uid === uid).length), [uid]);

  useEffect(() => {
    refreshCount();
    const handler = () => refreshCount();
    window.addEventListener('pixel-paws-offline-queue-changed', handler);
    return () => window.removeEventListener('pixel-paws-offline-queue-changed', handler);
  }, [refreshCount]);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return false;
    refreshCount();
    if (!isOnline || !uid || !db || getOfflineQueue().length === 0) return false;
    syncingRef.current = true;
    setStatus('syncing');
    const result = await processOfflineQueue({ db, uid });
    syncingRef.current = false;
    refreshCount();
    if (result.ok || result.synced > 0) {
      setStatus('synced');
      setLastSyncedAt(Date.now());
      if (result.synced > 0) onToast?.('Offline progress synced.', 'success');
      return true;
    }
    setStatus('failed');
    if (result.permissionDenied) onToast?.('Some offline changes could not sync. Check permissions.', 'warning');
    else if (result.unavailable) onToast?.('Connection unavailable. Your progress is safe locally.', 'warning');
    return false;
  }, [db, isOnline, onToast, refreshCount, uid]);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!isOnline || !uid || pendingCount === 0) return undefined;
    timerRef.current = window.setTimeout(() => { void syncNow(); }, 2000);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [isOnline, pendingCount, syncNow, uid]);

  const clearQueue = useCallback(() => {
    clearOfflineQueue(uid ?? undefined);
    refreshCount();
    setStatus(isOnline ? 'online' : 'saved_offline');
  }, [isOnline, refreshCount, uid]);

  return { status, setStatus, pendingCount, lastSyncedAt, syncNow, clearQueue };
}
