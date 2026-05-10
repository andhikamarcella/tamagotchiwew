'use client';

import { useEffect, useState } from 'react';
import { isFirebaseConfigured } from '@/src/lib/firebase';
import { useAuth } from '@/src/hooks/useAuth';

function Spinner() {
  return <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" aria-hidden="true" />;
}

function LoginToast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="fixed right-3 top-3 z-50 max-w-[calc(100vw-1.5rem)] pixel-border-sm animate-pop bg-white p-3 text-[10px] leading-relaxed">{message}</div>;
}

function AuthButton({ children, loading, disabled, onClick, tone = 'bg-pink-300' }: { children: React.ReactNode; loading?: boolean; disabled?: boolean; onClick: () => void; tone?: string }) {
  return <button type="button" disabled={disabled || loading} onClick={onClick} className={`pixel-border-sm ${tone} flex w-full items-center justify-center gap-2 px-3 py-3 text-[10px] leading-relaxed text-slate-950 transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50`}>{loading && <Spinner />}{children}</button>;
}

export default function LoginPage() {
  const configured = isFirebaseConfigured();
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (auth.error) setToast(auth.error);
  }, [auth.error]);

  const submitEmail = async () => {
    const result = mode === 'login' ? await auth.signInWithEmail(email, password) : await auth.registerWithEmail(email, password);
    setToast(result.ok ? (mode === 'login' ? 'Welcome back!' : 'Account created!') : result.message ?? 'Something went wrong. Please try again.');
  };

  const resetPassword = async () => {
    const result = await auth.sendResetEmail(email);
    setToast(result.ok ? 'Password reset email sent.' : result.message ?? 'Please enter a valid email address.');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg)] p-4 text-slate-950 sm:p-6">
      <LoginToast message={toast} />
      <section className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="pixel-border bg-[var(--panel)] p-5 text-center sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.35em]">Welcome to</p>
          <h1 className="mt-3 text-2xl leading-relaxed sm:text-4xl">Pixel Paws</h1>
          <div className="mx-auto mt-6 max-w-xs border-4 border-slate-950 bg-lime-100 p-4 shadow-[6px_6px_0_#0f172a]">
            <div className="mb-3 flex justify-between text-[9px]"><span>LCD PET</span><span>ONLINE READY</span></div>
            <div className="grid min-h-44 place-items-center border-4 border-slate-950 bg-lime-200 text-center">
              <div className="animate-idle text-7xl">🐾</div>
              <div className="text-[10px]">(^･ω･^)ﾉ</div>
            </div>
            <div className="mt-3 flex justify-center gap-2 text-[9px]"><span>HUN 88</span><span>JOY 92</span><span>LOVE 99</span></div>
          </div>
          <p className="mt-6 text-[10px] leading-relaxed">Login sederhana dan stabil: Google, Microsoft, Email + Password, atau Guest Mode. Tidak ada provider tambahan yang tidak dipakai.</p>
        </div>

        <div className="pixel-border bg-white p-4 sm:p-6">
          <h2 className="text-lg leading-relaxed">Sign in to play</h2>
          {!configured && (
            <div className="my-4 border-4 border-slate-950 bg-yellow-100 p-3 text-[10px] leading-relaxed">
              Firebase env vars are not configured yet. Online login and Couple Mode are disabled, but you can still play local single-player mode.
            </div>
          )}
          <div className="mt-4 grid gap-3">
            <AuthButton tone="bg-white" disabled={!configured} loading={auth.loading === 'google'} onClick={async () => { const result = await auth.signInWithGoogle(); setToast(result.ok ? 'Signed in with Google!' : result.message ?? 'Google login failed.'); }}>Continue with Google</AuthButton>
            <AuthButton tone="bg-blue-100" disabled={!configured} loading={auth.loading === 'microsoft'} onClick={async () => { const result = await auth.signInWithMicrosoft(); setToast(result.ok ? 'Signed in with Microsoft!' : result.message ?? 'Microsoft login failed.'); }}>Continue with Microsoft</AuthButton>
            <div className="grid gap-2 border-4 border-slate-950 bg-pink-50 p-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setMode('login')} className={`pixel-border-sm px-3 py-2 text-[10px] ${mode === 'login' ? 'bg-pink-300' : 'bg-white'}`}>Login with Email</button>
                <button type="button" onClick={() => setMode('register')} className={`pixel-border-sm px-3 py-2 text-[10px] ${mode === 'register' ? 'bg-pink-300' : 'bg-white'}`}>Register with Email</button>
              </div>
              <label className="text-[10px]">Email<input value={email} onChange={(event) => setEmail(event.target.value)} inputMode="email" autoComplete="email" className="mt-1 w-full border-4 border-slate-950 p-3 text-xs" placeholder="you@example.com" /></label>
              <label className="text-[10px]">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="mt-1 w-full border-4 border-slate-950 p-3 text-xs" placeholder="Minimum 6 characters" /></label>
              <AuthButton disabled={!configured} loading={auth.loading === 'email'} onClick={submitEmail}>{mode === 'login' ? 'Login with Email' : 'Register with Email'}</AuthButton>
              <button type="button" disabled={!configured || auth.loading === 'reset'} onClick={resetPassword} className="text-left text-[10px] underline disabled:opacity-50">{auth.loading === 'reset' ? 'Sending reset email...' : 'Forgot Password'}</button>
            </div>
            <AuthButton disabled={!configured} loading={auth.loading === 'guest'} onClick={async () => { const result = await auth.signInAsGuest(); setToast(result.ok ? 'Continuing as Guest!' : result.message ?? 'Guest mode is not enabled. Please use Google, Microsoft, or Email login.'); }}>Continue as Guest</AuthButton>
          </div>
        </div>
      </section>
    </main>
  );
}
