'use client';

import { useMemo, useState } from 'react';
import { MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const start = [1, 2, 3, 4, 0, 6, 7, 5, 8];

export default function PuzzleSlideGame({ controls, onScore, onEnd }: MiniGameRuntimeProps) {
  const [tiles, setTiles] = useState(start);
  const [moves, setMoves] = useState(0);
  const emptyIndex = tiles.indexOf(0);
  const picture = useMemo(() => ['🐱', '🐱', '🐶', '🐶', '🐰', '🐰', '🦊', '🦊'], []);
  const canMove = (index: number) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;
    return Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
  };
  const move = (index: number) => {
    if (!canMove(index)) return;
    const next = [...tiles];
    [next[index], next[emptyIndex]] = [next[emptyIndex], next[index]];
    const nextMoves = moves + 1;
    const score = Math.max(20, 120 - nextMoves * 5);
    setTiles(next);
    setMoves(nextMoves);
    onScore(score);
    if (next.every((value, i) => value === solved[i])) onEnd(true, score);
  };
  return <MiniGamePanel controls={controls} title="🧩 Pet Puzzle Slide"><p className="mb-3 text-[10px]">Slide adjacent tiles into the empty slot until the pet picture is restored.</p><div className="mx-auto grid max-w-xs grid-cols-3 gap-2">{tiles.map((tile, index) => <button key={`${tile}-${index}`} type="button" disabled={tile === 0} onClick={() => move(index)} className={`grid h-20 place-items-center border-4 border-slate-950 text-2xl ${tile === 0 ? 'bg-slate-200' : canMove(index) ? 'bg-yellow-100' : 'bg-white'}`}>{tile === 0 ? '·' : <span><span className="emoji-native">{picture[tile - 1]}</span><span className="block text-[9px]">{tile}</span></span>}</button>)}</div><p className="mt-3 text-[10px]">Moves {moves} · highlighted tiles can slide.</p></MiniGamePanel>;
}
