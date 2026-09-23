import { useMemo, useState, useEffect } from 'react';
import { Check, CircleCheck, Copy, QrCode, Sparkles, Ticket, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { couponValue, useProgressBar } from '../components/CouponCards.jsx';
import Navbar from '../components/Navbar.jsx';
import Logo from '../components/Logo.jsx';
import PublicMenu from '../components/PublicMenu.jsx';
import { toast, Modal } from '../components/ui.jsx';

// Colores por tipo de cupón (mismos matices que tile-sky / tile-rose / tile-lemon)
const TYPE_TONE = {
  descuento: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  regalo: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
  monto: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
};
const typeLabel = (t) => (t === 'descuento' ? 'Descuento' : t === 'regalo' ? 'Regalo' : 'Recompensa');

const STEPS = ['Activá un cupón', 'Mostrá tu QR al pagar', 'Completalo y canjealo'];

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
      <Sparkles size={13} />
      {children}
    </span>
  );
}

function ActiveStrip({ coupon, currency, onQr, onHow }) {
  const points = Number(coupon.points) || 0;
  const target = Math.max(1, Number(coupon.target_points) || 1);
  const pct = Math.min(100, Math.round((points / target) * 100));
  const fill = useProgressBar(pct);
  const left = Math.max(0, target - points);

  return (
    <div className="relative min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-strong p-5 text-primary-contrast shadow-glow sm:p-8">
      <div className="orb -right-16 -top-16 h-56 w-56 bg-primary-contrast/10" />
      <div className="relative flex items-center justify-between gap-3">
        <Eyebrow>Tu cupón activo · {typeLabel(coupon.type)}</Eyebrow>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-extrabold">{pct}%</span>
      </div>
      <h1 className="relative mt-4 font-heading text-[28px] font-bold leading-[1.05] [overflow-wrap:anywhere] sm:text-[40px]">
        {coupon.type === 'regalo' ? coupon.title : `${couponValue(coupon, currency)} · ${coupon.title}`}
      </h1>
      {coupon.description && <p className="relative mt-2 max-w-xl text-[15px] leading-relaxed opacity-85">{coupon.description}</p>}
      <div className="relative mt-5 max-w-xl">
        <div className="h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-1000 ease-out"
            style={{ width: `${fill}%` }}
          >
            <div className="animate-shimmer absolute inset-0 rounded-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55)_42%,rgba(255,255,255,0.55)_50%,transparent_58%)] bg-[length:200%_100%]" />
          </div>
        </div>
        <p className="mt-2 text-sm font-bold">
          {points}/{target} puntos
          <span className="font-medium opacity-80">
            {left > 0 ? ` · te faltan ${left} ${left === 1 ? 'compra' : 'compras'}` : ' · ¡listo para canjear!'}
          </span>
        </p>
      </div>
      <div className="relative mt-6 flex flex-wrap gap-2">
        <button
          onClick={onQr}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary-strong transition hover:-translate-y-0.5 active:scale-95"
        >
          <QrCode size={16} /> Mostrar mi QR
        </button>
        <button
          onClick={onHow}
          className="inline-flex items-center justify-center rounded-full border border-white/35 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
        >
          Cómo funciona
        </button>
      </div>
    </div>
  );
}

function IntroStrip({ isAuthed, loginTo }) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-strong p-5 text-primary-contrast shadow-glow sm:p-8">
      <div className="orb -right-16 -top-16 h-56 w-56 bg-primary-contrast/10" />
      <div className="relative max-w-xl">
        <Eyebrow>Programa de fidelización</Eyebrow>
        <h1 className="mt-4 font-heading text-[28px] font-bold leading-[1.05] [overflow-wrap:anywhere] sm:text-[40px]">
          {isAuthed ? 'Elegí tu primer cupón' : 'Sumá compras, ganá premios'}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed opacity-85">
          {isAuthed
            ? 'Activá uno de los cupones disponibles y empezá a sumar puntos con cada compra.'
            : 'Ingresá con Google, activá un cupón y sumá puntos cada vez que pagás.'}
        </p>
      </div>
      <ol className="relative mt-6 grid gap-2 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-semibold">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-primary-strong">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      {!isAuthed && (
        <Link
          to={loginTo}
          className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary-strong transition hover:-translate-y-0.5"
        >
          Ingresá con Google y empezá a sumar
        </Link>
      )}
    </div>
  );
}

