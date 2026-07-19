import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Moon,
  NotebookPen,
  Salad,
  Settings,
  Shield,
  Sun,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { applyTheme, getStoredTheme, type ThemeMode } from '../lib/theme';
import { NotificationScheduler } from './NotificationScheduler';
import { NotificationOnboarding } from './NotificationOnboarding';
import { getTrialStatus } from '../lib/trial';

const navItems = [
  { to: '/', label: 'Hoje', icon: LayoutDashboard },
  { to: '/calendar', label: 'Agenda', icon: CalendarDays },
  { to: '/studies', label: 'Faculdade', icon: BookOpen },
  { to: '/tools', label: 'Ferramentas', icon: Calculator },
  { to: '/notes', label: 'Anotações IA', icon: NotebookPen },
  { to: '/internship', label: 'Estágio', icon: BriefcaseBusiness },
  { to: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { to: '/finances', label: 'Finanças', icon: CreditCard },
  { to: '/meals', label: 'Bem-estar', icon: Salad },
  { to: '/goals', label: 'Metas', icon: Target },
  { to: '/settings', label: 'Ajustes', icon: Settings }
];

export function AppShell() {
  const { signOut, user, isAdmin } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const trial = user?.email && !isAdmin ? getTrialStatus(user.email) : null;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <NotificationScheduler />
      <NotificationOnboarding />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white/95 px-4 py-5 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-lg bg-brand-600 font-bold text-white">VX</div>
          <div>
            <p className="text-lg font-bold">VERTEX</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Estudo, estágio e finanças</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-100'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
              <Shield size={18} />
              Super Admin
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="safe-top sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-3 pb-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">Sua rotina organizada</p>
              <h1 className="truncate text-lg font-bold sm:text-xl">Olá, {user?.user_metadata?.full_name ?? user?.email}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button onClick={toggleTheme} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" title={theme === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" title="Notificações">
                <Bell size={18} />
              </button>
              <button onClick={signOut} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" title="Sair">
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <nav className="mobile-scroll mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                <Shield size={16} />
                Super Admin
              </NavLink>
            )}
          </nav>
        </header>
        <main className="safe-bottom mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
          {trial && <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">Período de teste: <strong>{trial.remainingDays} {trial.remainingDays === 1 ? 'dia restante' : 'dias restantes'}</strong>.</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
