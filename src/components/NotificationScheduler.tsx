import { useEffect } from 'react';
import { dispatchDueNotifications, syncNativeNotifications } from '../lib/notifications';

export function NotificationScheduler() {
  useEffect(() => {
    dispatchDueNotifications();
    syncNativeNotifications();
    const interval = window.setInterval(dispatchDueNotifications, 60_000);
    const reschedule = () => syncNativeNotifications();
    window.addEventListener('vertex:local-store-updated', reschedule);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('vertex:local-store-updated', reschedule);
    };
  }, []);

  return null;
}
