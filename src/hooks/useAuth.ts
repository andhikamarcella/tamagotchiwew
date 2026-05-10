'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '@/src/lib/firebase';
import { getFirebaseErrorCode, getFriendlyFirebaseError } from '@/src/lib/firebaseErrors';
import { isValidEmail, validatePassword } from '@/src/lib/validators';
import { GUEST_SAVE_CACHE_KEY, GUEST_TRIAL_DURATION_MS, GUEST_TRIAL_EXPIRED_KEY, GUEST_TRIAL_START_KEY, computeGuestTrial, readGuestTrialExpired, readGuestTrialStart } from '@/src/lib/guestTrial';

export type AuthLoadingKey = 'google' | 'microsoft' | 'emailLogin' | 'emailRegister' | 'guest' | 'resetPassword' | 'signOut' | null;

type AuthActionResult = { ok: boolean; message?: string; user?: User | null };

type GuestTrialSnapshot = { startAt: number | null; endsAt: number | null; remainingMs: number; expired: boolean };

function getGuestTrialSnapshot(now = Date.now()): GuestTrialSnapshot {
  const startAt = readGuestTrialStart();
  const computed = computeGuestTrial(startAt, now);
  const expired = readGuestTrialExpired() || computed.expired;
  return { startAt, endsAt: computed.endsAt, remainingMs: expired ? 0 : computed.remainingMs, expired };
}

function writeGuestTrialExpired(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GUEST_TRIAL_EXPIRED_KEY, 'yes');
}

function ensureGuestTrialStarted(): GuestTrialSnapshot {
  if (typeof window === 'undefined') return getGuestTrialSnapshot();
  const existing = readGuestTrialStart();
  const startAt = existing ?? Date.now();
  if (!existing) window.localStorage.setItem(GUEST_TRIAL_START_KEY, String(startAt));
  const snapshot = getGuestTrialSnapshot();
  if (snapshot.expired) writeGuestTrialExpired();
  return getGuestTrialSnapshot();
}

function validateEmailPassword(email: string, password?: string): string | null {
  if (!isValidEmail(email)) return 'Please enter a valid email address.';
  if (password !== undefined) return validatePassword(password);
  return null;
}

