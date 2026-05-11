'use client';
import { useState } from 'react';
import ChangeEmailModal from './ChangeEmailModal';
import { useAuth } from '@/src/hooks/useAuth';

export default function EmailChangePanel({ onToast }: { onToast: (message: string) => void }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const refresh = async () => { const result = await auth.refreshEmailVerification(); onToast(result.ok ? 'Email verified!' : result.message ?? 'Email status refreshed.'); };
  return <section className="pixel-border bg-white p-3"><h2 className="mb-2 text-sm">Email</h2><p className="break-all text-[10px]">{auth.email ?? 'No email on this account'}</p><p className="mt-1 text-[10px]">Status: {auth.emailVerified ? '✅ Email verified' : '⚠️ Not verified'}</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><button type="button" disabled={!auth.email || auth.emailVerified || auth.providerLoading.verifyEmail} onClick={() => void auth.sendVerificationEmail().then((r) => onToast(r.ok ? 'Verification email sent.' : r.message ?? 'Could not send verification email. Please try again.'))} className="pixel-border-sm bg-yellow-100 px-3 py-2 text-[10px] disabled:opacity-50">Send verification email</button><button type="button" disabled={!auth.email || auth.providerLoading.verifyEmail} onClick={() => void refresh()} className="pixel-border-sm bg-lime-100 px-3 py-2 text-[10px] disabled:opacity-50">Refresh verification status</button><button type="button" disabled={!auth.email} onClick={() => setOpen(true)} className="pixel-border-sm bg-white px-3 py-2 text-[10px] disabled:opacity-50">Change email</button><button type="button" disabled={!auth.email || auth.providerLoading.resetPassword} onClick={() => void auth.sendResetEmail(auth.email ?? '').then((r) => onToast(r.ok ? 'Password reset email sent.' : r.message ?? 'Password reset failed.'))} className="pixel-border-sm bg-white px-3 py-2 text-[10px] disabled:opacity-50">Send password reset</button></div>{open && <ChangeEmailModal onClose={() => setOpen(false)} onToast={onToast} />}</section>;
}
