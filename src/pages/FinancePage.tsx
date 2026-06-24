import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Button, Card, Field, inputClass, PageTitle } from '../components/ui';
import { demoFinances } from '../lib/demoData';
import { getInvestmentRadar, type InvestmentIdea, type InvestmentRadar } from '../lib/investments';
import { loadLocal, saveLocal } from '../lib/localStore';
import type { FinanceRecord } from '../lib/types';

const colors = ['#059669', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#0f766e'];

export function FinancePage() {
  const [records, setRecords] = useState(() => loadLocal<FinanceRecord[]>('hg-finances', demoFinances));
  const [radar, setRadar] = useState<InvestmentRadar | null>(null);
  const [radarBusy, setRadarBusy] = useState(true);
  const [form, setForm] = useState({
    type: 'saida' as FinanceRecord['type'],
    title: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    category: 'Faculdade',
    status: 'previsto' as FinanceRecord['status'],
    paymentMethod: 'Pix'
  });
  const income = records.filter((item) => item.type === 'entrada').reduce((sum, item) => sum + item.amount, 0);
  const expenses = records.filter((item) => item.type === 'saida').reduce((sum, item) => sum + item.amount, 0);
  const invested = records.filter((item) => item.type === 'investimento').reduce((sum, item) => sum + item.amount, 0);
  const freeBalance = income - expenses - invested;
  const byCategory = useMemo(
    () =>
      Object.values(
        records.reduce<Record<string, { name: string; value: number }>>((acc, item) => {
          if (item.type !== 'entrada') acc[item.category] = { name: item.category, value: (acc[item.category]?.value ?? 0) + item.amount };
          return acc;
        }, {})
      ),
    [records]
  );

  useEffect(() => {
    refreshRadar();
  }, []);

  async function refreshRadar() {
    setRadarBusy(true);
    setRadar(await getInvestmentRadar());
    setRadarBusy(false);
  }

  function add(event: React.FormEvent) {
    event.preventDefault();
    const next = [{ id: crypto.randomUUID(), ...form, amount: Number(form.amount) }, ...records];
    setRecords(next);
    saveLocal('hg-finances', next);
    setForm({ ...form, title: '', amount: 0 });
  }

  return (
    <>
      <PageTitle title="Finanças" subtitle="Controle ganhos, gastos, reserva e acompanhe ideias de investimento sem transformar isso em recomendação de compra." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Ganhei" value={income} className="text-brand-700" />
        <Summary label="Gastei" value={expenses} className="text-red-600" />
        <Summary label="Investi" value={invested} className="text-blue-600" />
        <Summary label="Saldo livre" value={freeBalance} className={freeBalance >= 0 ? 'text-slate-950 dark:text-white' : 'text-red-600'} />
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">Radar de investimentos</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Dados para estudar oportunidades. Não é recomendação de compra ou venda.</p>
          </div>
          <Button type="button" onClick={refreshRadar} disabled={radarBusy} className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
            <RefreshCw size={17} />Atualizar
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {(radar?.ideas ?? []).map((idea) => <InvestmentCard key={idea.symbol} idea={idea} />)}
          {radarBusy && <p className="text-sm text-slate-500 dark:text-slate-400">Carregando radar...</p>}
        </div>
        {radar && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Fonte: {radar.source} - atualizado em {new Date(radar.updatedAt).toLocaleString('pt-BR')}. Consulte uma corretora ou profissional antes de investir.
          </p>
        )}
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <form className="grid gap-3" onSubmit={add}>
            <Field label="Tipo">
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as FinanceRecord['type'] })}>
                <option value="entrada">Ganhei</option>
                <option value="saida">Gastei</option>
                <option value="investimento">Investi</option>
              </select>
            </Field>
            <Field label="Descrição"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Valor"><input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
              <Field label="Data"><input className={inputClass} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Categoria"><select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Estágio</option><option>Faculdade</option><option>Curso</option><option>Transporte</option><option>Alimentação</option><option>Reserva</option><option>Lazer</option><option>Outros</option></select></Field>
              <Field label="Forma"><input className={inputClass} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /></Field>
              <Field label="Status"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as FinanceRecord['status'] })}><option value="previsto">Previsto</option><option value="pago">Pago</option><option value="atrasado">Atrasado</option></select></Field>
            </div>
            <Button>Salvar movimentação</Button>
          </form>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Gastos e investimentos por categoria</h3>
          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90}>{byCategory.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {records.map((item) => <div key={item.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">{labelFor(item.type)}: {item.title} - {money(item.amount)} - {item.status}</div>)}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

function InvestmentCard({ idea }: { idea: InvestmentIdea }) {
  const isPositive = (idea.changePercent ?? 0) >= 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-brand-700 dark:text-brand-100">{idea.category}</p>
          <h4 className="mt-1 font-semibold">{idea.symbol}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{idea.name}</p>
        </div>
        {idea.changePercent !== undefined && (
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-100'}`}>
            <TrendingUp size={14} />{isPositive ? '+' : ''}{idea.changePercent.toFixed(2)}%
          </span>
        )}
      </div>
      {idea.price !== undefined && <p className="mt-3 text-xl font-bold">{money(idea.price)}</p>}
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{idea.highlight}</p>
      <p className="mt-3 flex gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
        <AlertTriangle className="mt-0.5 shrink-0" size={14} />{idea.caution}
      </p>
    </div>
  );
}

function Summary({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${className}`}>{money(value)}</p>
    </Card>
  );
}

function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function labelFor(type: FinanceRecord['type']) {
  if (type === 'entrada') return 'Ganho';
  if (type === 'investimento') return 'Investimento';
  return 'Gasto';
}
