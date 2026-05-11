'use client';
import { useState } from 'react';
import BindAccountModal from './BindAccountModal';
import EditUsernameModal from './EditUsernameModal';
import UpgradeAccountCard from './UpgradeAccountCard';
import { useAuth } from '@/src/hooks/useAuth';

function providerLabel(providerId: string | null | undefined, isGuest: boolean) { if (isGuest) return 'Guest Trial'; if (providerId?.includes('google')) return 'Google'; if (providerId?.includes('microsoft')) return 'Microsoft'; return 'Email'; }

export default function AccountBar({ coins, activePetName, onSettings, onToast }: { coins: number; activePetName?: string | null; onSettings: () => void; onToast: (message: string) => void }) {
  const auth = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [bindOpen, setBindOpen] = useState(false);
  const displayName = auth.username || auth.displayName || auth.email?.split('@')[0] || 'Player';
  const initials = displayName.slice(0, 2).toUpperCase();
  const provider = providerLabel(auth.user?.providerData[0]?.providerId, auth.isGuest);
  const logout = async () => { const result = await auth.signOutUser(); onToast(result.ok ? 'Signed out.' : result.message ?? 'Logout failed.'); };
  return <div className="mb-3 grid gap-3"><section className="pixel-border-sm flex flex-wrap items-center justify-between gap-3 bg-white/95 p-3 text-[10px]"><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-slate-950 bg-lime-100">{auth.photoURL ? <img src={auth.photoURL} alt={displayName} className="h-full w-full object-cover" /> : initials}</div><div className="min-w-0"><div className="truncate text-xs">{displayName}</div><div className="truncate text-[9px] text-slate-600">{auth.email ?? `UID ${auth.uid?.slice(0, 8) ?? '-'}`} · {provider}</div><div className="text-[9px]">🪙 {coins} · {activePetName ?? 'No pet yet'}</div></div></div><div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><button type="button" onClick={() => setEditOpen(true)} className="pixel-border-sm bg-white px-3 py-2">Edit name</button>{auth.isGuest && <button type="button" onClick={() => setBindOpen(true)} className="pixel-border-sm bg-yellow-100 px-3 py-2">Upgrade</button>}<button type="button" onClick={onSettings} className="pixel-border-sm bg-white px-3 py-2">Settings</button><button type="button" onClick={() => void logout()} className="pixel-border-sm bg-red-200 px-3 py-2">Logout</button></div></section>{auth.isGuest && <UpgradeAccountCard onOpen={() => setBindOpen(true)} />}{editOpen && <EditUsernameModal initialUsername={displayName} onClose={() => setEditOpen(false)} onSave={auth.updateUsername} />}{bindOpen && <BindAccountModal onClose={() => setBindOpen(false)} onToast={onToast} />}</div>;
}
