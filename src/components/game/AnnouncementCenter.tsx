'use client';
import { ANNOUNCEMENTS } from '@/src/config/gameMeta';
import type { GameRemoteConfig, RemoteConfigStatus } from '@/src/config/defaultRemoteConfig';

export const SEEN_ANNOUNCEMENTS_KEY = 'pixel-paws-seen-announcements';
export const SEEN_REMOTE_ANNOUNCEMENTS_KEY = 'pixel-paws-seen-remote-announcements';

export default function AnnouncementCenter({ compact = false, remoteConfig, remoteStatus }: { compact?: boolean; remoteConfig?: GameRemoteConfig; remoteStatus?: RemoteConfigStatus }) {
  const active = ANNOUNCEMENTS.filter((item) => item.active);
  const showRemote = Boolean(remoteConfig?.announcement_title && remoteConfig.announcement_message && remoteStatus === 'loaded');
  return <section className={`pixel-border bg-white p-3 ${compact ? '' : 'sm:p-4'}`}><h2 className="mb-2 text-sm">News</h2><div className="grid gap-2">{showRemote && <article className="border-2 border-slate-950 bg-yellow-100 p-2 text-[10px] leading-relaxed"><span className="mb-1 inline-block border-2 border-slate-950 bg-white px-2 py-1 text-[8px]">Remote</span><h3 className="text-[11px]">{remoteConfig?.announcement_title}</h3><p className="mt-1">{remoteConfig?.announcement_message}</p></article>}{remoteConfig?.weekly_event_enabled && <article className="border-2 border-slate-950 bg-pink-100 p-2 text-[10px] leading-relaxed"><span className="mb-1 inline-block border-2 border-slate-950 bg-white px-2 py-1 text-[8px]">Weekly Event</span><h3 className="text-[11px]">{remoteConfig.weekly_event_title}</h3><p className="mt-1">Rewards x{remoteConfig.coin_reward_multiplier} · Care XP x{remoteConfig.care_xp_multiplier} · Shop discount {remoteConfig.shop_discount_percent}%</p></article>}{active.map((item) => <article key={item.id} className="border-2 border-slate-950 bg-sky-50 p-2 text-[10px] leading-relaxed"><h3 className="text-[11px]">{item.title}</h3><p className="mt-1">{item.message}</p></article>)}</div></section>;
}
