import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
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

function RequireAdmin({ children }) {
  const { isAuthed, user } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Navigate to="/login" replace />} />
      <Route
        path="/perfil"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/notificaciones"
        element={
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/cupones"
        element={
          <RequireAuth>
            <CouponsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/configuracion"
        element={
          <RequireAuth>
            <UserSettings />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
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
        <Route path="configuracion" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}