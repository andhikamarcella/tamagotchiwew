import type { GameRemoteConfig, RemoteConfigStatus } from '@/src/config/defaultRemoteConfig';
import type { ANNOUNCEMENTS } from '@/src/config/gameMeta';

type LocalAnnouncement = (typeof ANNOUNCEMENTS)[number];

export type MergedAnnouncement = {
  id: string;
  title: string;
  message: string;
  badge?: 'Remote' | 'News' | 'Weekly Event';
  date?: string;
  source: 'remote' | 'local' | 'event';
};

export function normalizeAnnouncementTitle(title: string): string {
  return title.toLowerCase().trim().replace(/[\p{P}\p{S}]/gu, '').replace(/\s+/g, ' ');
}

export function dedupeAnnouncements(announcements: MergedAnnouncement[]): MergedAnnouncement[] {
  const seen = new Set<string>();
  return announcements.filter((announcement) => {
    if (!announcement.title.trim() || !announcement.message.trim()) return false;
    const key = normalizeAnnouncementTitle(announcement.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mergeAnnouncements({ remoteConfig, remoteStatus, localAnnouncements, maxItems }: { remoteConfig?: GameRemoteConfig; remoteStatus?: RemoteConfigStatus; localAnnouncements: readonly LocalAnnouncement[]; maxItems?: number }): MergedAnnouncement[] {
  const remoteActive = remoteStatus === 'loaded' && Boolean(remoteConfig?.announcement_title.trim() && remoteConfig.announcement_message.trim());
  const remoteItems: MergedAnnouncement[] = remoteActive && remoteConfig ? [{
    id: `remote-${normalizeAnnouncementTitle(remoteConfig.announcement_title) || 'announcement'}`,
    title: remoteConfig.announcement_title,
    message: remoteConfig.announcement_message,
    badge: 'Remote',
    source: 'remote',
  }] : [];
  const eventItems: MergedAnnouncement[] = remoteConfig?.weekly_event_enabled ? [{
    id: `event-${normalizeAnnouncementTitle(remoteConfig.weekly_event_title) || 'weekly'}`,
    title: remoteConfig.weekly_event_title,
    message: `Rewards x${remoteConfig.coin_reward_multiplier} · Care XP x${remoteConfig.care_xp_multiplier} · Shop discount ${remoteConfig.shop_discount_percent}%`,
    badge: 'Weekly Event',
    source: 'event',
  }] : [];
  const localItems: MergedAnnouncement[] = localAnnouncements.filter((item) => item.active).map((item) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    badge: 'News',
    source: 'local',
  }));
  const merged = dedupeAnnouncements([...remoteItems, ...eventItems, ...localItems]);
  return typeof maxItems === 'number' ? merged.slice(0, maxItems) : merged;
}