const flat = (v) => String(v || '').toLowerCase().replace(/\s+/g, '');

export default function Home() {
  const { user, isAuthed } = useAuth();
  const { settings } = useTheme();
  const { t } = useTenant();
  const currency = settings.currency || '$';

  const [catalog, setCatalog] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [confirmCoupon, setConfirmCoupon] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [query, setQuery] = useState('');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const activeCoupon = useMemo(() => mine.find((c) => c.status === 'activado') || null, [mine]);
  const readyCount = useMemo(() => mine.filter((c) => c.status === 'completado').length, [mine]);
  const others = useMemo(
    () => catalog.filter((c) => c.id !== activeCoupon?.coupon_id),
    [catalog, activeCoupon]
  );

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

  const CouponRow = ({ c }) => (
    <div className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 ${TYPE_TONE[c.type] || TYPE_TONE.monto}`}>
      <span className="w-[84px] shrink-0 font-heading text-lg font-bold leading-none sm:w-24 sm:text-xl">{couponValue(c, currency)}</span>
      <span className="line-clamp-2 min-w-0 flex-1 text-xs font-semibold leading-snug opacity-90">
        {flat(c.title) !== flat(couponValue(c, currency)) ? c.title : c.description || ''}
      </span>
      {!isAuthed ? (
        <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-extrabold dark:bg-white/10">
          {Number(c.target_points)} pts
        </span>
      ) : activeCoupon ? (
        <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-extrabold dark:bg-white/10">
          {Number(c.target_points)} pts
        </span>
      ) : (
        <button
          className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-contrast transition hover:bg-primary-strong disabled:opacity-50"
          disabled={activating === c.id}
          onClick={() => setConfirmCoupon(c)}
        >
          {activating === c.id ? 'Activando…' : `Activar · ${Number(c.target_points)} pts`}
        </button>
      )}
    </div>
  );

  return (
    <div className="page-aurora min-h-screen">
      <Navbar search={{ value: query, onChange: setQuery, placeholder: 'Buscar plato, bebida, postre…' }} />

      <main className={`mx-auto w-full min-w-0 max-w-[1600px] overflow-x-clip px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 ${isAuthed && activeCoupon ? 'pb-28 lg:pb-16' : 'pb-16'}`}>
        {/* Franja de fidelización: estado real del cliente en lugar del hero + 3 bloques explicativos */}
        <section className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
          {isAuthed && activeCoupon ? (
            <ActiveStrip
              coupon={activeCoupon}
              currency={currency}
              onQr={() => setQrOpen(true)}
              onHow={() => setHowOpen(true)}
            />
          ) : (
            <IntroStrip isAuthed={isAuthed} loginTo={t('/login')} />
          )}

          <div className="card flex min-w-0 flex-col gap-2.5 p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-heading text-base font-bold text-ink">
                {isAuthed && activeCoupon ? 'Tus próximos cupones' : 'Cupones disponibles'}
              </h2>
              {isAuthed && (
                <Link to={t('/cupones')} className="text-xs font-semibold text-primary-strong hover:underline">
                  Ver todos
                </Link>
              )}
            </div>
            {loading ? (
              <>
                <div className="h-12 animate-pulse rounded-2xl bg-surface-alt" />
                <div className="h-12 animate-pulse rounded-2xl bg-surface-alt" />
              </>
            ) : others.length === 0 ? (
              <p className="py-3 text-sm text-ink-muted">No hay otros cupones por ahora.</p>
            ) : (
              others.slice(0, 3).map((c) => <CouponRow key={c.id} c={c} />)
            )}
            <p className="text-[11px] text-ink-muted">
              {!isAuthed
                ? 'Iniciá sesión para activar uno.'
                : activeCoupon
                ? 'Se activan cuando completás el cupón actual.'
                : 'Podés tener un cupón activo a la vez.'}
            </p>
            {readyCount > 0 && (
              <Link to={t('/perfil')} className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400">
                Tenés {readyCount} cupón{readyCount > 1 ? 'es' : ''} listo{readyCount > 1 ? 's' : ''} para canjear →
              </Link>
            )}

          </div>
        </section>

        <PublicMenu query={query} onQueryChange={setQuery} />
      </main>

      <footer className="border-t border-line py-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo size="md" showText={false} />
          <p className="min-w-0 truncate text-sm text-ink-muted">
            <span className="font-extrabold text-ink">{settings.businessName || 'Fidelización App'}</span>
            {settings.tagline && <span> · {settings.tagline}</span>}
          </p>
        </div>
      </footer>

      {/* Mobile: píldora fija con el cupón activo + acceso al QR */}
      {isAuthed && activeCoupon && (
        <div className="fixed inset-x-4 bottom-5 z-40 flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-surface-page shadow-2xl lg:hidden dark:bg-surface dark:text-ink dark:border dark:border-line">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">
            {activeCoupon.title}
            <span className="opacity-65">
              {' '}· {Number(activeCoupon.points) || 0}/{Number(activeCoupon.target_points) || 0}
            </span>
          </span>
          <button
            onClick={() => setQrOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-ink transition active:scale-95"
          >
            <QrCode size={15} /> Mi QR
          </button>
        </div>
      )}

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Tu QR">
        <div className="flex flex-col items-center text-center">
          {activeQrImg ? (
            <img src={activeQrImg} alt={`Código QR ${activeQr}`} className="h-64 w-64 sm:h-72 sm:w-72" />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center text-ink-muted">
              <Sparkles className="animate-pulse" size={22} />
            </div>
          )}
          <button className="btn-ghost mt-3 px-3 py-1 text-xs" onClick={copyActiveQr} title="Copiar código">
            {qrCopied ? <Check size={13} /> : <Copy size={13} />}
            <span className="font-mono text-xs font-bold tracking-widest">{activeQr || '—'}</span>
          </button>
          <p className="mt-4 max-w-xs text-sm font-semibold text-ink-muted">
            Mostrá este código al pagar para que el local te sume puntos.
          </p>
        </div>
      </Modal>

      <Modal open={howOpen} onClose={() => setHowOpen(false)} title="Cómo funciona">
        <ol className="space-y-4">
          {[
            [QrCode, 'Mostrá tu QR al pagar', 'Un código único que te identifica en el local.'],
            [CircleCheck, 'El local suma tus puntos', 'Verifica los requisitos y suma a tu cupón activo.'],
            [Zap, 'Completá y canjeá', 'Al llegar al objetivo recibís un código y activás el siguiente.'],
          ].map(([Icon, title, sub], i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong">
                <Icon size={18} />
              </span>
              <div>
                <p className="font-bold text-ink">{i + 1}. {title}</p>
                <p className="text-sm text-ink-muted">{sub}</p>
              </div>
            </li>
          ))}
        </ol>
      </Modal>

      <Modal
        open={!!confirmCoupon}
        onClose={() => {
          if (!activating) setConfirmCoupon(null);
        }}
        title="¿Seguro querés activar este cupón?"
      >
        {confirmCoupon && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface-alt p-4 text-center">
              <p className="text-3xl font-black text-ink">{couponValue(confirmCoupon, currency)}</p>
              <p className="mt-1 font-bold text-ink">{confirmCoupon.title}</p>
              {confirmCoupon.description && <p className="mt-1 text-sm text-ink-muted">{confirmCoupon.description}</p>}
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
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Ticket size={15} />
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
