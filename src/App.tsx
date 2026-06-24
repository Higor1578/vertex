import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute, SuperAdminRoute } from './components/ProtectedRoute';
import { AdminPage } from './pages/AdminPage';
import { CalendarPage } from './pages/CalendarPage';
import { DashboardPage } from './pages/DashboardPage';
import { FinancePage } from './pages/FinancePage';
import { GoalsPage } from './pages/GoalsPage';
import { InternshipPage } from './pages/InternshipPage';
import { LoginPage } from './pages/LoginPage';
import { MealsPage } from './pages/MealsPage';
import { NotesPage } from './pages/NotesPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudiesPage } from './pages/StudiesPage';
import { TasksPage } from './pages/TasksPage';
import { ToolsPage } from './pages/ToolsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="internship" element={<InternshipPage />} />
          <Route path="studies" element={<StudiesPage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="finances" element={<FinancePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route element={<SuperAdminRoute />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
