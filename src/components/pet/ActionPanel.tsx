'use client';
import { PixelButton } from '../PixelButton';
import { PixelCard } from '../PixelCard';
import type { Mood, Pet } from '@/lib/types';

const actions = [['feed','Feed','🍽️'], ['play','Play','🎾'], ['clean','Clean','🧼'], ['sleep','Sleep','💤'], ['wake','Wake Up','☀️'], ['medicine','Medicine','💊'], ['pet','Pet','💖'], ['walk','Walk','🚶'], ['train','Train','🏋️'], ['snack','Snack','🍪']] as const;
export function ActionPanel({ pet, mood, doAction }: { pet: Pet; mood: Mood; doAction: (action: string) => void }) {
  return <PixelCard><h2 className="mb-3 text-sm">Care Actions</h2><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{actions.map(([key, label, icon]) => <PixelButton key={key} disabled={(pet.isSleeping && key !== 'wake') || (!pet.isSleeping && key === 'wake') || ((mood === 'Sakit' || mood === 'Very Sick') && ['play','walk','train'].includes(key))} onClick={() => doAction(key)}>{icon} {label}</PixelButton>)}</div></PixelCard>;
}
