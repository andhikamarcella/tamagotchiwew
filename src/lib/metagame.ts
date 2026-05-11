import { itemById } from '@/lib/gameLogic';
import type { DailyGoal, DiaryEntry, Pet, PetRequest, SaveData } from '@/lib/types';

const uuid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
export const personalityEffects: Record<string, string> = {
  Foodie: 'Gets hungry faster, but favorite food gives extra happiness.',
  Sleepy: 'Legacy sleepy trait: gets tired faster, but recovers more energy while sleeping.',
  Lazy: 'Energy drops faster, but sleep recovery is stronger.',
  Playful: 'Earns more XP from Play actions and mini games.',
  Curious: 'Finds items more often during walks and errands.',
  Shy: 'Social gains are slower, but bond rewards are stronger.',
  Clingy: 'Affection rises faster from pet and hug actions.',
  Brave: 'Training is more effective.',
  Gentle: 'Bond grows steadily from care actions.',
  Naughty: 'Mood changes more often, but play rewards are higher.',
  Loyal: 'Bond rank rises faster from daily care.',
  Moody: 'Mood shifts quickly, so smart suggestions matter more.',
};

export function smartSuggestions(pet: Pet, save: SaveData): string[] {
  const animalFood = itemById(save.favoriteItems[0] ?? '')?.name;
  return [
    pet.stats.energy < 35 ? `Energy is low. Let ${pet.customName} sleep.` : '',
    pet.stats.hunger < 40 ? `${pet.customName} loves ${animalFood ?? 'their favorite food'}. Try feeding for bonus affection.` : '',
    pet.stats.cleanliness < 40 ? 'Cleanliness is low. Bubble Bath or Clean will help.' : '',
    save.inventory.some((item) => itemById(item.itemId)?.category === 'Badges' && !item.equipped) ? 'You have unused badges. Equip one in Inventory.' : '',
    pet.isAlive ? 'Couple Mode is ready when you want to invite someone.' : '',
  ].filter(Boolean).slice(0, 3);
}

export function addDiaryEntry(pet: Pet, text: string): Pet {
  const entry: DiaryEntry = { id: uuid(), date: new Date().toISOString().slice(0, 10), text };
  return { ...pet, diary: [entry, ...(pet.diary ?? [])].slice(0, 100), careHistory: [entry, ...(pet.careHistory ?? [])].slice(0, 100) };
}

export function progressDailyGoal(save: SaveData, id: string, amount = 1): SaveData {
  return { ...save, dailyGoals: { ...save.dailyGoals, goals: save.dailyGoals.goals.map((goal) => goal.id === id ? { ...goal, progress: Math.min(goal.target, Math.max(0, goal.progress + amount)) } : goal) } };
}

export function claimDailyGoal(save: SaveData, goalId: string, petId: string | null): SaveData {
  const goal = save.dailyGoals.goals.find((item) => item.id === goalId);
  if (!goal || goal.claimed || goal.progress < goal.target) return save;
  return {
    ...save,
    userCoins: Math.max(0, save.userCoins + goal.rewardCoins),
    dailyGoals: { ...save.dailyGoals, goals: save.dailyGoals.goals.map((item) => item.id === goalId ? { ...item, claimed:true } : item) },
    pets: save.pets.map((pet) => pet.id === petId ? addDiaryEntry({ ...pet, stats:{ ...pet.stats, xp: pet.stats.xp + goal.rewardXp } }, `Claimed daily goal: ${goal.label}.`) : pet),
  };
}

export function generatePetRequest(pet: Pet): PetRequest {
  const requests = [
    { text:`I want Pixel Fish!`, action:'feed', itemName:'Pixel Fish' },
    { text:`Can we play Ball Toss?`, action:'play', itemName:'Ball Toss' },
    { text:`I need a bath.`, action:'clean' },
    { text:`Let’s go to the Beach!`, action:'walk', itemName:'Beach House' },
    { text:`I feel sleepy.`, action:'sleep' },
    { text:`Can I wear a ribbon?`, action:'equip', itemName:'Red Ribbon' },
  ];
  const pick = requests[Math.floor(Math.random() * requests.length)] ?? requests[0]!;
  return { id: uuid(), ...pick, expiresAt: Date.now() + 6 * 60 * 60 * 1000, rewardCoins: 18, rewardXp: 8, completed:false, failed:false };
}

export function collectionCounts(save: SaveData) {
  return {
    pets: save.collection.discoveredPets.length,
    foods: save.collection.foodsTried.length,
    toys: save.collection.toysUsed.length,
    badges: save.collection.badgesCollected.length,
    habitats: save.collection.habitatsUnlocked.length,
    events: save.collection.eventItems.length,
    trophies: save.collection.miniGameTrophies.length,
  };
}

export function roomComfort(save: SaveData, pet: Pet): number {
  const habitat = pet.equippedHabitat ? 12 : 0;
  const decor = Math.min(30, pet.equippedDecorations.length * 8);
  const special = pet.equippedDecorations.some((id) => itemById(id)?.category === 'Special') ? 10 : 0;
  return Math.min(100, 35 + habitat + decor + special + Math.min(15, save.inventory.filter((item) => item.equipped).length * 2));
}

export function rarityTone(rarity?: string): string {
  switch (rarity) {
    case 'Legendary': return 'bg-purple-200';
    case 'Epic': return 'bg-fuchsia-200';
    case 'Rare': return 'bg-blue-200';
    case 'Event': return 'bg-yellow-200';
    case 'Uncommon': return 'bg-green-200';
    default: return 'bg-white';
  }
}
