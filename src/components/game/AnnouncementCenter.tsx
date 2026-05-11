'use client';
import { ANNOUNCEMENTS } from '@/src/config/gameMeta';
export const SEEN_ANNOUNCEMENTS_KEY = 'pixel-paws-seen-announcements';
export default function AnnouncementCenter({ compact = false }: { compact?: boolean }) { const active = ANNOUNCEMENTS.filter((item) => item.active); return <section className={`pixel-border bg-white p-3 ${compact ? '' : 'sm:p-4'}`}><h2 className="mb-2 text-sm">News</h2><div className="grid gap-2">{active.map((item) => <article key={item.id} className="border-2 border-slate-950 bg-sky-50 p-2 text-[10px] leading-relaxed"><h3 className="text-[11px]">{item.title}</h3><p className="mt-1">{item.message}</p></article>)}</div></section>; }
