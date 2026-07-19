import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTrialStatus } from '../lib/trial';

export function ProtectedRoute() {
  const { user, loading, isAdmin, isBlocked, signOut } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Carregando VERTEX...</div>;
  }

  if (user && isBlocked) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-xl font-bold">Conta bloqueada</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Seu acesso foi bloqueado pelo administrador do VERTEX.</p>
          <button
            onClick={signOut}
            className="mt-5 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  const trial = user?.email && !isAdmin ? getTrialStatus(user.email) : null;
  if (user && trial?.expired) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-xl font-bold">Período de teste encerrado</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Os 7 dias de teste do VERTEX terminaram. Entre em contato com o administrador para continuar.</p>
          <button onClick={signOut} className="mt-5 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Sair</button>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function SuperAdminRoute() {
  const { user, loading, isAdmin, isBlocked } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Carregando VERTEX...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (isBlocked) return <Navigate to="/login" replace />;

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
