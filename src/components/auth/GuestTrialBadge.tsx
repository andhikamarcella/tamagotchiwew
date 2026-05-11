'use client';

import { useMounted } from '@/src/hooks/useMounted';
import { formatGuestTrialTime } from '@/src/lib/guestTrial';

export default function GuestTrialBadge({ remainingMs, onLogin }: { remainingMs: number; onLogin: () => void }) {
  const mounted = useMounted();
  if (!mounted) return null;
  const warning = remainingMs <= 60_000;
  const low = remainingMs <= 120_000;
  return (
    <div className={`pixel-border-sm sticky top-2 z-20 mb-3 flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-[9px] sm:text-[10px] ${warning ? 'bg-red-100' : low ? 'bg-yellow-100' : 'bg-lime-100'}`}>
      <div className="min-w-0">
        <div className="uppercase tracking-[0.18em]">Guest Trial</div>
        <div className="mt-1 text-xs">Guest Trial: {formatGuestTrialTime(remainingMs)}</div>
        <div className="text-[9px]">{formatGuestTrialTime(remainingMs)} left</div>
      </div>
      <button type="button" onClick={onLogin} className="border-2 border-slate-950 bg-white px-2 py-1 text-[9px] shadow-[2px_2px_0_#0f172a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
        Login to save
      </button>
    </div>
  );
}
