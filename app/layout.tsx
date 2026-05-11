import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Paws',
  description: '8-bit animal tamagotchi game.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-950">{children}</body>
    </html>
  );
}
