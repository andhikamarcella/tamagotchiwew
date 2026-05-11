'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import EmailPasswordForm, { type EmailMode } from '@/src/components/auth/EmailPasswordForm';
import ForgotPasswordModal from '@/src/components/auth/ForgotPasswordModal';
import { useAuth } from '@/src/hooks/useAuth';
import { isFirebaseConfigured } from '@/src/lib/firebase';
import type { ToastMessage, ToastType } from '@/src/components/ui/ToastProvider';
import ToastProvider from '@/src/components/ui/ToastProvider';
import { useBodyScrollLock } from '@/src/hooks/useBodyScrollLock';

function GateButton({ children, loading, onClick }: { children: ReactNode; loading?: boolean; onClick: () => void }) {
  return <button type="button" disabled={loading} onClick={onClick} className="pixel-border-sm w-full bg-white px-4 py-3 text-[10px] text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Please wait...' : children}</button>;
}

export default function TrialExpiredGate({ onEmailLogin }: { onEmailLogin?: () => void }) {
  const auth = useAuth();
  useBodyScrollLock(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailMode, setEmailMode] = useState<EmailMode>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
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

  const handleEmailLogin = async (email: string, password: string) => {
    if (!configured) { showToast('Firebase is not configured.', 'warning'); return; }
    const result = await auth.signInWithEmail(email, password);
    showToast(result.ok ? 'Welcome back! Your guest backup is safe.' : result.message ?? 'Email login failed.', result.ok ? 'success' : 'warning');
    if (result.ok) onEmailLogin?.();
  };

  const handleEmailRegister = async (email: string, password: string) => {
    if (!configured) { showToast('Firebase is not configured.', 'warning'); return; }
    const result = auth.isGuest ? await auth.upgradeGuestWithEmail(email, password) : await auth.registerWithEmail(email, password);
    showToast(result.ok ? 'Account created and guest progress saved.' : result.message ?? 'Account creation failed.', result.ok ? 'success' : 'warning');
    if (result.ok) onEmailLogin?.();
  };

  const handleReset = async (email: string) => {
    if (!configured) { showToast('Firebase is not configured.', 'warning'); return false; }
    const result = await auth.sendResetEmail(email);
    showToast(result.ok ? 'Password reset email sent.' : result.message ?? 'Password reset failed.', result.ok ? 'success' : 'warning');
    return result.ok;
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-end overflow-hidden bg-slate-950/70 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true">
      <ToastProvider toasts={toasts} onClose={removeToast} />
      {forgotOpen && <ForgotPasswordModal initialEmail={forgotEmail} loading={auth.providerLoading.resetPassword} onSend={handleReset} onClose={() => setForgotOpen(false)} onToast={showToast} />}
      <section className="pixel-border modal-scroll-area max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl bg-white p-5 text-slate-950 shadow-[8px_8px_0_#0f172a] sm:max-w-lg sm:rounded-none sm:p-6">
        <div className="text-4xl">⏰🐾</div>
        <h2 className="mt-3 text-lg leading-relaxed">Your guest trial has ended</h2>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-700">Login atau register untuk lanjut main dan simpan pet kamu. Progress guest tetap dibackup lokal sambil kami coba sambungkan ke akunmu.</p>
        <div className="mt-5 grid gap-3">
          <GateButton loading={auth.providerLoading.google} onClick={() => void login('google')}>Continue with Google</GateButton>
          <GateButton loading={auth.providerLoading.microsoft} onClick={() => void login('microsoft')}>Continue with Microsoft</GateButton>
          <GateButton loading={auth.providerLoading.emailLogin || auth.providerLoading.emailRegister} onClick={() => setEmailOpen((next) => !next)}>Login / Register with Email</GateButton>
          {emailOpen && <EmailPasswordForm mode={emailMode} setMode={setEmailMode} disabled={!configured || Boolean(auth.loading)} loadingLogin={auth.providerLoading.emailLogin} loadingRegister={auth.providerLoading.emailRegister} onLogin={handleEmailLogin} onRegister={handleEmailRegister} onForgotPassword={(email) => { setForgotEmail(email); setForgotOpen(true); }} onToast={showToast} />}
          <p className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[10px] leading-relaxed text-slate-600">Guest trial sudah habis, jadi mode guest dikunci. Pilih Google, Microsoft, atau email agar game bisa lanjut tanpa kehilangan backup lokal.</p>
        </div>
      </section>
    </div>
  );
}
