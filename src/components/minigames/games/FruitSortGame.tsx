'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

const items=[['🍎','fruit'],['🍓','fruit'],['🍌','fruit'],['🥕','veggie'],['🌽','veggie'],['🥬','veggie'],['🍪','snack'],['🍩','snack'],['🍬','snack'],['🧪','trash'],['🪨','trash']] as const; const baskets=['fruit','veggie','snack','trash'];
export default function FruitSortGame({controls,onScore,onEnd}:MiniGameRuntimeProps){const pick=()=>items[Math.floor(Math.random()*items.length)]!; const [cur,setCur]=useState(pick()),[score,setScore]=useState(0),[left,setLeft]=useState(12); const sort=(b:string)=>{const next=clampScore(score+(b===cur[1]?10:-5)); setScore(next); onScore(next); setLeft(l=>l-1); setCur(pick()); if(left<=1)onEnd(next>30,next)}; return <MiniGamePanel controls={controls} title="🍓 Fruit Sort"><p className="text-[10px]">Tap the matching basket for each item.</p><div className="my-5 text-center text-6xl">{cur[0]}</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{baskets.map(b=><button key={b} type="button" onClick={()=>sort(b)} className="border-4 border-slate-950 bg-white p-3 text-[10px] capitalize">{b}</button>)}</div><p className="mt-2 text-[10px]">Items left {left} · Score {score}</p></MiniGamePanel>}
