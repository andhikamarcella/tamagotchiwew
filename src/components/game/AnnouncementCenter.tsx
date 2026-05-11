'use client';
import { ANNOUNCEMENTS } from '@/src/config/gameMeta';
import { mergeAnnouncements } from '@/src/lib/announcements';
import type { GameRemoteConfig, RemoteConfigStatus } from '@/src/config/defaultRemoteConfig';

export const SEEN_ANNOUNCEMENTS_KEY = 'pixel-paws-seen-announcements';
export const SEEN_REMOTE_ANNOUNCEMENTS_KEY = 'pixel-paws-seen-remote-announcements';

export default function AnnouncementCenter({ compact = false, remoteConfig, remoteStatus }: { compact?: boolean; remoteConfig?: GameRemoteConfig; remoteStatus?: RemoteConfigStatus }) {
  const items = mergeAnnouncements({ remoteConfig, remoteStatus, localAnnouncements: ANNOUNCEMENTS, maxItems: compact ? 3 : undefined });
  return <section className={`pixel-border bg-white p-3 ${compact ? '' : 'sm:p-4'}`}><h2 className="mb-2 text-sm">News</h2><div className="grid gap-2">{items.map((item) => <article key={item.id} className={`border-2 border-slate-950 p-2 text-[10px] leading-relaxed ${item.source === 'remote' ? 'bg-yellow-100' : item.source === 'event' ? 'bg-pink-100' : 'bg-sky-50'}`}>{item.badge && <span className="mb-1 inline-block border-2 border-slate-950 bg-white px-2 py-1 text-[8px]">{item.badge}</span>}<h3 className="text-[11px]">{item.title}</h3><p className="mt-1">{item.message}</p></article>)}{items.length === 0 && <p className="text-[10px]">No news right now.</p>}</div></section>;
}
