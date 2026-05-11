'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clampScore, MiniGamePanel, type MiniGameRuntimeProps } from '@/src/components/minigames/MiniGameShell';

const good = ['🍖','🥕','🍓','🍪','🐟']; const bad = ['🪨','💀','🧪'];
export default function CatchFoodGame({ controls, onScore, onEnd, paused }: MiniGameRuntimeProps) {
 const [lane,setLane]=useState(1), [obj,setObj]=useState({lane:1,y:0,icon:'🍓',bad:false}), [score,setScore]=useState(0), [lives,setLives]=useState(3);
 useEffect(()=>{ if(paused) return; const id=window.setInterval(()=>setObj(o=>{ const y=o.y+18; if(y>=100){ if(!o.bad && o.lane!==lane) setLives(v=>Math.max(0,v-1)); const isBad=Math.random()<.25; return {lane:Math.floor(Math.random()*3), y:0, icon:isBad?bad[Math.floor(Math.random()*bad.length)]!:good[Math.floor(Math.random()*good.length)]!, bad:isBad}; } return {...o,y};}),350); return()=>window.clearInterval(id);},[lane,paused]);
 useEffect(()=>{ if(lives<=0) onEnd(score>0, score); },[lives,onEnd,score]); const catchIt=()=>{ if(obj.y<55) return; const delta=obj.bad?-15:(obj.icon==='🐟'?20:10); const next=clampScore(score+delta); setScore(next); onScore(next); setObj({...obj,y:100}); };
 return <MiniGamePanel controls={controls} title="🍎 Catch Food"><p className="text-[10px]">Move basket lanes. Catch good food near the bottom; avoid rocks/poison.</p><div className="relative mt-3 h-64 border-4 border-slate-950 bg-lime-100"><button type="button" onClick={catchIt} className="absolute text-3xl" style={{left:`${obj.lane*33+10}%`,top:`${obj.y}%`}}>{obj.icon}</button><div className="absolute bottom-2 grid w-full grid-cols-3 gap-2 px-2">{[0,1,2].map(i=><button key={i} type="button" onClick={()=>setLane(i)} className={`border-4 border-slate-950 p-2 text-2xl ${lane===i?'bg-yellow-200':'bg-white'}`}>{lane===i?'🧺':'·'}</button>)}</div></div><div className="mt-2 flex gap-2 text-[10px]"><span>Lives {lives}</span><span>Score {score}</span></div></MiniGamePanel>;
}
