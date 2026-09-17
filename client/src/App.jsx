import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './context/AuthContext.jsx';
import { TenantProvider, useTenant } from './context/TenantContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import CouponsPage from './pages/CouponsPage.jsx';
import UserSettings from './pages/UserSettings.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import DashboardLayout from './pages/dashboard/DashboardLayout.jsx';
import MenuManager from './pages/dashboard/MenuManager.jsx';
import Clients from './pages/dashboard/Clients.jsx';
import ClientDetail from './pages/dashboard/ClientDetail.jsx';
import ScanPage from './pages/dashboard/ScanPage.jsx';
import Coupons from './pages/dashboard/Coupons.jsx';
import SettingsPage from './pages/dashboard/SettingsPage.jsx';
import SupportPage from './pages/dashboard/SupportPage.jsx';
import SuperAdmin from './pages/superadmin/SuperAdmin.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Landing from './pages/Landing.jsx';

function RequireAdmin({ children }) {
  const { isAuthed, user } = useAuth();
  const { t } = useTenant();
  if (!isAuthed) return <Navigate to={t('/login')} replace />;
  if (user?.role !== 'admin') return <Navigate to={t('/')} replace />;
  return children;
}

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  const { t } = useTenant();
  if (!isAuthed) return <Navigate to={t('/login')} replace />;
  return children;
}

// Mientras la landing no está, la raíz redirige al perfil principal.
function DefaultRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    api('/api/tenants/default')
      .then(({ slug }) => navigate(`/${slug}`, { replace: true }))
      .catch(() => navigate('/perks/admin', { replace: true }));
  }, [navigate]);
  return null;
}

function RedirectHome() {
  const { home } = useTenant();
  return <Navigate to={home()} replace />;
}

function TenantApp() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="registro" element={<Navigate to="login" replace />} />
      <Route
        path="perfil"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="notificaciones"
        element={
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="cupones"
        element={
          <RequireAuth>
            <CouponsPage />
          </RequireAuth>
        }
      />
      <Route
        path="configuracion"
        element={
          <RequireAuth>
            <UserSettings />
          </RequireAuth>
        }
      />
      <Route
        path="dashboard"
        element={
          <RequireAdmin>
            <DashboardLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<MenuManager />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="clientes" element={<Clients />} />
        <Route path="cliente/:id" element={<ClientDetail />} />
        <Route path="escanear" element={<ScanPage />} />
        <Route path="cupones" element={<Coupons />} />
        <Route path="soporte" element={<SupportPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<RedirectHome />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/perks/admin" element={<SuperAdmin />} />
      <Route path="/comenzar" element={<Onboarding />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/demo" element={<DefaultRedirect />} />
      <Route
        path="/:slug"
        element={
          <TenantProvider>
            <TenantApp />
          </TenantProvider>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}