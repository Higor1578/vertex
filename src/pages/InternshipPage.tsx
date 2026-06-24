import { useState } from 'react';
import { BriefcaseBusiness, Plus } from 'lucide-react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { demoInternship } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import type { InternshipItem, Priority, Status } from '../lib/types';

export function InternshipPage() {
  const [items, setItems] = useState(() => loadLocal<InternshipItem[]>('hg-internship', demoInternship));
  const [form, setForm] = useState({
    title: '',
    company: 'Empresa do estágio',
    supervisor: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '',
    priority: 'media' as Priority,
    status: 'pendente' as Status,
    notes: ''
  });

  function add(event: React.FormEvent) {
    event.preventDefault();
    const next = [{ id: crypto.randomUUID(), ...form }, ...items];
    setItems(next);
    saveLocal('hg-internship', next);
    setForm({ ...form, title: '', supervisor: '', notes: '' });
  }

  function updateStatus(id: string, status: Status) {
    const next = items.map((item) => (item.id === id ? { ...item, status } : item));
    setItems(next);
    saveLocal('hg-internship', next);
  }

  return (
    <>
      <PageTitle title="Estágio" subtitle="Lembretes de rotina, entregas, reuniões, supervisores e horas do estágio." />
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <form className="grid gap-3" onSubmit={add}>
            <Field label="Compromisso"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Empresa"><input className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required /></Field>
              <Field label="Supervisor"><input className={inputClass} value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></Field>
              <Field label="Data"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Início"><input className={inputClass} type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field>
              <Field label="Fim"><input className={inputClass} type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></Field>
              <Field label="Prioridade"><select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></Field>
            </div>
            <Field label="Observações"><textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button><Plus size={17} />Salvar lembrete</Button>
          </form>
        </Card>
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-medium uppercase text-brand-700 dark:text-brand-100"><BriefcaseBusiness size={14} />{item.company}</p>
                  <h3 className="mt-1 font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.date} das {item.startTime}{item.endTime ? ` até ${item.endTime}` : ''}</p>
                  <p className="mt-2 text-sm">{item.notes}</p>
                  {item.supervisor && <p className="mt-2 text-xs text-slate-500">Supervisor: {item.supervisor}</p>}
                </div>
                <select className={`${inputClass} w-44`} value={item.status} onChange={(e) => updateStatus(item.id, e.target.value as Status)}>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
