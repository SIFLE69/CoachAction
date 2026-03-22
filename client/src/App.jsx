import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider, useUI } from './context/UIContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import BatchesPage from './pages/BatchesPage';
import AttendancePage from './pages/AttendancePage';
import FeesPage from './pages/FeesPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <p className="text-surface-500 dark:text-surface-400 text-sm font-medium animate-pulse tracking-wide italic">Preparing your dashboard...</p>
    </div>
  );
  return user ? (
    <div className="flex min-h-screen bg-[var(--bg-main)] selection:bg-primary-500/30 selection:text-primary-900 dark:selection:text-primary-100 italic-selection">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto scroll-smooth">{children}</main>
    </div>
  ) : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/students" element={<PrivateRoute><StudentsPage /></PrivateRoute>} />
      <Route path="/batches" element={<PrivateRoute><BatchesPage /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/fees" element={<PrivateRoute><FeesPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </UIProvider>
    </BrowserRouter>
  );
}
