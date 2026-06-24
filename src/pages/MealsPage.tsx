import { useState } from 'react';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { demoMeals } from '../lib/demoData';
import { loadLocal, saveLocal } from '../lib/localStore';
import type { Meal } from '../lib/types';

export function MealsPage() {
  const [meals, setMeals] = useState(() => loadLocal<Meal[]>('hg-meals', demoMeals));
  const [form, setForm] = useState({ type: 'almoco' as Meal['type'], time: '12:00', amount: '', notes: '', done: false });

  function add(event: React.FormEvent) {
    event.preventDefault();
    const next = [{ id: crypto.randomUUID(), ...form }, ...meals];
    setMeals(next);
    saveLocal('hg-meals', next);
  }

  function toggle(id: string) {
    const next = meals.map((meal) => (meal.id === id ? { ...meal, done: !meal.done } : meal));
    setMeals(next);
    saveLocal('hg-meals', next);
  }

  return (
    <>
      <PageTitle title="Bem-estar" subtitle="Cuide de refeições, água, suplementos e horários do dia." />
      <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <form className="grid gap-3" onSubmit={add}>
            <Field label="Tipo"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Meal['type'] })}><option value="cafe">Café da manhã</option><option value="almoco">Almoço</option><option value="lanche">Lanche</option><option value="jantar">Jantar</option><option value="ceia">Ceia</option><option value="agua">Água</option><option value="suplemento">Suplemento</option></select></Field>
            <Field label="Horário"><input className={inputClass} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
            <Field label="Quantidade"><input className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="500 ml, 150 g..." /></Field>
            <Field label="Observações"><textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button>Salvar lembrete</Button>
          </form>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold capitalize">{meal.type}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{meal.time} {meal.amount && `· ${meal.amount}`}</p>
                  <p className="mt-2 text-sm">{meal.notes}</p>
                </div>
                <input className="size-5 accent-brand-600" type="checkbox" checked={meal.done} onChange={() => toggle(meal.id)} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
