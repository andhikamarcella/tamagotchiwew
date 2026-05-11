'use client';

import { useEffect, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

type Drop = { id: number; lane: number; y: number; bad: boolean };

export default function CoinRainGame({ controls, onScore, onEnd, paused }: MiniGameRuntimeProps) {
  const [lane, setLane] = useState(1);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      setTicks((t) => t + 1);
      setDrops((items) => {
        const moved = items.map((drop) => ({ ...drop, y: drop.y + 14 }));
        let nextScore = score;
        let lost = 0;
        const kept: Drop[] = [];
        moved.forEach((drop) => {
          if (drop.y >= 92) {
            if (drop.lane === lane) { nextScore = clampScore(nextScore + (drop.bad ? -15 : 12)); if (drop.bad) lost += 1; }
          } else kept.push(drop);
        });
        if (nextScore !== score) { setScore(nextScore); onScore(nextScore); }
        if (lost) setLives((life) => Math.max(0, life - lost));
        if (ticks % 2 === 0) kept.push({ id: Date.now(), lane: Math.floor(Math.random() * 3), y: 0, bad: Math.random() < 0.22 });
        return kept.slice(-8);
      });
    }, 320);
    return () => window.clearInterval(id);
  }, [lane, onScore, paused, score, ticks]);
  useEffect(() => { if (lives <= 0 || ticks >= 95) onEnd(score > 20, score); }, [lives, onEnd, score, ticks]);
  return <MiniGamePanel controls={controls} title="🪙 Coin Rain"><div className="relative h-72 overflow-hidden border-4 border-slate-950 bg-sky-100">{drops.map((drop) => <span key={drop.id} className="absolute text-3xl" style={{ left: `${drop.lane * 33 + 12}%`, top: `${drop.y}%` }}>{drop.bad ? '🪨' : '🪙'}</span>)}<div className="absolute bottom-2 grid w-full grid-cols-3 gap-2 px-2">{[0, 1, 2].map((index) => <button key={index} type="button" onClick={() => setLane(index)} className={`border-4 border-slate-950 p-3 text-2xl ${lane === index ? 'bg-yellow-200' : 'bg-white'}`}>{lane === index ? '🧺' : '·'}</button>)}</div></div><p className="mt-2 text-[10px]">Catch coins, dodge rocks · Lives {lives} · Score {score}</p></MiniGamePanel>;
}
