'use client';

import type { FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, confirmPasswordReset, reload, sendEmailVerification, verifyPasswordResetCode } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '@/src/lib/firebase';
import { getFriendlyFirebaseError } from '@/src/lib/firebaseErrors';
import { getAuthActionCodeSettings } from '@/src/lib/authActionSettings';
import { validateConfirmPassword } from '@/src/lib/validators';

type ActionMode = 'resetPassword' | 'verifyEmail' | 'recoverEmail' | 'verifyAndChangeEmail';
type Status = 'checking' | 'form' | 'success' | 'error';

function ActionButton({ children, onClick, disabled, tone = 'bg-lime-100' }: { children: ReactNode; onClick: () => void; disabled?: boolean; tone?: string }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`pixel-border-sm w-full ${tone} px-4 py-3 text-[10px] text-slate-950 disabled:cursor-not-allowed disabled:opacity-50`}>{children}</button>;
}

function modeTitle(mode: ActionMode | null) {
  if (mode === 'resetPassword') return 'Create a new password';
  if (mode === 'verifyEmail') return 'Verify your email';
  if (mode === 'recoverEmail') return 'Recover your email';
  if (mode === 'verifyAndChangeEmail') return 'Confirm email change';
  return 'Invalid action link';
}

export default function AuthActionPage() {
  const router = useRouter();
  const params = useSearchParams();
  const rawMode = params.get('mode');
  const oobCode = params.get('oobCode') ?? '';
  const continueUrl = params.get('continueUrl') || '/';
  const mode = useMemo<ActionMode | null>(() => (rawMode === 'resetPassword' || rawMode === 'verifyEmail' || rawMode === 'recoverEmail' || rawMode === 'verifyAndChangeEmail') ? rawMode : null, [rawMode]);
  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState('Checking your action link...');
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const goHome = useCallback(() => router.replace('/'), [router]);
  const goContinue = useCallback(() => {
    try {
      const url = new URL(continueUrl, window.location.origin);
      router.replace(url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : '/');
    } catch {
      router.replace('/');
    }
  }, [continueUrl, router]);

  const showError = useCallback((nextMessage = 'Invalid or expired action link.') => {
    setStatus('error');
    setMessage(nextMessage);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) { showError('Firebase is not configured.'); return; }
    const auth = getFirebaseAuth();
    if (!auth) { showError('Firebase is not configured.'); return; }
    if (!mode || !oobCode) { showError('Invalid or expired action link.'); return; }

    let cancelled = false;
    const run = async () => {
      setStatus('checking');
      setMessage('Checking your action link...');
      try {
        if (mode === 'resetPassword') {
          const resetEmail = await verifyPasswordResetCode(auth, oobCode);
          if (cancelled) return;
          setEmail(resetEmail);
          setStatus('form');
          setMessage('Enter a new password for your Pixel Paws account.');
          return;
        }

        await applyActionCode(auth, oobCode);
        if (auth.currentUser) {
          await reload(auth.currentUser).catch(() => undefined);
          const refreshed = auth.currentUser;
          const db = getFirebaseDb();
          if (db && refreshed) await setDoc(doc(db, 'users', refreshed.uid), { email: refreshed.email, emailVerified: refreshed.emailVerified, updatedAt: serverTimestamp() }, { merge: true });
        }
        if (cancelled) return;
        setStatus('success');
        if (mode === 'verifyEmail') setMessage('Your Pixel Paws account is now verified.');
        else if (mode === 'recoverEmail') setMessage('Your sign-in email has been restored.');
        else setMessage('Your new sign-in email is now active.');
      } catch (error) {
        if (cancelled) return;
        showError(getFriendlyFirebaseError(error));
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [mode, oobCode, showError]);

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateConfirmPassword(password, confirmPassword);
    if (validation) { setMessage(validation); return; }
    const auth = getFirebaseAuth();
    if (!auth || !oobCode) { showError('Invalid or expired action link.'); return; }
    setLoading(true);
    setMessage('Updating your password...');
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('success');
      setMessage('You can now sign in with your new password.');
    } catch (error) {
      setMessage(getFriendlyFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth?.currentUser;
    if (!currentUser || currentUser.emailVerified) return;
    setLoading(true);
    try {
      const settings = getAuthActionCodeSettings();
      if (settings) await sendEmailVerification(currentUser, settings);
      else await sendEmailVerification(currentUser);
      setMessage('A new verification email was sent.');
    } catch (error) {
      setMessage(getFriendlyFirebaseError(error));
    } finally {
      setLoading(false);
    }
  };

  const icon = status === 'success' ? '✅' : status === 'error' ? '⚠️' : mode === 'resetPassword' ? '🔑' : '✉️';
  const title = status === 'success'
    ? (mode === 'resetPassword' ? 'Password updated!' : mode === 'verifyEmail' ? 'Email verified!' : mode === 'recoverEmail' ? 'Email recovered' : 'Email changed!')
    : status === 'error' ? 'Invalid or expired action link' : modeTitle(mode);

  return (
    <main className="grid min-h-screen w-full place-items-center overflow-x-hidden bg-[radial-gradient(circle_at_20%_20%,#fde68a,transparent_28%),radial-gradient(circle_at_80%_10%,#bae6fd,transparent_28%),linear-gradient(135deg,#bbf7d0,#fbcfe8)] p-4 font-pixel text-slate-950">
      <section className="pixel-border w-full max-w-md bg-white p-5 text-center sm:p-6">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border-4 border-slate-950 bg-lime-100 px-3 py-2 text-[10px] shadow-[3px_3px_0_#0f172a]"><span>🐾</span><span className="font-display">Pixel Paws</span></div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-4 border-slate-950 bg-yellow-100 text-3xl shadow-[4px_4px_0_#0f172a]">{icon}</div>
        <h1 className="mt-4 text-2xl leading-relaxed">{title}</h1>
        {email && status === 'form' && <p className="mt-2 break-all text-[10px] text-slate-600">Resetting password for {email}</p>}
        <p className="mt-3 text-[11px] leading-relaxed text-slate-700">{message}</p>

        {status === 'checking' && <div className="pixel-border-sm mt-5 bg-sky-100 px-4 py-3 text-[10px]">Checking your action link...</div>}

        {status === 'form' && mode === 'resetPassword' && (
          <form noValidate onSubmit={submitReset} className="mt-5 grid gap-3 text-left">
            <label className="grid gap-1 text-[10px] uppercase tracking-wider text-slate-700">New password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" className="w-full rounded-xl border-4 border-slate-950 bg-white px-3 py-3 text-xs outline-none focus:ring-4 focus:ring-yellow-200" placeholder="••••••" /></label>
            <label className="grid gap-1 text-[10px] uppercase tracking-wider text-slate-700">Confirm password<input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" className="w-full rounded-xl border-4 border-slate-950 bg-white px-3 py-3 text-xs outline-none focus:ring-4 focus:ring-yellow-200" placeholder="••••••" /></label>
            <button type="submit" disabled={loading} className="pixel-border-sm w-full bg-lime-100 px-4 py-3 text-center text-[10px] text-slate-950 disabled:opacity-50">{loading ? 'Resetting...' : 'Reset password'}</button>
          </form>
        )}

        <div className="mt-5 grid gap-3">
          {status === 'success' && <ActionButton onClick={mode === 'resetPassword' ? goHome : goContinue}>{mode === 'resetPassword' ? 'Back to login' : 'Continue to Pixel Paws'}</ActionButton>}
          {status === 'error' && <ActionButton onClick={goHome} tone="bg-white">Back to Pixel Paws</ActionButton>}
          {status === 'error' && mode === 'verifyEmail' && getFirebaseAuth()?.currentUser && !getFirebaseAuth()?.currentUser?.emailVerified && <ActionButton disabled={loading} onClick={() => void resendVerification()} tone="bg-yellow-100">Send a new verification email</ActionButton>}
        </div>
      </section>
    </main>
  );
}
