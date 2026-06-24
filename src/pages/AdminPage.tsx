import { Card, PageTitle } from '../components/ui';

export function AdminPage() {
  const stats = [
    ['Total de usuários', '1.248'],
    ['Usuários ativos', '932'],
    ['Usuários bloqueados', '7'],
    ['Planos premium', '318'],
    ['Assinaturas anuais', '96'],
    ['Logs hoje', '4.812']
  ];

  return (
    <>
      <PageTitle title="Super Admin" subtitle="Painel do SaaS sem acesso a dados privados dos usuários." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value]) => <Card key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></Card>)}
      </div>
      <Card className="mt-4">
        <h3 className="mb-3 font-semibold">Planos</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {['Gratuito: limites de tarefas e notificações', 'Premium Mensal: limites ampliados e IA', 'Premium Anual: prioridade e economia'].map((plan) => <div className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-800" key={plan}>{plan}</div>)}
        </div>
      </Card>
      <Card className="mt-4">
        <h3 className="mb-3 font-semibold">Logs do sistema</h3>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>auth.sign_in · usuário autenticado · sem payload privado</p>
          <p>billing.subscription_updated · plano alterado · metadados administrativos</p>
          <p>security.rate_limit · tentativa bloqueada · IP truncado</p>
        </div>
      </Card>
    </>
  );
}
