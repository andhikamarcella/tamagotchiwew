import type { Stats } from '@/lib/types';

export type CareAction = 'feed' | 'snack' | 'play' | 'clean' | 'medicine' | 'pet' | 'walk' | 'train' | 'sleep' | 'wake';
export type PetAnimationType = 'idle' | 'eat' | 'snack' | 'play' | 'clean' | 'medicine' | 'pet' | 'walk' | 'train' | 'sleep' | 'wake' | 'levelUp' | 'findItem' | 'buyItem' | 'equipItem';
export type Rarity = 'Basic' | 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface CareOption {
  id: string;
  action: CareAction;
  name: string;
  icon: string;
  rarity: Rarity;
  description: string;
  effects: Partial<Stats>;
  coinCost?: number;
  itemName?: string;
  itemId?: string;
  consumesItem?: boolean;
  isFreeDaily?: boolean;
  unlockLevel: number;
  favoriteSpecies?: string[];
  dislikedSpecies?: string[];
  requiredToy?: string;
  requiredTool?: string;
  cooldownSeconds?: number;
  sicknessMatch?: string;
  rewardCoins?: number;
  findChance?: number;
}

export interface ActionResult {
  ok: boolean;
  reason?: string;
  petAnimation: PetAnimationType;
  dialog: string;
  toast: string;
  log: string;
  rewards: { coins: number; itemId?: string };
  levelUp: boolean;
}
