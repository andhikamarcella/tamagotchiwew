import { defaultSave } from '@/lib/gameLogic';
import type { SaveData } from '@/lib/types';
import { SAVE_KEY, loadSaveResult, storeValidatedSave } from '@/src/lib/saveSystem';
export { SAVE_KEY };
export function loadSave(): SaveData { return typeof window === 'undefined' ? defaultSave() : loadSaveResult().save; }
export function storeSave(save: SaveData): void { if (typeof window !== 'undefined') storeValidatedSave(save); }
