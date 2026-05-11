'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import PixelModal from '@/src/components/PixelModal';
import { isValidEmail } from '@/src/lib/validators';

export default function ForgotPasswordModal({ initialEmail, loading, onSend, onClose, onToast }: { initialEmail: string; loading?: boolean; onSend: (email: string) => Promise<boolean>; onClose: () => void; onToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) { onToast('Please enter your email.', 'error'); return; }
    if (!isValidEmail(email)) { onToast('Please enter a valid email address.', 'error'); return; }
    const ok = await onSend(email);
    if (ok) setSent(true);
  };

  return (
    <PixelModal title={sent ? 'Check your inbox' : 'Reset your password'} description={sent ? 'If this email has a Firebase account, a reset link was sent. Please check Inbox/Spam.' : 'Enter your email and we’ll send you a Firebase reset link.'} onClose={onClose} maxWidth="sm:max-w-md" panelClassName="bg-white">
      {sent ? (
        <div className="text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-4 border-slate-950 bg-emerald-100 text-3xl shadow-[3px_3px_0_#0f172a]">✓</div><p className="mt-4 text-[10px] leading-relaxed text-slate-700">Kalau email tidak muncul, cek Spam/Promotions dan pastikan Email/Password provider aktif di Firebase.</p><button type="button" onClick={onClose} className="pixel-border-sm mt-5 w-full bg-emerald-200 px-4 py-3 text-[10px]">Back to login</button></div>
      ) : (
        <form noValidate onSubmit={submit} className="grid gap-3">
          <label className="grid gap-1 text-[10px] uppercase tracking-wider text-slate-700">Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="text" inputMode="email" autoComplete="email" className="w-full rounded-xl border-4 border-slate-950 px-3 py-3 text-xs outline-none focus:ring-4 focus:ring-yellow-200" placeholder="keeper@example.com" /></label>
          <button type="submit" disabled={loading} className="pixel-border-sm w-full bg-yellow-200 px-4 py-3 text-[10px] disabled:opacity-50">{loading ? 'Sending...' : 'Send reset link'}</button>
          <button type="button" disabled={loading} onClick={onClose} className="pixel-border-sm w-full bg-white px-4 py-3 text-[10px] disabled:opacity-50">Cancel</button>
        </form>
      )}
    </PixelModal>
  );
}
