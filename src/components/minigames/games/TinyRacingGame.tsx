'use client';

import { useEffect, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

type Obstacle = { id: number; lane: number; y: number; coin: boolean };

export default function TinyRacingGame({ controls, onScore, onEnd, paused }: MiniGameRuntimeProps) {
  const [lane, setLane] = useState(1);
  const [objects, setObjects] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [ticks, setTicks] = useState(0);
  const move = (delta: number) => setLane((current) => Math.max(0, Math.min(2, current + delta)));
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); move(1); } };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      setTicks((tick) => tick + 1);
      setObjects((items) => {
        const nextItems: Obstacle[] = [];
        let nextScore = score + 1;
        let hit = 0;
        items.map((item) => ({ ...item, y: item.y + 13 })).forEach((item) => { if (item.y >= 88) { if (item.lane === lane) { if (item.coin) nextScore += 15; else hit += 1; } } else nextItems.push(item); });
        if (ticks % 3 === 0) nextItems.push({ id: Date.now(), lane: Math.floor(Math.random() * 3), y: 0, coin: Math.random() < 0.35 });
        nextScore = clampScore(nextScore); setScore(nextScore); onScore(nextScore); if (hit) setLives((life) => Math.max(0, life - hit)); return nextItems.slice(-7);
      });
    }, 260);
    return () => window.clearInterval(id);
  }, [lane, onScore, paused, score, ticks]);
  useEffect(() => { if (lives <= 0 || ticks >= 120) onEnd(score > 45, score); }, [lives, onEnd, score, ticks]);
  return <MiniGamePanel controls={controls} title="🏎️ Tiny Racing"><div className="relative h-72 overflow-hidden border-4 border-slate-950 bg-slate-700"><div className="absolute inset-0 grid grid-cols-3 divide-x-4 divide-dashed divide-yellow-200">{[0, 1, 2].map((index) => <div key={index} />)}</div>{objects.map((item) => <span key={item.id} className="absolute text-3xl" style={{ left: `${item.lane * 33 + 13}%`, top: `${item.y}%` }}>{item.coin ? '🪙' : '🚧'}</span>)}<span className="absolute bottom-3 text-4xl" style={{ left: `${lane * 33 + 12}%` }}>🏎️</span></div><div className="mt-2 grid grid-cols-2 gap-2"><button className="border-4 border-slate-950 bg-white p-3" onClick={() => move(-1)}>←</button><button className="border-4 border-slate-950 bg-white p-3" onClick={() => move(1)}>→</button></div><p className="mt-2 text-[10px]">Dodge roadblocks, collect coins · Lives {lives} · Score {score}</p></MiniGamePanel>;
}
