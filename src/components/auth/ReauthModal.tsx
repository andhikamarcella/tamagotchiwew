'use client';
import { useState } from 'react';
import PixelModal from '@/src/components/PixelModal';
import { useAuth } from '@/src/hooks/useAuth';

export default function ReauthModal({ onClose, onDone, onToast }: { onClose: () => void; onDone: () => void; onToast: (message: string) => void }) {
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const provider = auth.providerIds[0] ?? 'password';
  const reauth = async () => {
    const result = provider.includes('google') ? await auth.reauthenticateWithProvider('google') : provider.includes('microsoft') ? await auth.reauthenticateWithProvider('microsoft') : await auth.reauthenticateWithPassword(password);
    onToast(result.ok ? 'Signed in again.' : result.message ?? 'Reauthentication failed.');
    if (result.ok) onDone();
  };
  return <PixelModal title="Sign in again" description="For security, Firebase needs a recent login before changing email." onClose={onClose} maxWidth="sm:max-w-md" panelClassName="bg-white"><div className="grid gap-3">{!provider.includes('google') && !provider.includes('microsoft') && <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="border-4 border-slate-950 p-3 text-xs" placeholder="Current password" />}<button type="button" onClick={() => void reauth()} className="pixel-border-sm bg-lime-100 px-3 py-2 text-[10px]">Continue</button></div></PixelModal>;
}
