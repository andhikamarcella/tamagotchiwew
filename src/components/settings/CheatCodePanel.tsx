'use client';

import { useState } from 'react';
import { PixelButton } from '@/src/components/PixelButton';
import PixelCard from '@/src/components/PixelCard';

export default function CheatCodePanel({ onCheat, used }: { onCheat: (code: string) => { ok: boolean; message: string }; used: boolean }) {
  const [code, setCode] = useState('');
  return <PixelCard className="bg-slate-950 text-white"><h2 className="text-sm text-white">Secret Codes</h2><p className="mt-2 text-[10px] leading-relaxed text-zinc-200">Enter a secret code. Each code can only be used once per save.</p><form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const result = onCheat(code); setCode(''); if (!result.ok) return; }}><input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter code" className="min-h-11 flex-1 border-4 border-white bg-slate-900 px-3 text-xs text-white placeholder:text-zinc-400" /><PixelButton type="submit" disabled={used || !code.trim()} className="bg-yellow-200">Submit</PixelButton></form>{used && <p className="mt-2 text-[9px] text-yellow-200">A secret code has already been used on this save.</p>}</PixelCard>;
}
