import { AlertTriangle, BookOpen, BriefcaseBusiness, Clock } from 'lucide-react';
import { Card, PageTitle } from '../components/ui';
import { demoInternship, demoMeals, demoStudies, demoTasks } from '../lib/demoData';
import { loadLocal } from '../lib/localStore';
import type { InternshipItem, Meal, StudyItem, Task } from '../lib/types';

export function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = loadLocal<Task[]>('hg-tasks', demoTasks);
  const studies = loadLocal<StudyItem[]>('hg-studies', demoStudies);
  const internship = loadLocal<InternshipItem[]>('hg-internship', demoInternship);
  const meals = loadLocal<Meal[]>('hg-meals', demoMeals);
  const pending = tasks.filter((task) => task.status !== 'concluido').length;
  const exams = studies.filter((study) => study.type === 'prova').sort((a, b) => a.date.localeCompare(b.date));
  const todayStudies = studies.filter((study) => study.date === today);
  const todayTasks = tasks.filter((task) => task.date === today && task.status !== 'concluido');
  const todayInternship = internship.filter((item) => item.date === today);
  const nextStudies = studies
    .filter((study) => study.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  const nextInternship = internship
    .filter((item) => item.date >= today)
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
    .slice(0, 4);

  return (
    <>
      <PageTitle title="Hoje" subtitle="O que você precisa lembrar entre faculdade, estágio, estudo e tarefas." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BookOpen} label="Estudos hoje" value={todayStudies.length.toString()} />
        <Metric icon={AlertTriangle} label="Provas próximas" value={exams.length.toString()} />
        <Metric icon={BriefcaseBusiness} label="Estágio hoje" value={todayInternship.length.toString()} />
        <Metric icon={Clock} label="Tarefas abertas" value={pending.toString()} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-brand-600 text-white dark:bg-brand-700">
          <h3 className="text-lg font-semibold">Assistente do dia</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Reminder title="Primeiro foco" value={todayStudies[0] ? `${todayStudies[0].subject}: ${todayStudies[0].title}` : 'Criar bloco de estudo para hoje'} />
            <Reminder title="Próxima prova" value={exams[0] ? `${exams[0].subject} em ${formatDate(exams[0].date)}` : 'Nenhuma prova cadastrada'} />
            <Reminder title="Estágio" value={todayInternship[0] ? `${todayInternship[0].startTime} - ${todayInternship[0].title}` : 'Sem compromisso de estágio hoje'} />
            <Reminder title="Bem-estar" value={meals.find((meal) => !meal.done)?.notes ?? 'Bem-estar em dia'} />
          </div>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Agenda de hoje</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {[
              ...todayStudies.map((study) => `${study.subject}: ${study.title}`),
              ...todayInternship.map((item) => `${item.startTime} - ${item.title}`),
              ...todayTasks.map((task) => task.title)
            ].slice(0, 6).map((item) => (
              <li key={item} className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">{item}</li>
            ))}
            {todayStudies.length + todayInternship.length + todayTasks.length === 0 ? (
              <li className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">Nenhum compromisso para hoje</li>
            ) : null}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <List title="Próximos estudos e provas" items={nextStudies.map((study) => `${formatDate(study.date)} - ${study.subject}: ${study.title}`)} />
        <div className="grid gap-4">
          <List title="Próximos compromissos do estágio" items={nextInternship.map((item) => `${formatDate(item.date)} ${item.startTime} - ${item.title}`)} />
        </div>
      </div>
    </>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <Icon className="text-brand-600" size={22} />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </Card>
  );
}

function Reminder({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/12 p-3">
      <p className="text-xs uppercase text-white/75">{title}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {(items.length ? items : ['Nenhum item cadastrado']).map((item) => (
          <li key={item} className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">{item}</li>
        ))}
      </ul>
    </Card>
  );
}
