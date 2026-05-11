import AuthCheckingScreen from '@/src/components/system/AuthCheckingScreen';

export function LoadingScreen({ label = 'Loading your pet room...' }: { label?: string }) {
  return <AuthCheckingScreen state={label.toLowerCase().includes('save') ? 'loading-profile' : 'initializing'} />;
}
