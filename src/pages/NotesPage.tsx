import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight, FileQuestion, Plus } from 'lucide-react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { prepareExam, type StudyPack } from '../lib/ai';
import { demoNotes } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import { loadSubjects } from '../lib/subjects';
import type { StudyNote, Subject } from '../lib/types';

export function NotesPage() {
  const [notes, setNotes] = useState(() => loadLocal<StudyNote[]>('hg-notes', demoNotes));
  const [subjects] = useState(() => loadSubjects(loadLocal<StudyNote[]>('hg-notes', demoNotes).map((note) => note.subject)));
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [pack, setPack] = useState<StudyPack | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ subject: '', discipline: '', chapter: '', title: '', content: '' });
  const groupedNotes = groupBySubject(notes);

  function add(event: React.FormEvent) {
    event.preventDefault();
    const next = [{ id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString() }, ...notes];
    setNotes(next);
    saveLocal('hg-notes', next);
    setForm({ subject: '', discipline: '', chapter: '', title: '', content: '' });
  }

  async function runAi() {
    setBusy(true);
    setPack(await prepareExam(notes));
    setBusy(false);
  }

  return (
    <>
      <PageTitle title="Anotacoes Inteligentes" subtitle="Materias, capitulos, PDFs/imagens preparados para armazenamento e IA de revisao." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={runAi} disabled={busy}><Brain size={17} />Preparar para Prova</Button>
        <Button onClick={runAi} className="bg-blue-600 hover:bg-blue-700" disabled={busy}><FileQuestion size={17} />Gerar questoes e flashcards</Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <form className="grid gap-3" onSubmit={add}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Materia"><SubjectSelect subjects={subjects} value={form.subject} onChange={(subject) => setForm({ ...form, subject })} /></Field>
              <Field label="Disciplina"><input className={inputClass} value={form.discipline} onChange={(event) => setForm({ ...form, discipline: event.target.value })} required /></Field>
              <Field label="Capitulo"><input className={inputClass} value={form.chapter} onChange={(event) => setForm({ ...form, chapter: event.target.value })} /></Field>
              <Field label="Titulo"><input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></Field>
            </div>
            <Field label="Anotacao"><textarea className={inputClass} rows={8} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required /></Field>
            <Field label="Anexos"><input className={inputClass} type="file" multiple accept=".pdf,image/*" /></Field>
            <Button><Plus size={17} />Salvar anotacao</Button>
          </form>
        </Card>
        <div className="grid gap-3">
          {pack && (
            <Card className="border-brand-200 dark:border-brand-800">
              <h3 className="font-semibold">Plano de revisao gerado</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{pack.quickSummary}</p>
              <p className="mt-2 text-sm">Tempo estimado: <strong>{pack.estimatedMinutes} min</strong></p>
              <div className="mt-3 flex flex-wrap gap-2">{pack.keywords.map((word) => <span className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-100" key={word}>{word}</span>)}</div>
              <ul className="mt-3 list-inside list-disc text-sm text-slate-600 dark:text-slate-300">{pack.reviewPlan.map((step) => <li key={step}>{step}</li>)}</ul>
            </Card>
          )}
          {groupedNotes.map(([subject, subjectNotes], index) => {
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
                    <span className="text-sm text-slate-500 dark:text-slate-400">{subjectNotes.length} anotacao{subjectNotes.length === 1 ? '' : 'es'}</span>
                  </span>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {isOpen && (
                  <div className="mt-4 grid gap-3">
                    {subjectNotes.map((note) => (
                      <div key={note.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-xs font-medium uppercase text-brand-700 dark:text-brand-100">{note.discipline}</p>
                        <h3 className="mt-1 font-semibold">{note.title}</h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {!groupedNotes.length && (
            <Card>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma anotacao cadastrada.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function groupBySubject(notes: StudyNote[]) {
  const groups = new Map<string, StudyNote[]>();

  notes.forEach((note) => {
    const subject = note.subject || 'Geral';
    groups.set(subject, [...(groups.get(subject) ?? []), note]);
  });

  return Array.from(groups.entries()).sort(([first], [second]) => first.localeCompare(second));
}

function SubjectSelect({ subjects, value, onChange }: { subjects: Subject[]; value: string; onChange: (value: string) => void }) {
  return (
    <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} required>
      <option value="">Selecione uma materia</option>
      {subjects.map((subject) => (
        <option key={subject.id} value={subject.name}>{subject.name}</option>
      ))}
    </select>
  );
}
