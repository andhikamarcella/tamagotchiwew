'use client';
import type { Mood, Pet, SaveData } from '@/lib/types';
import { PixelCard } from '../PixelCard';
import { getAnimal, getEvolution, xpNeed } from '@/lib/gameLogic';
import { PetSprite } from './PetSprite';
import { PetDialog } from './PetDialog';
import { StatBar } from './StatBar';
import { ActionPanel } from './ActionPanel';

export function PetDashboard({ pet, mood, dialog, save, doAction, setName }: { pet: Pet; mood: Mood; dialog: string; save: SaveData; doAction: (key: string) => void; setName: (name: string) => void }) {
  const animal = getAnimal(pet.animalId);
  return <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]"><PixelCard className="text-center"><PetSprite pet={pet} mood={mood} reduced={save.settings.reducedMotion} /><PetDialog text={`${animal.species}: ${dialog}`} /><input value={pet.customName} onChange={(event) => setName(event.target.value)} className="mt-4 w-full border-4 border-slate-950 p-2 text-[10px]" /><p className="mt-2 text-[10px]">Level {pet.level}/50 · {getEvolution(pet.level)}</p></PixelCard><div className="grid gap-4"><PixelCard><div className="grid gap-3"><StatBar label="Kenyang" value={pet.stats.hunger} color="bg-orange-400" /><StatBar label="Bahagia" value={pet.stats.happiness} color="bg-pink-400" /><StatBar label="Energi" value={pet.stats.energy} color="bg-blue-400" /><StatBar label="Kebersihan" value={pet.stats.cleanliness} color="bg-cyan-300" /><StatBar label="Kesehatan" value={pet.stats.health} color="bg-green-400" /><StatBar label="Kasih sayang" value={pet.stats.affection} color="bg-red-300" /><StatBar label={`XP / ${xpNeed(pet.level)}`} value={(pet.stats.xp / xpNeed(pet.level)) * 100} color="bg-purple-400" /></div></PixelCard><ActionPanel pet={pet} mood={mood} doAction={doAction} /></div></div>;
}
