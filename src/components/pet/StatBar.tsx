export function StatBar({ label, value, color = 'bg-green-400' }: { label: string; value: number; color?: string }) {
  const safe = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[9px]"><span>{label}</span><span>{Math.round(safe)}/100</span></div>
      <div className="h-4 border-2 border-slate-950 bg-white"><div className={`h-full ${color}`} style={{ width: `${safe}%` }} /></div>
    </div>
  );
}