async function syncUserProfile(user: User, trial?: GuestTrialSnapshot, upgradedFromGuest = false): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const providerIds = user.providerData.map((provider) => provider.providerId);
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName: user.displayName ?? (user.isAnonymous ? 'Guest Keeper' : 'Pixel Keeper'),
    email: user.email,
    photoURL: user.photoURL,
    providerId: providerIds[0] ?? (user.isAnonymous ? 'anonymous' : 'password'),
    providerIds,
    isAnonymous: user.isAnonymous,
    guestTrialStartAt: user.isAnonymous && trial?.startAt ? new Date(trial.startAt) : null,
    guestTrialEndsAt: user.isAnonymous && trial?.endsAt ? new Date(trial.endsAt) : null,
    guestTrialExpired: user.isAnonymous ? Boolean(trial?.expired) : false,
    ...(upgradedFromGuest ? { upgradedFromGuest: true, upgradedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<AuthLoadingKey>(null);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestTrial, setGuestTrial] = useState<GuestTrialSnapshot>(() => ({ startAt: null, endsAt: null, remainingMs: GUEST_TRIAL_DURATION_MS, expired: false }));

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setUser(null);
      setAuthReady(true);
      return undefined;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      const trial = getGuestTrialSnapshot();
      setGuestTrial(trial);
      if (nextUser) {
        void syncUserProfile(nextUser, nextUser.isAnonymous ? trial : undefined).catch((profileError) => {
          console.error('User profile sync failed:', profileError);
          setError(getFriendlyFirebaseError(profileError));
        });
      }
    });
  }, []);

  useEffect(() => {
    setGuestTrial(getGuestTrialSnapshot());
    const id = window.setInterval(() => {
      const next = getGuestTrialSnapshot();
      if (next.expired && !readGuestTrialExpired()) writeGuestTrialExpired();
      setGuestTrial(next.expired ? { ...next, remainingMs: 0 } : next);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const startGuestTrial = useCallback(async (currentUser?: User | null) => {
    const trial = ensureGuestTrialStarted();
    setGuestTrial(trial);
    const targetUser = currentUser ?? user;
    if (targetUser?.isAnonymous) await syncUserProfile(targetUser, trial).catch((profileError) => console.error('Guest trial sync failed:', profileError));
    return trial;
  }, [user]);

  const markGuestTrialExpired = useCallback(async () => {
    writeGuestTrialExpired();
    const trial = { ...getGuestTrialSnapshot(), remainingMs: 0, expired: true };
    setGuestTrial(trial);
    if (user?.isAnonymous) await syncUserProfile(user, trial).catch((profileError) => console.error('Guest trial expiry sync failed:', profileError));
    return trial;
  }, [user]);

  const migrateGuestToPermanentAccount = useCallback(async (targetUser?: User | null) => {
    const nextUser = targetUser ?? user;
    if (!nextUser || nextUser.isAnonymous || typeof window === 'undefined') return false;
    const cachedSave = window.localStorage.getItem(GUEST_SAVE_CACHE_KEY);
    if (!cachedSave) return false;
    const db = getFirebaseDb();
    if (!db) return false;
    try {
      await setDoc(doc(db, 'users', nextUser.uid), {
        isAnonymous: false,
        upgradedFromGuest: true,
        upgradedAt: serverTimestamp(),
        guestProgressMigration: {
          status: 'pending-choice',
          source: 'local-guest-cache',
          saveJson: cachedSave,
          cachedAt: serverTimestamp(),
        },
      }, { merge: true });
      setError('Guest progress saved to your account.');
      return true;
    } catch (migrationError) {
      console.error('Guest progress migration failed:', migrationError);
      setError('Login succeeded, but guest progress migration failed. Your local backup is safe.');
      return false;
    }
  }, [user]);

  const runAuthAction = useCallback(async (key: AuthLoadingKey, action: () => Promise<User | null>): Promise<AuthActionResult> => {
    if (!isFirebaseConfigured()) {
      const message = 'Firebase is not configured. Add Firebase env vars to enable online login.';
      setError(message);
      return { ok: false, message };
    }

    setLoading(key);
    setError(null);
    try {
      const nextUser = await action();
      if (nextUser) {
        setUser(nextUser);
        await syncUserProfile(nextUser, nextUser.isAnonymous ? getGuestTrialSnapshot() : undefined).catch((profileError) => {
          console.error('User profile sync failed:', profileError);
          setError('Login succeeded, but profile sync failed.');
        });
      }
      if (nextUser && !nextUser.isAnonymous) void migrateGuestToPermanentAccount(nextUser);
      return { ok: true, user: nextUser };
    } catch (err) {
      console.error('Auth action failed:', err);
      const message = getFirebaseErrorCode(err) === 'auth/admin-restricted-operation'
        ? 'Guest mode is not enabled. Please use Google, Microsoft, or Email login.'
        : getFriendlyFirebaseError(err);
      setError(message);
      return { ok: false, message };
    } finally {
      setLoading(null);
    }
  }, [migrateGuestToPermanentAccount]);

  const signInWithGoogle = useCallback(() => runAuthAction('google', async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const credential = await signInWithPopup(auth, provider);
      return credential.user;
    } catch (err) {
      if (getFirebaseErrorCode(err) === 'auth/popup-blocked') {
        setError('Popup was blocked. Trying redirect...');
        await signInWithRedirect(auth, provider);
        return auth.currentUser;
      }
      throw err;
    }
  }), [runAuthAction]);

  const signInWithMicrosoft = useCallback(() => runAuthAction('microsoft', async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const credential = await signInWithPopup(auth, provider);
      return credential.user;
    } catch (err) {
      if (getFirebaseErrorCode(err) === 'auth/popup-blocked') {
        setError('Popup was blocked. Trying redirect...');
        await signInWithRedirect(auth, provider);
        return auth.currentUser;
      }
      throw err;
    }
  }), [runAuthAction]);

  const signInWithEmail = useCallback((email: string, password: string) => runAuthAction('emailLogin', async () => {
    const validation = validateEmailPassword(email, password);
    if (validation) throw new Error(validation);
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  }), [runAuthAction]);

  const registerWithEmail = useCallback((email: string, password: string) => runAuthAction('emailRegister', async () => {
    const validation = validateEmailPassword(email, password);
    if (validation) throw new Error(validation);
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  }), [runAuthAction]);

  const sendResetEmail = useCallback((email: string) => runAuthAction('resetPassword', async () => {
    const validation = validateEmailPassword(email);
    if (validation) throw new Error(validation);
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    await sendPasswordResetEmail(auth, email.trim());
    return auth.currentUser;
  }), [runAuthAction]);

  const signInAsGuest = useCallback(() => runAuthAction('guest', async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    if (getGuestTrialSnapshot().expired) throw new Error('Guest trial ended. Please login with Google, Microsoft, or Email to keep playing.');
    const credential = await signInAnonymously(auth);
    await startGuestTrial(credential.user);
    return credential.user;
  }), [runAuthAction, startGuestTrial]);

  const signOutUser = useCallback(() => runAuthAction('signOut', async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    await signOut(auth);
    setUser(null);
    return null;
  }), [runAuthAction]);

  return useMemo(() => ({
    user,
    loading,
    authReady,
    error,
    providerLoading: {
      google: loading === 'google',
      microsoft: loading === 'microsoft',
      emailLogin: loading === 'emailLogin',
      emailRegister: loading === 'emailRegister',
      resetPassword: loading === 'resetPassword',
      guest: loading === 'guest',
    },
    isAuthenticated: Boolean(user),
    isGuest: Boolean(user?.isAnonymous),
    guestTrialStartAt: guestTrial.startAt,
    guestTrialEndsAt: guestTrial.endsAt,
    guestTrialRemainingMs: guestTrial.remainingMs,
    isGuestTrialExpired: Boolean(user?.isAnonymous && guestTrial.expired),
    hasGuestTrialExpired: guestTrial.expired,
    startGuestTrial,
    markGuestTrialExpired,
    migrateGuestToPermanentAccount,
    uid: user?.uid ?? null,
    displayName: user?.displayName ?? (user?.isAnonymous ? 'Guest Keeper' : null),
    email: user?.email ?? null,
    photoURL: user?.photoURL ?? null,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithEmail,
    registerWithEmail,
    sendResetEmail,
    signInAsGuest,
    signOutUser,
  }), [authReady, error, guestTrial, loading, markGuestTrialExpired, migrateGuestToPermanentAccount, registerWithEmail, sendResetEmail, signInAsGuest, signInWithEmail, signInWithGoogle, signInWithMicrosoft, signOutUser, startGuestTrial, user]);
}
