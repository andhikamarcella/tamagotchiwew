'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { isValidEmail, validateConfirmPassword, validatePassword } from '@/src/lib/validators';

export type EmailMode = 'login' | 'register';

function PasswordInput({ label, value, onChange, autoComplete }: { label: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="grid gap-1 text-[10px] uppercase tracking-wider text-slate-700">
      {label}
      <div className="flex rounded-xl border-4 border-slate-950 bg-white focus-within:ring-4 focus-within:ring-pink-200">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-xs outline-none"
          placeholder="••••••"
        />
        <button type="button" onClick={() => setVisible((next) => !next)} className="border-l-4 border-slate-950 px-3 text-[10px]">
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </label>
  );
}

export default function EmailPasswordForm({ mode, setMode, loadingLogin, loadingRegister, disabled, onLogin, onRegister, onForgotPassword, onToast }: { mode: EmailMode; setMode: (mode: EmailMode) => void; loadingLogin?: boolean; loadingRegister?: boolean; disabled?: boolean; onLogin: (email: string, password: string) => Promise<void>; onRegister: (email: string, password: string) => Promise<void>; onForgotPassword: (email: string) => void; onToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const busy = Boolean(loadingLogin || loadingRegister);

  const validate = () => {
    if (!email.trim()) return 'Please enter your email.';
    if (!isValidEmail(email)) return 'Please enter a valid email address.';
    const passwordError = mode === 'login' ? validatePassword(password) : validateConfirmPassword(password, confirmPassword);
    return passwordError;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      onToast(message, 'error');
      return;
    }
    if (mode === 'login') await onLogin(email, password);
    else await onRegister(email, password);
  };

  return (
    <div className="rounded-2xl border-4 border-slate-950 bg-pink-50/90 p-3 shadow-[3px_3px_0_#0f172a] sm:p-4">
      <div className="mb-4 grid grid-cols-2 rounded-xl border-4 border-slate-950 bg-white p-1 text-[10px]">
        <button type="button" disabled={busy} onClick={() => setMode('login')} className={`rounded-lg px-3 py-2 transition ${mode === 'login' ? 'bg-pink-300 shadow-[2px_2px_0_#0f172a]' : 'hover:bg-pink-100'}`}>Login</button>
        <button type="button" disabled={busy} onClick={() => setMode('register')} className={`rounded-lg px-3 py-2 transition ${mode === 'register' ? 'bg-pink-300 shadow-[2px_2px_0_#0f172a]' : 'hover:bg-pink-100'}`}>Register</button>
      </div>
      <form noValidate onSubmit={handleSubmit} className="grid gap-3">
        <label className="grid gap-1 text-[10px] uppercase tracking-wider text-slate-700">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            inputMode="email"
            autoComplete="email"
            type="text"
            className="w-full rounded-xl border-4 border-slate-950 bg-white px-3 py-3 text-xs outline-none focus:ring-4 focus:ring-pink-200"
            placeholder="keeper@example.com"
          />
        </label>
        <PasswordInput label="Password" value={password} onChange={setPassword} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        {mode === 'register' && <PasswordInput label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />}
        <button type="submit" disabled={disabled || busy} className="pixel-border-sm min-h-12 w-full bg-[var(--accent)] px-4 py-3 text-[10px] text-slate-950 transition hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-55">
          {mode === 'login' ? (loadingLogin ? 'Logging in...' : 'Login with Email') : (loadingRegister ? 'Creating account...' : 'Create account')}
        </button>
      </form>
      <button type="button" disabled={disabled || busy} onClick={() => onForgotPassword(email)} className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-950 bg-white/70 px-3 py-2 text-[10px] underline-offset-4 hover:underline disabled:opacity-50">
        Forgot password?
      </button>
    </div>
  );
}
