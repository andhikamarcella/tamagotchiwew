'use client';

import { useEffect, useRef, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

type Phase = 'waiting' | 'ready' | 'tooSoon';

export default function ReactionTapGame({ controls, onScore, onEnd, paused }: MiniGameRuntimeProps) {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Wait for the green paw, then tap!');
  const readyAt = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);
  useEffect(() => {
    if (paused || phase !== 'waiting') return undefined;
    const delay = 800 + Math.floor(Math.random() * 1800);
    timeoutRef.current = window.setTimeout(() => { readyAt.current = performance.now(); setPhase('ready'); setMessage('NOW! Tap the green paw!'); }, delay);
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  }, [paused, phase, round]);

  const tap = () => {
    if (phase === 'waiting') {
      setPhase('tooSoon'); setMessage('Too soon! Wait for green.'); setScore((s) => clampScore(s - 10));
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setPhase('waiting'), 500);
      return;
    }
    if (phase !== 'ready') return;
    const reaction = Math.max(0, Math.round(performance.now() - readyAt.current));
    const gained = reaction < 260 ? 35 : reaction < 420 ? 22 : reaction < 700 ? 12 : 4;
    const next = clampScore(score + gained);
    setScore(next); onScore(next);
    if (round >= 5) onEnd(next >= 50, next);
    else { setRound((r) => r + 1); setPhase('waiting'); setMessage(`Nice ${reaction}ms! Round ${round + 1}: wait again.`); }
  };
  return <MiniGamePanel controls={controls} title="⚡ Reaction Tap"><button type="button" onClick={tap} className={`grid h-64 w-full place-items-center border-4 border-slate-950 text-center ${phase === 'ready' ? 'bg-lime-300' : phase === 'tooSoon' ? 'bg-red-200' : 'bg-slate-900 text-white'}`}><span className="text-5xl">{phase === 'ready' ? '🐾' : '…'}</span><span className="block text-[12px]">{message}</span></button><p className="mt-2 text-[10px]">Round {round}/5 · Score {score}</p></MiniGamePanel>;
}
