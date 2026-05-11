import type { MiniGameDifficulty, RewardResult } from '@/lib/types';

const rewardBands: Record<MiniGameDifficulty, { coins: [number, number]; xp: [number, number] }> = {
  Easy: { coins: [5, 12], xp: [5, 6] },
  Medium: { coins: [10, 22], xp: [10, 12] },
  Hard: { coins: [18, 35], xp: [18, 22] },
  Event: { coins: [12, 28], xp: [12, 18] },
};

export function coinReward(min: number, max: number): number {
  const low = Math.max(0, Math.floor(Number.isFinite(min) ? min : 0));
  const high = Math.max(low, Math.floor(Number.isFinite(max) ? max : low));
  return low + Math.floor(Math.random() * (high - low + 1));
}

export function createMiniGameReward(input: { difficulty: MiniGameDifficulty; reason: string; actionId: string; score?: number; multiplier?: number; alreadyRewarded?: boolean }): RewardResult {
  if (input.alreadyRewarded) return { coins: 0, xp: 0, reason: 'Reward already claimed.', actionId: input.actionId };
  const band = rewardBands[input.difficulty] ?? rewardBands.Easy;
  const scoreBonus = Math.max(0, Math.min(10, Math.floor((Number.isFinite(input.score ?? 0) ? input.score ?? 0 : 0) / 5)));
  const eventBonus = input.difficulty === 'Event' ? 1.2 : 1;
  const multiplier = Math.max(0, Number.isFinite(input.multiplier ?? 1) ? input.multiplier ?? 1 : 1);
  return {
    coins: Math.max(0, Math.round((coinReward(...band.coins) + scoreBonus) * eventBonus * multiplier)),
    xp: Math.max(0, Math.round((coinReward(...band.xp) + Math.floor(scoreBonus / 2)) * eventBonus)),
    reason: input.reason,
    actionId: input.actionId,
  };
}
