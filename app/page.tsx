import AuthGate from '@/src/components/auth/AuthGate';
import PixelPalsApp from '@/src/components/PixelPalsApp';

export default function Home() {
  return <AuthGate><PixelPalsApp /></AuthGate>;
}
