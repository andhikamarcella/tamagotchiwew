export function PixelCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`pixel-border min-w-0 max-w-full overflow-hidden break-words bg-[var(--panel)] p-3 sm:p-4 ${className}`}>{children}</section>;
}

export default PixelCard;
