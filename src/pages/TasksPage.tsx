import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { demoTasks } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import { sanitizeText } from '../lib/security';
import type { Priority, Status, Task } from '../lib/types';

export function TasksPage() {
  const [tasks, setTasks] = useState(() => loadLocal<Task[]>('hg-tasks', demoTasks));
  const [form, setForm] = useState({ title: '', client: '', company: '', date: new Date().toISOString().slice(0, 10), time: '09:00', priority: 'media' as Priority, status: 'pendente' as Status, notes: '', recurrence: '' });

  function addTask(event: React.FormEvent) {
    event.preventDefault();
    const next = [{ id: crypto.randomUUID(), ...form, title: sanitizeText(form.title), notes: sanitizeText(form.notes) }, ...tasks];
    setTasks(next);
    saveLocal('hg-tasks', next);
    setForm({ ...form, title: '', client: '', company: '', notes: '' });
  }

  function updateStatus(id: string, status: Status) {
    const next = tasks.map((task) => (task.id === id ? { ...task, status } : task));
    setTasks(next);
    saveLocal('hg-tasks', next);
  }

  return (
    <>
      <PageTitle title="Tarefas de serviço" subtitle="Clientes, horários, prioridade, status, repetição e observações." />
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <form className="grid gap-3" onSubmit={addTask}>
            <Field label="Nome do serviço"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Cliente"><input className={inputClass} value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} /></Field>
              <Field label="Empresa"><input className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
              <Field label="Data"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Horário"><input className={inputClass} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
              <Field label="Prioridade"><select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></Field>
              <Field label="Repetição"><input className={inputClass} value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })} placeholder="Semanal, mensal..." /></Field>
            </div>
            <Field label="Observações"><textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button><Plus size={17} />Adicionar tarefa</Button>
          </form>
        </Card>
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{task.client || 'Sem cliente'} · {task.date} {task.time}</p>
                  <p className="mt-2 text-sm">{task.notes}</p>
                </div>
                <select className={`${inputClass} w-44`} value={task.status} onChange={(e) => updateStatus(task.id, e.target.value as Status)}>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">Prioridade: {task.priority}</span>
                {task.recurrence && <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">Repete: {task.recurrence}</span>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
