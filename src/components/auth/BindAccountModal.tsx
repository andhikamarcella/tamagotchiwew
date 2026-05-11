'use client';
import { useState } from 'react';
import PixelModal from '@/src/components/PixelModal';
import { useAuth } from '@/src/hooks/useAuth';

export default function BindAccountModal({ onClose, onToast }: { onClose: () => void; onToast: (message: string) => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const run = async (action: () => Promise<{ ok: boolean; message?: string }>) => { const result = await action(); onToast(result.ok ? 'Guest progress saved to your account.' : result.message ?? 'Upgrade failed. Local backup is safe.'); if (result.ok) onClose(); };
  return <PixelModal title="Save progress with an account" description="Link this guest keeper to Google, Microsoft, or Email without deleting your local backup." onClose={onClose} maxWidth="sm:max-w-md" panelClassName="bg-white"><div className="grid gap-2"><button type="button" onClick={() => void run(auth.upgradeGuestWithGoogle)} className="pixel-border-sm bg-white px-3 py-2 text-[10px]">Link with Google</button><button type="button" onClick={() => void run(auth.upgradeGuestWithMicrosoft)} className="pixel-border-sm bg-white px-3 py-2 text-[10px]">Link with Microsoft</button><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" className="border-4 border-slate-950 p-2 text-xs" /><input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" className="border-4 border-slate-950 p-2 text-xs" /><button type="button" onClick={() => void run(() => auth.upgradeGuestWithEmail(email, password))} className="pixel-border-sm bg-lime-200 px-3 py-2 text-[10px]">Link with Email</button><button type="button" onClick={onClose} className="pixel-border-sm bg-white px-3 py-2 text-[10px]">Close</button></div></PixelModal>;
}
