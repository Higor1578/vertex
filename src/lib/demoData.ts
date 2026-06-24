import type { FinanceRecord, Goal, InternshipItem, Meal, NotificationSettings, StudyItem, StudyNote, Subject, Task } from './types';

export const demoSubjects: Subject[] = [
  { id: 'subject-1', name: 'Cálculo I' },
  { id: 'subject-2', name: 'Banco de Dados' },
  { id: 'subject-3', name: 'Modelagem' }
];

export const demoTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Enviar relatório semanal do estágio',
    client: 'Coordenação',
    company: 'Empresa do estágio',
    date: new Date().toISOString().slice(0, 10),
    time: '17:30',
    priority: 'alta',
    status: 'pendente',
    notes: 'Conferir atividades feitas, aprendizados e horas lançadas.',
    recurrence: 'Semanal'
  },
  {
    id: 'task-2',
    title: 'Separar documentos da faculdade',
    client: 'Secretaria',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '16:00',
    priority: 'media',
    status: 'pendente',
    notes: 'Enviar comprovante de estágio e declaração atualizada.'
  }
];

export const demoStudies: StudyItem[] = [
  {
    id: 'study-1',
    subject: 'Cálculo I',
    type: 'prova',
    title: 'Prova de limites e derivadas',
    date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    time: '08:00',
    priority: 'urgente',
    notes: 'Revisar listas, definicoes e exercicios que errou.'
  },
  {
    id: 'study-2',
    subject: 'Banco de Dados',
    type: 'revisao',
    title: 'Revisar normalizacao',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    time: '20:00',
    priority: 'alta',
    notes: 'Fazer resumo de 1FN, 2FN e 3FN.'
  }
];

export const demoInternship: InternshipItem[] = [
  {
    id: 'intern-1',
    title: 'Daily com o time',
    company: 'Empresa do estágio',
    supervisor: 'Ana Paula',
    date: new Date().toISOString().slice(0, 10),
    startTime: '10:00',
    endTime: '10:30',
    priority: 'media',
    status: 'pendente',
    notes: 'Anotar bloqueios e próximas tarefas.'
  },
  {
    id: 'intern-2',
    title: 'Entregar ajuste da planilha',
    company: 'Empresa do estágio',
    supervisor: 'Carlos',
    date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    startTime: '14:00',
    priority: 'alta',
    status: 'em_andamento',
    notes: 'Validar dados antes de enviar.'
  }
];

export const demoNotes: StudyNote[] = [];

export const demoMeals: Meal[] = [
  { id: 'meal-1', type: 'cafe', time: '07:00', notes: 'Café da manhã antes da aula', done: true },
  { id: 'meal-2', type: 'agua', time: '10:00', amount: '600 ml', notes: 'Meta diaria 2,5 L', done: false },
  { id: 'meal-3', type: 'almoco', time: '12:30', notes: 'Almoço entre estágio e aula', done: false }
];

export const demoFinances: FinanceRecord[] = [
  {
    id: 'fin-1',
    type: 'entrada',
    title: 'Bolsa do estágio',
    amount: 900,
    date: new Date().toISOString().slice(0, 10),
    category: 'Estagio',
    status: 'pago',
    paymentMethod: 'Pix'
  },
  {
    id: 'fin-2',
    type: 'saida',
    title: 'Transporte faculdade',
    amount: 180,
    date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    category: 'Transporte',
    status: 'previsto',
    paymentMethod: 'Cartao'
  },
  {
    id: 'fin-3',
    type: 'investimento',
    title: 'Reserva em CDB',
    amount: 150,
    date: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    category: 'Reserva',
    status: 'pago',
    paymentMethod: 'Conta digital'
  }
];

export const demoGoals: Goal[] = [
  { id: 'goal-1', title: 'Passar em Cálculo I', horizon: 'curto', progress: 64, deadline: '2026-07-30' },
  { id: 'goal-2', title: 'Guardar reserva de 3 meses', horizon: 'longo', progress: 28, deadline: '2027-03-15' }
];

export const demoSettings: NotificationSettings = {
  enabled: true,
  sound: true,
  pushEnabled: false,
  mealLeadTime: 2,
  studyLeadTime: 30,
  internshipLeadTime: 15,
  financeLeadTime: 1440,
  taskDailyHour: '08:00'
};
