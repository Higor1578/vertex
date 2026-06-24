import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { demoStudies } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import { loadSubjects } from '../lib/subjects';
import type { Priority, StudyItem, Subject } from '../lib/types';

export function StudiesPage() {
  const [items, setItems] = useState(() => loadLocal<StudyItem[]>('hg-studies', demoStudies));
  const [subjects, setSubjects] = useState(() => loadSubjects(loadLocal<StudyItem[]>('hg-studies', demoStudies).map((item) => item.subject)));
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [form, setForm] = useState({ subject: '', type: 'aula' as StudyItem['type'], title: '', date: new Date().toISOString().slice(0, 10), time: '19:00', priority: 'media' as Priority, notes: '' });
  const groupedItems = groupBySubject(items);

  function addSubject(event: React.FormEvent) {
    event.preventDefault();
    const name = subjectName.trim();
    if (!name || subjects.some((subject) => subject.name.toLowerCase() === name.toLowerCase())) return;
    const next = [...subjects, { id: crypto.randomUUID(), name }].sort((a, b) => a.name.localeCompare(b.name));
    setSubjects(next);
    saveLocal('hg-subjects', next);
    setSubjectName('');
    setForm((current) => ({ ...current, subject: current.subject || name }));
  }

  function removeSubject(id: string) {
    const next = subjects.filter((subject) => subject.id !== id);
    setSubjects(next);
    saveLocal('hg-subjects', next);
    setForm((current) => ({ ...current, subject: subjects.find((subject) => subject.id === id)?.name === current.subject ? '' : current.subject }));
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    const next = [{ id: crypto.randomUUID(), ...form }, ...items];
    setItems(next);
    saveLocal('hg-studies', next);
    setForm({ ...form, subject: '', title: '', notes: '' });
  }

  return (
    <>
      <PageTitle title="Faculdade e curso" subtitle="Provas, trabalhos, aulas, entregas e lembretes de revisão para não esquecer nada." />
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-4">
          <Card>
            <h3 className="mb-3 font-semibold">Minhas matérias</h3>
            <form className="flex gap-2" onSubmit={addSubject}>
              <input className={inputClass} value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Ex: Algoritmos" />
              <Button className="shrink-0 px-3" title="Adicionar matéria"><Plus size={17} /></Button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <span key={subject.id} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {subject.name}
                  <button type="button" onClick={() => removeSubject(subject.id)} className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white" title={`Remover ${subject.name}`}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <form className="grid gap-3" onSubmit={add}>
              <Field label="Matéria ou disciplina"><SubjectSelect subjects={subjects} value={form.subject} onChange={(subject) => setForm({ ...form, subject })} /></Field>
              <Field label="Título"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tipo"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as StudyItem['type'] })}><option value="prova">Prova</option><option value="revisao">Revisão</option><option value="trabalho">Trabalho</option><option value="aula">Aula</option><option value="seminario">Seminário</option><option value="atividade">Atividade</option><option value="entrega">Entrega</option></select></Field>
                <Field label="Prioridade"><select className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></Field>
                <Field label="Data"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
                <Field label="Horário"><input className={inputClass} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
              </div>
              <Field label="Observações"><textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              <Button><Plus size={17} />Salvar lembrete</Button>
            </form>
          </Card>
        </div>
        <div className="grid gap-3">
          {groupedItems.map(([subject, subjectItems], index) => {
            const isOpen = activeSubject === null ? index === 0 : activeSubject === subject;
            return (
              <Card key={subject}>
                <button
                  type="button"
                  onClick={() => setActiveSubject(isOpen ? '' : subject)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span>
                    <span className="block font-semibold">{subject}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{subjectItems.length} lembrete{subjectItems.length === 1 ? '' : 's'}</span>
                  </span>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {isOpen && (
                  <div className="mt-4 grid gap-3">
                    {subjectItems.map((item) => (
                      <div key={item.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex flex-wrap justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{labelFor(item.type)} - {item.date} {item.time}</p>
                            <p className="mt-2 text-sm">{item.notes}</p>
                          </div>
                          <span className="h-fit rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-100">{item.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {!groupedItems.length && (
            <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum lembrete cadastrado.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function groupBySubject(items: StudyItem[]) {
  const groups = new Map<string, StudyItem[]>();

  items.forEach((item) => {
    const subject = item.subject || 'Geral';
    groups.set(subject, [...(groups.get(subject) ?? []), item]);
  });

  return Array.from(groups.entries()).sort(([first], [second]) => first.localeCompare(second));
}

function SubjectSelect({ subjects, value, onChange }: { subjects: Subject[]; value: string; onChange: (value: string) => void }) {
  return (
    <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} required>
      <option value="">Selecione uma matéria</option>
      {subjects.map((subject) => (
        <option key={subject.id} value={subject.name}>{subject.name}</option>
      ))}
    </select>
  );
}

function labelFor(type: StudyItem['type']) {
  const labels: Record<StudyItem['type'], string> = {
    trabalho: 'Trabalho',
    prova: 'Prova',
    aula: 'Aula',
    seminario: 'Seminário',
    atividade: 'Atividade',
    entrega: 'Entrega',
    revisao: 'Revisão'
  };
  return labels[type];
}
