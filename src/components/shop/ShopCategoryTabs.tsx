'use client';

const CATEGORY_META: Record<string, { icon: string; mobileLabel: string }> = {
  Food: { icon: '🍖', mobileLabel: 'Food' },
  Snacks: { icon: '🍬', mobileLabel: 'Snacks' },
  Toys: { icon: '🧸', mobileLabel: 'Toys' },
  Medicine: { icon: '💊', mobileLabel: 'Meds' },
  Accessories: { icon: '🎀', mobileLabel: 'Gear' },
  Decorations: { icon: '🪴', mobileLabel: 'Deco' },
  Habitats: { icon: '🏠', mobileLabel: 'Habitat' },
  Special: { icon: '✨', mobileLabel: 'Special' },
};

export default function ShopCategoryTabs<T extends string>({ categories, activeCategory, onChange }: { categories: T[]; activeCategory: T; onChange: (category: T) => void }) {
  return <div className="relative w-full min-w-0 overflow-hidden"><div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-5 bg-gradient-to-r from-[var(--panel)] to-transparent" /><div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-[var(--panel)] to-transparent" /><div className="flex w-full gap-2 overflow-x-auto overflow-y-hidden pb-2 overscroll-x-contain whitespace-nowrap [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible">{categories.map((category) => { const meta = CATEGORY_META[category] ?? { icon: '◆', mobileLabel: category }; const active = category === activeCategory; return <button key={category} type="button" aria-label={category} title={category} onClick={() => onChange(category)} className={`shrink-0 whitespace-nowrap border-4 border-slate-950 px-4 py-3 text-sm leading-none shadow-[3px_3px_0_#111] active:translate-x-1 active:translate-y-1 active:shadow-none ${active ? 'bg-yellow-200' : 'bg-white'}`}><span className="mr-1">{meta.icon}</span><span className="sm:hidden">{meta.mobileLabel}</span><span className="hidden sm:inline">{category}</span></button>; })}</div></div>;
}
