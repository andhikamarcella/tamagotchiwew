import { addDoc, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import type { CollectionReference, DocumentData, DocumentReference, Firestore, SetOptions, Transaction, UpdateData, WriteBatch, WithFieldValue } from 'firebase/firestore';
import { getFriendlyFirebaseError } from '@/src/lib/firebaseErrors';

type SafeResult<T = unknown> = { ok: true; data?: T } | { ok: false; offline?: boolean; code?: string; message: string };

function offlineResult(): SafeResult {
  return { ok: false, offline: true, code: 'offline', message: 'You’re offline. This action will sync later.' };
}

function errorResult(error: unknown): SafeResult {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : 'unknown';
  return { ok: false, code, message: getFriendlyFirebaseError(error) };
}

function canWriteOnline(): SafeResult | null {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return offlineResult();
  return null;
}

export async function safeSetDoc<T extends DocumentData>(ref: DocumentReference<T>, data: WithFieldValue<T>, options?: SetOptions): Promise<SafeResult> {
  const offline = canWriteOnline();
  if (offline) return offline;
  try {
    if (options) await setDoc(ref, data, options);
    else await setDoc(ref, data);
    return { ok: true };
  } catch (error) {
    console.error('safeSetDoc failed:', error);
    return errorResult(error);
  }
}

export async function safeUpdateDoc<T extends DocumentData>(ref: DocumentReference<T>, data: UpdateData<T>): Promise<SafeResult> {
  const offline = canWriteOnline();
  if (offline) return offline;
  try {
    await updateDoc(ref, data as never);
    return { ok: true };
  } catch (error) {
    console.error('safeUpdateDoc failed:', error);
    return errorResult(error);
  }
}

export async function safeAddDoc<T extends DocumentData>(ref: CollectionReference<T>, data: WithFieldValue<T>): Promise<SafeResult<DocumentReference<T>>> {
  const offline = canWriteOnline();
  if (offline) return offline as SafeResult<DocumentReference<T>>;
  try {
    const dataRef = await addDoc(ref, data);
    return { ok: true, data: dataRef };
  } catch (error) {
    console.error('safeAddDoc failed:', error);
    return errorResult(error) as SafeResult<DocumentReference<T>>;
  }
}

export async function safeBatchCommit(batch: WriteBatch): Promise<SafeResult> {
  const offline = canWriteOnline();
  if (offline) return offline;
  try {
    await batch.commit();
    return { ok: true };
  } catch (error) {
    console.error('safeBatchCommit failed:', error);
    return errorResult(error);
  }
}

export async function safeRunTransaction<T>(db: Firestore | null, updateFunction: (transaction: Transaction) => Promise<T>): Promise<SafeResult<T>> {
  if (!db) return { ok: false, code: 'firebase-not-configured', message: 'Firebase is not configured. Add Firebase env vars to enable online features.' };
  const offline = canWriteOnline();
  if (offline) return offline as SafeResult<T>;
  try {
    const data = await runTransaction(db, updateFunction);
    return { ok: true, data };
  } catch (error) {
    console.error('safeRunTransaction failed:', error);
    return errorResult(error) as SafeResult<T>;
  }
}
