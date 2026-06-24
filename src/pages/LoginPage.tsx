import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock, Mail, UserPlus } from 'lucide-react';
import { Button, Card, Field, inputClass } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { sanitizeText } from '../lib/security';

export function LoginPage() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('demo@vertex.com');
  const [password, setPassword] = useState('demo12345');
  const [name, setName] = useState('Usuário VERTEX');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'login') await signIn(sanitizeText(email), password);
      else await signUp(sanitizeText(email), password, sanitizeText(name));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível autenticar.');
    } finally {
      setBusy(false);
    }
  }

  async function recover() {
    setBusy(true);
    try {
      await resetPassword(sanitizeText(email));
      setMessage('Se o email estiver cadastrado, enviaremos as instruções de recuperação.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível iniciar a recuperação.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex min-h-[42vh] flex-col justify-between bg-[linear-gradient(rgba(15,23,42,.45),rgba(15,23,42,.78)),url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center p-6 lg:min-h-screen lg:p-10">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-lg bg-brand-600 text-xl font-bold">VX</div>
          <span className="text-lg font-semibold">VERTEX</span>
        </div>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-normal sm:text-5xl">VERTEX</h1>
          <p className="mt-4 max-w-xl text-base text-slate-100 sm:text-lg">
            Tarefas, estudos, bem-estar, finanças, metas e anotações inteligentes em um único SaaS seguro e instalável.
          </p>
        </div>
      </section>
      <section className="grid place-items-center bg-slate-50 p-4 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <Card className="w-full max-w-md">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Use Supabase Auth em produção ou entre no modo demo local.</p>
          </div>
          <form className="grid gap-4" onSubmit={submit}>
            {mode === 'signup' && (
              <Field label="Nome">
                <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
              </Field>
            )}
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={17} />
                <input className={`${inputClass} pl-9`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
            </Field>
            <Field label="Senha">
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={17} />
                <input className={`${inputClass} pl-9`} type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
              </div>
            </Field>
            {message && <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-100">{message}</p>}
            <Button disabled={busy}>
              {mode === 'signup' && <UserPlus size={17} />}
              {mode === 'login' ? 'Entrar com segurança' : 'Criar conta'}
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
            <button className="text-brand-700 dark:text-brand-100" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
            </button>
            <button className="text-slate-500 dark:text-slate-400" onClick={recover}>Recuperar senha</button>
          </div>
        </Card>
      </section>
    </main>
  );
}
