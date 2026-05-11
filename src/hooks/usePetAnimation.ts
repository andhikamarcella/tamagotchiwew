'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PetAnimationType } from '@/src/types/care';
export type ExtendedPetAnimationType = PetAnimationType | 'snack' | 'findItem' | 'evolve';
export function usePetAnimation(initial: ExtendedPetAnimationType = 'idle') { const [animation, setAnimation] = useState<ExtendedPetAnimationType>(initial); const timer = useRef<number | null>(null); const trigger = useCallback((next: ExtendedPetAnimationType, duration = 1400) => { if (timer.current) window.clearTimeout(timer.current); setAnimation(next); timer.current = window.setTimeout(() => setAnimation('idle'), duration); }, []); useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []); return { animation, trigger, setAnimation }; }
