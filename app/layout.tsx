import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pixel = Press_Start_2P({ subsets: ['latin'], weight: '400', variable: '--font-pixel' });

export const metadata: Metadata = {
  title: 'Pixel Paws',
  description: '8-bit animal tamagotchi game.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${pixel.variable} bg-slate-950 text-slate-950`}>{children}</body>
    </html>
  );
}
