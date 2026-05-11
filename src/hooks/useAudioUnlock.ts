'use client';

import { useEffect, useState } from 'react';

export function useAudioUnlock(onUnlocked?: () => void) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  useEffect(() => {
    if (typeof document === 'undefined' || audioUnlocked) return undefined;
    let active = true;
    const unlock = () => {
      void import('@/src/lib/audioEngine').then(async (engine) => {
        const ok = await engine.unlockAudio();
        if (!active) return;
        setAudioUnlocked(ok);
        if (ok) onUnlocked?.();
      }).catch(() => undefined);
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock);
    document.addEventListener('touchstart', unlock, { passive: true });
    return () => {
      active = false;
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, [audioUnlocked, onUnlocked]);
  return audioUnlocked;
}
