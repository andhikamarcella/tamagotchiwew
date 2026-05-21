import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export const OFFLINE_QUEUE_KEY = 'pixel-paws-offline-queue-v1';
const MAX_QUEUE_ITEMS = 200;
const COMPACTED_TYPES = new Set<OfflineQueueType>(['pet_update', 'settings_update', 'room_decor_update']);
const MAX_RETRY_ATTEMPTS = 3;

export type OfflineQueueType =
  | 'pet_update'
  | 'coins_update'
  | 'inventory_update'
  | 'settings_update'
  | 'activity_log'
  | 'achievement_update'
  | 'daily_update'
  | 'notification_update'
  | 'collection_update'
  | 'mailbox_update'
  | 'room_decor_update'
  | 'pet_request_update'
  | 'mini_game_result'
  | 'cheat_code_update'
  | 'badge_update'
  | 'album_update'
  | 'clinic_visit'
  | 'illness_update'
  | 'revive_history'
  | 'safety_item'
  | 'care_calendar'
  | 'mood_timeline'
  | 'training_update'
  | 'pet_journal';

export type OfflineQueueStatus = 'pending' | 'failed_permission' | 'failed_invalid' | 'retry_later';

export type OfflineQueueItem = {
  id: string;
  type: OfflineQueueType;
  uid: string | null;
  payload: Record<string, unknown>;
  createdAt: number;
  retryCount: number;
  status?: OfflineQueueStatus;
  lastError?: string;
  lastErrorAt?: number;
  lastPath?: string;
};

export type ProcessOfflineQueueResult = {
  ok: boolean;
  synced: number;
  failed: number;
  permissionDenied: boolean;
  unavailable: boolean;
  invalid: boolean;
  error?: string;
  failedType?: OfflineQueueType;
  failedPath?: string;
};

type QueueTarget = { path: string[]; data: Record<string, unknown> };

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function emitQueueChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('pixel-paws-offline-queue-changed'));
  }
}

function safeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cleanDocId(value: unknown, fallback: string): string {
  const next = String(value ?? fallback).replace(/[/.#[\]]/g, '-').slice(0, 120);
  return next || fallback;
}

export function getOfflineQueue(): OfflineQueueItem[] {
  if (!canUseStorage()) return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]') as OfflineQueueItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => item && typeof item.id === 'string' && typeof item.type === 'string');
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
    if (COMPACTED_TYPES.has(item.type)) {
      latestByType.set(`${item.uid ?? 'guest'}:${item.type}`, item);
    } else {
      keep.push(item);
    }
  }

  return [...keep, ...Array.from(latestByType.values())]
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-MAX_QUEUE_ITEMS);
}

export function addOfflineQueueItem(
  item: Partial<OfflineQueueItem> & { type: OfflineQueueType; payload: Record<string, unknown>; uid?: string | null },
): OfflineQueueItem {
  const next: OfflineQueueItem = {
    id: item.id ?? safeId(),
    type: item.type,
    uid: item.uid ?? null,
    payload: item.payload,
    createdAt: item.createdAt ?? Date.now(),
    retryCount: item.retryCount ?? 0,
    status: item.status ?? 'pending',
  };

  writeOfflineQueue(compactQueue([...getOfflineQueue(), next]));
  return next;
}

export function removeOfflineQueueItem(id: string): void {
  writeOfflineQueue(getOfflineQueue().filter((item) => item.id !== id));
}

export function clearOfflineQueue(uid?: string | null): void {
  if (uid === undefined) {
    writeOfflineQueue([]);
    return;
  }

  writeOfflineQueue(getOfflineQueue().filter((item) => item.uid !== uid));
}

export function markQueueItemFailed(
  id: string,
  status: OfflineQueueStatus,
  error: string,
  path?: string,
): void {
  writeOfflineQueue(
    getOfflineQueue().map((item) => (
      item.id === id
        ? {
            ...item,
            retryCount: item.retryCount + 1,
            status,
            lastError: error,
            lastErrorAt: Date.now(),
            lastPath: path,
          }
        : item
    )),
  );
}

export function getOfflineQueueSummary(uid?: string | null) {
  const items = getOfflineQueue().filter((item) => uid === undefined || !item.uid || item.uid === uid);
  const failed = items.filter((item) => item.status === 'failed_permission' || item.status === 'failed_invalid');
  const lastFailure = failed.at(-1);

  return {
    pending: items.filter((item) => !item.status || item.status === 'pending' || item.status === 'retry_later').length,
    failed: failed.length,
    lastError: lastFailure?.lastError,
    lastType: lastFailure?.type,
    lastPath: lastFailure?.lastPath,
  };
}

