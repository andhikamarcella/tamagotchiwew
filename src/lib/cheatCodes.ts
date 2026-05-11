import type { CheatCodeResult, SaveData } from '@/lib/types';

const FAILED_TRIES_KEY = 'pixel-paws-cheat-failed-tries';

function readFailures(): number[] {
  if (typeof window === 'undefined') return [];
  try { return (JSON.parse(window.localStorage.getItem(FAILED_TRIES_KEY) || '[]') as number[]).filter((ts) => Date.now() - ts < 60000); } catch { return []; }
}

export function applyCheatCode(rawCode: string, save: SaveData): { result: CheatCodeResult; save: SaveData } {
  const code = rawCode.trim().toLowerCase();
  const failures = readFailures();
  if (failures.length >= 5) return { result: { ok:false, message:'Too many invalid codes. Try again in a minute.', rateLimited:true }, save };
  if (code !== 'motherlode') {
    if (typeof window !== 'undefined') window.localStorage.setItem(FAILED_TRIES_KEY, JSON.stringify([...failures, Date.now()].slice(-5)));
    return { result:{ ok:false, message:'Invalid code.' }, save };
  }
  if (save.usedCheatCodes?.motherlode) return { result:{ ok:false, message:'This code has already been used.', code, alreadyUsed:true }, save };
  const next: SaveData = { ...save, userCoins: Math.max(0, save.userCoins + 20), usedCheatCodes: { ...(save.usedCheatCodes ?? {}), motherlode: true } };
  if (typeof window !== 'undefined') window.localStorage.setItem('pixel-paws-used-cheat-motherlode', 'true');
  return { result:{ ok:true, message:'Cheat accepted! +20 coins.', coins:20, code }, save: next };
}
