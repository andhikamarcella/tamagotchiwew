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
};

export const DEFAULT_REMOTE_CONFIG: GameRemoteConfig = {
  maintenance_mode: false,
  maintenance_message: 'Pixel Paws is getting a tiny tune-up. Please come back soon.',
  announcement_title: 'Pixel Paws v1.0.0 Beta is Live!',
  announcement_message: 'All 20 mini games are playable, the Beta Launch label is live, and seasonal event news is refreshed.',
  weekly_event_enabled: true,
  weekly_event_title: 'Beta Launch Festival',
  shop_discount_percent: 0,
  daily_reward_multiplier: 1,
  care_xp_multiplier: 1,
  coin_reward_multiplier: 1,
  couple_mode_enabled: true,
  guest_trial_minutes: 5,
  min_supported_version: '0.1.0',
  latest_version: '1.0.0',
  version_label: 'Beta',
  release_channel: 'beta',
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
    guest_trial_minutes: Math.round(clampNumber(config.guest_trial_minutes, 1, 60)),
  };
}
