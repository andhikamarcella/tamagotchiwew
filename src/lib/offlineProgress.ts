import type { GameplayDifficulty, Pet } from '@/lib/types';
import { applyStats, evaluatePetDeath } from '@/lib/gameLogic';

const TEN_MINUTES = 10 * 60 * 1000;
const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000;

export function applyOfflineProgress(pet: Pet, lastUpdatedAt: number, now = Date.now(), difficulty: GameplayDifficulty = 'normal'): { pet: Pet; summary: string; changed: boolean } {
  const elapsed = Math.max(0, Math.min(MAX_OFFLINE_MS, now - (Number.isFinite(lastUpdatedAt) ? lastUpdatedAt : now)));
  const ticks = Math.floor(elapsed / TEN_MINUTES);
  if (ticks <= 0) return { pet, summary: '', changed: false };
  const decay = difficulty === 'challenge' ? 1.35 : difficulty === 'cozy' ? 0.55 : 1;
  const next = evaluatePetDeath(applyStats(pet, { hunger: -2 * ticks * decay, happiness: -1 * ticks * decay, cleanliness: -1 * ticks * decay, energy: pet.isSleeping ? 3 * ticks : -1 * ticks * decay, health: pet.stats.hunger < 15 || pet.stats.cleanliness < 15 || pet.stats.energy < 5 ? -0.5 * ticks * decay : 0 }), now, difficulty);
  const summaryBits = ['got hungry', 'a little dirty'];
  if (pet.isSleeping) summaryBits.push('rested while sleeping');
  if (next.lifeState === 'critical' || next.lifeState === 'emergency') summaryBits.push('needs help');
  return { pet: next, summary: `While you were away, ${pet.customName} ${summaryBits.join(' and ')}.`, changed: true };
}
