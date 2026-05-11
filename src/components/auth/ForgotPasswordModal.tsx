'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { isValidEmail } from '@/src/lib/validators';

export default function ForgotPasswordModal({ initialEmail, loading, onSend, onClose, onToast }: { initialEmail: string; loading?: boolean; onSend: (email: string) => Promise<boolean>; onClose: () => void; onToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      onToast('Please enter your email.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      onToast('Please enter a valid email address.', 'error');
      return;
    }
    const ok = await onSend(email);
    if (ok) setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[65] grid place-items-end bg-slate-950/60 p-0 sm:place-items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="pixel-border max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 text-slate-950 sm:w-[calc(100vw-24px)] sm:max-w-md sm:rounded-3xl sm:p-5">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-4 border-slate-950 bg-emerald-100 text-3xl shadow-[3px_3px_0_#0f172a]">✓</div>
            <h2 className="mt-4 text-base">Check your inbox</h2>
            <p className="mt-2 text-[10px] leading-relaxed">We sent a reset link to your email.</p>
            <button type="button" onClick={onClose} className="pixel-border-sm mt-5 w-full bg-emerald-200 px-4 py-3 text-[10px]">Back to login</button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-slate-950 bg-yellow-100 text-2xl shadow-[3px_3px_0_#0f172a]">✉️</div>
              <div>
                <h2 className="text-base">Reset your password</h2>
                <p className="mt-2 text-[10px] leading-relaxed">Enter your email and we’ll send you a reset link.</p>
              </div>
            </div>
            <form noValidate onSubmit={submit} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-[10px] uppercase tracking-wider text-slate-700">
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="text" inputMode="email" autoComplete="email" className="w-full rounded-xl border-4 border-slate-950 px-3 py-3 text-xs outline-none focus:ring-4 focus:ring-yellow-200" placeholder="keeper@example.com" />
              </label>
              <button type="submit" disabled={loading} className="pixel-border-sm w-full bg-yellow-200 px-4 py-3 text-[10px] disabled:opacity-50">{loading ? 'Sending...' : 'Send reset link'}</button>
              <button type="button" disabled={loading} onClick={onClose} className="pixel-border-sm w-full bg-white px-4 py-3 text-[10px] disabled:opacity-50">Cancel</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
