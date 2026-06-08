import { addInventory, getAnimal, newPet, todayKey } from '@/lib/gameLogic';
import type { Pet, PetEgg, PetPersonality, SaveData } from '@/lib/types';
import { getPersonalityEffects } from './personalityEffects';

export const PET_VARIANTS = [
  { variantId:'golden-cat', displayName:'Golden Cat', baseAnimalId:'cat', rarity:'Legendary', colorTheme:'#facc15', unlockSource:'breeding' },
  { variantId:'snow-rabbit', displayName:'Snow Rabbit', baseAnimalId:'rabbit', rarity:'Rare', colorTheme:'#e0f2fe', unlockSource:'breeding' },
  { variantId:'midnight-fox', displayName:'Midnight Fox', baseAnimalId:'fox', rarity:'Epic', colorTheme:'#312e81', unlockSource:'breeding' },
  { variantId:'sakura-panda', displayName:'Sakura Panda', baseAnimalId:'panda', rarity:'Epic', colorTheme:'#f9a8d4', unlockSource:'event' },
  { variantId:'cyber-raccoon', displayName:'Cyber Raccoon', baseAnimalId:'raccoon', rarity:'Legendary', colorTheme:'#22d3ee', unlockSource:'achievement' },
] as const;

export function canBreed(parentA: Pet | undefined, parentB: Pet | undefined, save: SaveData, now = Date.now()): string | null {
  if (!parentA || !parentB || parentA.id === parentB.id) return 'Choose two different pets.';
  if ((save.breedingCooldownUntil ?? 0) > now) return 'The cozy nest is still on cooldown.';
  if (!parentA.isAlive || !parentB.isAlive) return 'Memorial pets cannot breed.';
  if (parentA.isSleeping || parentB.isSleeping) return 'Wake both pets before breeding.';
  if ((parentA.activeIllnesses?.length ?? 0) || (parentB.activeIllnesses?.length ?? 0)) return 'Both pets need to be healthy.';
  if (parentA.stats.affection < 75 || parentB.stats.affection < 75) return 'Both pets need at least 75 affection.';
  return null;
}

export function createEgg(save: SaveData, parentAId: string, parentBId: string, now = Date.now()): SaveData {
  const a = save.pets.find((pet) => pet.id === parentAId); const b = save.pets.find((pet) => pet.id === parentBId);
  if (canBreed(a, b, save, now) || !a || !b) return save;
  const rareChance = Math.min(.2, .05 + (a.bondRank === 'Soul Pet' ? .04 : 0) + (b.bondRank === 'Soul Pet' ? .04 : 0));
  const egg: PetEgg = { id:`egg-${now}-${Math.random().toString(16).slice(2)}`, parentIds:[a.id,b.id], createdAt:now, hatchAt:now + 30 * 60 * 1000, rarityChance:rareChance, inheritedTraits:{ species:Math.random()<.5?a.animalId:b.animalId, personality:(Math.random()<.5?a.personality:b.personality), favoriteFood:getAnimal(Math.random()<.5?a.animalId:b.animalId).favoriteFood, favoriteToy:getAnimal(Math.random()<.5?a.animalId:b.animalId).favoriteToy }, status:'incubating' };
  return { ...save, eggs:[...(save.eggs ?? []), egg], breedingCooldownUntil:now + 24 * 60 * 60 * 1000, moodMemory:[...(save.moodMemory ?? []), { id:`memory-first-egg-${now}`, petId:a.id, type:'first-egg', text:'Our first tiny egg arrived in a warm pixel nest.', createdAt:now }] };
}