function targetForItem(uid: string, item: OfflineQueueItem): QueueTarget | null {
  const payload = item.payload;
  const base = {
    ...payload,
    offlineQueueId: item.id,
    offlineType: item.type,
    source: 'offline_queue',
    syncedAt: serverTimestamp(),
    localCreatedAt: item.createdAt,
  };

  switch (item.type) {
    case 'pet_update':
      return { path: ['users', uid, 'saveState', 'current'], data: base };
    case 'coins_update':
      return { path: ['users', uid, 'saveState', 'coins'], data: base };
    case 'inventory_update':
      return { path: ['users', uid, 'inventory', cleanDocId(payload.itemId, item.id)], data: base };
    case 'settings_update':
      return { path: ['users', uid, 'settings', 'gameplay'], data: base };
    case 'activity_log':
      return { path: ['users', uid, 'activityLogs', cleanDocId(payload.logId, item.id)], data: base };
    case 'achievement_update':
      return { path: ['users', uid, 'achievements', cleanDocId(payload.achievementId, item.id)], data: base };
    case 'daily_update':
      return { path: ['users', uid, 'dailyGoals', cleanDocId(payload.dateId, new Date(item.createdAt).toISOString().slice(0, 10))], data: base };
    case 'notification_update':
      return { path: ['users', uid, 'notifications', cleanDocId(payload.notificationId, item.id)], data: base };
    case 'collection_update':
      return { path: ['users', uid, 'collection', cleanDocId(payload.collectionId, 'current')], data: base };
    case 'mailbox_update':
      return { path: ['users', uid, 'mailbox', cleanDocId(payload.mailId, item.id)], data: base };
    case 'room_decor_update':
      return { path: ['users', uid, 'roomDecor', cleanDocId(payload.slotId, 'current')], data: base };
    case 'pet_request_update':
      return { path: ['users', uid, 'petRequests', cleanDocId(payload.requestId, item.id)], data: base };
    case 'mini_game_result':
      return { path: ['users', uid, 'miniGameResults', cleanDocId(payload.resultId, item.id)], data: base };
    case 'cheat_code_update':
      return { path: ['users', uid, 'usedCheatCodes', cleanDocId(payload.codeId, item.id)], data: base };
    case 'badge_update':
      return { path: ['users', uid, 'badges', cleanDocId(payload.badgeId, item.id)], data: base };
    case 'album_update':
      return { path: ['users', uid, 'album', cleanDocId(payload.momentId, item.id)], data: base };
    case 'clinic_visit':
      return { path: ['users', uid, 'clinicVisits', cleanDocId(payload.visitId, item.id)], data: base };
    case 'illness_update':
      return { path: ['users', uid, 'illnessHistory', cleanDocId(payload.illnessId, item.id)], data: base };
    case 'revive_history':
      return { path: ['users', uid, 'reviveHistory', cleanDocId(payload.reviveId, item.id)], data: base };
    case 'safety_item':
      return { path: ['users', uid, 'safetyItems', cleanDocId(payload.safetyItemId, item.id)], data: base };
    case 'care_calendar':
      return { path: ['users', uid, 'careCalendar', cleanDocId(payload.dateId, item.id)], data: base };
    case 'mood_timeline':
      return { path: ['users', uid, 'moodTimeline', cleanDocId(payload.eventId, item.id)], data: base };
    case 'training_update':
      return { path: ['users', uid, 'training', cleanDocId(payload.commandId, item.id)], data: base };
    case 'pet_journal':
      return { path: ['users', uid, 'petJournal', cleanDocId(payload.entryId, item.id)], data: base };
    default:
      return null;
  }
}

function errorCode(error: unknown): string {
  return typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: string }).code)
    : 'unknown';
}

export async function processOfflineQueue({ db, uid }: { db: Firestore | null; uid: string | null }): Promise<ProcessOfflineQueueResult> {
  if (!db || !uid) {
    return { ok: false, synced: 0, failed: getOfflineQueue().length, permissionDenied: false, unavailable: false, invalid: false, error: 'Firebase is not configured.' };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: false, synced: 0, failed: getOfflineQueue().length, permissionDenied: false, unavailable: true, invalid: false, error: 'You are offline.' };
  }

  const items = getOfflineQueue().filter((item) => !item.uid || item.uid === uid);
  let synced = 0;
  let failed = 0;
  let permissionDenied = false;
  let unavailable = false;
  let invalid = false;
  let failedType: OfflineQueueType | undefined;
  let failedPath: string | undefined;
  let errorMessage: string | undefined;

  for (const item of items) {
    const target = targetForItem(uid, item);

    if (!target) {
      failed += 1;
      invalid = true;
      failedType = item.type;
      errorMessage = `Invalid offline queue type: ${item.type}`;
      markQueueItemFailed(item.id, 'failed_invalid', errorMessage);
      continue;
    }

    const pathLabel = target.path.join('/');

    try {
      await setDoc(doc(db, pathLabel), target.data, { merge: true });
      removeOfflineQueueItem(item.id);
      synced += 1;
    } catch (error) {
      const code = errorCode(error);
      failed += 1;
      failedType = item.type;
      failedPath = pathLabel;
      errorMessage = code;

      console.warn(`[Pixel Paws] Offline sync failed for ${item.type} at ${pathLabel}:`, error);

      if (code.includes('permission-denied')) {
        permissionDenied = true;
        markQueueItemFailed(item.id, 'failed_permission', code, pathLabel);
      } else if (code.includes('unavailable') || code.includes('deadline-exceeded')) {
        unavailable = true;
        markQueueItemFailed(item.id, 'retry_later', code, pathLabel);
        break;
      } else {
        invalid = true;
        markQueueItemFailed(item.id, item.retryCount >= MAX_RETRY_ATTEMPTS ? 'failed_invalid' : 'retry_later', code, pathLabel);
        if (item.retryCount >= MAX_RETRY_ATTEMPTS) continue;
        break;
      }
    }
  }

  return { ok: failed === 0, synced, failed, permissionDenied, unavailable, invalid, error: errorMessage, failedType, failedPath };
}
