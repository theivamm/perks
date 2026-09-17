import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgePercent, Check, Copy, Gift, QrCode, Sparkles, Ticket, Zap } from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTenant } from '../context/TenantContext.jsx';
import { ActiveCouponCard, ReadyCouponCard, couponValue } from '../components/CouponCards.jsx';
import Navbar from '../components/Navbar.jsx';
import { EmptyState, Modal, Spinner, toast } from '../components/ui.jsx';

export default function CouponsPage() {
  const { isAuthed } = useAuth();
  const { settings } = useTheme();
  const { t } = useTenant();
  const currency = settings.currency || '$';

  const [catalog, setCatalog] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);
  const [confirmCoupon, setConfirmCoupon] = useState(null);

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
    if (isAuthed) loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const activeCoupon = useMemo(() => mine.find((c) => c.status === 'activado') || null, [mine]);
  const readyCoupons = useMemo(() => mine.filter((c) => c.status === 'completado'), [mine]);

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

  return (
    <div className="page-aurora min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-10 pb-16">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-strong to-primary-soft p-8 text-primary-contrast shadow-glow sm:p-10">
          <div className="orb -right-16 -top-16 h-64 w-64 bg-primary-contrast/15" />
          <div className="orb -bottom-24 right-40 h-52 w-52 bg-primary-contrast/12" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-contrast/15 px-3 py-1 text-xs font-bold tracking-wide uppercase">
                <Gift size={14} />
                Mis cupones
              </span>
              <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Seguí tu progreso</h1>
              <p className="mt-2 max-w-xl text-sm text-primary-contrast/85 sm:text-base">
                Activá un premio, sumá puntos con tu QR y canjeá tu recompensa cuando la completes.
              </p>
            </div>
            <Link
              to={t('/')}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-contrast/15 px-4 py-2.5 text-sm font-extrabold transition-colors hover:bg-primary-contrast/25"
            >
              Ver menú y precios
              <QrCode size={16} />
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <div className="tile tile-mint relative overflow-hidden p-5">
            <div className="orb -right-8 -top-12 h-32 w-32 bg-white/50" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-200">Cupón activo</p>
              <p className="mt-1 text-2xl font-black text-ink">
                {activeCoupon ? couponValue(activeCoupon, currency) : 'Sin activar'}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-ink-muted">
                {activeCoupon ? activeCoupon.title : 'Elegí uno del catálogo'}
              </p>
            </div>
          </div>
          <div className="tile tile-peach relative overflow-hidden p-5">
            <div className="orb -right-8 -top-12 h-32 w-32 bg-white/50" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-wide text-orange-800 dark:text-orange-200">Listos para canjear</p>
              <p className="mt-1 text-2xl font-black text-ink">{readyCoupons.length}</p>
              <p className="mt-0.5 text-xs font-semibold text-ink-muted">
                {readyCoupons.length === 0 ? 'Completá un cupón' : 'Mostrá el QR en el local'}
              </p>
            </div>
          </div>
          <div className="tile tile-lilac relative overflow-hidden p-5">
            <div className="orb -right-8 -top-12 h-32 w-32 bg-white/50" />
            <div className="relative">
              <p className="text-xs font-black uppercase tracking-wide text-violet-800 dark:text-violet-200">Premios disponibles</p>
              <p className="mt-1 text-2xl font-black text-ink">{catalog.length}</p>
              <p className="mt-0.5 text-xs font-semibold text-ink-muted">Elegí tu próxima meta</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {activeCoupon ? (
              <ActiveCouponCard coupon={activeCoupon} currency={currency} />
            ) : (
              <div className="card flex h-full flex-col items-center justify-center border-2 border-dashed border-line p-10 text-center">
                <Sparkles size={34} className="text-ink-muted" />
                <p className="mt-3 font-extrabold text-ink">No tenés cupones activos</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Activá un premio y empezá a sumar puntos con tu QR al pagar.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {activeCoupon ? (
              <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
                <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-primary to-primary-strong px-5 py-3 text-white">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
                    <QrCode size={15} />
                    QR para escanear
                  </p>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold transition-colors hover:bg-white/30"
                    onClick={copyActiveQr}
                    title="Copiar código QR"
                  >
                    {qrCopied ? <Check size={13} /> : <Copy size={13} />}
                    <span className="font-mono">{activeQr || '—'}</span>
                  </button>
                </div>
                <div className="relative border-t border-dashed border-line bg-surface px-5 pb-5 pt-4">
                  <span className="absolute left-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />
                  <span className="absolute right-[-9px] top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-surface-page" />
                  <div className="flex flex-col items-center py-2 text-center">
                    {activeQrImg ? (
                      <img src={activeQrImg} alt={`Código QR ${activeQr}`} className="h-56 w-56 sm:h-64 sm:w-64" />
                    ) : (
                      <div className="flex h-56 w-56 items-center justify-center text-sm font-bold text-ink-muted sm:h-64 sm:w-64">
                        <Sparkles className="animate-pulse" size={22} />
                      </div>
                    )}
                    <p className="mt-4 max-w-xs text-sm font-semibold text-ink-muted">
                      Mostrá este código al pagar para que el local sume puntos a tu cupón activo.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex h-full flex-col items-center justify-center border-2 border-dashed border-line p-10 text-center">
                <QrCode size={34} className="text-ink-muted" />
                <p className="mt-3 font-extrabold text-ink">Sin QR todavía</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Tu QR personal aparece acá apenas activás tu primer cupón.
                </p>
              </div>
            )}
          </div>
        </section>

        {readyCoupons.length > 0 && (
          <section className="mt-10">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
                <Gift size={20} className="text-primary-strong" />
                Listos para canjear
              </h2>
              <span className="badge">{readyCoupons.length}</span>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {readyCoupons.map((c) => (
                <ReadyCouponCard key={c.id} coupon={c} currency={currency} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
                <Ticket size={20} className="text-primary-strong" />
                Elegí tu próximo premio
              </h2>
              <p className="mt-0.5 text-sm text-ink-muted">
                Activá un cupón y empezá a sumar puntos para ganarlo.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-64 animate-pulse" />
              ))}
            </div>
          ) : catalog.length === 0 ? (
            <EmptyState
              icon={BadgePercent}
              title="No hay premios disponibles por ahora"
              subtitle="Cuando el local publique cupones van a aparecer acá."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((c) => (
                <CatalogCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </section>
      </main>

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