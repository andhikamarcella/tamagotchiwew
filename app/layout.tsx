import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pixel = Press_Start_2P({ subsets: ['latin'], weight: '400', variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'Pixel Paws: 8-Bit Animal Tamagotchi',
  description: 'A cozy 8-bit virtual pet game built with Next.js.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${pixel.variable} bg-slate-950 text-slate-950`}>{children}</body>
    </html>
  );
}
