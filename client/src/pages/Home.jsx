import { useMemo, useState, useEffect } from 'react';
import { Check, CircleCheck, Copy, Gift, QrCode, Sparkles, Ticket, Trophy, Zap } from 'lucide-react';
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
import { ContactFab, SiteFooter } from '../components/SiteFooter.jsx';
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
  const menuEnabled = settings.menuEnabled !== 'false';

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

  const couponsOnlyMode = !menuEnabled;

  return (
    <div className="page-aurora min-h-screen">
      <Navbar search={menuEnabled ? { value: query, onChange: setQuery, placeholder: 'Buscar plato, bebida, postre…' } : undefined} />

      <main className={`mx-auto w-full min-w-0 max-w-[1600px] overflow-x-clip px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 ${isAuthed && activeCoupon ? 'pb-28 lg:pb-16' : 'pb-16'}`}>
        {couponsOnlyMode ? (
          // MODO SOLO CUPONES - Diseño especial
          <>
            {/* Hero solo cupones */}
            <section className="mb-8">
              {isAuthed && activeCoupon ? (
                <ActiveStrip
                  coupon={activeCoupon}
                  currency={currency}
                  onQr={() => setQrOpen(true)}
                  onHow={() => setHowOpen(true)}
                />
              ) : (
                <div className="relative min-w-0 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-strong p-6 text-primary-contrast shadow-glow sm:p-10">
                  <div className="orb -right-16 -top-16 h-56 w-56 bg-primary-contrast/10" />
                  <div className="relative max-w-2xl">
                    <Eyebrow>Programa de fidelización</Eyebrow>
                    <h1 className="mt-4 font-heading text-3xl font-bold leading-tight [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
                      {isAuthed ? 'Tus cupones especiales' : 'Gana cupones cada compra'}
                    </h1>
                    <p className="mt-4 text-base leading-relaxed opacity-90 sm:text-lg">
                      {isAuthed
                        ? 'Activa un cupón, suma puntos y canjea tus premios. Todo en un solo lugar.'
                        : 'Ingresa con Google, elige tu primer cupón y comienza a ganar puntos con cada compra.'}
                    </p>
                    {!isAuthed && (
                      <Link
                        to={t('/login')}
                        className="relative mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-base font-bold text-primary-strong transition hover:-translate-y-0.5"
                      >
                        Inicia sesión y comienza ahora
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Grid de cupones grande */}
            <section className="mb-8">
              <div className="flex items-baseline justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                    {isAuthed && activeCoupon ? 'Tus próximos premios' : 'Cupones disponibles'}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {isAuthed && activeCoupon
                      ? 'Se activan cuando completás el cupón actual'
                      : 'Elige el que más te guste'}
                  </p>
                </div>
                {isAuthed && (
                  <Link to={t('/cupones')} className="text-sm font-bold text-primary-strong hover:underline">
                    Ver más
                  </Link>
                )}
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-80 animate-pulse rounded-3xl bg-surface-alt" />
                  ))}
                </div>
              ) : others.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-line bg-surface-alt/50 py-16 text-center">
                  <Gift size={40} className="mx-auto mb-4 text-ink-muted opacity-40" />
                  <p className="text-lg font-semibold text-ink-muted">No hay otros cupones por ahora</p>
                  <p className="text-sm text-ink-muted mt-1">Vuelve pronto para descubrir más premios</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {others.map((c) => (
                    <div
                      key={c.id}
                      className={`group flex flex-col items-center gap-4 rounded-3xl border-2 p-6 text-center transition ${TYPE_TONE[c.type] || TYPE_TONE.monto} ${
                        isAuthed && !activeCoupon ? 'cursor-pointer hover:shadow-lg hover:border-current' : ''
                      }`}
                      onClick={() => isAuthed && !activeCoupon && setConfirmCoupon(c)}
                    >
                      <div className="text-5xl font-black leading-none sm:text-6xl">
                        {couponValue(c, currency)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg leading-tight">{c.title}</p>
                        {c.description && (
                          <p className="text-sm mt-2 leading-relaxed opacity-75">{c.description}</p>
                        )}
                      </div>
                      <div className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/20 px-4 py-2.5 text-sm font-bold">
                        <Ticket size={16} />
                        {Number(c.target_points)} compras
                      </div>
                      {isAuthed && !activeCoupon && (
                        <button className="w-full rounded-2xl bg-primary text-primary-contrast font-bold py-3 transition hover:bg-primary-strong active:scale-95">
                          Activar ahora
                        </button>
                      )}
                      {isAuthed && activeCoupon && (
                        <span className="text-xs font-semibold opacity-70">Disponible después</span>
                      )}
                      {!isAuthed && (
                        <span className="text-xs font-semibold opacity-70">Inicia sesión para activar</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {readyCount > 0 && (
                <div className="mt-8 rounded-3xl border-2 border-dashed border-emerald-400/60 bg-emerald-50 p-6 text-center dark:border-emerald-400/40 dark:bg-emerald-400/10">
                  <Trophy size={28} className="mx-auto mb-3 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-bold text-lg text-emerald-900 dark:text-emerald-200">
                    ¡Tenés premios listos! 🎉
                  </p>
                  <p className="text-sm mt-2 text-emerald-800 dark:text-emerald-300">
                    {readyCount} cupón{readyCount > 1 ? 'es' : ''} completad{readyCount > 1 ? 'os' : 'o'} para canjear
                  </p>
                  <Link
                    to={t('/perfil')}
                    className="inline-block mt-4 rounded-full bg-emerald-600 text-white px-5 py-2.5 font-bold text-sm transition hover:bg-emerald-700"
                  >
                    Ver mis premios
                  </Link>
                </div>
              )}
            </section>
          </>
        ) : (
          // MODO NORMAL - Layout original
          <>
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

            {menuEnabled && <PublicMenu query={query} onQueryChange={setQuery} />}
          </>
        )}
      </main>

      <SiteFooter />
      <ContactFab raised={Boolean(isAuthed && activeCoupon)} />

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

      <Modal open={howOpen} onClose={() => setHowOpen(false)} title="Cómo funciona" subtitle="Tres pasos, sin tarjetas de papel.">
        <ol className="relative space-y-1">
          <span className="absolute bottom-8 left-[21px] top-8 w-0.5 rounded-full bg-gradient-to-b from-primary via-primary/50 to-emerald-400" />
          {[
            [QrCode, 'Mostrá tu QR al pagar', 'Es único y te identifica en el local. Lo tenés siempre en “Mi QR”.'],
            [CircleCheck, 'El local suma tus puntos', 'Cada compra que cumpla los requisitos suma 1 punto a tu cupón activo.'],
            [Zap, 'Completá y canjeá', 'Al llegar al objetivo recibís un código para canjear y ya podés activar el siguiente.'],
          ].map(([Icon, title, sub], i) => (
            <li key={title} className="relative flex items-start gap-4 rounded-2xl p-1.5">
              <span
                className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-4 ring-surface ${
                  i === 2 ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-primary to-primary-strong text-primary-contrast'
                }`}
              >
                <Icon size={19} />
              </span>
              <div className="min-w-0 pb-4 pt-0.5">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">Paso {i + 1}</p>
                <p className="font-heading text-lg font-bold leading-tight text-ink">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{sub}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-2 flex items-center gap-3 rounded-2xl bg-primary-softer px-4 py-3">
          <Ticket size={18} className="shrink-0 text-primary-strong" />
          <p className="text-sm text-ink">Podés tener <strong>un cupón activo a la vez</strong>. Cuando lo completás, elegís el próximo.</p>
        </div>
        <button className="btn-primary mt-4 w-full justify-center" onClick={() => setHowOpen(false)}>
          Entendido
        </button>
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
