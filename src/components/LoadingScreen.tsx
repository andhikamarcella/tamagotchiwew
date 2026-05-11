export function LoadingScreen({ label = 'Loading your pet room...' }: { label?: string }) {
  return <main className="grid min-h-screen place-items-center bg-slate-950 p-4 font-pixel text-xs text-zinc-50"><section className="text-center"><div className="mx-auto mb-3 h-9 w-9 animate-spin border-4 border-white border-t-yellow-300" /><p>{label}</p></section></main>;
}
