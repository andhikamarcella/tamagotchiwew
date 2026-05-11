'use client';
import { useState } from 'react';
import PixelModal from '@/src/components/PixelModal';

export function validateUsername(value: string): string | null {
  const clean = value.trim();
  if (!clean) return 'Username cannot be empty.';
  if (clean.length < 3 || clean.length > 16) return 'Username must be 3-16 characters.';
  if (!/^[\w ]+$/.test(clean)) return 'Use letters, numbers, spaces, or underscore.';
  return null;
}

export default function EditUsernameModal({ initialUsername, onSave, onClose }: { initialUsername: string; onSave: (username: string) => Promise<boolean>; onClose: () => void }) {
  const [username, setUsername] = useState(initialUsername);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    const validation = validateUsername(username);
    if (validation) { setError(validation); return; }
    setSaving(true);
    try { if (await onSave(username.trim())) onClose(); }
    finally { setSaving(false); }
  };
  return <PixelModal title="Edit username" onClose={onClose} maxWidth="sm:max-w-md" panelClassName="bg-white" footer={<div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={saving} onClick={() => void submit()} className="pixel-border-sm w-full bg-lime-200 px-3 py-2 text-[10px]">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={onClose} className="pixel-border-sm w-full bg-white px-3 py-2 text-[10px]">Cancel</button></div>}><input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full border-4 border-slate-950 p-3 text-xs" maxLength={16} />{error && <p className="mt-2 text-[10px] text-red-700">{error}</p>}</PixelModal>;
}
