'use client';
import { useState } from 'react';
import EditUsernameModal from '@/src/components/auth/EditUsernameModal';
import EmailVerificationBanner from '@/src/components/auth/EmailVerificationBanner';
import EmailChangePanel from './EmailChangePanel';
import MfaSettingsPanel from './MfaSettingsPanel';
import { useAuth } from '@/src/hooks/useAuth';

function providerLabel(providerIds: string[], isGuest: boolean) { if (isGuest) return 'Guest'; if (providerIds.some((id) => id.includes('google'))) return 'Google'; if (providerIds.some((id) => id.includes('microsoft'))) return 'Microsoft'; return 'Email/Password'; }

export default function ProfileSettings({ onToast }: { onToast: (message: string) => void }) {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const name = auth.username || auth.displayName || auth.email?.split('@')[0] || 'Player';
  return <div className="grid gap-3"><section className="pixel-border bg-white p-3"><h2 className="mb-2 text-sm">Profile</h2><div className="flex min-w-0 items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-slate-950 bg-lime-100">{auth.photoURL ? <img src={auth.photoURL} alt={name} className="h-full w-full object-cover" /> : name.slice(0, 2).toUpperCase()}</div><div className="min-w-0 text-[10px]"><p className="truncate">{name}</p><p className="truncate text-slate-600">Provider: {providerLabel(auth.providerIds, auth.isGuest)}</p><p>{auth.emailVerified ? '✅ Email verified' : '⚠️ Email not verified'}</p></div></div><button type="button" onClick={() => setOpen(true)} className="pixel-border-sm mt-3 w-full bg-lime-100 px-3 py-2 text-[10px]">Edit username</button>{open && <EditUsernameModal initialUsername={name} onClose={() => setOpen(false)} onSave={async (username) => { const ok = await auth.updateUsername(username); if (ok) onToast('Username updated.'); return ok; }} />}</section><EmailVerificationBanner onToast={onToast} /><EmailChangePanel onToast={onToast} /><MfaSettingsPanel /></div>;
}
