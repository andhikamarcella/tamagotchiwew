import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export const OFFLINE_QUEUE_KEY = 'pixel-paws-offline-queue-v1';
const MAX_QUEUE_ITEMS = 200;

export type OfflineQueueType = 'pet_update' | 'coins_update' | 'inventory_update' | 'settings_update' | 'activity_log' | 'achievement_update' | 'daily_update';

export type OfflineQueueItem = {
  id: string;
  type: OfflineQueueType;
  uid: string | null;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function emitQueueChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('pixel-paws-offline-queue-changed'));
}

function safeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOfflineQueue(): OfflineQueueItem[] {
  if (!canUseStorage()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]') as OfflineQueueItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.id === 'string' && typeof item.type === 'string') : [];
  } catch {
    return [];
  }
}

function writeOfflineQueue(items: OfflineQueueItem[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items.slice(-MAX_QUEUE_ITEMS)));
  emitQueueChanged();
}

export function compactQueue(items = getOfflineQueue()): OfflineQueueItem[] {
  const latestByType = new Map<string, OfflineQueueItem>();
  const keep: OfflineQueueItem[] = [];
  for (const item of items) {
    if (item.type === 'pet_update' || item.type === 'settings_update') latestByType.set(`${item.uid ?? 'guest'}:${item.type}`, item);
    else keep.push(item);
  }
  const compacted = [...keep, ...Array.from(latestByType.values())].sort((a, b) => a.createdAt - b.createdAt);
  return compacted.slice(-MAX_QUEUE_ITEMS);
}

export function addOfflineQueueItem(item: Partial<OfflineQueueItem> & { type: OfflineQueueType; payload: Record<string, unknown>; uid?: string | null }): OfflineQueueItem {
  const next: OfflineQueueItem = {
    id: item.id ?? safeId(),
    type: item.type,
    uid: item.uid ?? null,
    payload: item.payload,
    createdAt: item.createdAt ?? Date.now(),
    retryCount: item.retryCount ?? 0,
  };
  writeOfflineQueue(compactQueue([...getOfflineQueue(), next]));
  return next;
}

export function removeOfflineQueueItem(id: string): void {
  writeOfflineQueue(getOfflineQueue().filter((item) => item.id !== id));
}

export function clearOfflineQueue(uid?: string | null): void {
  if (uid === undefined) writeOfflineQueue([]);
  else writeOfflineQueue(getOfflineQueue().filter((item) => item.uid !== uid));
}

export function markQueueItemFailed(id: string): void {
  writeOfflineQueue(getOfflineQueue().map((item) => item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item));
}

export type ProcessOfflineQueueResult = { ok: boolean; synced: number; failed: number; permissionDenied: boolean; unavailable: boolean; error?: string };

export async function processOfflineQueue({ db, uid }: { db: Firestore | null; uid: string | null }): Promise<ProcessOfflineQueueResult> {
  if (!db || !uid) return { ok: false, synced: 0, failed: getOfflineQueue().length, permissionDenied: false, unavailable: false, error: 'Firebase is not configured.' };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { ok: false, synced: 0, failed: getOfflineQueue().length, permissionDenied: false, unavailable: true, error: 'You are offline.' };
  const items = getOfflineQueue().filter((item) => !item.uid || item.uid === uid);
  let synced = 0;
  let failed = 0;
  let permissionDenied = false;
  let unavailable = false;

  for (const item of items) {
    try {
      await setDoc(doc(db, 'users', uid, 'offlineSync', item.id), {
        ...item,
        uid,
        syncedAt: serverTimestamp(),
      }, { merge: true });
      if (item.type === 'pet_update') {
        await setDoc(doc(db, 'users', uid, 'singlePlayerState', 'current'), {
          ...item.payload,
          updatedAt: serverTimestamp(),
          source: 'offline_queue',
        }, { merge: true });
      }
      removeOfflineQueueItem(item.id);
      synced += 1;
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : 'unknown';
      failed += 1;
      markQueueItemFailed(item.id);
      if (code.includes('permission-denied')) permissionDenied = true;
      if (code.includes('unavailable') || code.includes('deadline-exceeded')) unavailable = true;
      if (unavailable) break;
    }
  }
  return { ok: failed === 0, synced, failed, permissionDenied, unavailable };
}
