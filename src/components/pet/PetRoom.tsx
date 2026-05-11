export function PetRoom({ children }: { children: React.ReactNode }) {
  return <div className="relative overflow-hidden rounded bg-[var(--soft)] p-4">{children}</div>;
}
