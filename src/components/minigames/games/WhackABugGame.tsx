'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

export default function WhackABugGame({controls,onScore,onEnd,paused}:MiniGameRuntimeProps){const [target,setTarget]=useState(0),[friend,setFriend]=useState(false),[score,setScore]=useState(0),[left,setLeft]=useState(20); useEffect(()=>{if(paused)return; const id=setInterval(()=>{setTarget(Math.floor(Math.random()*9)); setFriend(Math.random()<.2); setLeft(l=>l-1)},700); return()=>clearInterval(id)},[paused]); useEffect(()=>{if(left<=0)onEnd(score>20,score)},[left,onEnd,score]); const hit=(i:number)=>{if(i!==target)return; const next=clampScore(score+(friend?-10:10)); setScore(next); onScore(next)}; return <MiniGamePanel controls={controls} title="🪲 Whack-a-Bug"><div className="grid grid-cols-3 gap-2">{Array.from({length:9},(_,i)=><button key={i} onClick={()=>hit(i)} className="h-20 border-4 border-slate-950 bg-orange-100 text-3xl">{i===target?(friend?'🐱':'🪲'):'🕳️'}</button>)}</div><p className="mt-2 text-[10px]">Hits score {score} · Time {left}</p></MiniGamePanel>}
