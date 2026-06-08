'use client';

import { useMemo, useState } from 'react';
import type { SaveData } from '@/lib/types';
import { PixelButton } from '@/src/components/PixelButton';
import { PixelCard } from '@/src/components/PixelCard';
import { PET_VARIANTS, canBreed, createEgg, hatchEgg, revivePet, spendSkillPoint } from '@/src/lib/gameplayV2';
import { PERSONALITY_EFFECTS } from '@/src/lib/personalityEffects';

const skills = [
  ['play-1', 'Play', 'More happiness from play'],
  ['care-1', 'Care', 'Stronger feeding and cleaning'],
  ['luck-1', 'Luck', 'Better errand drops'],
  ['social-1', 'Social', 'Faster couple bond'],
  ['survival-1', 'Survival', 'Slower health decay'],
  ['survival-2', 'Survival+', '15% revive discount'],
] as const;

export default function V2Hub({ save, updateSave, toast }: { save: SaveData; updateSave: (fn: (save: SaveData) => SaveData) => void; toast: (message: string, type?: 'info' | 'success' | 'warning') => void }) {
  const [parentA, setParentA] = useState(save.pets[0]?.id ?? '');
  const [parentB, setParentB] = useState(save.pets[1]?.id ?? '');
  const active = save.pets.find((pet) => pet.id === save.activePetId);
  const reason = canBreed(save.pets.find((pet) => pet.id === parentA), save.pets.find((pet) => pet.id === parentB), save);
  const eggs = useMemo(() => (save.eggs ?? []).map((egg) => ({ ...egg, ready: Date.now() >= egg.hatchAt })), [save.eggs]);

  return (
    <div className="grid gap-3">
      <PixelCard className="bg-yellow-100"><h2 className="text-sm">Pixel Paws v2.0 Center</h2><p className="mt-2 text-[10px]">Breeding, variants, revival, skills, and safe save metadata live here.</p></PixelCard>
      <PixelCard><h2 className="text-sm">Personality Effect</h2><p className="mt-2 text-[10px]"><b>{active?.personality ?? 'No active pet'}:</b> {active ? PERSONALITY_EFFECTS[active.personality].description : 'Adopt a pet to see a gameplay effect.'}</p></PixelCard>

      <PixelCard>
        <h2 className="text-sm">Cozy Breeding Nest</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select className="border-2 border-black bg-white p-2 text-[10px]" value={parentA} onChange={(event) => setParentA(event.target.value)}>{save.pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.customName}</option>)}</select>
          <select className="border-2 border-black bg-white p-2 text-[10px]" value={parentB} onChange={(event) => setParentB(event.target.value)}>{save.pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.customName}</option>)}</select>
        </div>
        {reason && <p className="mt-2 text-[9px] text-red-700">{reason}</p>}
        <PixelButton disabled={!!reason} onClick={() => { updateSave((current) => createEgg(current, parentA, parentB)); toast('A warm little egg is now incubating!', 'success'); }} className="mt-3 bg-pink-200">Create Egg</PixelButton>
        <div className="mt-3 grid gap-2">
          {eggs.length ? eggs.map((egg) => <div key={egg.id} className="border-2 border-black bg-white p-2 text-[9px]"><b>{egg.status === 'hatched' ? 'Hatched Egg' : 'Pixel Egg'}</b><p>{egg.ready ? 'Ready to hatch' : `Ready ${new Date(egg.hatchAt).toLocaleTimeString()}`}</p><PixelButton disabled={!egg.ready || egg.status === 'hatched'} onClick={() => { updateSave((current) => hatchEgg(current, egg.id)); toast('Your egg hatched! Check the pet and variant collection.', 'success'); }} className="mt-2 bg-yellow-200">Hatch</PixelButton></div>) : <p className="text-[9px]">No eggs yet.</p>}
        </div>
      </PixelCard>

      <PixelCard>
        <h2 className="text-sm">Memorial & Revive</h2>
        <p className="mt-2 text-[10px]">The first revive is free. Later revives use a token or 2,500 coins. Memorial history stays safe.</p>
        <div className="mt-3 grid gap-2">
          {save.pets.filter((pet) => pet.lifeState === 'dead').map((pet) => <div key={pet.id} className="border-2 border-black bg-white p-2 text-[9px]"><b>{pet.customName}</b><PixelButton onClick={() => { if (!window.confirm('Revive this pet?')) return; const result = revivePet(save, pet.id); if (result.error) toast(result.error, 'warning'); else { updateSave(() => result.save); toast('Second Chance unlocked. Welcome home!', 'success'); } }} className="mt-2 bg-pink-200">Revive this pet?</PixelButton></div>)}
          {!save.pets.some((pet) => pet.lifeState === 'dead') && <p className="text-[9px]">No memorial pet needs revival.</p>}
        </div>
      </PixelCard>

      <PixelCard><h2 className="text-sm">Skill Tree · {save.skillPoints ?? 0} point(s)</h2><div className="mt-3 grid gap-2 sm:grid-cols-2">{skills.map(([id, name, description]) => <button key={id} disabled={(save.skillPoints ?? 0) < 1 || (save.unlockedSkills ?? []).includes(id)} onClick={() => updateSave((current) => spendSkillPoint(current, id))} className="border-2 border-black bg-lime-100 p-2 text-left text-[9px] disabled:opacity-50"><b>{name}</b><br />{description}<br />{(save.unlockedSkills ?? []).includes(id) ? 'Unlocked' : 'Spend 1 point'}</button>)}</div></PixelCard>
      <PixelCard><h2 className="text-sm">Variant Collection</h2><p className="mt-2 text-[10px]">{save.unlockedVariants?.length ?? 0}/{PET_VARIANTS.length} unlocked. Unknown variant IDs safely fall back to the base pet.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{PET_VARIANTS.map((variant) => <div key={variant.variantId} className="border-2 border-black p-2 text-[9px]" style={{ background: variant.colorTheme }}><b>{variant.displayName}</b> · {variant.rarity}<br />{(save.unlockedVariants ?? []).includes(variant.variantId) ? 'Unlocked' : 'Locked'}</div>)}</div></PixelCard>
    </div>
  );
}
