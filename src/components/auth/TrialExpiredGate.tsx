'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { isFirebaseConfigured } from '@/src/lib/firebase';
import type { ToastMessage, ToastType } from '@/src/components/ui/ToastProvider';
import ToastProvider from '@/src/components/ui/ToastProvider';

function GateButton({ children, loading, onClick }: { children: ReactNode; loading?: boolean; onClick: () => void }) {
  return <button type="button" disabled={loading} onClick={onClick} className="pixel-border-sm w-full bg-white px-4 py-3 text-[10px] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Please wait...' : children}</button>;
}

export default function TrialExpiredGate({ onEmailLogin }: { onEmailLogin?: () => void }) {
  const auth = useAuth();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const configured = isFirebaseConfigured();
  const removeToast = useCallback((id: string) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items.slice(-3), { id, message, type }]);
    window.setTimeout(() => removeToast(id), 3600);
  }, [removeToast]);

  useEffect(() => {
    if (auth.error) showToast(auth.error, auth.error.includes('succeeded') ? 'success' : 'warning');
  }, [auth.error, showToast]);

  const login = async (provider: 'google' | 'microsoft') => {
    if (!configured) { showToast('Firebase is not configured.', 'warning'); return; }
    const result = provider === 'google' ? await auth.signInWithGoogle() : await auth.signInWithMicrosoft();
    showToast(result.ok ? 'Welcome back! Your guest backup is safe.' : result.message ?? 'Login failed.', result.ok ? 'success' : 'warning');
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-slate-950/70 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true">
      <ToastProvider toasts={toasts} onClose={removeToast} />
      <section className="pixel-border max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 text-slate-950 shadow-[8px_8px_0_#0f172a] sm:max-w-md sm:rounded-none sm:p-6">
        <div className="text-4xl">⏰🐾</div>
        <h2 className="mt-3 text-lg leading-relaxed">Your guest trial has ended</h2>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-700">Login to keep playing and save your pets. Your guest progress stays backed up locally while we try to attach it to your account.</p>
        <div className="mt-5 grid gap-3">
          <GateButton loading={auth.providerLoading.google} onClick={() => void login('google')}>Continue with Google</GateButton>
          <GateButton loading={auth.providerLoading.microsoft} onClick={() => void login('microsoft')}>Continue with Microsoft</GateButton>
          <GateButton loading={auth.providerLoading.emailLogin || auth.providerLoading.emailRegister} onClick={() => onEmailLogin ? onEmailLogin() : showToast('Use Login / Register with Email from the sign-in page.', 'info')}>Login / Register with Email</GateButton>
          <button type="button" disabled className="w-full rounded border-2 border-slate-300 bg-slate-100 px-4 py-3 text-[10px] text-slate-500">View progress (read-only)</button>
        </div>
      </section>
    </div>
  );
}
