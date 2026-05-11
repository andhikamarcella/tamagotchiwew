import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from '@/src/vendor/vercel-analytics/next';
import ServiceWorkerRegistrar from '@/src/components/system/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'Pixel Paws',
  description: '8-bit animal tamagotchi game.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 font-pixel text-slate-950 antialiased"><ServiceWorkerRegistrar />{children}<Analytics /></body>
    </html>
  );
}
