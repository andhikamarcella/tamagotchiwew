'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_REMOTE_CONFIG, clampRemoteConfig } from '@/src/config/defaultRemoteConfig';
import type { GameRemoteConfig, RemoteConfigStatus } from '@/src/config/defaultRemoteConfig';
import { fetchGameRemoteConfig } from '@/src/lib/remoteConfig';
import { isRemoteConfigEnabled } from '@/src/lib/firebase';

type State = {
  config: GameRemoteConfig;
  status: RemoteConfigStatus;
  loading: boolean;
  lastFetchAt: number | null;
  error?: string;
};

export function useGameRemoteConfig() {
  const [state, setState] = useState<State>({
    config: clampRemoteConfig(DEFAULT_REMOTE_CONFIG),
    status: isRemoteConfigEnabled() ? 'defaults' : 'disabled',
    loading: false,
    lastFetchAt: null,
  });

  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return state;
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    const result = await fetchGameRemoteConfig();
    const next = { ...result, loading: false };
    setState(next);
    return next;
  }, [state]);

  useEffect(() => {
    let alive = true;
    if (!isRemoteConfigEnabled()) return undefined;
    window.setTimeout(() => {
      void fetchGameRemoteConfig().then((result) => {
        if (alive) setState({ ...result, loading: false });
      });
    }, 0);
    return () => { alive = false; };
  }, []);

  return { ...state, refresh };
}
