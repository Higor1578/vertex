import { useEffect } from 'react';
import { dispatchDueNotifications } from '../lib/notifications';

export function NotificationScheduler() {
  useEffect(() => {
    dispatchDueNotifications();
    const interval = window.setInterval(dispatchDueNotifications, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return null;
}
