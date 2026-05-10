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

export type AuthLoadingKey = 'google' | 'microsoft' | 'email' | 'guest' | 'reset' | 'signOut' | null;

type AuthActionResult = { ok: boolean; message?: string; user?: User | null };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmailPassword(email: string, password?: string): string | null {
  if (!emailPattern.test(email.trim())) return 'Please enter a valid email address.';
  if (password !== undefined && password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

async function syncUserProfile(user: User): Promise<void> {
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
      if (nextUser) {
        void syncUserProfile(nextUser).catch((profileError) => {
          console.error('User profile sync failed:', profileError);
          setError(getFriendlyFirebaseError(profileError));
        });
      }
    });
  }, []);

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
        await syncUserProfile(nextUser);
      }
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
  }, []);

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

  const signInWithEmail = useCallback((email: string, password: string) => runAuthAction('email', async () => {
    const validation = validateEmailPassword(email, password);
    if (validation) throw new Error(validation);
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  }), [runAuthAction]);

  const registerWithEmail = useCallback((email: string, password: string) => runAuthAction('email', async () => {
    const validation = validateEmailPassword(email, password);
    if (validation) throw new Error(validation);
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase is not configured.');
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  }), [runAuthAction]);

  const sendResetEmail = useCallback((email: string) => runAuthAction('reset', async () => {
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
    const credential = await signInAnonymously(auth);
    return credential.user;
  }), [runAuthAction]);

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
    isAuthenticated: Boolean(user),
    isGuest: Boolean(user?.isAnonymous),
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
  }), [authReady, error, loading, registerWithEmail, sendResetEmail, signInAsGuest, signInWithEmail, signInWithGoogle, signInWithMicrosoft, signOutUser, user]);
}
