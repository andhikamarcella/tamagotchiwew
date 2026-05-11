'use client';
import { useState } from 'react';

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
  return <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-4"><section className="pixel-border w-full rounded-t-2xl bg-white p-4 sm:max-w-md sm:rounded-none"><h2 className="mb-3 text-sm">Edit username</h2><input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full border-4 border-slate-950 p-3 text-xs" maxLength={16} />{error && <p className="mt-2 text-[10px] text-red-700">{error}</p>}<div className="mt-4 flex flex-col gap-2 sm:flex-row"><button type="button" disabled={saving} onClick={() => void submit()} className="pixel-border-sm w-full bg-lime-200 px-3 py-2 text-[10px]">{saving ? 'Saving...' : 'Save'}</button><button type="button" onClick={onClose} className="pixel-border-sm w-full bg-white px-3 py-2 text-[10px]">Cancel</button></div></section></div>;
}
