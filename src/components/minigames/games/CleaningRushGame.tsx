'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

export default function CleaningRushGame({controls,onScore,onEnd}:MiniGameRuntimeProps){const [spots,setSpots]=useState(()=>Array.from({length:10},(_,i)=>i)),[score,setScore]=useState(0); const clean=(i:number)=>{const left=spots.filter(s=>s!==i); setSpots(left); const next=score+10; setScore(next); onScore(next); if(left.length===0)onEnd(true,next)}; return <MiniGamePanel controls={controls} title="🧼 Cleaning Rush"><p className="text-[10px]">Tap every dirt spot to clean the room.</p><div className="relative mt-3 h-64 border-4 border-slate-950 bg-teal-100">{spots.map((s,i)=><button key={s} onClick={()=>clean(s)} className="absolute text-3xl" style={{left:`${(i*23)%80+5}%`,top:`${(i*31)%65+5}%`}}>💩</button>)}</div><p className="mt-2 text-[10px]">Cleaned {10-spots.length}/10</p></MiniGamePanel>}
