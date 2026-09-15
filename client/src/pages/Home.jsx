import { useEffect, useMemo, useState } from 'react';
import { CircleCheck, QrCode, Sparkles, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ActiveCouponCard, CatalogCouponCard } from '../components/CouponCards.jsx';
import Navbar from '../components/Navbar.jsx';
import PublicMenu from '../components/PublicMenu.jsx';
import { toast } from '../components/ui.jsx';

export default function Home() {
  const { user, isAuthed } = useAuth();
  const { settings } = useTheme();
  const currency = settings.currency || '$';

  const [tab, setTab] = useState('catalog');
  const [catalog, setCatalog] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  const loadCatalog = async () => {
    try {
      const res = await api('/api/coupons/catalog');
      setCatalog(res.coupons || []);
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMine = async () => {
    if (!isAuthed) return;
    try {
      const res = await api('/api/coupons/me');
      setMine(res.coupons || []);
    } catch (err) {
      toast(err.message);
    }
  };

  useEffect(() => {
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthed) loadMine();
  }, [isAuthed]);

  const activeCoupon = useMemo(() => mine.find((c) => c.status === 'activado') || null, [mine]);
  const readyCount = useMemo(() => mine.filter((c) => c.status === 'completado').length, [mine]);

  const activate = async (coupon) => {
    setActivating(coupon.id);
    try {
      await api('/api/coupons/activate', { method: 'POST', body: { coupon_id: coupon.id } });
      toast('Cupón activado. ¡Empezá a sumar puntos!');
      await loadMine();
    } catch (err) {
      toast(err.message);
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-12 pb-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-strong to-primary-soft p-8 text-primary-contrast shadow-glow sm:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary-contrast/10" />
          <div className="absolute -bottom-14 right-24 h-40 w-40 rounded-full bg-primary-contrast/10" />
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-contrast/15 px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <Sparkles size={14} />
              Programa de fidelización
            </span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
              Sumá compras, ganá premios
            </h1>
            <p className="mt-3 text-sm text-primary-contrast/85 sm:text-base">
              Activá un cupón, mostrá tu código QR al pagar y empezá a sumar puntos para canjearlo.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <QrCode size={22} />
            </div>
            <h2 className="mt-3 font-extrabold text-ink">Tu código QR</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Un código único que te identifica al pagar en el local.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <CircleCheck size={22} />
            </div>
            <h2 className="mt-3 font-extrabold text-ink">El local suma tus puntos</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Al pagar, el local verifica tus requisitos y suma puntos a tu cupón activo.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
              <Sparkles size={22} />
            </div>
            <h2 className="mt-3 font-extrabold text-ink">Completá y canjeá</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Al llegar al objetivo te damos un código para canjear en el local y activás el siguiente.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">Cupones</h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Elegí el premio que querés ganar y empezá a sumar puntos.
              </p>
            </div>
            <div className="flex gap-2 rounded-2xl bg-surface-alt p-1">
              <button
                className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${
                  tab === 'catalog' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
                onClick={() => setTab('catalog')}
              >
                Cupones
              </button>
              <button
                className={`rounded-xl px-4 py-2 text-sm font-extrabold transition ${
                  tab === 'activos' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
                }`}
                onClick={() => setTab('activos')}
              >
                Ver cupones activos
              </button>
            </div>
          </div>

          {tab === 'activos' ? (
            <div className="mt-6">
              {!isAuthed ? (
                <div className="card border-2 border-dashed border-line p-10 text-center">
                  <Ticket size={36} className="mx-auto text-ink-muted" />
                  <p className="mt-3 font-extrabold text-ink">Iniciá sesión para ver tus cupones activos</p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link to="/login" className="btn-primary text-sm">Ingresar</Link>
                    <Link to="/registro" className="btn-secondary text-sm">Crear cuenta</Link>
                  </div>
                </div>
              ) : activeCoupon ? (
                <div className="w-full">
                  <ActiveCouponCard coupon={activeCoupon} currency={currency} />
                  {readyCount > 0 && (
                    <p className="mt-3 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Tenés {readyCount} cupón{readyCount > 1 ? 'es' : ''} listo{readyCount > 1 ? 's' : ''} para canjear
                      <Link to="/perfil" className="ml-1 underline">ver en tu perfil</Link>
                    </p>
                  )}
                </div>
              ) : (
                <div className="card border-2 border-dashed border-line p-10 text-center">
                  <Sparkles size={36} className="mx-auto text-ink-muted" />
                  <p className="mt-3 font-extrabold text-ink">No tenés cupones activos</p>
                  <p className="mt-1 text-sm text-ink-muted">Activá uno de la lista y empezá a sumar puntos.</p>
                  <button className="btn-primary mx-auto mt-4 text-sm" onClick={() => setTab('catalog')}>
                    Ver cupones disponibles
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <>
                  <div className="card h-64 animate-pulse" />
                  <div className="card h-64 animate-pulse" />
                  <div className="card h-64 animate-pulse" />
                </>
              ) : catalog.length === 0 ? (
                <div className="card col-span-full border-2 border-dashed border-line p-10 text-center text-ink-muted">
                  No hay cupones disponibles por ahora.
                </div>
              ) : (
                catalog.map((c, i) => (
                  <CatalogCouponCard
                    key={c.id}
                    c={c}
                    currency={currency}
                    index={i}
                    state={{
                      isAuthed,
                      isActiveCoupon: activeCoupon?.coupon_id === c.id,
                      disabled: Boolean(activeCoupon) && activeCoupon?.coupon_id !== c.id,
                      activating: activating === c.id,
                      onActivate: () => activate(c),
                    }}
                  />
                ))
              )}
            </div>
          )}
        </section>

        <PublicMenu />

        <section className="mt-12 text-center">
          {isAuthed ? (
            <Link
              to={user?.role === 'admin' ? '/dashboard' : '/perfil'}
              className="btn-primary text-base"
            >
              {user?.role === 'admin' ? 'Ir al panel' : <QrCode size={18} className="inline-block" />}
              {user?.role === 'admin' ? '' : ' Ver mi QR y cupones'}
            </Link>
          ) : (
            <Link to="/registro" className="btn-primary text-base">
              <QrCode size={18} />
              Creá tu cuenta y empezá a sumar
            </Link>
          )}
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-ink-muted">
        © {new Date().getFullYear()} Fidelización App · {currency} moneda configurable desde el panel
      </footer>
    </div>
  );
}