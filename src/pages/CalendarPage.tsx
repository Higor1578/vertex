import { Card, PageTitle } from '../components/ui';
import { demoFinances, demoInternship, demoMeals, demoStudies, demoTasks } from '../lib/demoData';
import { loadLocal } from '../lib/localStore';
import type { FinanceRecord, InternshipItem, Meal, StudyItem, Task } from '../lib/types';

export function CalendarPage() {
  const tasks = loadLocal<Task[]>('hg-tasks', demoTasks).map((item) => ({ date: item.date, title: item.title, type: 'Tarefa', color: 'bg-brand-600' }));
  const studies = loadLocal<StudyItem[]>('hg-studies', demoStudies).map((item) => ({ date: item.date, title: item.title, type: item.type === 'prova' ? 'Prova' : 'Estudo', color: item.type === 'prova' ? 'bg-red-500' : 'bg-blue-600' }));
  const internship = loadLocal<InternshipItem[]>('hg-internship', demoInternship).map((item) => ({ date: item.date, title: item.title, type: 'Estagio', color: 'bg-violet-600' }));
  const meals = loadLocal<Meal[]>('hg-meals', demoMeals).map((item) => ({ date: new Date().toISOString().slice(0, 10), title: item.type, type: 'Bem-estar', color: 'bg-amber-500' }));
  const finances = loadLocal<FinanceRecord[]>('hg-finances', demoFinances).map((item) => ({ date: item.date, title: item.title, type: item.type === 'investimento' ? 'Investimento' : 'Finanças', color: item.type === 'entrada' ? 'bg-emerald-500' : item.type === 'investimento' ? 'bg-sky-500' : 'bg-red-500' }));
  const events = [...tasks, ...studies, ...internship, ...meals, ...finances].sort((a, b) => a.date.localeCompare(b.date));
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });

  return (
    <>
      <PageTitle title="Agenda" subtitle="Tudo em uma visão: provas, revisões, estágio, finanças e bem-estar." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {days.map((day) => {
          const dayEvents = events.filter((event) => event.date === day);
          return (
            <Card key={day} className="min-h-36">
              <p className="mb-2 text-sm font-semibold">{new Date(`${day}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</p>
              <div className="space-y-2">
                {dayEvents.map((event) => <div key={`${event.type}-${event.title}`} className="rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-800"><span className={`mr-2 inline-block size-2 rounded-full ${event.color}`} />{event.type}: {event.title}</div>)}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
