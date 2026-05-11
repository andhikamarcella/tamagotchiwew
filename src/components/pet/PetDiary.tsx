'use client';
export default function PetDiary({ entries }: { entries: string[] }) { return <section className="pixel-border bg-white p-3"><h2 className="mb-2 text-sm">Pet Diary</h2><div className="grid gap-2 text-[10px]">{entries.length ? entries.slice(0, 5).map((entry) => <p key={entry}>{entry}</p>) : <p>Today is ready for a new memory.</p>}</div></section>; }
