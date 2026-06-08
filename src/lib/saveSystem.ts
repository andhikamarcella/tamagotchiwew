import { CURRENT_SAVE_VERSION, defaultSave, safeParseSave } from '@/lib/gameLogic';
import type { LifeState, SaveData } from '@/lib/types';
import { GAME_VERSION } from '@/src/config/gameMeta';

export const SAVE_KEY = 'pixel-pals-save-v1';
export const BACKUP_KEY = 'pixel-paws-backups-v2';
export const BROKEN_SAVE_KEY = 'pixel-paws-broken-save';
export const MAX_BACKUPS = 5;
export type BackupReason = 'auto' | 'before-reset' | 'before-import' | 'before-migration' | 'corrupt-save' | 'manual';

export interface SaveBackup {
  id: string;
  createdAt: number;
  reason: BackupReason;
  saveVersion: number;
  petName: string;
  level: number;
  coins: number;
  appVersion: string;
  raw: string;
}

export interface LoadSaveResult { save: SaveData; repaired: string[]; migratedFrom: number | null; error: string | null; brokenRaw: string | null; }

const finite = (value: unknown, fallback = 0) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const clamp = (value: unknown, min = 0, max = 100) => Math.min(max, Math.max(min, finite(value, min)));
const validLifeStates: LifeState[] = ['healthy', 'warning', 'critical', 'emergency', 'dead'];
const safeArray = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

export function getBackups(): SaveBackup[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BACKUP_KEY) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is SaveBackup => Boolean(item && typeof item === 'object' && 'raw' in item)).slice(0, MAX_BACKUPS) : [];
  } catch { return []; }
}

