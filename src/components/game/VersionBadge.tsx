'use client';
import { GAME_BUILD_DATE, GAME_NAME, GAME_VERSION } from '@/src/config/gameMeta';
export default function VersionBadge() { return <div className="inline-flex flex-wrap items-center gap-2 rounded-full border-2 border-slate-950 bg-white px-3 py-1 text-[9px] shadow-[2px_2px_0_#0f172a]"><span>{GAME_NAME}</span><span>v{GAME_VERSION}</span><span>{GAME_BUILD_DATE}</span></div>; }
