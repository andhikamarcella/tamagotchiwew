'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'reconnecting';

type NetworkState = {
  isOnline: boolean;
  wasOffline: boolean;
  connectionStatus: ConnectionStatus;
  lastOnlineAt: number | null;
  lastOfflineAt: number | null;
};

export function useNetworkStatus(): NetworkState {
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(null);
  const [lastOfflineAt, setLastOfflineAt] = useState<number | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');

  useEffect(() => {
    setMounted(true);
    const initialOnline = navigator.onLine;
    setIsOnline(initialOnline);
    setConnectionStatus(initialOnline ? 'online' : 'offline');
    if (initialOnline) setLastOnlineAt(Date.now());
    else setLastOfflineAt(Date.now());

    const handleOffline = () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      setWasOffline(true);
      setIsOnline(false);
      setConnectionStatus('offline');
      setLastOfflineAt(Date.now());
    };

    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus('reconnecting');
      setLastOnlineAt(Date.now());
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = window.setTimeout(() => setConnectionStatus('online'), 2500);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return useMemo(() => ({
    isOnline: mounted ? isOnline : true,
    wasOffline,
    connectionStatus: mounted ? connectionStatus : 'online',
    lastOnlineAt,
    lastOfflineAt,
  }), [connectionStatus, isOnline, lastOfflineAt, lastOnlineAt, mounted, wasOffline]);
}
