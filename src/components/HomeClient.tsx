'use client';

import dynamic from 'next/dynamic';
import AuthGate from '@/src/components/auth/AuthGate';

const PixelPalsApp = dynamic(() => import('@/src/components/PixelPalsApp'), {
  loading: () => <main className="grid min-h-screen place-items-center bg-lime-100 p-4 font-pixel text-slate-950"><section className="pixel-border bg-white p-4 text-center text-[10px]">Loading Pixel Paws...</section></main>,
});

export default function HomeClient() {
  return <AuthGate><PixelPalsApp /></AuthGate>;
}
