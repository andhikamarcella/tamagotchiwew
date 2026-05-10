export function PixelCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`pixel-border bg-[var(--panel)] p-4 ${className}`}>{children}</section>;
}
