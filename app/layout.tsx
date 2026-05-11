import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'Pixel Paws',
  description: '8-bit animal tamagotchi game.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="bg-slate-950 font-pixel text-slate-950 antialiased">{children}<Analytics /></body>
    </html>
  );
}
