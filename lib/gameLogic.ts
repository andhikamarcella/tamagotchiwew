import { achievements, animals, shopItems } from './gameData';
import type { BondRank, CollectionState, DailyGoalsState, EquippedBadges, Evolution, GameplayDifficulty, InventoryItem, LifeState, MemorialPet, Mood, Pet, PetIllness, PetPersonality, SaveData, Stats, TimeOfDay, Weather, WeeklyQuestsState } from './types';
export const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
export const todayKey = () => new Date().toISOString().slice(0,10);
export const xpNeed = (level: number) => 50 + level * 25;
export const getEvolution = (level: number): Evolution => level >= 50 ? 'Legendary' : level >= 30 ? 'Adult' : level >= 15 ? 'Teen' : level >= 5 ? 'Kid' : 'Baby';
export const getAnimal = (id: string) => animals.find((a) => a.id === id) ?? animals[0]!;
export const randomWeather = (): Weather => (['Sunny','Rainy','Cloudy','Snowy','Windy','Starry'] as Weather[])[Math.floor(Math.random()*6)] ?? 'Sunny';
export const getTimeOfDay = (): TimeOfDay => { const h = new Date().getHours(); return h < 11 ? 'Morning' : h < 16 ? 'Afternoon' : h < 20 ? 'Evening' : 'Night'; };
export const personalities: PetPersonality[] = ['Playful','Foodie','Lazy','Brave','Clingy','Curious','Shy','Loyal','Moody','Gentle'];
export const normalizePersonality = (value: unknown): PetPersonality => { const raw = String(value ?? '').trim().toLowerCase(); return personalities.find((item) => item.toLowerCase() === raw) ?? personalities[Math.floor(Math.random()*personalities.length)] ?? 'Curious'; };
const randomTrait = (): PetPersonality => personalities[Math.floor(Math.random()*personalities.length)] ?? 'Curious';
export const getBondRank = (affection: number): BondRank => affection >= 95 ? 'Soul Pet' : affection >= 78 ? 'Family' : affection >= 55 ? 'Best Friend' : affection >= 28 ? 'Buddy' : 'Stranger';
export const calculateCareScore = (pet: Pet): { score: number; grade: 'S'|'A'|'B'|'C'|'D'; tips: string[] } => { const stats = normalizeStats(pet.stats); const bond = pet.bondXp ?? stats.affection; const score = Math.round((stats.health + stats.happiness + stats.cleanliness + stats.hunger + stats.energy + Math.min(100, bond)) / 6); const grade = score >= 90 ? 'S' : score >= 78 ? 'A' : score >= 62 ? 'B' : score >= 45 ? 'C' : 'D'; const tips = [stats.hunger < 35 ? 'Feed your pet soon' : '', stats.cleanliness < 35 ? 'Cleanliness is low' : '', stats.energy < 35 ? 'Energy is low' : '', stats.health < 45 ? 'Health needs medicine' : ''].filter(Boolean).slice(0, 3); return { score, grade, tips }; };
export const defaultCollection = (): CollectionState => ({ foodsTried: [], toysUsed: [], badgesCollected: [], habitatsUnlocked: ['hab-0'], eventItems: [], miniGameTrophies: [], discoveredPets: [] , claimedMilestones: [] });
export const defaultDailyGoals = (date = todayKey()): DailyGoalsState => ({ date, goals: [
  { id:'feed-2', label:'Feed pet 2 times', target:2, progress:0, rewardCoins:20, rewardXp:8, claimed:false },
  { id:'play-1', label:'Play with pet', target:1, progress:0, rewardCoins:15, rewardXp:8, claimed:false },
  { id:'clean-1', label:'Clean pet', target:1, progress:0, rewardCoins:15, rewardXp:6, claimed:false },
  { id:'sleep-1', label:'Let pet sleep', target:1, progress:0, rewardCoins:15, rewardXp:6, claimed:false },
  { id:'mini-game-1', label:'Win 1 mini game', target:1, progress:0, rewardCoins:25, rewardXp:10, claimed:false },
  { id:'earn-30', label:'Earn 30 coins', target:30, progress:0, rewardCoins:20, rewardXp:8, claimed:false },
  { id:'request-1', label:'Complete pet request', target:1, progress:0, rewardCoins:30, rewardXp:12, claimed:false },
  { id:'buy-1', label:'Buy 1 item', target:1, progress:0, rewardCoins:15, rewardXp:6, claimed:false },
  { id:'snack-1', label:'Use 1 snack', target:1, progress:0, rewardCoins:15, rewardXp:7, claimed:false },
  { id:'shop-visit', label:'Check shop', target:1, progress:0, rewardCoins:10, rewardXp:5, claimed:false },
  { id:'couple-visit', label:'Visit Couple Mode', target:1, progress:0, rewardCoins:10, rewardXp:5, claimed:false },
  { id:'couple-chat-1', label:'Send 1 chat message in Couple Room', target:1, progress:0, rewardCoins:20, rewardXp:8, claimed:false },
] });
export const defaultWeeklyQuests = (): WeeklyQuestsState => ({ weekKey: `${new Date().getUTCFullYear()}-${Math.ceil((((Date.now()/86400000)|0)+4)/7)}`, quests: [
  { id:'win-10-games', label:'Win 10 mini games', target:10, progress:0, rewardCoins:220, rewardItemId:'badge-5', claimed:false },
  { id:'care-20-actions', label:'Complete 20 care actions', target:20, progress:0, rewardCoins:180, rewardItemId:'badge-1', claimed:false },
  { id:'alive-7-days', label:'Keep pet alive for 7 days', target:7, progress:0, rewardCoins:180, rewardItemId:'dec-15', claimed:false },
  { id:'collect-3-badges', label:'Collect 3 badges', target:3, progress:0, rewardCoins:180, rewardItemId:'badge-13', claimed:false },
  { id:'buy-5-items', label:'Buy 5 shop items', target:5, progress:0, rewardCoins:160, rewardItemId:'dec-15', claimed:false },
  { id:'requests-10', label:'Complete 10 pet requests', target:10, progress:0, rewardCoins:220, rewardItemId:'special-8', claimed:false },
  { id:'couple-gifts-3', label:'Send 3 gifts/coins in Couple Mode', target:3, progress:0, rewardCoins:180, rewardItemId:'badge-15', claimed:false },
  { id:'earn-500', label:'Earn 500 coins', target:500, progress:0, rewardCoins:250, rewardItemId:'badge-11', claimed:false },
] });
export const defaultEquippedBadges = (): EquippedBadges => ({ profile:null, pet:null, couple:null });
const now = () => Date.now();
const uuid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `pet-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const HUNGER_ZERO_GRACE_MS = 12 * HOUR_MS;
const ENERGY_ZERO_GRACE_MS = 12 * HOUR_MS;
const SICKNESS_GRACE_MS = 24 * HOUR_MS;
const HEALTH_ZERO_DEATH_GRACE_MS = HOUR_MS;
const EMERGENCY_DEATH_GRACE_MS = 6 * HOUR_MS;
const LEGACY_TITLES = ['Memory Keeper', 'Second Journey', 'Guardian Friend', 'Gentle Caretaker'] as const;

export const defaultSkillTree = () => [
  { id:'better-eating', name:'Better Eating', level:0, unlocked:false, description:'Food restores a little more hunger.' },
  { id:'cleaner-fur', name:'Cleaner Fur', level:0, unlocked:false, description:'Cleanliness decays slower.' },
  { id:'faster-recovery', name:'Faster Recovery', level:0, unlocked:false, description:'Medicine and rest restore more health.' },
  { id:'lucky-explorer', name:'Lucky Explorer', level:0, unlocked:false, description:'Errands can return better small rewards.' },
  { id:'mini-game-focus', name:'Mini Game Focus', level:0, unlocked:false, description:'Mini game rewards gain a small XP bonus.' },
];
export const defaultTraining = () => (['Sit','Jump','Dance','Fetch','Wave'] as const).map((command, index) => ({ id:command.toLowerCase(), command, level:0, unlocked:index === 0, lastTrainedAt:null }));

export const newPet = (animalId: string, customName: string, personality: PetPersonality = randomTrait()): Pet => {
  const t = now();
  return { id: uuid(), animalId, customName: customName.trim() || getAnimal(animalId).species, level: 1, birthDate: t, stats: { hunger: 82, happiness: 82, energy: 84, cleanliness: 84, health: 90, affection: 20, xp: 0 }, isSleeping: false, equippedHabitat: 'hab-0', equippedDecorations: [], actionCounts: {}, snackCountToday: 0, lastSnackDate: todayKey(), sickMinutes: 0, trait: personality, personality, evolutionStage:'Baby', lastEvolutionStage:'Baby', bondRank:'Stranger', bondXp:20, equippedPetBadge:null, isAlive: true, lifeState:'healthy', diedAt: null, deathReason: null, criticalSince: null, emergencySince:null, deathEventId:null, lastFedAt: t, lastSleptAt: t, lastCleanedAt:t, lastMedicineAt:t, lastHealthCheckAt: t, lastVetVisitAt:null, neglectScore:0, activeIllnesses:[], vaccinationUntil:null, freeFirstAidDate:null, moodHistory: [], diary: [{ id:uuid(), date:todayKey(), text:`A new journey started with ${personality} personality.` }], careHistory: [], nearDeathRecords:[] };
};
export const defaultSave = (): SaveData => ({ userCoins: 100, activePetId: null, pets: [], inventory: [{ itemId:'hab-0', quantity:1, equipped:true }, { itemId:'food-0', quantity:3 }, { itemId:'medicine-0', quantity:1 }], achievements: [], unlockedAnimals: ['cat','dog','rabbit'], settings: { sound: true, reducedMotion: false, theme: 'Green Retro', confirmExpensivePurchases:true, quickActionButtons:true, showTutorialTips:true, showMoodWarnings:true, gameplayDifficulty:'normal', deathModeConfirmed:false }, dailyReward: { lastClaimDate: null, streak: 0 }, lastUpdatedAt: now(), weather: randomWeather(), weatherUpdatedAt: now(), usedCheatCodes: {}, petMemorials: [], collection: defaultCollection(), dailyGoals: defaultDailyGoals(), weeklyQuests: defaultWeeklyQuests(), equippedBadges: defaultEquippedBadges(), crafting: { materials:{ 'Star Dust':2, 'Festival Token':1, 'Shell Piece':0, 'Pumpkin Chip':0, 'Snowflake Bit':0, 'Moon Thread':0, 'Heart Gem':0 }, craftedRecipes:[] }, leaderboards:{}, tutorial:{ skipped:false, completed:false, step:0, claimed:false }, activePetRequest:null, activeErrand:null, favoriteItems:[], profileShowcase:{ displayBadge:null, favoritePetId:null, favoriteHabitat:'hab-0', playerTitle:'New Keeper', profileFrame:'Classic LCD', favoriteMiniGame:null, statusMessage:'Taking care of pixel pals!' }, mailbox:[{ id:'welcome-mail', title:'Welcome Gift', message:'Thanks for playing Pixel Paws. Claim this starter gift once.', rewardCoins:25, createdAt:now(), claimedAt:null, type:'system' }], notifications:[], roomDecor:{ slots:{ floor:null, wall:null, bed:null, toy:null, lamp:null, window:null, special:null }, comfortScore:35 }, album:[], playerRank:{ name:'New Keeper', points:0, claimedRewards:[] }, gameStarted:false, needsNewJourney:true, lastResetAt:null, legacyTitle:null, keepsakes:[], careCalendar:[], moodTimeline:[], skillTree:defaultSkillTree(), training:defaultTraining(), clinicVisits:[], illnessHistory:[], reviveHistory:[], safetyItems:[], petJournal:[] });
export const normalizeStats = (stats: Partial<Stats> | undefined): Stats => ({ hunger: clamp(stats?.hunger ?? 80), happiness: clamp(stats?.happiness ?? 80), energy: clamp(stats?.energy ?? 80), cleanliness: clamp(stats?.cleanliness ?? 80), health: clamp(stats?.health ?? 90), affection: clamp(stats?.affection ?? 10), xp: Math.max(0, Number.isFinite(stats?.xp ?? 0) ? stats?.xp ?? 0 : 0) });
export const getMood = (pet: Pet): Mood => { const s = normalizeStats(pet.stats); if (!pet.isAlive) return 'Very Sick'; if (pet.isSleeping) return 'Tidur'; if (s.health <= 0) return 'Very Sick'; if (s.health < 35) return 'Sakit'; if (s.energy < 25) return 'Ngantuk'; if (s.hunger < 25) return 'Lapar'; if (s.cleanliness < 25) return 'Kotor'; if (s.happiness < 20) return 'Sedih'; if (s.happiness < 45) return 'Bosan'; if (s.affection > 80 && s.happiness > 75) return 'Manja'; return 'Senang'; };
export const addInventory = (inventory: InventoryItem[], itemId: string, qty = 1) => { const amount = Math.max(0, Math.floor(qty)); const found = inventory.find((i) => i.itemId === itemId); return found ? inventory.map((i) => i.itemId === itemId ? { ...i, quantity: Math.max(0, i.quantity + amount) } : i) : [...inventory, { itemId, quantity: amount }]; };
export const applyStats = (pet: Pet, delta: Partial<Stats>) => ({ ...pet, stats: normalizeStats({ ...pet.stats, hunger: pet.stats.hunger + (delta.hunger ?? 0), happiness: pet.stats.happiness + (delta.happiness ?? 0), energy: pet.stats.energy + (delta.energy ?? 0), cleanliness: pet.stats.cleanliness + (delta.cleanliness ?? 0), health: pet.stats.health + (delta.health ?? 0), affection: pet.stats.affection + (delta.affection ?? 0), xp: pet.stats.xp + (delta.xp ?? 0) }) });
export function levelPet(pet: Pet): { pet: Pet; gained: number } { let next = { ...pet, stats: { ...pet.stats } }; let gained = 0; while (next.level < 50 && next.stats.xp >= xpNeed(next.level)) { next.stats.xp = Math.max(0, next.stats.xp - xpNeed(next.level)); next.level += 1; gained += 1; } return { pet: next, gained }; }
export function petWarnings(pet: Pet): string[] {
  const warnings: string[] = [];
  if (!pet.isAlive) return warnings;
  if (pet.stats.hunger <= 25) warnings.push(pet.stats.hunger <= 10 ? `${pet.customName} is very hungry!` : `${pet.customName} needs a meal soon.`);
  if (pet.stats.energy <= 20) warnings.push(pet.stats.energy <= 5 ? `${pet.customName} is exhausted!` : `${pet.customName} needs rest soon.`);
  if (pet.stats.health <= 30) warnings.push(`${pet.customName} needs medicine or clinic care.`);
  if (pet.stats.cleanliness <= 15) warnings.push(`${pet.customName} may get sick from dirty fur.`);
  if ((pet.activeIllnesses ?? []).some((illness) => illness.severity === 'severe')) warnings.push(`${pet.customName} is too weak to play. Visit the clinic soon.`);
  if (!pet.isSleeping && Date.now() - pet.lastSleptAt > 10 * HOUR_MS) warnings.push(`${pet.customName} needs sleep soon!`);
  return Array.from(new Set(warnings));
}

function activeIllnessEmergency(pet: Pet, at: number): boolean {
  return (pet.activeIllnesses ?? []).some((illness) => illness.severity === 'severe' && at - illness.untreatedSince >= SICKNESS_GRACE_MS) || pet.sickMinutes >= 24 * 60;
}

export function getPetLifeState(pet: Pet, at = now()): LifeState {
  if (!pet.isAlive || pet.lifeState === 'dead') return 'dead';
  if (pet.stats.health <= 0) return 'emergency';
  if (pet.stats.hunger <= 0 && at - pet.lastFedAt >= HUNGER_ZERO_GRACE_MS) return 'emergency';
  if (pet.stats.energy <= 0 && at - pet.lastSleptAt >= ENERGY_ZERO_GRACE_MS) return 'emergency';
  if (activeIllnessEmergency(pet, at)) return 'emergency';
  if (pet.stats.hunger <= 10 || pet.stats.energy <= 5 || pet.stats.health <= 30 || (pet.activeIllnesses ?? []).some((illness) => illness.severity === 'severe')) return 'critical';
  if (pet.stats.hunger <= 25 || pet.stats.energy <= 20 || pet.stats.cleanliness <= 15 || (pet.activeIllnesses ?? []).length > 0) return 'warning';
  return 'healthy';
}

export function evaluatePetDeath(pet: Pet, at = now(), difficulty: GameplayDifficulty = 'normal'): Pet {
  if (!pet.isAlive) return { ...pet, lifeState:'dead' };
  const lifeState = getPetLifeState(pet, at);
  const criticalSince = lifeState === 'critical' || lifeState === 'emergency' ? pet.criticalSince ?? at : null;
  const emergencySince = lifeState === 'emergency' ? pet.emergencySince ?? at : null;
  const base = { ...pet, lifeState, criticalSince, emergencySince, neglectScore: Math.max(0, Math.round((pet.neglectScore ?? 0) + (lifeState === 'healthy' ? -1 : lifeState === 'warning' ? 1 : lifeState === 'critical' ? 3 : 5))) };

  if (difficulty === 'cozy') {
    return lifeState === 'emergency'
      ? { ...base, lifeState:'emergency', stats: normalizeStats({ ...base.stats, health: Math.max(base.stats.health, 20), hunger: Math.max(base.stats.hunger, 10), energy: Math.max(base.stats.energy, 10) }), deathReason:null, diedAt:null }
      : base;
  }

  if (lifeState !== 'emergency' || !emergencySince) return base;
  const healthDeath = base.stats.health <= 0 && at - emergencySince >= HEALTH_ZERO_DEATH_GRACE_MS;
  const hungerDeath = base.stats.hunger <= 0 && at - base.lastFedAt >= HUNGER_ZERO_GRACE_MS + EMERGENCY_DEATH_GRACE_MS;
  const energyDeath = base.stats.energy <= 0 && at - base.lastSleptAt >= ENERGY_ZERO_GRACE_MS + EMERGENCY_DEATH_GRACE_MS;
  const illnessDeath = activeIllnessEmergency(base, at) && at - emergencySince >= EMERGENCY_DEATH_GRACE_MS;
  if (!healthDeath && !hungerDeath && !energyDeath && !illnessDeath) return base;
  const deathReason = healthDeath ? 'Health stayed at 0 through the emergency grace period.' : hungerDeath ? 'Starvation after too long without food.' : energyDeath ? 'Exhaustion after too long without sleep.' : 'Sickness was untreated for too long.';
  return { ...base, isAlive:false, lifeState:'dead', diedAt:at, deathReason, deathEventId:base.deathEventId ?? `death-${base.id}-${at}`, isSleeping:false };
}

export function createMemorial(pet: Pet, badges: string[], miniGameStats: SaveData['leaderboards'] = {}): MemorialPet {
  const diedAt = pet.diedAt ?? now();
  const animal = getAnimal(pet.animalId);
  return { petId: pet.id, name: pet.customName, animalId: pet.animalId, species:animal.species, personality:pet.personality, level: pet.level, birthDate: pet.birthDate, createdAt:now(), diedAt, deathReason: pet.deathReason ?? 'Unknown', badges, daysCared: Math.max(1, Math.ceil((diedAt - pet.birthDate) / DAY_MS)), bondRank:pet.bondRank, favoriteFood:animal.favoriteFood, favoriteToy:animal.favoriteToy, equippedBadge:pet.equippedPetBadge ?? null, equippedHabitat:pet.equippedHabitat ?? null, achievementsSnapshot:badges, miniGameStats, finalStats:normalizeStats(pet.stats), memoriesCount:(pet.diary ?? []).length + (pet.moodHistory ?? []).length, deathEventId:pet.deathEventId ?? null };
}

export function createKeepsake(pet: Pet) {
  const names = ['Old Ribbon', 'Tiny Pawprint', 'Favorite Toy Memory', 'Little Bell', 'Memory Star'];
  const name = names[Math.abs(pet.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % names.length] ?? 'Memory Star';
  return { id:`keepsake-${pet.id}`, petId:pet.id, name, description:`A gentle keepsake from ${pet.customName}.`, createdAt:now(), displayed:false };
}

export function legacyTitleForPet(pet: Pet): string {
  if (pet.level >= 30 || pet.bondRank === 'Soul Pet') return 'Guardian Friend';
  if (pet.level >= 15 || pet.bondRank === 'Family') return 'Memory Keeper';
  if (pet.level >= 5) return 'Second Journey';
  return LEGACY_TITLES[3];
}

export function resetSaveAfterPetDeath(save: SaveData, pet: Pet, at = now()): SaveData {
  const memorial = createMemorial(pet, save.achievements, save.leaderboards);
  const memorials = save.petMemorials.some((item) => item.petId === pet.id) ? save.petMemorials : [...save.petMemorials, { ...memorial, createdFromDeathReset:true }];
  const keepsakes = save.keepsakes?.some((item) => item.petId === pet.id) ? save.keepsakes : [...(save.keepsakes ?? []), createKeepsake(pet)];
  return {
    ...defaultSave(),
    petMemorials: memorials,
    keepsakes,
    settings:{ ...defaultSave().settings, theme:save.settings.theme, sound:save.settings.sound, reducedMotion:save.settings.reducedMotion, gameplayDifficulty:save.settings.gameplayDifficulty ?? 'normal', deathModeConfirmed:save.settings.deathModeConfirmed ?? false },
    legacyTitle: legacyTitleForPet(pet),
    userCoins: pet.level >= 10 ? 110 : 100,
    needsNewJourney:true,
    gameStarted:false,
    lastResetAt:at,
  };
}

export const withOfflineProgress = (save: SaveData): SaveData => {
  const current = Date.now();
  const minutes = Math.min(8 * 60, Math.max(0, Math.floor((current - (save.lastUpdatedAt || current)) / 60000)));
  if (!minutes) return save;
  const difficulty = save.settings.gameplayDifficulty ?? 'normal';
  const decay = difficulty === 'challenge' ? 1.35 : difficulty === 'cozy' ? 0.55 : 1;
  const pets = save.pets.map((p) => {
    if (!p.isAlive) return { ...p, lifeState:'dead' as LifeState };
    const bad = p.stats.hunger < 20 || p.stats.cleanliness < 20 || p.stats.energy < 15 || (p.activeIllnesses ?? []).length > 0;
    const changed = applyStats({ ...p, sickMinutes: bad ? p.sickMinutes + minutes : Math.max(0, p.sickMinutes - minutes) }, { hunger: -minutes*0.08*decay, happiness: -minutes*0.03*decay, cleanliness: -minutes*0.04*decay, energy: p.isSleeping ? minutes*0.18 : -minutes*0.02*decay, health: bad ? -minutes*0.05*decay : 0 });
    return evaluatePetDeath(changed, current, difficulty);
  });
  return { ...save, pets, lastUpdatedAt: current, weather: current - save.weatherUpdatedAt > 180000 ? randomWeather() : save.weather, weatherUpdatedAt: current - save.weatherUpdatedAt > 180000 ? current : save.weatherUpdatedAt };
};
export const safeParseSave = (raw: string | null): SaveData => {
  if (!raw) return defaultSave();
  try {
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const base = defaultSave();
    const lastUpdatedAt = parsed.lastUpdatedAt ?? Date.now();
    const normalizedPets = Array.isArray(parsed.pets) ? parsed.pets.map((p) => {
      const born = newPet(p.animalId || 'cat', p.customName || 'Pal', normalizePersonality(p.personality ?? p.trait));
      const isAlive = p.isAlive ?? true;
      const lifeState = !isAlive ? 'dead' : (p.lifeState ?? born.lifeState);
      return {
        ...born,
        ...p,
        stats: normalizeStats(p.stats),
        equippedDecorations: p.equippedDecorations ?? [],
        actionCounts: p.actionCounts ?? {},
        personality: normalizePersonality(p.personality ?? p.trait),
        trait: normalizePersonality(p.personality ?? p.trait),
        evolutionStage: p.evolutionStage ?? getEvolution(p.level ?? 1),
        lastEvolutionStage: p.lastEvolutionStage ?? p.evolutionStage ?? getEvolution(p.level ?? 1),
        bondXp: Math.max(0, Number.isFinite(p.bondXp ?? p.stats?.affection ?? 20) ? p.bondXp ?? p.stats?.affection ?? 20 : 20),
        bondRank: p.bondRank ?? getBondRank(p.stats?.affection ?? 20),
        equippedPetBadge: p.equippedPetBadge ?? null,
        isAlive,
        lifeState,
        diedAt: p.diedAt ?? null,
        deathReason: p.deathReason ?? null,
        criticalSince: p.criticalSince ?? null,
        emergencySince: p.emergencySince ?? null,
        deathEventId: p.deathEventId ?? null,
        lastFedAt: p.lastFedAt ?? lastUpdatedAt,
        lastSleptAt: p.lastSleptAt ?? lastUpdatedAt,
        lastCleanedAt: p.lastCleanedAt ?? lastUpdatedAt,
        lastMedicineAt: p.lastMedicineAt ?? p.lastHealthCheckAt ?? lastUpdatedAt,
        lastHealthCheckAt: p.lastHealthCheckAt ?? lastUpdatedAt,
        lastVetVisitAt: p.lastVetVisitAt ?? null,
        neglectScore: Math.max(0, Number.isFinite(p.neglectScore ?? 0) ? p.neglectScore ?? 0 : 0),
        activeIllnesses: Array.isArray(p.activeIllnesses) ? p.activeIllnesses.slice(0, 2) : [],
        vaccinationUntil: p.vaccinationUntil ?? null,
        freeFirstAidDate: p.freeFirstAidDate ?? null,
        moodHistory: p.moodHistory ?? [],
        diary: p.diary ?? [],
        careHistory: p.careHistory ?? [],
        nearDeathRecords: p.nearDeathRecords ?? [],
      };
    }) : [];
    return withOfflineProgress({
      ...base,
      ...parsed,
      pets: normalizedPets,
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory.filter((i) => i.quantity > 0) : base.inventory,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
      unlockedAnimals: Array.isArray(parsed.unlockedAnimals) ? parsed.unlockedAnimals : base.unlockedAnimals,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      dailyReward: { ...base.dailyReward, ...(parsed.dailyReward ?? {}) },
      lastUpdatedAt,
      weather: parsed.weather ?? randomWeather(),
      weatherUpdatedAt: parsed.weatherUpdatedAt ?? Date.now(),
      usedCheatCodes: parsed.usedCheatCodes ?? {},
      petMemorials: Array.isArray(parsed.petMemorials) ? parsed.petMemorials : [],
      collection: { ...base.collection, ...(parsed.collection ?? {}) },
      dailyGoals: parsed.dailyGoals?.date === todayKey() ? { ...base.dailyGoals, ...parsed.dailyGoals, goals: Array.isArray(parsed.dailyGoals.goals) ? parsed.dailyGoals.goals : base.dailyGoals.goals } : defaultDailyGoals(),
      weeklyQuests: { ...base.weeklyQuests, ...(parsed.weeklyQuests ?? {}) },
      equippedBadges: { ...base.equippedBadges, ...(parsed.equippedBadges ?? {}) },
      crafting: { materials:{ ...base.crafting.materials, ...(parsed.crafting?.materials ?? {}) }, craftedRecipes:Array.isArray(parsed.crafting?.craftedRecipes) ? parsed.crafting!.craftedRecipes : [] },
      leaderboards: parsed.leaderboards ?? {},
      tutorial: { ...base.tutorial, ...(parsed.tutorial ?? {}) },
      activePetRequest: parsed.activePetRequest ?? null,
      activeErrand: parsed.activeErrand ?? null,
      favoriteItems: Array.isArray(parsed.favoriteItems) ? parsed.favoriteItems : [],
      profileShowcase:{ ...base.profileShowcase, ...(parsed.profileShowcase ?? {}) },
      mailbox:Array.isArray(parsed.mailbox) ? parsed.mailbox : base.mailbox,
      notifications:Array.isArray(parsed.notifications) ? parsed.notifications : [],
      roomDecor:{ ...base.roomDecor, ...(parsed.roomDecor ?? {}), slots:{ ...base.roomDecor.slots, ...(parsed.roomDecor?.slots ?? {}) } },
      album:Array.isArray(parsed.album) ? parsed.album : [],
      playerRank:{ ...base.playerRank, ...(parsed.playerRank ?? {}) },
      gameStarted: parsed.gameStarted ?? normalizedPets.length > 0,
      needsNewJourney: parsed.needsNewJourney ?? normalizedPets.length === 0,
      lastResetAt: parsed.lastResetAt ?? null,
      legacyTitle: parsed.legacyTitle ?? null,
      keepsakes: Array.isArray(parsed.keepsakes) ? parsed.keepsakes : [],
      careCalendar: Array.isArray(parsed.careCalendar) ? parsed.careCalendar : [],
      moodTimeline: Array.isArray(parsed.moodTimeline) ? parsed.moodTimeline : [],
      skillTree: Array.isArray(parsed.skillTree) ? parsed.skillTree : base.skillTree,
      training: Array.isArray(parsed.training) ? parsed.training : base.training,
      clinicVisits: Array.isArray(parsed.clinicVisits) ? parsed.clinicVisits : [],
      illnessHistory: Array.isArray(parsed.illnessHistory) ? parsed.illnessHistory : [],
      reviveHistory: Array.isArray(parsed.reviveHistory) ? parsed.reviveHistory : [],
      safetyItems: Array.isArray(parsed.safetyItems) ? parsed.safetyItems : [],
      petJournal: Array.isArray(parsed.petJournal) ? parsed.petJournal : [],
    });
  } catch {
    return defaultSave();
  }
};
export const getUnlockedAchievements = (save: SaveData): string[] => { const pet = save.pets.find((p) => p.id === save.activePetId); const stats = pet?.stats; const checks: Record<string, boolean> = { 'first-meal': (pet?.actionCounts.feed ?? 0) >= 1, 'clean-10': (pet?.actionCounts.clean ?? 0) >= 10, 'play-10': (pet?.actionCounts.play ?? 0) >= 10, 'sleep-5': (pet?.actionCounts.sleep ?? 0) >= 5, 'healthy-hero': (pet?.actionCounts.medicine ?? 0) >= 1 && (stats?.health ?? 0) > 70, 'level-10': (pet?.level ?? 0) >= 10, 'level-25': (pet?.level ?? 0) >= 25, 'level-50': (pet?.level ?? 0) >= 50, 'rich-keeper': save.userCoins >= 1000, 'collector-5': save.pets.length >= 5, 'perfect-day': !!stats && Object.entries(stats).filter(([k]) => k !== 'xp').every(([,v]) => v > 90), 'best-friend': (stats?.affection ?? 0) >= 100, 'mini-rookie': (pet?.actionCounts['mini-game'] ?? 0) >= 1, 'memory-genius': (pet?.actionCounts['memory-match'] ?? 0) >= 1, 'treasure-hunter': (pet?.actionCounts['treasure-dig'] ?? 0) >= 1, 'festival-friend': save.inventory.some((i) => itemById(i.itemId)?.eventTag) };
  return achievements.filter((a) => checks[a.id] && !save.achievements.includes(a.id)).map((a) => a.id); };
export const itemById = (id: string) => shopItems.find((i) => i.id === id);
