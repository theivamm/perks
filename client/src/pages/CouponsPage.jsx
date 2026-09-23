import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgePercent, Check, CheckCircle2, Copy, Gift, QrCode, Sparkles, Ticket, Zap } from 'lucide-react';
import QRCode from 'qrcode';
import { api, formatDate } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { ReadyCouponCard, couponValue, useProgressBar } from '../components/CouponCards.jsx';
import Navbar from '../components/Navbar.jsx';
import { EmptyState, Modal, Spinner, toast } from '../components/ui.jsx';

const TYPE = {
  descuento: { label: 'Descuento', band: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300' },
  regalo: { label: 'Regalo', band: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300' },
  monto: { label: 'Recompensa', band: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' },
};
const typeOf = (c) => TYPE[c?.type] || TYPE.monto;
const flat = (v) => String(v || '').toLowerCase().replace(/\s+/g, '');
// Si el título repite el valor ("25% OFF" / "25%OFF") no lo mostramos dos veces.
const subtitleOf = (c, currency) => (flat(c.title) !== flat(couponValue(c, currency)) ? c.title : '');

const STEPS = ['Elegí un premio de abajo', 'Mostrá tu QR al pagar', 'Completalo y canjealo'];

function Stamps({ points, target }) {
  // Hasta 12 puntos mostramos sellos; con más, una barra.
  const pct = Math.min(100, Math.round((points / Math.max(1, target)) * 100));
  const fill = useProgressBar(pct);
  if (target > 12) {
    return (
      <div className="h-3.5 max-w-md overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-[width] duration-1000 ease-out" style={{ width: `${fill}%` }} />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: target }, (_, i) => {
        const done = i < points;
        const last = i === target - 1;
        return (
          <span
            key={i}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold transition-all sm:h-11 sm:w-11 ${
              done ? 'animate-pop bg-amber-400 text-ink shadow-sm' : 'border-2 border-dashed border-white/45 text-primary-contrast/80'
            }`}
            style={done ? { animationDelay: `${i * 60}ms` } : undefined}
          >
            {done ? <Check size={17} strokeWidth={3} /> : last ? <Gift size={16} /> : i + 1}
          </span>
        );
      })}
    </div>
  );
}

export default function CouponsPage() {
  const { isAuthed } = useAuth();
  const { settings } = useTheme();
  const { t } = useTenant();
  const navigate = useNavigate();
  const currency = settings.currency || '$';

  const [catalog, setCatalog] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [confirmCoupon, setConfirmCoupon] = useState(null);
  const [typeFilter, setTypeFilter] = useState('todos');

  const loadCatalog = async () => {
    try {
      const res = await api('/api/coupons/catalog');
      setCatalog(res.coupons || []);
    } catch (err) {
      toast(err.message);
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
    setLoading(true);
    Promise.all([loadCatalog(), loadMine()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const activeCoupon = useMemo(() => mine.find((c) => c.status === 'activado') || null, [mine]);
  const readyCoupons = useMemo(() => mine.filter((c) => c.status === 'completado'), [mine]);
  const history = useMemo(
    () =>
      mine
        .filter((c) => c.status === 'canjeado')
        .sort((a, b) => String(b.redeemed_at || '').localeCompare(String(a.redeemed_at || ''))),
    [mine]
  );

  const typeCounts = useMemo(() => {
    const m = {};
    for (const c of catalog) m[c.type || 'monto'] = (m[c.type || 'monto'] || 0) + 1;
    return m;
  }, [catalog]);
  const filteredCatalog = useMemo(
    () =>
      catalog
        .filter((c) => typeFilter === 'todos' || (c.type || 'monto') === typeFilter)
        .sort((a, b) => Number(a.target_points) - Number(b.target_points)),
    [catalog, typeFilter]
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
      toast('No se pudo copiar el código');
    }
  };

  const openConfirm = (coupon) => {
    if (!isAuthed) {
      navigate(t('/login'));
      return;
    }
    setConfirmCoupon(coupon);
  };

  const activate = async (coupon) => {
    setActivating(coupon.id);
    try {
      await api('/api/coupons/activate', { method: 'POST', body: { coupon_id: coupon.id } });
      toast('Cupón activado. ¡Empezá a sumar puntos!');
      await loadMine();
      setConfirmCoupon(null);
    } catch (err) {
      toast(err.message);
    } finally {
      setActivating(null);
    }
  };

  const CatalogCard = ({ c }) => {
    const isActiveCoupon = activeCoupon?.coupon_id === c.id;
    const disabled = Boolean(activeCoupon) && !isActiveCoupon;
    const tp = typeOf(c);
    const sub = subtitleOf(c, currency);
    const target = Number(c.target_points) || 0;

    return (
      <article
        className={`flex flex-col overflow-hidden rounded-3xl bg-surface transition-transform hover:-translate-y-0.5 ${
          isActiveCoupon ? 'border-2 border-primary shadow-glow' : 'border border-line'
        }`}
      >
        <div className={`flex items-start justify-between gap-3 px-5 py-4 ${tp.band}`}>
          <p className="font-heading text-[34px] font-bold leading-none">{couponValue(c, currency)}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-extrabold dark:bg-white/10">
            <Zap size={12} /> {target} pts
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5 pt-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-muted">{sub || tp.label}</p>
          {c.description && <p className="text-sm leading-relaxed text-ink-muted">{c.description}</p>}
          <p className="text-xs font-semibold text-ink">≈ {target} {target === 1 ? 'compra' : 'compras'}</p>
          <div className="mt-auto pt-3">
            {isActiveCoupon ? (
              <span className="block rounded-full bg-emerald-100 px-3 py-2.5 text-center text-sm font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                ✓ Es tu cupón activo · {Number(activeCoupon.points) || 0}/{target}
              </span>
            ) : disabled ? (
              <span className="block rounded-full bg-surface-alt px-3 py-2.5 text-center text-sm font-semibold text-ink-muted">
                Completá tu cupón activo primero
              </span>
            ) : (
              <button className="btn-primary w-full justify-center" disabled={activating === c.id} onClick={() => openConfirm(c)}>
                {activating === c.id ? 'Activando…' : isAuthed ? 'Activar este cupón' : 'Ingresá y activalo'}
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  if (loading && !catalog.length && !mine.length) {
    return (
      <div className="page-aurora min-h-screen">
        <Navbar />
        <div className="flex justify-center py-24">
          <Spinner label="Cargando tus cupones..." />
        </div>
      </div>
    );
  }

  const points = Number(activeCoupon?.points) || 0;
  const target = Math.max(1, Number(activeCoupon?.target_points) || 1);
  const left = Math.max(0, target - points);

  return (
    <div className="page-aurora min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1600px] space-y-10 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-ink sm:text-4xl">Mis cupones</h1>
            <p className="mt-1 text-sm text-ink-muted sm:text-base">
              {activeCoupon ? 'Mostrá tu QR al pagar y sumá puntos para tu próximo premio.' : 'Elegí un premio y empezá a sumar.'}
            </p>
          </div>
          <Link to={t('/')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-strong hover:underline">
            <ArrowLeft size={15} /> Volver al menú
          </Link>
        </div>

        {/* Billetera: cupón activo + QR + resumen */}
        <section className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {activeCoupon ? (
            <div className="relative grid gap-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary to-primary-strong p-6 text-primary-contrast shadow-glow sm:p-8 md:grid-cols-[minmax(0,1fr)_230px] md:items-center">
              <div className="orb -right-16 -top-16 h-56 w-56 bg-primary-contrast/10" />
              <div className="relative space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                  <Ticket size={13} /> Tu cupón activo · {typeOf(activeCoupon).label}
                </span>
                <h2 className="font-heading text-3xl font-bold leading-[1.05] sm:text-[42px]">
                  {activeCoupon.type === 'regalo' ? activeCoupon.title : couponValue(activeCoupon, currency)}
                </h2>
                {activeCoupon.description && <p className="max-w-lg text-[15px] leading-relaxed opacity-85">{activeCoupon.description}</p>}
                <Stamps points={points} target={target} />
                <p className="text-[15px] font-bold">
                  {points} de {target} puntos
                  <span className="font-medium opacity-80">
                    {left > 0 ? ` · te faltan ${left} ${left === 1 ? 'compra' : 'compras'}` : ' · ¡completado!'}
                  </span>
                </p>
              </div>
              <div className="relative flex flex-col items-center gap-2.5 rounded-3xl bg-white p-3.5 text-ink dark:bg-surface">
                {activeQrImg ? (
                  <img src={activeQrImg} alt={`Código QR ${activeQr}`} className="h-48 w-48 rounded-xl bg-white" />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-ink-muted">
                    <Sparkles className="animate-pulse" size={22} />
                  </div>
                )}
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-xs font-bold transition hover:bg-surface-alt"
                  onClick={copyActiveQr}
                  title="Copiar código"
                >
                  {activeQr || '—'} {qrCopied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <p className="text-center text-[11px] text-ink-muted">Mostralo en caja al pagar</p>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col justify-center gap-5 border-2 border-dashed p-6 sm:p-8">
              <div>
                <h2 className="text-2xl font-bold text-ink">
                  {isAuthed ? 'Todavía no tenés un cupón activo' : 'Ingresá para empezar a sumar'}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">Tu QR personal aparece acá apenas activás un premio.</p>
              </div>
              <ol className="grid gap-2 sm:grid-cols-3">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 rounded-2xl bg-surface-alt px-3 py-2.5 text-sm font-semibold text-ink">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                        i === 0 ? 'bg-primary text-primary-contrast' : 'bg-primary-soft text-primary-strong'
                      }`}
                    >
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              {!isAuthed && (
                <Link to={t('/login')} className="btn-primary w-fit">
                  <QrCode size={16} /> Ingresá con Google
                </Link>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="card flex-1 space-y-3 p-5">
              <p className="font-heading text-base font-bold text-ink">Tu resumen</p>
              {[
                ['Listos para canjear', readyCoupons.length, 'text-emerald-600 dark:text-emerald-400'],
                ['Premios canjeados', history.length, 'text-ink'],
                ['Premios disponibles', catalog.length, 'text-ink'],
              ].map(([label, n, cls], i) => (
                <div key={label} className={`flex items-baseline justify-between ${i < 2 ? 'border-b border-line pb-3' : ''}`}>
                  <span className="text-sm text-ink-muted">{label}</span>
                  <span className={`font-heading text-2xl font-bold ${cls}`}>{n}</span>
                </div>
              ))}
            </div>
            <div className="rounded-3xl bg-primary-softer p-4">
              <p className="text-sm font-bold text-ink">Cómo funciona</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Tenés un cupón activo a la vez. Cada compra con tu QR suma 1 punto. Al completarlo te damos un código para canjear en el local.
              </p>
            </div>
          </div>
        </section>

        {readyCoupons.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-ink">Listos para canjear</h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                {readyCoupons.length}
              </span>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {readyCoupons.map((c) => (
                <ReadyCouponCard key={c.id} coupon={c} currency={currency} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-ink">{activeCoupon ? 'Tu próximo premio' : 'Premios disponibles'}</h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                {activeCoupon ? 'Cuando completes el actual, elegí cuál activar.' : 'Activá uno y empezá a sumar puntos para ganarlo.'}
              </p>
            </div>
            {Object.keys(typeCounts).length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {[['todos', 'Todos', catalog.length], ...Object.entries(typeCounts).map(([k, n]) => [k, typeOf({ type: k }).label, n])].map(
                  ([k, label, n]) => (
                    <button
                      key={k}
                      onClick={() => setTypeFilter(k)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                        typeFilter === k ? 'border-primary bg-primary text-primary-contrast' : 'border-line bg-surface text-ink hover:bg-surface-alt'
                      }`}
                    >
                      {label} · {n}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-64 animate-pulse" />
              ))}
            </div>
          ) : catalog.length === 0 ? (
            <EmptyState icon={BadgePercent} title="No hay premios disponibles por ahora" subtitle="Cuando el local publique cupones van a aparecer acá." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredCatalog.map((c) => (
                <CatalogCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </section>

        {history.length > 0 && (
          <section className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-bold text-ink">Historial</h2>
            <ul className="card divide-y divide-line overflow-hidden">
              {history.map((c) => {
                const sub = subtitleOf(c, currency);
                return (
                  <li key={c.id} className="flex items-center gap-3.5 px-5 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-softer text-primary-strong">
                      <CheckCircle2 size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {couponValue(c, currency)}
                        {sub && <span className="font-normal text-ink-muted"> · {sub}</span>}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        Canjeado {c.redeemed_at ? `el ${formatDate(c.redeemed_at)}` : ''}
                        {c.code ? ` · ${c.code}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-ink-muted">{Number(c.target_points) || 0} pts</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>

      <Modal open={!!confirmCoupon} onClose={() => { if (!activating) setConfirmCoupon(null); }} title="¿Seguro querés activar este cupón?">
        {confirmCoupon && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface-alt p-4 text-center">
              <p className="font-heading text-3xl font-bold text-ink">{couponValue(confirmCoupon, currency)}</p>
              {subtitleOf(confirmCoupon, currency) && <p className="mt-1 font-bold text-ink">{confirmCoupon.title}</p>}
              {confirmCoupon.description && <p className="mt-1 text-sm text-ink-muted">{confirmCoupon.description}</p>}
              <p className="mt-2 text-xs font-semibold text-ink-muted">Necesitás {Number(confirmCoupon.target_points)} puntos</p>
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
                  <Zap size={15} />
                )}
                {activating === confirmCoupon.id ? 'Activando...' : 'Sí, activar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
