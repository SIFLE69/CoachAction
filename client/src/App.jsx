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

function MobileHeader() {
  const { setSidebarOpen, instituteName } = useUI();
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-black text-sm shadow-sm">C</div>
        <p className="text-lg font-bold tracking-tight truncate max-w-[150px]">{instituteName}</p>
      </div>
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-lg hover:bg-[var(--border-subtle)] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
      </button>
    </header>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <p className="text-surface-500 dark:text-surface-400 text-sm font-medium animate-pulse tracking-wide italic">Preparing your dashboard...</p>
    </div>
  );
  return user ? (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg-main)]">
      {/* Sidebar for desktop + Mobile header */}
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <MobileHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
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
