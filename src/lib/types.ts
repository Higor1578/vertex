export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type Status = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';

export type Subject = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  title: string;
  client?: string;
  company?: string;
  date: string;
  time?: string;
  priority: Priority;
  status: Status;
  notes?: string;
  recurrence?: string;
};

export type StudyItem = {
  id: string;
  subject: string;
  type: 'trabalho' | 'prova' | 'aula' | 'seminario' | 'atividade' | 'entrega' | 'revisao';
  title: string;
  date: string;
  time?: string;
  priority: Priority;
  notes?: string;
};

export type InternshipItem = {
  id: string;
  title: string;
  company: string;
  supervisor?: string;
  date: string;
  startTime: string;
  endTime?: string;
  priority: Priority;
  status: Status;
  notes?: string;
};

export type StudyNote = {
  id: string;
  subject: string;
  discipline: string;
  chapter?: string;
  title: string;
  content: string;
  createdAt: string;
};

export type Meal = {
  id: string;
  type: 'cafe' | 'almoco' | 'lanche' | 'jantar' | 'ceia' | 'agua' | 'suplemento';
  time: string;
  amount?: string;
  notes?: string;
  done: boolean;
};

export type FinanceRecord = {
  id: string;
  type: 'entrada' | 'saida' | 'investimento';
  title: string;
  amount: number;
  date: string;
  category: string;
  status: 'previsto' | 'pago' | 'atrasado';
  paymentMethod: string;
};

export type Goal = {
  id: string;
  title: string;
  horizon: 'curto' | 'medio' | 'longo';
  progress: number;
  deadline: string;
};

export type NotificationSettings = {
  enabled: boolean;
  sound: boolean;
  pushEnabled: boolean;
  mealLeadTime: number;
  studyLeadTime: number;
  internshipLeadTime: number;
  financeLeadTime: number;
  taskDailyHour: string;
};
