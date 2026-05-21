'use client';

import { useEffect, useState } from 'react';
import { MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

export default function JumpRopeGame({ controls, onScore, onEnd, paused }: MiniGameRuntimeProps) {
  const [angle, setAngle] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      setTicks((tick) => tick + 1);
      setAngle((current) => {
        const nextAngle = (current + 18) % 360;
        if (nextAngle < 18 && !jumping) setMisses((miss) => miss + 1);
        if (nextAngle < 18 && jumping) { const nextScore = score + 10; setScore(nextScore); onScore(nextScore); }
        return nextAngle;
      });
    }, 95);
    return () => window.clearInterval(id);
  }, [jumping, onScore, paused, score]);
  useEffect(() => { if (!jumping) return undefined; const id = window.setTimeout(() => setJumping(false), 380); return () => window.clearTimeout(id); }, [jumping]);
  useEffect(() => { if (misses >= 3 || ticks > 260) onEnd(score >= 50, score); }, [misses, onEnd, score, ticks]);
  const nearFeet = angle > 300 || angle < 50;
  return <MiniGamePanel controls={controls} title="➰ Jump Rope"><button type="button" onClick={() => setJumping(true)} className="relative h-64 w-full overflow-hidden border-4 border-slate-950 bg-lime-100"><span className={`absolute left-1/2 top-28 -translate-x-1/2 text-5xl transition-transform ${jumping ? '-translate-y-16' : ''}`}>🐾</span><span className={`absolute left-1/2 top-28 h-28 w-28 -translate-x-1/2 rounded-full border-4 ${nearFeet ? 'border-red-500' : 'border-purple-500'}`} style={{ transform: `translateX(-50%) rotate(${angle}deg)`, borderTopColor: 'transparent', borderLeftColor: 'transparent' }} /><span className="absolute bottom-3 left-0 right-0 text-center text-[10px]">Tap when the rope reaches your paws!</span></button><p className="mt-2 text-[10px]">Jumps {Math.floor(score / 10)} · Misses {misses}/3</p></MiniGamePanel>;
}
