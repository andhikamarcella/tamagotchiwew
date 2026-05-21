import type { GameRemoteConfig } from '@/src/config/defaultRemoteConfig';
import { eventById, seasonalEvents, type SeasonalEventConfig } from '@/src/data/seasonalEvents';

export type ActiveSeasonalEvent = SeasonalEventConfig & {
  source: 'date' | 'remote';
  message: string;
  remainingDays: number;
  rewardMultiplier: number;
  shopDiscountPercent: number;
};

function dateOnly(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function parseLocalDate(value?: string | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function daysRemaining(now: Date, end: Date): number {
  return Math.max(0, Math.ceil((dateOnly(end).getTime() - dateOnly(now).getTime()) / 86400000) + 1);
}

function isBetweenDates(now: Date, start: Date, end: Date): boolean {
  const current = dateOnly(now).getTime();
  return current >= dateOnly(start).getTime() && current <= dateOnly(end).getTime();
}

function rangeForYear(now: Date, event: SeasonalEventConfig): { start: Date; end: Date } | null {
  if (!event.fixedRange) return null;
  const year = now.getFullYear();
  let start = new Date(year, event.fixedRange.startMonth - 1, event.fixedRange.startDay);
  let end = new Date(year, event.fixedRange.endMonth - 1, event.fixedRange.endDay);
  if (end < start) {
    if (now < start) start = new Date(year - 1, event.fixedRange.startMonth - 1, event.fixedRange.startDay);
    else end = new Date(year + 1, event.fixedRange.endMonth - 1, event.fixedRange.endDay);
  }
  return { start, end };
}

function manualRange(config: GameRemoteConfig, startKey: 'ramadan_start' | 'eid_start', endKey: 'ramadan_end' | 'eid_end'): { start: Date; end: Date } | null {
  const start = parseLocalDate(config[startKey]);
  const end = parseLocalDate(config[endKey]);
  return start && end ? { start, end } : null;
}

function attachActive(event: SeasonalEventConfig, now: Date, end: Date, source: 'date' | 'remote', config: GameRemoteConfig, message = event.announcement): ActiveSeasonalEvent {
  const rewardMultiplier = config.reward_multiplier ?? config.coin_reward_multiplier ?? event.bonusMultiplier;
  return {
    ...event,
    source,
    message,
    remainingDays: daysRemaining(now, end),
    rewardMultiplier,
    shopDiscountPercent: config.shop_discount_percent ?? 0,
  };
}

export function resolveActiveSeasonalEvent(config: GameRemoteConfig, now: Date | null): ActiveSeasonalEvent | null {
  if (!now) return null;

  if (config.seasonal_event_override_enabled && config.seasonal_event_active_id) {
    const overrideBase = eventById(config.seasonal_event_active_id) ?? seasonalEvents[0];
    const start = parseLocalDate(config.seasonal_event_start);
    const end = parseLocalDate(config.seasonal_event_end);
    const inRange = !start || !end || isBetweenDates(now, start, end);
    if (overrideBase && inRange) {
      return attachActive(
        { ...overrideBase, title:config.seasonal_event_title || overrideBase.title, announcement:config.seasonal_event_message || overrideBase.announcement },
        now,
        end ?? now,
        'remote',
        config,
        config.seasonal_event_message || overrideBase.announcement,
      );
    }
  }

  for (const event of seasonalEvents) {
    const fixed = rangeForYear(now, event);
    if (fixed && isBetweenDates(now, fixed.start, fixed.end)) return attachActive(event, now, fixed.end, 'date', config);
    if (event.id === 'ramadan') {
      const manual = manualRange(config, 'ramadan_start', 'ramadan_end');
      if ((config.ramadan_enabled || Boolean(manual)) && manual && isBetweenDates(now, manual.start, manual.end)) return attachActive(event, now, manual.end, 'remote', config);
    }
    if (event.id === 'eid') {
      const manual = manualRange(config, 'eid_start', 'eid_end');
      if ((config.eid_enabled || Boolean(manual)) && manual && isBetweenDates(now, manual.start, manual.end)) return attachActive(event, now, manual.end, 'remote', config);
    }
  }
  return null;
}

export function seasonalEventTimeline(now: Date): Array<SeasonalEventConfig & { status: 'active' | 'upcoming' | 'ended'; daysUntil?: number; remainingDays?: number }> {
  const current = dateOnly(now).getTime();
  return seasonalEvents.map((event) => {
    const range = rangeForYear(now, event);
    if (!range) return { ...event, status:'upcoming' as const };
    const start = dateOnly(range.start).getTime();
    const end = dateOnly(range.end).getTime();
    if (current >= start && current <= end) return { ...event, status:'active' as const, remainingDays:daysRemaining(now, range.end) };
    if (current < start) return { ...event, status:'upcoming' as const, daysUntil:Math.ceil((start - current) / 86400000) };
    return { ...event, status:'ended' as const };
  });
}