export function hatchEgg(save: SaveData, eggId: string, now = Date.now()): SaveData {
  const egg = save.eggs?.find((item) => item.id === eggId); if (!egg || egg.status === 'hatched' || now < egg.hatchAt) return save;
  const animalId = egg.inheritedTraits.species ?? 'cat'; const personality = (egg.inheritedTraits.personality ?? 'Curious') as PetPersonality;
  const pet = newPet(animalId, `Tiny ${getAnimal(animalId).species}`, personality);
  const matching = PET_VARIANTS.filter((variant) => variant.baseAnimalId === animalId);
  const shiny = matching.length > 0 && Math.random() < egg.rarityChance ? matching[Math.floor(Math.random()*matching.length)] : undefined;
  return { ...save, pets:[...save.pets, pet], activePetId:pet.id, eggs:(save.eggs ?? []).map((item) => item.id === eggId ? { ...item, status:'hatched', hatchedPetId:pet.id } : item), unlockedVariants:shiny ? Array.from(new Set([...(save.unlockedVariants ?? []), shiny.variantId])) : save.unlockedVariants, activeVariantByPet:shiny ? { ...(save.activeVariantByPet ?? {}), [pet.id]:shiny.variantId } : save.activeVariantByPet, achievements:Array.from(new Set([...save.achievements, 'first-hatch'])), moodMemory:[...(save.moodMemory ?? []), { id:`memory-first-hatch-${now}`, petId:pet.id, type:'first-egg', text:`${pet.customName} hatched today. The room felt full of sparkles!`, createdAt:now }] };
}

export function revivePet(save: SaveData, petId: string): { save: SaveData; error: string | null } {
  const pet = save.pets.find((item) => item.id === petId); if (!pet || pet.lifeState !== 'dead') return { save, error:'Pet is not in memorial state.' };
  const token = save.inventory.find((item) => item.itemId === 'special-8' && item.quantity > 0);
  const free = !save.reviveFreeUsed; const discount = (save.unlockedSkills ?? []).includes('survival-2') ? .85 : 1; const coinCost = Math.round(2500 * discount);
  if (!free && !token && save.userCoins < coinCost) return { save, error:`A Revive Token or ${coinCost} coins is needed.` };
  const inventory = token ? save.inventory.map((item) => item.itemId === token.itemId ? { ...item, quantity:item.quantity-1 } : item).filter((item) => item.quantity > 0) : save.inventory;
  const revived = { ...pet, isAlive:true, lifeState:'healthy' as const, diedAt:null, deathReason:null, activeIllnesses:[], isSleeping:false, stats:{ ...pet.stats, health:55, hunger:50, happiness:50, cleanliness:50, energy:50 }, reviveCount:Math.max(0, Number((pet as Pet & { reviveCount?: number }).reviveCount ?? 0))+1, diary:[{ id:`revive-diary-${Date.now()}`, date:todayKey(), type:'revive' as const, text:'Today I received a second chance. I felt your love calling me home.' }, ...(pet.diary ?? [])] };
  return { save:{ ...save, userCoins:free||token?save.userCoins:save.userCoins-coinCost, inventory, reviveFreeUsed:true, pets:save.pets.map((item)=>item.id===petId?revived:item), achievements:Array.from(new Set([...save.achievements,'second-chance'])), moodMemory:[...(save.moodMemory ?? []), { id:`memory-revive-${Date.now()}`, petId, type:'first-revive', text:'A gentle second chance became one of our strongest memories.', createdAt:Date.now() }] }, error:null };
}

export function spendSkillPoint(save: SaveData, skillId: string): SaveData {
  if ((save.skillPoints ?? 0) < 1 || (save.unlockedSkills ?? []).includes(skillId)) return save;
  return { ...save, skillPoints:(save.skillPoints ?? 0)-1, unlockedSkills:[...(save.unlockedSkills ?? []),skillId], achievements:Array.from(new Set([...save.achievements,'first-skill'])) };
}

export const jobRewardMultiplier = (pet: Pet, job: string) => { const effect=getPersonalityEffects(pet.personality); return effect.errandSuccess * (job==='Arcade Runner'&&pet.personality==='Playful'?1.15:1) * (job==='Bakery Helper'&&pet.personality==='Foodie'?1.15:1); };
export const grantReviveToken = (save: SaveData) => ({ ...save, inventory:addInventory(save.inventory,'special-8',1) });
