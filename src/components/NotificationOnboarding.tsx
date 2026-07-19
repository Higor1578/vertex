import { useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enableNativeNotifications, usesNativeNotifications } from '../lib/notifications';
import { Button } from './ui';

export function NotificationOnboarding() {
  const { user } = useAuth();
  const storageKey = `vertex-notification-intro:${user?.id ?? 'guest'}`;
  const [visible, setVisible] = useState(() => {
    if (localStorage.getItem(storageKey)) return false;
    return !('Notification' in window) || Notification.permission === 'default';
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  function close() {
    localStorage.setItem(storageKey, 'dismissed');
    setVisible(false);
  }

  async function activate() {
    setBusy(true);
    setMessage('');
    try {
      if (usesNativeNotifications()) {
        await enableNativeNotifications();
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') throw new Error('A permissão não foi concedida. Você pode ativá-la depois em Ajustes.');
      } else {
        throw new Error('No iPhone, adicione o VERTEX à Tela de Início pelo Safari e abra pelo ícone antes de ativar.');
      }
      localStorage.setItem(storageKey, 'enabled');
      setVisible(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível ativar as notificações.');
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="safe-bottom fixed inset-0 z-50 grid place-items-end bg-slate-950/60 p-3 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="notification-title">
      <section className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-100"><BellRing size={22} /></div>
          <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={close} aria-label="Fechar"><X size={20} /></button>
        </div>
        <h2 id="notification-title" className="mt-4 text-xl font-bold">Ative seus lembretes</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Permita notificações para receber avisos de tarefas, provas, estágio, refeições e contas nos horários escolhidos.</p>
        {message && <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-100">{message}</p>}
        <div className="mt-5 grid gap-2">
          <Button onClick={activate} disabled={busy}><BellRing size={17} />{busy ? 'Ativando...' : 'Ativar notificações'}</Button>
          <button className="px-3 py-2 text-sm text-slate-500" onClick={close}>Agora não</button>
        </div>
      </section>
    </div>
  );
}
