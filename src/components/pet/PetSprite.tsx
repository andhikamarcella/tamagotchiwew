'use client';
import type { Mood, Pet } from '@/lib/types';
import { getAnimal, getEvolution, itemById } from '@/lib/gameLogic';

export function PetSprite({ pet, mood, reduced = false }: { pet: Pet; mood: Mood; reduced?: boolean }) {
  const animal = getAnimal(pet.animalId);
  const evo = getEvolution(pet.level);
  const size = evo === 'Adult' ? 'text-8xl' : evo === 'Teen' ? 'text-7xl' : evo === 'Kid' ? 'text-6xl' : 'text-5xl';
  const anim = reduced ? '' : mood === 'Sakit' || mood === 'Very Sick' ? 'animate-sick' : mood === 'Senang' || mood === 'Manja' ? 'animate-happy' : 'animate-idle';
  return <div className={`mx-auto flex h-44 w-44 items-center justify-center border-4 border-slate-950 bg-white ${anim}`} style={{ background: `linear-gradient(135deg, ${animal.color}, white)` }}><div className={`${size} drop-shadow`}><span>{animal.emoji}</span><span className="block text-center text-xs">{animal.expressions[mood] ?? '^_^'}</span>{pet.equippedAccessory && <span className="block text-center text-2xl">{itemById(pet.equippedAccessory)?.emoji}</span>}</div></div>;
}
