import { useMemo, useState } from 'react';
import { Button, Card, Field, PageTitle, inputClass } from '../components/ui';
import { loadLocal, saveLocal } from '../lib/localStore';

type BillingStatus = 'pago' | 'pendente' | 'atrasado' | 'cancelado';
type BillingRecord = { id: string; customer: string; email: string; plan: 'gratuito' | 'mensal' | 'anual'; amount: number; dueDate: string; status: BillingStatus };

const initialForm = { customer: '', email: '', plan: 'mensal' as BillingRecord['plan'], amount: '29.90', dueDate: new Date().toISOString().slice(0, 10), status: 'pendente' as BillingStatus };

export function AdminPage() {
  const [records, setRecords] = useState(() => loadLocal<BillingRecord[]>('vertex-admin-billing', []));
  const [form, setForm] = useState(initialForm);
  const totals = useMemo(() => ({
    customers: new Set(records.map((item) => item.email.toLowerCase())).size,
    paid: records.filter((item) => item.status === 'pago').length,
    pending: records.filter((item) => item.status === 'pendente').length,
    overdue: records.filter((item) => item.status === 'atrasado').length,
    received: records.filter((item) => item.status === 'pago').reduce((sum, item) => sum + item.amount, 0),
    expected: records.filter((item) => item.status !== 'cancelado').reduce((sum, item) => sum + item.amount, 0)
  }), [records]);

  function persist(next: BillingRecord[]) { setRecords(next); saveLocal('vertex-admin-billing', next); }
  function addRecord(event: React.FormEvent) {
    event.preventDefault();
    persist([{ ...form, id: crypto.randomUUID(), amount: Number(form.amount) }, ...records]);
    setForm(initialForm);
  }
  function updateStatus(id: string, status: BillingStatus) { persist(records.map((item) => item.id === id ? { ...item, status } : item)); }

  const stats = [
    ['Clientes cadastrados', String(totals.customers)], ['Pagamentos confirmados', String(totals.paid)],
    ['Pagamentos pendentes', String(totals.pending)], ['Pagamentos atrasados', String(totals.overdue)],
    ['Total recebido', totals.received.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
    ['Total previsto', totals.expected.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]
  ];

  return <>
    <PageTitle title="Super Admin" subtitle="Controle local de clientes, planos e pagamentos do VERTEX." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(([label, value]) => <Card key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></Card>)}</div>
    <Card className="mt-4">
      <h3 className="mb-4 font-semibold">Registrar cobrança</h3>
      <form className="grid gap-3 md:grid-cols-3" onSubmit={addRecord}>
        <Field label="Cliente"><input className={inputClass} value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} required /></Field>
        <Field label="E-mail"><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Plano"><select className={inputClass} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value as BillingRecord['plan'] })}><option value="gratuito">Gratuito</option><option value="mensal">Premium mensal</option><option value="anual">Premium anual</option></select></Field>
        <Field label="Valor"><input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field>
        <Field label="Vencimento"><input className={inputClass} type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required /></Field>
        <Field label="Situação"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as BillingStatus })}><option value="pendente">Pendente</option><option value="pago">Pago</option><option value="atrasado">Atrasado</option><option value="cancelado">Cancelado</option></select></Field>
        <div className="md:col-span-3"><Button>Adicionar cobrança</Button></div>
      </form>
    </Card>
    <Card className="mt-4 overflow-x-auto">
      <h3 className="mb-4 font-semibold">Pagamentos</h3>
      {records.length === 0 ? <p className="text-sm text-slate-500">Nenhuma cobrança cadastrada.</p> : <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700"><tr><th className="p-2">Cliente</th><th className="p-2">Plano</th><th className="p-2">Valor</th><th className="p-2">Vencimento</th><th className="p-2">Situação</th><th className="p-2">Ações</th></tr></thead>
        <tbody>{records.map((item) => <tr className="border-b border-slate-100 dark:border-slate-800" key={item.id}><td className="p-2"><strong>{item.customer}</strong><br /><span className="text-slate-500">{item.email}</span></td><td className="p-2 capitalize">{item.plan}</td><td className="p-2">{item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-2">{item.dueDate.split('-').reverse().join('/')}</td><td className="p-2"><select className={inputClass} value={item.status} onChange={(e) => updateStatus(item.id, e.target.value as BillingStatus)}><option value="pendente">Pendente</option><option value="pago">Pago</option><option value="atrasado">Atrasado</option><option value="cancelado">Cancelado</option></select></td><td className="p-2"><button className="text-red-600 hover:underline" onClick={() => persist(records.filter((record) => record.id !== item.id))}>Excluir</button></td></tr>)}</tbody>
      </table>}
    </Card>
    <p className="mt-3 text-xs text-slate-500">Dados salvos somente neste navegador. Cobranças reais exigem integração segura com um servidor e provedor de pagamento.</p>
  </>;
}
