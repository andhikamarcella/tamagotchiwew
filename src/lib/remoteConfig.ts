import { DEFAULT_REMOTE_CONFIG, clampRemoteConfig, type GameRemoteConfig, type RemoteConfigStatus } from '@/src/config/defaultRemoteConfig';
import { getFirebaseApp, isRemoteConfigEnabled } from '@/src/lib/firebase';

export type RemoteConfigSnapshot = {
  config: GameRemoteConfig;
  status: RemoteConfigStatus;
  lastFetchAt: number | null;
  error?: string;
};

function readBoolean(value: string): boolean {
  return value === 'true';
}

function readNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function fetchGameRemoteConfig(): Promise<RemoteConfigSnapshot> {
  if (typeof window === 'undefined' || !isRemoteConfigEnabled()) {
    return { config: clampRemoteConfig(DEFAULT_REMOTE_CONFIG), status: 'disabled', lastFetchAt: null };
  }

  const app = getFirebaseApp();
  if (!app) return { config: clampRemoteConfig(DEFAULT_REMOTE_CONFIG), status: 'defaults', lastFetchAt: null };

  try {
    const remote = await import('firebase/remote-config');
    if (!(await remote.isSupported())) {
      return { config: clampRemoteConfig(DEFAULT_REMOTE_CONFIG), status: 'failed', lastFetchAt: Date.now(), error: 'Remote Config is not supported in this browser.' };
    }
    const rc = remote.getRemoteConfig(app);
    rc.defaultConfig = DEFAULT_REMOTE_CONFIG;
    rc.settings.minimumFetchIntervalMillis = process.env.NODE_ENV === 'development' ? 60_000 : 3_600_000;
    await remote.fetchAndActivate(rc);
    const next = clampRemoteConfig({
      maintenance_mode: readBoolean(remote.getValue(rc, 'maintenance_mode').asString()),
      maintenance_message: remote.getValue(rc, 'maintenance_message').asString() || DEFAULT_REMOTE_CONFIG.maintenance_message,
      announcement_title: remote.getValue(rc, 'announcement_title').asString() || DEFAULT_REMOTE_CONFIG.announcement_title,
      announcement_message: remote.getValue(rc, 'announcement_message').asString() || DEFAULT_REMOTE_CONFIG.announcement_message,
      weekly_event_enabled: readBoolean(remote.getValue(rc, 'weekly_event_enabled').asString()),
      weekly_event_title: remote.getValue(rc, 'weekly_event_title').asString() || DEFAULT_REMOTE_CONFIG.weekly_event_title,
      shop_discount_percent: readNumber(remote.getValue(rc, 'shop_discount_percent').asString(), DEFAULT_REMOTE_CONFIG.shop_discount_percent),
      daily_reward_multiplier: readNumber(remote.getValue(rc, 'daily_reward_multiplier').asString(), DEFAULT_REMOTE_CONFIG.daily_reward_multiplier),
      care_xp_multiplier: readNumber(remote.getValue(rc, 'care_xp_multiplier').asString(), DEFAULT_REMOTE_CONFIG.care_xp_multiplier),
      coin_reward_multiplier: readNumber(remote.getValue(rc, 'coin_reward_multiplier').asString(), DEFAULT_REMOTE_CONFIG.coin_reward_multiplier),
      couple_mode_enabled: remote.getValue(rc, 'couple_mode_enabled').asString() === '' ? DEFAULT_REMOTE_CONFIG.couple_mode_enabled : readBoolean(remote.getValue(rc, 'couple_mode_enabled').asString()),
      guest_trial_minutes: readNumber(remote.getValue(rc, 'guest_trial_minutes').asString(), DEFAULT_REMOTE_CONFIG.guest_trial_minutes),
      min_supported_version: remote.getValue(rc, 'min_supported_version').asString() || DEFAULT_REMOTE_CONFIG.min_supported_version,
      latest_version: remote.getValue(rc, 'latest_version').asString() || DEFAULT_REMOTE_CONFIG.latest_version,
      version_label: remote.getValue(rc, 'version_label').asString() || DEFAULT_REMOTE_CONFIG.version_label,
      release_channel: remote.getValue(rc, 'release_channel').asString() || DEFAULT_REMOTE_CONFIG.release_channel,
      seasonal_event_override_enabled: remote.getValue(rc, 'seasonal_event_override_enabled').asString() === '' ? DEFAULT_REMOTE_CONFIG.seasonal_event_override_enabled : readBoolean(remote.getValue(rc, 'seasonal_event_override_enabled').asString()),
      seasonal_event_active_id: remote.getValue(rc, 'seasonal_event_active_id').asString() || DEFAULT_REMOTE_CONFIG.seasonal_event_active_id,
      seasonal_event_title: remote.getValue(rc, 'seasonal_event_title').asString() || DEFAULT_REMOTE_CONFIG.seasonal_event_title,
      seasonal_event_message: remote.getValue(rc, 'seasonal_event_message').asString() || DEFAULT_REMOTE_CONFIG.seasonal_event_message,
      seasonal_event_start: remote.getValue(rc, 'seasonal_event_start').asString() || DEFAULT_REMOTE_CONFIG.seasonal_event_start,
      seasonal_event_end: remote.getValue(rc, 'seasonal_event_end').asString() || DEFAULT_REMOTE_CONFIG.seasonal_event_end,
      reward_multiplier: readNumber(remote.getValue(rc, 'reward_multiplier').asString(), DEFAULT_REMOTE_CONFIG.reward_multiplier),
      ramadan_enabled: remote.getValue(rc, 'ramadan_enabled').asString() === '' ? DEFAULT_REMOTE_CONFIG.ramadan_enabled : readBoolean(remote.getValue(rc, 'ramadan_enabled').asString()),
      ramadan_start: remote.getValue(rc, 'ramadan_start').asString() || DEFAULT_REMOTE_CONFIG.ramadan_start,
      ramadan_end: remote.getValue(rc, 'ramadan_end').asString() || DEFAULT_REMOTE_CONFIG.ramadan_end,
      eid_enabled: remote.getValue(rc, 'eid_enabled').asString() === '' ? DEFAULT_REMOTE_CONFIG.eid_enabled : readBoolean(remote.getValue(rc, 'eid_enabled').asString()),
      eid_start: remote.getValue(rc, 'eid_start').asString() || DEFAULT_REMOTE_CONFIG.eid_start,
      eid_end: remote.getValue(rc, 'eid_end').asString() || DEFAULT_REMOTE_CONFIG.eid_end,
    });
    return { config: next, status: 'loaded', lastFetchAt: Date.now() };
  } catch (error) {
    return { config: clampRemoteConfig(DEFAULT_REMOTE_CONFIG), status: 'failed', lastFetchAt: Date.now(), error: error instanceof Error ? error.message : 'Remote Config failed to load.' };
  }
}
