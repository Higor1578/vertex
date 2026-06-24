import { useState } from 'react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { demoGoals } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import type { Goal } from '../lib/types';

export function GoalsPage() {
  const [goals, setGoals] = useState(() => loadLocal<Goal[]>('hg-goals', demoGoals));
  const [form, setForm] = useState({ title: '', horizon: 'curto' as Goal['horizon'], progress: 0, deadline: new Date().toISOString().slice(0, 10) });

  function add(event: React.FormEvent) {
    event.preventDefault();
    const next = [{ id: crypto.randomUUID(), ...form, progress: Number(form.progress) }, ...goals];
    setGoals(next);
    saveLocal('hg-goals', next);
  }

  return (
    <>
      <PageTitle title="Metas" subtitle="Curto, médio e longo prazo com progresso e prazo restante." />
      <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <form className="grid gap-3" onSubmit={add}>
            <Field label="Meta"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
            <Field label="Prazo"><input className={inputClass} type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <Field label="Horizonte"><select className={inputClass} value={form.horizon} onChange={(e) => setForm({ ...form, horizon: e.target.value as Goal['horizon'] })}><option value="curto">Curto prazo</option><option value="medio">Médio prazo</option><option value="longo">Longo prazo</option></select></Field>
            <Field label="Progresso"><input className={inputClass} type="range" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} /></Field>
            <Button>Salvar meta</Button>
          </form>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <div className="flex justify-between gap-3">
                <h3 className="font-semibold">{goal.title}</h3>
                <span className="text-sm text-slate-500">{goal.horizon}</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${goal.progress}%` }} /></div>
              <p className="mt-2 text-sm text-slate-500">{goal.progress}% concluído · prazo {goal.deadline}</p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
