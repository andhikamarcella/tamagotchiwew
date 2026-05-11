'use client';

import { useEffect, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

const moves = ['⬆️', '➡️', '⬇️', '⬅️'] as const;

export default function PetDanceTimingGame({ controls, onScore, onEnd, paused }: MiniGameRuntimeProps) {
  const [target, setTarget] = useState(0);
  const [beat, setBeat] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [miss, setMiss] = useState(0);
  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => { setBeat((value) => value + 1); setTarget(Math.floor(Math.random() * moves.length)); setCombo(0); }, 900);
    return () => window.clearInterval(id);
  }, [paused]);
  useEffect(() => { if (beat >= 24 || miss >= 5) onEnd(score >= 80, score); }, [beat, miss, onEnd, score]);
  const tap = (index: number) => {
    if (index === target) { const nextCombo = combo + 1; const next = clampScore(score + 12 + nextCombo * 2); setCombo(nextCombo); setScore(next); onScore(next); }
    else { setMiss((value) => value + 1); setCombo(0); }
  };
  return <MiniGamePanel controls={controls} title="💃 Pet Dance Timing"><div className="border-4 border-slate-950 bg-pink-100 p-4 text-center"><div className="mx-auto mb-4 grid h-32 w-32 place-items-center border-4 border-slate-950 bg-white text-6xl animate-bounce">{moves[target]}</div><p className="mb-3 text-[10px]">Hit the matching dance arrow before the beat changes.</p><div className="grid grid-cols-4 gap-2">{moves.map((move, index) => <button key={move} type="button" onClick={() => tap(index)} className="border-4 border-slate-950 bg-yellow-100 p-3 text-2xl">{move}</button>)}</div></div><p className="mt-2 text-[10px]">Beat {beat}/24 · Combo {combo} · Miss {miss}/5 · Score {score}</p></MiniGamePanel>;
}
