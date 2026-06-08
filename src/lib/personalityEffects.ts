import type { PetPersonality, Stats } from '@/lib/types';

export interface PersonalityEffects { decay: Partial<Record<keyof Stats, number>>; care: Partial<Record<keyof Stats, number>>; trainingXp: number; errandSuccess: number; itemDrop: number; minigameReward: number; sleepRecovery: number; affectionGain: number; description: string; }
const neutral: PersonalityEffects = { decay:{}, care:{}, trainingXp:1, errandSuccess:1, itemDrop:1, minigameReward:1, sleepRecovery:1, affectionGain:1, description:'A balanced little pal.' };
export const PERSONALITY_EFFECTS: Record<PetPersonality, PersonalityEffects> = {
  Playful:{ ...neutral, decay:{ happiness:1.1 }, care:{ happiness:1.15 }, minigameReward:1.1, description:'Loves games: extra play joy and mini-game rewards, but gets bored a little faster.' },
  Sleepy:{ ...neutral, decay:{ energy:1.12 }, sleepRecovery:1.25, description:'Needs naps sooner and restores more energy while sleeping.' },
  Lazy:{ ...neutral, decay:{ energy:.9 }, trainingXp:.92, description:'Energy lasts longer, though training takes a little more patience.' },
  Foodie:{ ...neutral, decay:{ hunger:1.1 }, care:{ hunger:1.1, happiness:1.12 }, description:'Gets hungry sooner and gains extra joy from favorite snacks.' },
  Shy:{ ...neutral, affectionGain:1.08, description:'Warms up gently and earns a small affection bonus from calm care.' },
  Clingy:{ ...neutral, decay:{ happiness:1.06 }, affectionGain:1.15, description:'Builds bonds quickly but misses attention a little sooner.' },
  Brave:{ ...neutral, trainingXp:1.15, errandSuccess:1.08, description:'Excels at training and has a small job success bonus.' },
  Curious:{ ...neutral, itemDrop:1.2, errandSuccess:1.04, description:'Finds materials and surprise items more often on errands.' },
  Gentle:{ ...neutral, care:{ health:1.08 }, affectionGain:1.08, description:'Responds especially well to careful, healthy routines.' },
  Naughty:{ ...neutral, minigameReward:1.08, care:{ happiness:1.08 }, description:'A cheeky player with a small fun and mini-game bonus.' },
  Loyal:{ ...neutral, affectionGain:1.2, description:'Affection and shared bonds grow faster.' },
  Moody:{ ...neutral, care:{ happiness:1.18 }, decay:{ happiness:1.12 }, description:'Feelings shift faster, but good care can create a bigger happiness boost.' },
};
export const getPersonalityEffects = (personality: PetPersonality) => PERSONALITY_EFFECTS[personality] ?? neutral;
export const applyPersonalityStats = (personality: PetPersonality, delta: Partial<Stats>): Partial<Stats> => { const effects = getPersonalityEffects(personality); return Object.fromEntries(Object.entries(delta).map(([key, value]) => [key, Number(value) * (Number(value) >= 0 ? effects.care[key as keyof Stats] ?? (key === 'affection' ? effects.affectionGain : 1) : effects.decay[key as keyof Stats] ?? 1)])) as Partial<Stats>; };
