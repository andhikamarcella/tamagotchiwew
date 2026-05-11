import { defaultSave, safeParseSave } from '@/lib/gameLogic';
import type { SaveData } from '@/lib/types';

export const SAVE_KEY = 'pixel-pals-save-v1';
export function loadSave(): SaveData {
  if (typeof window === 'undefined') return defaultSave();
  return safeParseSave(window.localStorage.getItem(SAVE_KEY));
}
export function storeSave(save: SaveData): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}
