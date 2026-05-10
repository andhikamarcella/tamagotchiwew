'use client';
const items = [['Pet','🐾'],['Shop','🛒'],['Games','🎮'],['Couple','💞'],['Dex','📚'],['Settings','⚙️']];
export function BottomNav({ page, setPage }: { page: string; setPage: (page: string) => void }) {
  return <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-6 gap-1 border-t-4 border-slate-950 bg-white p-2 md:hidden">{items.map(([name, icon]) => <button key={name} type="button" onClick={() => setPage(name)} className={`border-2 border-slate-950 p-2 text-[9px] ${page === name ? 'bg-yellow-200' : 'bg-[var(--soft)]'}`}>{icon}<br />{name}</button>)}</nav>;
}
