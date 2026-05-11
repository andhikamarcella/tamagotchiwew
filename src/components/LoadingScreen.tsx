export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return <main className="grid min-h-screen place-items-center bg-[var(--bg)] font-pixel text-xs">{label}</main>;
}
