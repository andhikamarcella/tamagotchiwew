'use client';

import type { GameRemoteConfig, RemoteConfigStatus } from '@/src/config/defaultRemoteConfig';
import { PixelButton } from '@/src/components/PixelButton';
import PixelCard from '@/src/components/PixelCard';

export default function RemoteConfigStatusCard({ config, status, lastFetchAt, loading, refresh }: { config: GameRemoteConfig; status: RemoteConfigStatus; lastFetchAt: number | null; loading: boolean; refresh: () => Promise<unknown> }) {
  return <PixelCard><h2 className="text-sm">Global Game Tuning</h2><p className="mt-2 text-[10px] leading-relaxed">Global status: {status === 'disabled' ? 'Disabled / local defaults' : status === 'loaded' ? 'Loaded from global service' : status === 'failed' ? 'Failed / local defaults' : 'Local defaults'}</p><div className="mt-3 grid gap-1 text-[9px]"><p>Last fetch: {lastFetchAt ? new Date(lastFetchAt).toLocaleString() : 'never'}</p><p>Maintenance mode: {String(config.maintenance_mode)}</p><p>Weekly event: {config.weekly_event_enabled ? config.weekly_event_title : 'off'}</p><p>Shop discount: {config.shop_discount_percent}%</p><p>Daily reward multiplier: {config.daily_reward_multiplier}x</p><p>Care XP multiplier: {config.care_xp_multiplier}x</p><p>Coin reward multiplier: {config.coin_reward_multiplier}x</p></div><div className="mt-3"><PixelButton onClick={() => void refresh()} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh global tuning'}</PixelButton></div></PixelCard>;
}
