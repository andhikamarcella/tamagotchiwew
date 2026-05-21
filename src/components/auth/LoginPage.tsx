'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthProviderButton from '@/src/components/auth/AuthProviderButton';
import EmailPasswordForm, { type EmailMode } from '@/src/components/auth/EmailPasswordForm';
import ForgotPasswordModal from '@/src/components/auth/ForgotPasswordModal';
import ToastProvider, { type ToastMessage, type ToastType } from '@/src/components/ui/ToastProvider';
import { useAuth } from '@/src/hooks/useAuth';
import { formatGuestTrialTime } from '@/src/lib/guestTrial';
import { isFirebaseConfigured } from '@/src/lib/firebase';

function PixelScene() {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border-4 border-slate-950 bg-gradient-to-br from-lime-100 via-pink-100 to-sky-100 p-5 shadow-[8px_8px_0_#0f172a] sm:p-7">
      <div className="absolute left-5 top-6 text-lg animate-sparkle-float">✦</div>
      <div className="absolute right-8 top-10 text-xl animate-idle">💗</div>
      <div className="absolute bottom-10 left-7 text-2xl">🥣</div>
      <div className="absolute bottom-24 right-7 rotate-12 text-2xl">🐾</div>
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-4 border-slate-950 bg-white/80 px-3 py-2 text-[10px] shadow-[3px_3px_0_#0f172a]"><span>🐾</span><span>Pixel Paws</span></div>
          <h1 className="mt-5 text-3xl leading-relaxed sm:text-4xl">Care for your 8-bit pet together.</h1>
          <p className="mt-3 max-w-sm text-[11px] leading-relaxed">Feed, play, collect tiny memories, and invite someone special into your cozy pixel room.</p>
        </div>
        <div className="mx-auto w-full max-w-sm rounded-[2rem] border-4 border-slate-950 bg-pink-200 p-4 shadow-[6px_6px_0_#0f172a]">
          <div className="mb-3 flex items-center justify-between text-[9px]"><span>LCD PET</span><span>ONLINE READY</span></div>
          <div className="relative grid min-h-48 place-items-center overflow-hidden rounded-2xl border-4 border-slate-950 bg-lime-200 text-center shadow-inner">
            <div className="absolute left-4 top-3 text-[10px]">✧ ✧</div>
            <div className="absolute right-4 top-3 text-[10px]">♡</div>
            <div className="animate-idle text-7xl text-slate-950 grayscale">🐱</div>
            <div className="absolute bottom-3 text-[10px] text-slate-950">(^･ω･^)ﾉ</div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px]"><span className="border-2 border-slate-950 bg-white py-1">HUN 88</span><span className="border-2 border-slate-950 bg-white py-1">JOY 92</span><span className="border-2 border-slate-950 bg-white py-1">LOVE 99</span></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const configured = isFirebaseConfigured();
  const auth = useAuth();
  const [mode, setMode] = useState<EmailMode>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items.slice(-3), { id, message, type }]);
    window.setTimeout(() => removeToast(id), 3600);
  }, [removeToast]);

  useEffect(() => {
    if (auth.error) showToast(auth.error, auth.error.includes('succeeded') ? 'warning' : 'error');
  }, [auth.error, showToast]);

  useEffect(() => {
    const resetMessage = window.localStorage.getItem('pixel-paws-reset-toast');
    if (!resetMessage) return;
    window.localStorage.removeItem('pixel-paws-reset-toast');
    showToast(resetMessage, 'success');
  }, [showToast]);

  const requireFirebase = () => {
    if (configured) return true;
    showToast('Firebase is not configured.', 'warning');
    return false;
  };

  const guestButtonText = useMemo(() => {
    if (auth.hasGuestTrialExpired) return 'Guest trial ended';
    if (auth.guestTrialStartAt) return `Continue Guest Trial — ${formatGuestTrialTime(auth.guestTrialRemainingMs)} left`;
    return 'Try as Guest — 5 minutes';
  }, [auth.guestTrialRemainingMs, auth.guestTrialStartAt, auth.hasGuestTrialExpired]);

  const handleProvider = async (provider: 'google' | 'microsoft') => {
    if (!requireFirebase()) return;
    const result = provider === 'google' ? await auth.signInWithGoogle() : await auth.signInWithMicrosoft();
    showToast(result.ok ? `Signed in with ${provider === 'google' ? 'Google' : 'Microsoft'}!` : result.message ?? 'Something went wrong. Please try again.', result.ok ? 'success' : 'error');
  };

  const handleLogin = async (email: string, password: string) => {
    if (!requireFirebase()) return;
    const result = await auth.signInWithEmail(email, password);
    showToast(result.ok ? 'Welcome back!' : result.message ?? 'Email login failed.', result.ok ? 'success' : 'error');
  };

  const handleRegister = async (email: string, password: string) => {
    if (!requireFirebase()) return;
    const result = await auth.registerWithEmail(email, password);
    showToast(result.ok ? 'Account created!' : result.message ?? 'Account creation failed.', result.ok ? 'success' : 'error');
  };

  const handleReset = async (email: string) => {
    if (!requireFirebase()) return false;
    const result = await auth.sendResetEmail(email);
    showToast(result.ok ? 'Password reset email sent.' : result.message ?? 'Password reset failed.', result.ok ? 'success' : 'error');
    return result.ok;
  };

  const handleGuest = async () => {
    if (auth.hasGuestTrialExpired) { showToast('Login to keep playing.', 'warning'); return; }
    if (!requireFirebase()) return;
    const result = await auth.signInAsGuest();
    showToast(result.ok ? 'Continuing as Guest!' : result.message ?? 'Guest mode is not enabled. Please use Google, Microsoft, or Email login.', result.ok ? 'success' : 'error');
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 p-4 text-slate-950 sm:p-6 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,.35),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(125,211,252,.3),transparent_28%),linear-gradient(135deg,#1e1b4b,#312e81_45%,#f9a8d4)]" />
      <ToastProvider toasts={toasts} onClose={removeToast} />
      {forgotOpen && <ForgotPasswordModal initialEmail={forgotEmail} loading={auth.providerLoading.resetPassword} onSend={handleReset} onClose={() => setForgotOpen(false)} onToast={showToast} />}
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl grid-cols-1 items-center gap-6 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,500px)] lg:gap-10">
        <PixelScene />
        <div className="mx-auto w-full max-w-lg rounded-[2rem] border-4 border-slate-950 bg-white/95 p-4 shadow-[8px_8px_0_#0f172a] backdrop-blur sm:p-6">
          <div className="mb-5">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-lime-100 px-3 py-1 text-[9px] uppercase tracking-[0.2em]"><span>🐾</span><span>Pixel Paws</span></div>
            <h2 className="text-3xl leading-tight tracking-wider text-slate-950">PIXEL PAWS</h2>
            <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-700">Sign in to save your pets, invite friends, and play together.</p>
            <div className="mt-3 rounded-2xl border-4 border-slate-950 bg-lime-100 p-3 text-[10px] font-semibold text-slate-950 shadow-[3px_3px_0_#0f172a]" aria-live="polite">Auth screen ready — choose Google, Microsoft, Email, or Guest mode.</div>
          </div>
          {!configured && <div className="mb-4 rounded-2xl border-4 border-slate-950 bg-yellow-100 p-3 text-[10px] leading-relaxed">Firebase is not configured. Add env vars and redeploy to enable online login.</div>}
          <div className="grid gap-3">
            <AuthProviderButton provider="google" disabled={!configured || Boolean(auth.loading)} loading={auth.providerLoading.google} onClick={() => void handleProvider('google')} />
            <AuthProviderButton provider="microsoft" disabled={!configured || Boolean(auth.loading)} loading={auth.providerLoading.microsoft} onClick={() => void handleProvider('microsoft')} />
            <div className="flex items-center gap-3 py-1"><div className="h-1 flex-1 bg-slate-200" /><span className="text-[9px] uppercase tracking-[0.25em] text-slate-500">or use email</span><div className="h-1 flex-1 bg-slate-200" /></div>
            <EmailPasswordForm mode={mode} setMode={setMode} disabled={!configured || Boolean(auth.loading)} loadingLogin={auth.providerLoading.emailLogin} loadingRegister={auth.providerLoading.emailRegister} onLogin={handleLogin} onRegister={handleRegister} onForgotPassword={(email) => { setForgotEmail(email); setForgotOpen(true); }} onToast={showToast} />
            <button type="button" disabled={!configured || Boolean(auth.loading) || auth.hasGuestTrialExpired} onClick={() => void handleGuest()} className="pixel-border-sm w-full bg-lime-100 px-4 py-3 text-[10px] text-slate-950 transition hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-55">
              {auth.providerLoading.guest ? 'Entering guest mode...' : guestButtonText}
            </button>
            <p className="text-center text-[9px] leading-relaxed text-slate-500">{auth.hasGuestTrialExpired ? 'Login to keep playing.' : 'Guest mode is a 5-minute trial. Login to save and continue.'}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
