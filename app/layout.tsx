import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@/src/vendor/vercel-analytics/next';
import ServiceWorkerRegistrar from '@/src/components/system/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'Pixel Paws',
  description: '8-bit animal tamagotchi game.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Pixel Paws',
  appleWebApp: { capable: true, title: 'Pixel Paws', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#bef264' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&display=swap" rel="stylesheet" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Pixel Paws" />
      </head>
      <body className="bg-slate-950 font-pixel text-slate-950 antialiased"><ServiceWorkerRegistrar />{children}<Analytics /></body>
    </html>
  );
}
