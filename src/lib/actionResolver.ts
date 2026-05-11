import { shopItems } from '@/lib/gameData';
import { applyStats, getAnimal, getMood, levelPet } from '@/lib/gameLogic';
import type { InventoryItem, Pet } from '@/lib/types';
import type { ActionResult, CareOption } from '@/src/types/care';

function shopIdForOption(option: CareOption): string | undefined {
  if (option.itemId) return option.itemId;
  if (!option.itemName) return undefined;
  return shopItems.find((item) => item.name === option.itemName)?.id ?? option.id;
}

function getQuantity(inventory: InventoryItem[], itemId: string | undefined): number {
  if (!itemId) return 0;
  return inventory.find((item) => item.itemId === itemId)?.quantity ?? 0;
}

function consumeItem(inventory: InventoryItem[], itemId: string | undefined): InventoryItem[] {
  if (!itemId) return inventory;
  return inventory
    .map((item) => item.itemId === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item)
    .filter((item) => item.quantity > 0);
}

export function optionDisabledReason(pet: Pet, option: CareOption, inventory: InventoryItem[], coins: number): string | null {
  if (pet.level < option.unlockLevel) return `Unlock at Lv. ${option.unlockLevel}`;
  if (option.coinCost && coins < option.coinCost) return 'Not enough coins';
  const itemId = shopIdForOption(option);
  if (option.consumesItem && !option.isFreeDaily && getQuantity(inventory, itemId) <= 0) return 'Need item in inventory';
  if (option.action === 'feed' && pet.stats.hunger > 95) return 'Already full';
  if (option.action === 'clean' && pet.stats.cleanliness > 95) return 'Already clean';
  if (['play', 'walk', 'train'].includes(option.action) && pet.stats.energy < 15) return 'Too tired';
  if (option.action === 'walk' && pet.stats.health <= 0) return 'Very sick';
  if (option.action === 'wake' && !pet.isSleeping) return 'Already awake';
  if (option.action === 'sleep' && pet.isSleeping) return 'Already sleeping';
  return null;
}

export function applyCareOption(pet: Pet, option: CareOption, inventory: InventoryItem[], coins: number): { pet: Pet; inventory: InventoryItem[]; coins: number; result: ActionResult } {
  const reason = optionDisabledReason(pet, option, inventory, coins);
  if (reason) {
    return { pet, inventory, coins, result: { ok:false, reason, petAnimation:'idle', dialog:reason, toast:reason, log:`${option.name} blocked: ${reason}`, rewards:{ coins:0 }, levelUp:false } };
  }
  const animal = getAnimal(pet.animalId);
  const itemId = shopIdForOption(option);
  const favorite = option.favoriteSpecies?.includes(animal.species) || option.name === animal.favoriteFood || option.name === animal.favoriteToy || option.name === animal.favoriteHabitat;
  const disliked = option.dislikedSpecies?.includes(animal.species) ?? false;
  const bonus = favorite ? 5 : disliked ? -4 : 0;
  const effects = { ...option.effects };
  effects.happiness = (effects.happiness ?? 0) + bonus;
  effects.xp = (effects.xp ?? 0) + (favorite ? 4 : 0);
  const basePet = { ...pet, isSleeping: option.action === 'sleep' ? true : option.action === 'wake' ? false : pet.isSleeping };
  const countedPet = { ...basePet, actionCounts: { ...basePet.actionCounts, [option.action]: (basePet.actionCounts[option.action] ?? 0) + 1 } };
  const levelled = levelPet(applyStats(countedPet, effects));
  const spent = option.coinCost ?? 0;
  const rewardCoins = Math.max(0, option.rewardCoins ?? 0);
  const nextCoins = Math.max(0, coins - spent + rewardCoins);
  const nextInventory = option.consumesItem && !option.isFreeDaily ? consumeItem(inventory, itemId) : inventory;
  const mood = getMood(levelled.pet);
  const dialog = favorite ? `${animal.species} loves ${option.name}!` : disliked ? `${animal.species} kurang suka ${option.name}...` : `${option.name} selesai! Mood: ${mood}`;
  return {
    pet: levelled.pet,
    inventory: nextInventory,
    coins: nextCoins,
    result: {
      ok: true,
      petAnimation: option.action === 'feed' ? 'eat' : option.action === 'pet' ? 'pet' : option.action,
      dialog,
      toast: `${pet.customName} enjoyed ${option.name}${rewardCoins ? ` (+${rewardCoins} coins)` : ''}!`,
      log: `${pet.customName} used ${option.name}. ${favorite ? 'Favorite bonus!' : disliked ? 'Disliked penalty.' : 'Care complete.'}`,
      rewards: { coins: rewardCoins },
      levelUp: levelled.gained > 0,
    },
  };
}