export function createBackup(rawOrSave: string | SaveData, reason: BackupReason): SaveBackup | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = typeof rawOrSave === 'string' ? rawOrSave : JSON.stringify(rawOrSave);
    const save = safeParseSave(raw);
    const pet = save.pets.find((item) => item.id === save.activePetId) ?? save.pets[0];
    const backup: SaveBackup = { id:`backup-${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt:Date.now(), reason, saveVersion:save.saveVersion ?? 1, petName:pet?.customName ?? 'No pet', level:pet?.level ?? 0, coins:save.userCoins, appVersion:GAME_VERSION, raw };
    window.localStorage.setItem(BACKUP_KEY, JSON.stringify([backup, ...getBackups()].slice(0, MAX_BACKUPS)));
    return backup;
  } catch { return null; }
}

export function restoreLatestBackup(): SaveData | null {
  const backup = getBackups()[0];
  if (!backup) return null;
  const result = parseAndRepairSave(backup.raw, false);
  if (result.error) return null;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(result.save));
  return result.save;
}

export function migrateSaveObject(input: Record<string, unknown>): { value: Record<string, unknown>; from: number } {
  const value = { ...input };
  const from = Math.max(1, Math.floor(finite(value.saveVersion, 1)));
  let version = from;
  if (version < 2) { value.petJournal ??= []; value.moodMemory ??= []; version = 2; }
  if (version < 3) { value.skillTree ??= defaultSave().skillTree; value.skillPoints ??= 0; value.unlockedSkills ??= []; version = 3; }
  if (version < 4) { value.metadata ??= { lastBackupAt:null, backupCount:0, repairLog:[], antiCheatFlags:[], lastDeviceTime:null }; version = 4; }
  if (version < 5) { value.eggs ??= []; value.breedingCooldownUntil ??= null; value.unlockedVariants ??= []; value.activeVariantByPet ??= {}; value.reviveFreeUsed ??= false; version = 5; }
  if (version < 6) { value.news ??= { readIds:[], lastReadVersion:null }; value.cloudSync ??= { enabled:false, autoSync:false, lastSyncedAt:null, deviceName:getDeviceName(), status:'disabled' }; version = 6; }
  value.saveVersion = CURRENT_SAVE_VERSION;
  return { value, from };
}

export function validateAndRepairSave(save: SaveData): { save: SaveData; repairs: string[] } {
  const repairs: string[] = [];
  const mark = (message: string) => { if (!repairs.includes(message)) repairs.push(message); };
  const pets = safeArray<SaveData['pets'][number]>(save.pets).map((pet) => {
    const stats = { ...pet.stats };
    (['hunger','happiness','energy','cleanliness','health','affection'] as const).forEach((key) => { const next = clamp(stats[key]); if (next !== stats[key]) mark(`Repaired ${pet.customName || 'pet'} ${key}.`); stats[key] = next; });
    stats.xp = Math.max(0, finite(stats.xp));
    const lifeState = validLifeStates.includes(pet.lifeState) ? pet.lifeState : (pet.isAlive === false ? 'dead' : 'healthy');
    if (lifeState !== pet.lifeState) mark('Repaired invalid pet life state.');
    const reviveCount = Math.max(0, finite((pet as typeof pet & { reviveCount?: number }).reviveCount));
    return { ...pet, stats, lifeState, isAlive:lifeState !== 'dead', reviveCount };
  });
  let activePetId = save.activePetId;
  if (activePetId && !pets.some((pet) => pet.id === activePetId)) { activePetId = pets[0]?.id ?? null; mark('Repaired missing active pet reference.'); }
  const inventory = safeArray<SaveData['inventory'][number]>(save.inventory).map((item) => { const quantity = Math.max(0, Math.floor(finite(item.quantity))); if (quantity !== item.quantity) mark('Repaired invalid inventory quantity.'); return { ...item, quantity }; }).filter((item) => item.quantity > 0);
  const inventoryIds = new Set(inventory.map((item) => item.itemId));
  const repairedPets = pets.map((pet) => ({ ...pet, equippedAccessory:pet.equippedAccessory && inventoryIds.has(pet.equippedAccessory) ? pet.equippedAccessory : undefined, equippedHabitat:pet.equippedHabitat && inventoryIds.has(pet.equippedHabitat) ? pet.equippedHabitat : undefined, equippedDecorations:safeArray<string>(pet.equippedDecorations).filter((id) => inventoryIds.has(id)) }));
  const activeErrand = save.activeErrand && finite(save.activeErrand.startedAt) > 0 && finite(save.activeErrand.endsAt) >= finite(save.activeErrand.startedAt) ? save.activeErrand : null;
  if (save.activeErrand && !activeErrand) mark('Removed invalid errand timing.');
  const eggs = safeArray<NonNullable<SaveData['eggs']>[number]>(save.eggs).filter((egg) => { const valid = finite(egg.createdAt) > 0 && finite(egg.hatchAt) >= finite(egg.createdAt); if (!valid) mark('Removed an egg with invalid hatch timing.'); return valid; });
  const userCoins = Math.max(0, finite(save.userCoins)); if (userCoins !== save.userCoins) mark('Repaired invalid coin balance.');
  const next: SaveData = { ...save, saveVersion:CURRENT_SAVE_VERSION, userCoins, gems:Math.max(0, finite(save.gems)), eventCurrency:Math.max(0, finite(save.eventCurrency)), activePetId, pets:repairedPets, inventory, activeErrand, eggs, dailyReward:{ lastClaimDate:typeof save.dailyReward?.lastClaimDate === 'string' ? save.dailyReward.lastClaimDate : null, streak:Math.max(0, Math.floor(finite(save.dailyReward?.streak))) } };
  if (repairs.length) next.metadata = { ...(next.metadata ?? defaultSave().metadata!), repairLog:[...(next.metadata?.repairLog ?? []).slice(-9), { id:`repair-${Date.now()}`, createdAt:Date.now(), repairs }], antiCheatFlags:next.metadata?.antiCheatFlags ?? [], lastBackupAt:next.metadata?.lastBackupAt ?? null, backupCount:next.metadata?.backupCount ?? 0, lastDeviceTime:Date.now() };
  return { save:next, repairs };
}

export function parseAndRepairSave(raw: string | null, makeMigrationBackup = true): LoadSaveResult {
  if (!raw) return { save:defaultSave(), repaired:[], migratedFrom:null, error:null, brokenRaw:null };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Save root is not an object.');
    const migrated = migrateSaveObject(parsed as Record<string, unknown>);
    if (makeMigrationBackup && migrated.from < CURRENT_SAVE_VERSION) createBackup(raw, 'before-migration');
    const normalized = safeParseSave(JSON.stringify(migrated.value));
    const repaired = validateAndRepairSave(normalized);
    return { save:repaired.save, repaired:repaired.repairs, migratedFrom:migrated.from < CURRENT_SAVE_VERSION ? migrated.from : null, error:null, brokenRaw:null };
  } catch (error) {
    try { window.localStorage.setItem(BROKEN_SAVE_KEY, raw); createBackup(raw, 'corrupt-save'); } catch { /* storage may be unavailable */ }
    return { save:defaultSave(), repaired:[], migratedFrom:null, error:error instanceof Error ? error.message : 'Save could not be read.', brokenRaw:raw };
  }
}

export function loadSaveResult(): LoadSaveResult {
  if (typeof window === 'undefined') return { save:defaultSave(), repaired:[], migratedFrom:null, error:null, brokenRaw:null };
  try { return parseAndRepairSave(window.localStorage.getItem(SAVE_KEY)); }
  catch (error) { return { save:defaultSave(), repaired:[], migratedFrom:null, error:error instanceof Error ? error.message : 'Local storage is unavailable.', brokenRaw:null }; }
}

export function storeValidatedSave(save: SaveData): { save: SaveData; repairs: string[] } {
  const result = validateAndRepairSave(save);
  if (typeof window !== 'undefined') window.localStorage.setItem(SAVE_KEY, JSON.stringify(result.save));
  return result;
}

export function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'This device';
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : 'Browser';
  const platform = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : 'Device';
  return `${browser} ${platform}`;
}

export function downloadJson(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type:'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}
