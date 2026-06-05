import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { MouseGlow } from './components/ui/Dynamic';
import { LoadingSpinner } from './components/ui/Common';
import Layout from './components/layout/Layout';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EquipmentList = lazy(() => import('./pages/EquipmentList'));
const EquipmentDetail = lazy(() => import('./pages/EquipmentDetail'));
const KanbanBoard = lazy(() => import('./pages/KanbanBoard'));
const FaultDetail = lazy(() => import('./pages/FaultDetail'));
const SpareParts = lazy(() => import('./pages/SpareParts'));
const Notifications = lazy(() => import('./pages/Notifications'));

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-page-enter">
      {children}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<PublicRoute><PageTransition><Login /></PageTransition></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><PageTransition><Register /></PageTransition></PublicRoute>} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/equipment" element={<PageTransition><EquipmentList /></PageTransition>} />
          <Route path="/equipment/:id" element={<PageTransition><EquipmentDetail /></PageTransition>} />
          <Route path="/kanban" element={<PageTransition><KanbanBoard /></PageTransition>} />
          <Route path="/faults/:id" element={<PageTransition><FaultDetail /></PageTransition>} />
          <Route path="/spare-parts" element={<PageTransition><SpareParts /></PageTransition>} />
          <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <MouseGlow />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
