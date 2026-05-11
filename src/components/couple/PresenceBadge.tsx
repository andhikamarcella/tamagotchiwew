'use client';

export type PresenceBadgeProps = {
  name?: string | null;
  photoURL?: string | null;
  online?: boolean;
  lastSeenLabel?: string;
  isOwner?: boolean;
};

export function PresenceBadge({ name, photoURL, online = false, lastSeenLabel, isOwner = false }: PresenceBadgeProps) {
  const displayName = name?.trim() || 'Player';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border-2 border-zinc-900 bg-white/90 px-3 py-2 shadow-[3px_3px_0_#111]">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-zinc-900 bg-emerald-100">
        {photoURL ? <img src={photoURL} alt={displayName} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-xs font-black">{initials}</div>}
        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-zinc-400'}`} />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-black">{displayName} {isOwner ? '★' : ''}</div>
        <div className="text-[10px] text-zinc-600">{online ? 'Online' : lastSeenLabel || 'Offline'}</div>
      </div>
    </div>
  );
}

export default PresenceBadge;
