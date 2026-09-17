import { useMemo, useRef, useState, useEffect } from 'react';
import { Check, Copy, CircleCheck, Gift, QrCode, Search, Sparkles, Ticket, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ActiveCouponCard, couponValue } from '../components/CouponCards.jsx';
import Navbar from '../components/Navbar.jsx';
import PublicMenu from '../components/PublicMenu.jsx';
import { toast, Modal } from '../components/ui.jsx';

export default function Home() {
  const { user, isAuthed } = useAuth();
  const { settings } = useTheme();
  const currency = settings.currency || '$';

  const [tab, setTab] = useState('catalog');
  const [catalog, setCatalog] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [confirmCoupon, setConfirmCoupon] = useState(null);
  const [showSearchFab, setShowSearchFab] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSearchFab(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const focusSearch = () => {
    const el = document.getElementById('menu-search');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus({ preventScroll: true }), 450);
  };

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

  const activeQr = useMemo(() => String(activeCoupon?.qr_code || '').trim(), [activeCoupon]);
  const [activeQrImg, setActiveQrImg] = useState('');
  const [qrCopied, setQrCopied] = useState(false);

  useEffect(() => {
    if (!activeQr) {
      setActiveQrImg('');
      return;
    }
    QRCode.toDataURL(activeQr, { margin: 1, width: 520, color: { dark: '#111827', light: '#ffffff' } })
      .then(setActiveQrImg)
      .catch(() => setActiveQrImg(''));
  }, [activeQr]);

  const copyActiveQr = async () => {
    try {
      await navigator.clipboard.writeText(activeQr);
      setQrCopied(true);
      setTimeout(() => setQrCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

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
      setConfirmCoupon(null);
    }
  };

  const CatalogCard = ({ c }) => {
    const isActiveCoupon = activeCoupon?.coupon_id === c.id;
    const disabled = Boolean(activeCoupon) && !isActiveCoupon;

    const band =
      c.type === 'descuento'
        ? { cls: 'tile-sky', chip: 'dark:bg-sky-500/15', text: 'text-sky-800 dark:text-sky-300' }
        : c.type === 'regalo'
        ? { cls: 'tile-rose', chip: 'dark:bg-rose-500/15', text: 'text-rose-800 dark:text-rose-300' }
        : { cls: 'tile-lemon', chip: 'dark:bg-amber-500/15', text: 'text-amber-800 dark:text-amber-300' };

    return (
      <div className="tile flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
        <div className={`flex items-center justify-between gap-3 px-5 py-4 ${band.cls}`}>
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-xs font-black ${band.chip} ${band.text}`}>
            <Ticket size={12} />
            {c.type === 'monto' ? 'Recompensa' : c.type === 'descuento' ? 'Descuento' : 'Regalo'}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1 text-xs font-black ${band.chip} ${band.text}`}>
            <Zap size={12} /> {Number(c.target_points)} pts
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 pt-4">
          <p className="text-3xl font-black text-ink drop-shadow-sm">{couponValue(c, currency)}</p>
          <h3 className="mt-1 font-extrabold text-ink">{c.title}</h3>
          {c.description && <p className="mt-1 text-sm text-ink-muted">{c.description}</p>}

        <div className="mt-auto pt-4">
          {isActiveCoupon ? (
            <span className="block rounded-full bg-emerald-100 px-3 py-2 text-center text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              ✓ Tu cupón activo
            </span>
          ) : !isAuthed ? (
            <Link to="/login" className="btn-secondary block text-center text-sm">
              Ingresá con Google y activá
            </Link>
          ) : disabled ? (
            <span className="block rounded-full bg-surface-alt px-3 py-2 text-center text-xs font-black text-ink-muted">
              Completá tu cupón activo
            </span>
          ) : (
            <button
              className="btn-primary w-full justify-center text-sm"
              disabled={activating === c.id}
              onClick={() => setConfirmCoupon(c)}
            >
              {activating === c.id ? 'Activando…' : 'Activar este cupón'}
            </button>
          )}
        </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-aurora min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-12 pb-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-strong to-primary-soft p-8 text-primary-contrast shadow-glow sm:p-12">
          <div className="orb -right-16 -top-16 h-64 w-64 bg-primary-contrast/15" />
          <div className="orb -bottom-24 right-32 h-52 w-52 bg-primary-contrast/12" />

          <div className="relative flex items-center justify-between gap-10">
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

            <div className="relative hidden shrink-0 gap-3 lg:grid">
              <div className="tile tile-mint flex items-center gap-3 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300">
                  <QrCode size={18} />
                </span>
                <div>
                  <p className="text-sm font-black text-ink">Tu QR personal</p>
                  <p className="text-xs text-ink-muted">Escanealo al pagar</p>
                </div>
              </div>
              <div className="tile tile-peach flex items-center gap-3 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 text-orange-700 shadow-sm dark:bg-orange-500/15 dark:text-orange-300">
                  <Zap size={18} />
                </span>
                <div>
                  <p className="text-sm font-black text-ink">Sumás puntos</p>
                  <p className="text-xs text-ink-muted">Con cada compra</p>
                </div>
              </div>
              <div className="tile tile-lilac flex items-center gap-3 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="text-sm font-black text-ink">Canjeá tu premio</p>
                  <p className="text-xs text-ink-muted">Al completar el cupón</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="tile tile-mint relative overflow-hidden p-6 transition-transform hover:-translate-y-1 md:col-span-2">
            <div className="orb -right-10 -top-14 h-40 w-40 bg-white/50" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300">
                <QrCode size={22} />
              </div>
              <div>
                <h2 className="font-extrabold text-ink">Tu código QR</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Un código único que te identifica al pagar en el local.
                </p>
              </div>
            </div>
          </div>
          <div className="tile tile-peach relative overflow-hidden p-6 transition-transform hover:-translate-y-1">
            <div className="orb -right-8 -top-12 h-32 w-32 bg-white/50" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 text-orange-700 shadow-sm dark:bg-orange-500/15 dark:text-orange-300">
                <CircleCheck size={22} />
              </div>
              <h2 className="mt-3 font-extrabold text-ink">El local suma tus puntos</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Al pagar, el local verifica tus requisitos y suma puntos a tu cupón activo.
              </p>
            </div>
          </div>
          <div className="tile tile-lilac relative overflow-hidden p-6 transition-transform hover:-translate-y-1 md:col-span-3">
            <div className="orb -left-8 -bottom-14 h-36 w-36 bg-white/50" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-violet-700 shadow-sm dark:bg-violet-500/15 dark:text-violet-300">
                <Sparkles size={22} />
              </div>
              <div className="flex-1">
                <h2 className="font-extrabold text-ink">Completá y canjeá</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Al llegar al objetivo te damos un código para canjear en el local y activás el siguiente.
                </p>
              </div>
            </div>
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
                  <Link to="/login" className="btn-primary mx-auto mt-4 w-fit text-sm">
                    Ingresar con Google
                  </Link>
                </div>
              ) : activeCoupon ? (
                <div className="w-full">
                  <ActiveCouponCard coupon={activeCoupon} currency={currency} />

                  <div className="mt-4 rounded-3xl border border-line bg-white shadow-sm dark:bg-surface">
                    <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
                      <p className="text-sm font-black text-ink">
                        <QrCode size={16} className="mr-1.5 inline-block" />
                        QR de tu cupón activo
                      </p>
                      <button
                        className="btn-ghost cursor-pointer px-3 py-1 text-xs"
                        onClick={copyActiveQr}
                        title="Copiar código QR"
                      >
                        {qrCopied ? <Check size={13} className="inline-block" /> : <Copy size={13} className="inline-block" />}
                        <span className="ml-1 font-mono text-xs font-bold">{activeQr || '—'}</span>
                      </button>
                    </div>
                    <div className="flex flex-col items-center px-5 py-6 text-center">
                      {activeQrImg ? (
                        <img
                          src={activeQrImg}
                          alt={`Código QR ${activeQr}`}
                          className="h-64 w-64 sm:h-72 sm:w-72"
                        />
                      ) : (
                        <div className="flex h-64 w-64 items-center justify-center text-sm font-bold text-ink-muted">
                          <Sparkles className="animate-pulse" size={22} />
                        </div>
                      )}
                      <p className="mt-4 max-w-xs text-sm font-semibold text-ink-muted">
                        Mostrá este código al pagar para que el local te sume puntos a este cupón.
                      </p>
                    </div>
                  </div>

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
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <>
                  <div className="card h-64 animate-pulse" />
                  <div className="card h-64 animate-pulse" />
                  <div className="card h-64 animate-pulse" />
                </>
              ) : catalog.length === 0 ? (
                <div className="card col-span-full border-2 border-dashed border-line p-10 text-center">
                  {isAuthed && activeCoupon ? (
                    <>
                      <Ticket size={36} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                      <p className="mt-3 font-extrabold text-ink">
                        Ya activaste el cupón “{activeCoupon.title}”
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">Completalo para poder activar uno nuevo.</p>
                    </>
                  ) : (
                    <p className="text-ink-muted">No hay cupones disponibles por ahora.</p>
                  )}
                </div>
              ) : (
                catalog.map((c) => <CatalogCard key={c.id} c={c} />)
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
            <Link to="/login" className="btn-primary text-base">
              <QrCode size={18} />
              Ingresá con Google y empezá a sumar
            </Link>
          )}
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-sm text-ink-muted">
        © {new Date().getFullYear()} {settings.businessName || 'Fidelización App'} · {currency} moneda configurable desde el panel
      </footer>

      {showSearchFab && (
        <div className="fixed bottom-6 left-4 z-40 flex items-center gap-2 sm:left-6">
          {isAuthed && (
            <Link
              to="/cupones"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-strong px-4 py-3 text-sm font-extrabold text-primary-contrast shadow-glow transition-transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Gift size={17} className="transition-transform group-hover:-rotate-6" />
              Ver cupones
            </Link>
          )}
          <button
            onClick={focusSearch}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow transition-all hover:scale-105 active:scale-95"
            aria-label="Buscar en el menú"
            title="Buscar en el menú"
          >
            <Search size={20} />
          </button>
        </div>
      )}

      <Modal open={!!confirmCoupon} onClose={() => { if (!activating) setConfirmCoupon(null); }} title="¿Seguro querés activar este cupón?">
        {confirmCoupon && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface-alt p-4 text-center">
              <p className="text-3xl font-black text-ink">{couponValue(confirmCoupon, currency)}</p>
              <p className="mt-1 font-bold text-ink">{confirmCoupon.title}</p>
              {confirmCoupon.description && (
                <p className="mt-1 text-sm text-ink-muted">{confirmCoupon.description}</p>
              )}
            </div>
            <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-800 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200">
              Una vez activado tendrás que completarlo para obtener otro cupón.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setConfirmCoupon(null)} disabled={!!activating}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={() => activate(confirmCoupon)} disabled={!!activating}>
                {activating === confirmCoupon.id ? (
                  <>
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                    Activando...
                  </>
                ) : (
                  <Zap size={15} />
                )}
                Sí, activar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}