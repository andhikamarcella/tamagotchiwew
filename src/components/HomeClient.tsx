'use client';

import dynamic from 'next/dynamic';
import AuthGate from '@/src/components/auth/AuthGate';
import AuthCheckingScreen from '@/src/components/system/AuthCheckingScreen';

const PixelPalsApp = dynamic(() => import('@/src/components/PixelPalsApp'), {
  loading: () => <AuthCheckingScreen state="loading-profile" />,
});

export default function HomeClient() {
  return <AuthGate><PixelPalsApp /></AuthGate>;
}
