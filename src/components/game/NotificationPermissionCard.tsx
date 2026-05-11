'use client';

import NotificationSettings from '@/src/components/settings/NotificationSettings';

export default function NotificationPermissionCard({ uid, onToast }: { uid: string | null; onToast?: (message: string, type?: 'success' | 'warning' | 'info') => void }) {
  return <NotificationSettings uid={uid} onToast={onToast} compact />;
}
