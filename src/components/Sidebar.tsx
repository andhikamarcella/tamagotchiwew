'use client';
import { PixelButton } from './PixelButton';
import { PixelCard } from './PixelCard';

const navItems = ['Pet', 'Shop', 'Inventory', 'Games', 'Couple', 'Achievements', 'Dex', 'Settings'];
export function Sidebar({ page, setPage, coins }: { page: string; setPage: (page: string) => void; coins: number }) {
  return <aside className="hidden w-56 shrink-0 md:block"><PixelCard className="sticky top-3"><h1 className="mb-2 text-sm leading-relaxed">Pixel Paws</h1><p className="mb-4 text-[10px]">🪙 {coins}</p><div className="grid gap-2">{navItems.map((item) => <PixelButton key={item} onClick={() => setPage(item)} className={page === item ? 'bg-yellow-200' : 'bg-white'}>{item}</PixelButton>)}</div></PixelCard></aside>;
}
