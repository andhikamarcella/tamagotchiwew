import type { Pet } from '@/lib/types';
import { applyStats } from '@/lib/gameLogic';

const TEN_MINUTES = 10 * 60 * 1000;
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

export function applyOfflineProgress(pet: Pet, lastUpdatedAt: number, now = Date.now()): { pet: Pet; summary: string; changed: boolean } {
  const elapsed = Math.max(0, Math.min(MAX_OFFLINE_MS, now - (Number.isFinite(lastUpdatedAt) ? lastUpdatedAt : now)));
  const ticks = Math.floor(elapsed / TEN_MINUTES);
  if (ticks <= 0) return { pet, summary: '', changed: false };
  const next = applyStats(pet, { hunger: -2 * ticks, happiness: -1 * ticks, cleanliness: -1 * ticks, energy: pet.isSleeping ? 3 * ticks : -1 * ticks, health: pet.stats.hunger < 15 || pet.stats.cleanliness < 15 || pet.stats.energy < 5 ? -0.5 * ticks : 0 });
  const summaryBits = ['got hungry', 'a little dirty'];
  if (pet.isSleeping) summaryBits.push('rested while sleeping');
  return { pet: next, summary: `While you were away, ${pet.customName} ${summaryBits.join(' and ')}.`, changed: true };
}
