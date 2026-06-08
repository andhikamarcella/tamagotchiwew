'use client';
import { useEffect, useState } from 'react';
import { BROKEN_SAVE_KEY, SAVE_KEY, createBackup, downloadJson, getBackups, restoreLatestBackup } from '@/src/lib/saveSystem';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [message, setMessage] = useState('');
  useEffect(() => { console.error(error); }, [error]);
  const restore = () => { const save = restoreLatestBackup(); setMessage(save ? 'Your latest backup is restored. Reloading…' : 'No healthy backup was found.'); if (save) window.setTimeout(() => window.location.reload(), 500); };
  const exportBroken = () => { const raw = window.localStorage.getItem(BROKEN_SAVE_KEY) ?? window.localStorage.getItem(SAVE_KEY); if (!raw) return setMessage('There is no broken save to export.'); downloadJson(`pixel-paws-broken-${Date.now()}.json`, raw); setMessage('Broken save exported safely.'); };
  const resetSafely = () => { const raw = window.localStorage.getItem(SAVE_KEY); if (raw) createBackup(raw, 'before-reset'); window.localStorage.removeItem(SAVE_KEY); setMessage('Local save reset safely. Reloading…'); window.setTimeout(() => window.location.reload(), 500); };
  return <html lang="en"><body className="bg-slate-950 p-4 font-mono text-slate-950"><main className="mx-auto mt-12 max-w-xl border-4 border-slate-950 bg-lime-100 p-5 shadow-[8px_8px_0_#000]"><div className="text-4xl">🐾🩹</div><h1 className="mt-3 text-xl font-bold">Oops, Pixel Paws had a small glitch.</h1><p className="mt-3 text-sm">Your pawsome memories may still be safe. Choose a recovery action below.</p>{message && <p className="mt-3 border-2 border-slate-950 bg-white p-2 text-xs">{message}</p>}<div className="mt-5 grid gap-2 sm:grid-cols-2"><button className="border-2 border-slate-950 bg-white p-3" onClick={reset}>Reload Game</button><button className="border-2 border-slate-950 bg-yellow-200 p-3" onClick={restore} disabled={!getBackups().length}>Restore Last Backup</button><button className="border-2 border-slate-950 bg-cyan-100 p-3" onClick={exportBroken}>Export Broken Save</button><button className="border-2 border-slate-950 bg-red-200 p-3" onClick={resetSafely}>Reset Safely</button></div>{process.env.NODE_ENV === 'development' && <pre className="mt-4 overflow-auto border-2 border-slate-950 bg-white p-2 text-[10px]">{error.message}</pre>}</main></body></html>;
}
