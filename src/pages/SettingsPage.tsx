import { useEffect, useState } from 'react';
import { BellRing, Moon, Sun } from 'lucide-react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { demoSettings } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import { buildReminders, enableBackgroundPush, getPushSetupStatus, normalizeSettings, type PushSetupStatus } from '../lib/notifications';
import { applyTheme, getStoredTheme, type ThemeMode } from '../lib/theme';
import type { NotificationSettings } from '../lib/types';

export function SettingsPage() {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [settings, setSettings] = useState(() => normalizeSettings(loadLocal<NotificationSettings>('hg-settings', demoSettings)));
  const [permission, setPermission] = useState(() => ('Notification' in window ? Notification.permission : 'unsupported'));
  const [pushStatus, setPushStatus] = useState<PushSetupStatus | null>(null);
  const [pushMessage, setPushMessage] = useState('');
  const [pushBusy, setPushBusy] = useState(false);
  const preview = buildReminders().sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, 5);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    refreshPushStatus();
  }, []);

  async function askPermission() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  async function refreshPushStatus() {
    setPushStatus(await getPushSetupStatus());
  }

  async function activateBackgroundPush() {
    setPushBusy(true);
    setPushMessage('');
    try {
      await enableBackgroundPush();
      setPushMessage('Alertas em segundo plano ativados neste dispositivo.');
    } catch (error) {
      setPushMessage(error instanceof Error ? error.message : 'Não foi possível ativar alertas em segundo plano.');
    } finally {
      await refreshPushStatus();
      setPushBusy(false);
    }
  }

  function update(next: NotificationSettings) {
    const normalized = normalizeSettings(next);
    setSettings(normalized);
    saveLocal('hg-settings', normalized);
  }

  function patch(partial: Partial<NotificationSettings>) {
    update({ ...settings, ...partial });
  }

  return (
    <>
      <PageTitle title="Ajustes" subtitle="Tema, perfil e alertas para lembrar prova, estudo, estágio, refeição e contas." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Aparência e perfil</h3>
          <div className="grid gap-3">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span className="flex items-center gap-2">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />} Tema {theme === 'dark' ? 'escuro' : 'claro'}</span>
              <span className="text-sm text-slate-500">Alternar</span>
            </button>
            <Field label="Idioma"><select className={inputClass}><option>Português (Brasil)</option><option>English</option><option>Español</option></select></Field>
            <Field label="Avatar"><input className={inputClass} type="file" accept="image/*" /></Field>
            <Field label="Logout automático"><select className={inputClass}><option>Desativado</option><option>Após 15 minutos</option><option>Após 1 hora</option></select></Field>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Notificações inteligentes</h3>
          <div className="grid gap-3">
            <label className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">Ativar notificações<input className="size-5 accent-brand-600" type="checkbox" checked={settings.enabled} onChange={(e) => patch({ enabled: e.target.checked })} /></label>
            <label className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">Alerta sonoro<input className="size-5 accent-brand-600" type="checkbox" checked={settings.sound} onChange={(e) => patch({ sound: e.target.checked })} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Refeição antes"><select className={inputClass} value={settings.mealLeadTime} onChange={(e) => patch({ mealLeadTime: Number(e.target.value) })}><option value={2}>2 minutos</option><option value={5}>5 minutos</option><option value={10}>10 minutos</option><option value={15}>15 minutos</option></select></Field>
              <Field label="Estudo/prova antes"><select className={inputClass} value={settings.studyLeadTime} onChange={(e) => patch({ studyLeadTime: Number(e.target.value) })}><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={60}>1 hora</option><option value={1440}>1 dia</option></select></Field>
              <Field label="Estágio antes"><select className={inputClass} value={settings.internshipLeadTime} onChange={(e) => patch({ internshipLeadTime: Number(e.target.value) })}><option value={5}>5 minutos</option><option value={15}>15 minutos</option><option value={30}>30 minutos</option><option value={60}>1 hora</option></select></Field>
              <Field label="Contas antes"><select className={inputClass} value={settings.financeLeadTime} onChange={(e) => patch({ financeLeadTime: Number(e.target.value) })}><option value={60}>1 hora</option><option value={1440}>1 dia</option><option value={4320}>3 dias</option></select></Field>
              <Field label="Resumo de tarefas"><input className={inputClass} type="time" value={settings.taskDailyHour} onChange={(e) => patch({ taskDailyHour: e.target.value })} /></Field>
            </div>
            <Button onClick={askPermission}><BellRing size={17} />Permitir notificações no navegador</Button>
            <p className="text-sm text-slate-500 dark:text-slate-400">Permissão atual: {permissionLabel(permission)}</p>
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Alertas em segundo plano</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pushStatus?.message ?? 'Verificando suporte do navegador...'}</p>
                </div>
                <Button type="button" onClick={activateBackgroundPush} disabled={pushBusy || !pushStatus?.supported}>
                  <BellRing size={17} />Ativar
                </Button>
              </div>
              {pushMessage && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{pushMessage}</p>}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-3 font-semibold">Próximos alertas previstos</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {preview.map((reminder) => (
              <div key={reminder.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <strong>{reminder.title}</strong>
                <p className="text-slate-500 dark:text-slate-400">{reminder.at.toLocaleString('pt-BR')} - {reminder.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function permissionLabel(value: string) {
  if (value === 'granted') return 'permitida';
  if (value === 'denied') return 'bloqueada';
  if (value === 'unsupported') return 'não suportada neste navegador';
  return 'ainda não solicitada';
}
