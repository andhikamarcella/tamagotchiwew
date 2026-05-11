'use client';
export default function MoodHistory({ moods }: { moods: string[] }) { return <section className="pixel-border bg-white p-3"><h2 className="mb-2 text-sm">Mood History</h2><div className="flex flex-wrap gap-2 text-[10px]">{moods.slice(0, 10).map((mood, index) => <span key={`${mood}-${index}`} className="border-2 border-slate-950 bg-pink-50 px-2 py-1">{mood}</span>)}</div></section>; }
