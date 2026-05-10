'use client';
import { PixelCard } from './PixelCard';

export function PixelModal({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4"><PixelCard className="max-w-md">{children}</PixelCard></div>;
}
