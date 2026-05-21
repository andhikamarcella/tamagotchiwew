export type GameRemoteConfig = {
  maintenance_mode: boolean;
  maintenance_message: string;
  announcement_title: string;
  announcement_message: string;
  weekly_event_enabled: boolean;
  weekly_event_title: string;
  shop_discount_percent: number;
  daily_reward_multiplier: number;
  care_xp_multiplier: number;
  coin_reward_multiplier: number;
  couple_mode_enabled: boolean;
  guest_trial_minutes: number;
  min_supported_version: string;
  latest_version: string;
  version_label: string;
  release_channel: string;
  seasonal_event_override_enabled: boolean;
  seasonal_event_active_id: string;
  seasonal_event_title: string;
  seasonal_event_message: string;
  seasonal_event_start: string;
  seasonal_event_end: string;
  reward_multiplier: number;
  ramadan_enabled: boolean;
  ramadan_start: string;
  ramadan_end: string;
  eid_enabled: boolean;
  eid_start: string;
  eid_end: string;
};

export const DEFAULT_REMOTE_CONFIG: GameRemoteConfig = {
  maintenance_mode: false,
  maintenance_message: 'Pixel Paws is getting a tiny tune-up. Please come back soon.',
  announcement_title: 'Pixel Paws v1.0.0 Beta is Here!',
  announcement_message: 'Seasonal events, life systems, improved mini games, habitat backgrounds, and safer sync are now live.',
  weekly_event_enabled: true,
  weekly_event_title: 'Beta Launch Festival',
  shop_discount_percent: 10,
  daily_reward_multiplier: 1.2,
  care_xp_multiplier: 1.2,
  coin_reward_multiplier: 1.2,
  couple_mode_enabled: true,
  guest_trial_minutes: 5,
  min_supported_version: '0.1.0',
  latest_version: '1.0.0',
  version_label: 'Beta Launch',
  release_channel: 'beta',
  seasonal_event_override_enabled: false,
  seasonal_event_active_id: '',
  seasonal_event_title: '',
  seasonal_event_message: '',
  seasonal_event_start: '',
  seasonal_event_end: '',
  reward_multiplier: 1.2,
  ramadan_enabled: false,
  ramadan_start: '',
  ramadan_end: '',
  eid_enabled: false,
  eid_start: '',
  eid_end: '',
};

export type RemoteConfigStatus = 'disabled' | 'defaults' | 'loaded' | 'failed';

export function clampRemoteConfig(config: GameRemoteConfig): GameRemoteConfig {
  const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
  return {
    ...config,
    shop_discount_percent: Math.round(clampNumber(config.shop_discount_percent, 0, 80)),
    daily_reward_multiplier: clampNumber(config.daily_reward_multiplier, 0.1, 5),
    care_xp_multiplier: clampNumber(config.care_xp_multiplier, 0.1, 5),
    coin_reward_multiplier: clampNumber(config.coin_reward_multiplier, 0.1, 5),
    reward_multiplier: clampNumber(config.reward_multiplier, 0.1, 5),
    guest_trial_minutes: Math.round(clampNumber(config.guest_trial_minutes, 1, 60)),
  };
}
