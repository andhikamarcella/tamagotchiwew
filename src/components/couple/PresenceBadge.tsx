'use client';

import type { PresenceEntry } from '@/src/lib/coupleTypes';

function formatLastSeen(lastSeenAtMs: number | null): string {
  if (!lastSeenAtMs) return 'recently';
  return 'seen';
}

export function PresenceBadge({ entry, nickname, online = true }: { entry?: PresenceEntry | null; nickname?: string | null; online?: boolean }) {
  const label = entry?.nickname ?? nickname ?? 'Pixel Friend';
  const lastSeen = entry ? formatLastSeen(entry.lastSeenAtMs) : online ? 'now' : 'recently';
  return (
    <span className={`inline-flex max-w-full items-center gap-2 rounded-full border-2 border-slate-950 px-2 py-1 text-[9px] ${online ? 'bg-green-100' : 'bg-slate-100'}`}>
      <span className={`h-2 w-2 shrink-0 rounded-full border border-slate-950 ${online ? 'bg-green-500' : 'bg-slate-400'}`} aria-hidden="true" />
      <span className="min-w-0 truncate">{label}</span>
      <span className="shrink-0 text-slate-600">{lastSeen}</span>
    </span>
  );
}

export default PresenceBadge;
