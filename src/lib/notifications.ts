import { demoFinances, demoInternship, demoMeals, demoSettings, demoStudies, demoTasks } from './demoData';
import { loadLocal, saveLocal } from './localStore';
import type { FinanceRecord, InternshipItem, Meal, NotificationSettings, StudyItem, Task } from './types';

export type Reminder = {
  id: string;
  at: Date;
  title: string;
  body: string;
  tag: string;
};

export type PushSetupStatus = {
  supported: boolean;
  configured: boolean;
  subscribed: boolean;
  message: string;
};

const sentKey = 'hg-sent-notifications';

export function normalizeSettings(settings: Partial<NotificationSettings>): NotificationSettings {
  return {
    ...demoSettings,
    ...settings
  };
}

export function buildReminders(now = new Date()) {
  const settings = normalizeSettings(loadLocal<NotificationSettings>('hg-settings', demoSettings));
  const tasks = loadLocal<Task[]>('hg-tasks', demoTasks);
  const studies = loadLocal<StudyItem[]>('hg-studies', demoStudies);
  const internship = loadLocal<InternshipItem[]>('hg-internship', demoInternship);
  const meals = loadLocal<Meal[]>('hg-meals', demoMeals);
  const finances = loadLocal<FinanceRecord[]>('hg-finances', demoFinances);
  const today = toDateKey(now);
  const reminders: Reminder[] = [];

  const pendingTasks = tasks.filter((task) => task.status !== 'concluido' && task.status !== 'cancelado' && task.date <= today);
  if (pendingTasks.length) {
    reminders.push({
      id: `daily-tasks-${today}`,
      at: combineDateTime(today, settings.taskDailyHour),
      title: 'Tarefas do dia',
      body: `Você tem ${pendingTasks.length} tarefa(s) aberta(s) para organizar hoje.`,
      tag: 'daily-tasks'
    });
  }

  for (const meal of meals.filter((item) => !item.done)) {
    const target = addMinutes(combineDateTime(today, meal.time), -settings.mealLeadTime);
    reminders.push({
      id: `meal-${meal.id}-${today}`,
      at: target,
      title: 'Lembrete de bem-estar',
      body: `${labelMeal(meal.type)} em ${settings.mealLeadTime} minuto(s). ${meal.notes ?? ''}`.trim(),
      tag: `meal-${meal.id}`
    });
  }

  for (const study of studies) {
    reminders.push({
      id: `study-${study.id}-${study.date}`,
      at: addMinutes(combineDateTime(study.date, study.time ?? '08:00'), -settings.studyLeadTime),
      title: study.type === 'prova' ? 'Prova chegando' : 'Hora de estudar',
      body: `${study.subject}: ${study.title}`,
      tag: `study-${study.id}`
    });
  }

  for (const item of internship.filter((entry) => entry.status !== 'concluido' && entry.status !== 'cancelado')) {
    reminders.push({
      id: `internship-${item.id}-${item.date}`,
      at: addMinutes(combineDateTime(item.date, item.startTime), -settings.internshipLeadTime),
      title: 'Lembrete do estágio',
      body: `${item.title} - ${item.company}`,
      tag: `internship-${item.id}`
    });
  }

  for (const item of finances.filter((entry) => entry.status !== 'pago' && entry.type === 'saida')) {
    reminders.push({
      id: `finance-${item.id}-${item.date}`,
      at: addMinutes(combineDateTime(item.date, '09:00'), -settings.financeLeadTime),
      title: 'Conta a vencer',
      body: `${item.title} - ${item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      tag: `finance-${item.id}`
    });
  }

  return reminders;
}

export async function dispatchDueNotifications() {
  const settings = normalizeSettings(loadLocal<NotificationSettings>('hg-settings', demoSettings));
  if (!settings.enabled || !('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const dueWindowStart = new Date(now.getTime() - 60_000);
  const sent = loadLocal<Record<string, string>>(sentKey, {});
  const due = buildReminders(now).filter((reminder) => reminder.at <= now && reminder.at >= dueWindowStart && !sent[reminder.id]);

  for (const reminder of due) {
    await showNotification(reminder);
    if (settings.sound) playAlertSound();
    sent[reminder.id] = new Date().toISOString();
  }

  if (due.length) saveLocal(sentKey, sent);
}

export async function getPushSetupStatus(): Promise<PushSetupStatus> {
  const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const configured = Boolean(import.meta.env.VITE_PUSH_PUBLIC_KEY && import.meta.env.VITE_PUSH_SUBSCRIBE_ENDPOINT);
  if (!supported) {
    return { supported, configured, subscribed: false, message: 'Push em segundo plano não é suportado neste navegador.' };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  const subscribed = Boolean(await registration?.pushManager.getSubscription());
  if (!configured) {
    return {
      supported,
      configured,
      subscribed,
      message: 'Pronto para conectar quando a chave VAPID e o endpoint do backend forem configurados.'
    };
  }

  return {
    supported,
    configured,
    subscribed,
    message: subscribed ? 'Alertas em segundo plano ativados neste dispositivo.' : 'Pronto para ativar alertas em segundo plano.'
  };
}

export async function enableBackgroundPush() {
  const settings = normalizeSettings(loadLocal<NotificationSettings>('hg-settings', demoSettings));
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Push em segundo plano não é suportado neste navegador.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permissão de notificação não concedida.');

  const publicKey = import.meta.env.VITE_PUSH_PUBLIC_KEY;
  const endpoint = import.meta.env.VITE_PUSH_SUBSCRIBE_ENDPOINT;
  if (!publicKey || !endpoint) {
    saveLocal('hg-settings', { ...settings, enabled: true, pushEnabled: false });
    throw new Error('Configure VITE_PUSH_PUBLIC_KEY e VITE_PUSH_SUBSCRIBE_ENDPOINT para ativar push real.');
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    }));

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      reminders: serializeRemindersForPush()
    })
  });

  if (!response.ok) throw new Error('Não foi possível salvar a inscrição push no backend.');
  saveLocal('hg-settings', { ...settings, enabled: true, pushEnabled: true });
}

async function showNotification(reminder: Reminder) {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(reminder.title, {
        body: reminder.body,
        icon: '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        tag: reminder.tag
      });
      return;
    }
  }

  new Notification(reminder.title, {
    body: reminder.body,
    icon: '/icons/icon-192.svg',
    tag: reminder.tag
  });
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time || '08:00'}:00`);
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function labelMeal(type: Meal['type']) {
  const labels: Record<Meal['type'], string> = {
    cafe: 'Café da manhã',
    almoco: 'Almoço',
    lanche: 'Lanche',
    jantar: 'Jantar',
    ceia: 'Ceia',
    agua: 'Água',
    suplemento: 'Suplemento'
  };
  return labels[type];
}

function serializeRemindersForPush() {
  return buildReminders().map((reminder) => ({
    ...reminder,
    at: reminder.at.toISOString()
  }));
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) output[index] = rawData.charCodeAt(index);
  return output;
}

function playAlertSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 740;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.5);
}
