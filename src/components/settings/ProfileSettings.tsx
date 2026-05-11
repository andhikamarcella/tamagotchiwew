'use client';
import { useState } from 'react';
import EditUsernameModal from '@/src/components/auth/EditUsernameModal';
import { useAuth } from '@/src/hooks/useAuth';
export default function ProfileSettings({ onToast }: { onToast: (message: string) => void }) { const auth = useAuth(); const [open, setOpen] = useState(false); const name = auth.username || auth.displayName || auth.email?.split('@')[0] || 'Player'; return <section className="pixel-border bg-white p-3"><h2 className="mb-2 text-sm">Profile</h2><p className="text-[10px]">Playing as {name}</p><button type="button" onClick={() => setOpen(true)} className="pixel-border-sm mt-3 bg-lime-100 px-3 py-2 text-[10px]">Edit username</button>{open && <EditUsernameModal initialUsername={name} onClose={() => setOpen(false)} onSave={async (username) => { const ok = await auth.updateUsername(username); if (ok) onToast('Username updated.'); return ok; }} />}</section>; }
