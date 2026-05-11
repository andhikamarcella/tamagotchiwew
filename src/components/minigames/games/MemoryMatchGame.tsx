'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

type Card = { id: string; pairId: string; icon: string };
const icons = ['🍖','🧸','🐾','⭐','🪙','🎁','🐱','🐶','🐰','🦊','🐼','🐸'];
const shuffle = <T,>(items: T[]) => items.map((value) => ({ value, sort: Math.random() })).sort((a,b) => a.sort-b.sort).map(({ value }) => value);
function build(): Card[] { return shuffle(icons.slice(0, 6).flatMap((icon, index) => [{ id:`${index}-a`, pairId:String(index), icon }, { id:`${index}-b`, pairId:String(index), icon }])); }
export default function MemoryMatchGame({ controls, onScore, onEnd }: MiniGameRuntimeProps) {
  const [cards, setCards] = useState<Card[]>(() => build()); const [flipped, setFlipped] = useState<string[]>([]); const [matched, setMatched] = useState<string[]>([]); const [moves, setMoves] = useState(0); const [locked, setLocked] = useState(false); const timeoutRef = useRef<number | null>(null);
  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); }, []);
  const click = (card: Card) => { if (locked || flipped.includes(card.id) || matched.includes(card.pairId)) return; const next = [...flipped, card.id]; setFlipped(next); if (next.length === 2) { setLocked(true); setMoves((m) => m + 1); const [a,b] = next.map((id) => cards.find((c) => c.id === id)); if (a && b && a.pairId === b.pairId) { const nextMatched = [...matched, a.pairId]; setMatched(nextMatched); setFlipped([]); setLocked(false); const score = clampScore(80 - moves * 3); onScore(score); if (nextMatched.length === cards.length / 2) onEnd(true, Math.max(20, score)); } else timeoutRef.current = window.setTimeout(() => { setFlipped([]); setLocked(false); }, 750); } };
  return <MiniGamePanel controls={controls} title="🧠 Memory Match"><p className="mb-3 text-[10px]">Flip exactly two cards. Matching pairs stay open; mismatches close after a delay.</p><div className="grid grid-cols-4 gap-2">{cards.map((card) => { const shown = flipped.includes(card.id) || matched.includes(card.pairId); return <button key={card.id} type="button" disabled={locked || matched.includes(card.pairId)} onClick={() => click(card)} className={`h-16 border-4 border-slate-950 text-2xl sm:h-20 ${shown ? 'bg-yellow-100' : 'bg-white'}`}>{shown ? card.icon : '?'}</button>; })}</div><p className="mt-2 text-[10px]">Moves: {moves} · Matched: {matched.length}/6</p></MiniGamePanel>;
}
