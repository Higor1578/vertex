import { useState } from 'react';
import { Brain, FileQuestion, Plus } from 'lucide-react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { prepareExam, type StudyPack } from '../lib/ai';
import { demoNotes } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import { loadSubjects } from '../lib/subjects';
import type { StudyNote, Subject } from '../lib/types';

export function NotesPage() {
  const [notes, setNotes] = useState(() => loadLocal<StudyNote[]>('hg-notes', demoNotes));
  const [subjects] = useState(() => loadSubjects(loadLocal<StudyNote[]>('hg-notes', demoNotes).map((note) => note.subject)));
  const [pack, setPack] = useState<StudyPack | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ subject: '', discipline: '', chapter: '', title: '', content: '' });

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
      <PageTitle title="Anotações Inteligentes" subtitle="Matérias, capítulos, PDFs/imagens preparados para armazenamento e IA de revisão." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={runAi} disabled={busy}><Brain size={17} />Preparar para Prova</Button>
        <Button onClick={runAi} className="bg-blue-600 hover:bg-blue-700" disabled={busy}><FileQuestion size={17} />Gerar questões e flashcards</Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <form className="grid gap-3" onSubmit={add}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Matéria"><SubjectSelect subjects={subjects} value={form.subject} onChange={(subject) => setForm({ ...form, subject })} /></Field>
              <Field label="Disciplina"><input className={inputClass} value={form.discipline} onChange={(e) => setForm({ ...form, discipline: e.target.value })} required /></Field>
              <Field label="Capítulo"><input className={inputClass} value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} /></Field>
              <Field label="Título"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
            </div>
            <Field label="Anotação"><textarea className={inputClass} rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></Field>
            <Field label="Anexos"><input className={inputClass} type="file" multiple accept=".pdf,image/*" /></Field>
            <Button><Plus size={17} />Salvar anotação</Button>
          </form>
        </Card>
        <div className="grid gap-3">
          {pack && (
            <Card className="border-brand-200 dark:border-brand-800">
              <h3 className="font-semibold">Plano de revisão gerado</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{pack.quickSummary}</p>
              <p className="mt-2 text-sm">Tempo estimado: <strong>{pack.estimatedMinutes} min</strong></p>
              <div className="mt-3 flex flex-wrap gap-2">{pack.keywords.map((word) => <span className="rounded-md bg-brand-50 px-2 py-1 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-100" key={word}>{word}</span>)}</div>
              <ul className="mt-3 list-inside list-disc text-sm text-slate-600 dark:text-slate-300">{pack.reviewPlan.map((step) => <li key={step}>{step}</li>)}</ul>
            </Card>
          )}
          {notes.map((note) => (
            <Card key={note.id}>
              <p className="text-xs font-medium uppercase text-brand-700 dark:text-brand-100">{note.subject} · {note.discipline}</p>
              <h3 className="mt-1 font-semibold">{note.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{note.content}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
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
