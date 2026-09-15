import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Coffee,
  Copy,
  Gift,
  Loader2,
  Mail,
  Phone,
  PlusCircle,
  QrCode,
  Ticket,
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EmptyState, Spinner, toast } from '../../components/ui.jsx';
import { ActiveCouponCard, couponValue } from '../../components/CouponCards.jsx';
import { formatDateTime } from '../../lib/notifications.js';

export default function ClientDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const scannedCouponId = searchParams.get('cupon');
  const { settings } = useTheme();
  const currency = settings.currency || '$';
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrImg, setQrImg] = useState('');
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api(`/api/clients/registered/${id}`);
      setDetail(res);
      const code = res.activeCoupon?.qr_code;
      if (code) {
        QRCode.toDataURL(code, { margin: 1, width: 480, color: { dark: '#1f2937', light: '#ffffff' } })
          .then(setQrImg)
          .catch(() => {});
      } else {
        setQrImg('');
      }
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addPoint = async () => {
    setSaving(true);
    try {
      const res = await api(`/api/clients/registered/${id}/puntos`, {
        method: 'POST',
        body: { user_coupon_id: scannedCouponId || undefined },
      });
      if (res.result?.status === 'completed') {
        toast('¡Cupón completado! Se generó el código de canje y el cliente fue notificado.');
      } else {
        toast('Punto sumado. El cliente recibió su notificación.');
      }
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(detail.activeCoupon?.qr_code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('No se pudo copiar el código');
    }
  };

  if (loading && !detail) return <Spinner label="Cargando perfil del cliente..." />;
  if (!detail) return <EmptyState icon={Coffee} title="No se pudo cargar el cliente" />;

  const { user, coupons, activeCoupon } = detail;
  const readyCoupons = (coupons || []).filter((c) => c.status === 'completado');
  const redeemedCoupons = (coupons || []).filter((c) => c.status === 'canjeado');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/clientes" className="btn-ghost !px-2.5 !py-2">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{user.name}</h1>
            <p className="text-sm text-ink-muted">Perfil del cliente</p>
          </div>
        </div>
        <button className="btn-primary" onClick={addPoint} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
          Sumar 1 punto
        </button>
      </div>

      <section className="card p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img src={user.image} alt={user.name} className="h-14 w-14 rounded-2xl object-cover shadow-sm" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-lg font-extrabold text-primary-contrast shadow-sm">
                {(user.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-sm text-ink-muted">
              <p className="flex items-center gap-1.5">
                <Mail size={13} /> {user.email || '—'}
              </p>
              {user.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone size={13} /> {user.phone}
                </p>
              )}
              {!user.phone && <p className="text-xs">—</p>}
            </div>
          </div>
          <button className="btn-ghost ml-auto" onClick={() => copyCode()} title="Copiar código QR del cupón activo">
            <span className="font-mono text-sm font-bold tracking-wider text-ink">{activeCoupon?.qr_code || '—'}</span>
            {copied ? (
              <span className="text-primary-strong">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface-alt/40 p-4">
          <div className="flex items-center gap-3">
            {qrImg ? (
              <img src={qrImg} alt={`QR ${activeCoupon?.qr_code}`} className="h-24 w-24 rounded-lg bg-white p-1" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-surface text-ink-muted">
                <QrCode size={24} />
              </div>
            )}
            <p className="max-w-52 text-xs leading-relaxed text-ink-muted">
              QR del cupón activo. Escanealo con la cámara del panel (o copialo) y sumá el punto acá abajo.
            </p>
          </div>
          <div className="ml-auto flex flex-col items-center gap-1">
            <p className="text-3xl font-extrabold text-primary-strong">{activeCoupon ? activeCoupon.points : '—'}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              puntos de {activeCoupon ? activeCoupon.target_points : '—'}
            </p>
          </div>
        </div>

        <div className="mt-5">
          {activeCoupon ? (
            <ActiveCouponCard coupon={activeCoupon} currency={currency} compact />
          ) : (
            <p className="text-sm text-ink-muted">
              El cliente no tiene un cupón activo en este momento.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Gift size={20} className="text-primary-strong" />
          Cupones listos para canjear ({readyCoupons.length})
        </h2>
        {readyCoupons.length === 0 ? (
          <p className="text-sm text-ink-muted">Aún no tiene cupones listos para canjear.</p>
        ) : (
          <ul className="space-y-1.5">
            {readyCoupons.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-400/50 bg-surface px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">
                    {couponValue(c, currency)} · {c.title}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    código <span className="font-mono font-bold">{c.code}</span>
                  </p>
                </div>
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-600">
                  listo para canjear
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
          <BadgeCheck size={20} className="text-primary-strong" />
          Cupones canjeados ({redeemedCoupons.length})
        </h2>
        {redeemedCoupons.length === 0 ? (
          <p className="text-sm text-ink-muted">Aún no canjeó ningún cupón.</p>
        ) : (
          <ul className="space-y-1.5">
            {redeemedCoupons.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">
                    {couponValue(c, currency)} · {c.title}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    código <span className="font-mono font-bold">{c.code}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-ink-muted">{formatDateTime(c.redeemed_at)}</p>
                  <span className="rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-bold text-ink-muted">
                    canjeado
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Ticket size={20} className="text-primary-strong" />
          Historial de cupones
        </h2>
        {(coupons || []).length === 0 ? (
          <p className="text-sm text-ink-muted">Aún no tiene cupones.</p>
        ) : (
          <ul className="space-y-1.5">
            {(coupons || []).map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2">
                <p className="min-w-0 truncate text-xs font-bold text-ink">
                  {couponValue(c, currency)} · {c.title} ·{' '}
                  <span className="text-ink-muted">{c.points}/{c.target_points} pts</span>
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    c.status === 'canjeado'
                      ? 'bg-surface-alt text-ink-muted'
                      : c.status === 'completado'
                        ? 'bg-green-500/15 text-green-600'
                        : 'bg-primary-soft text-primary-strong'
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      </div>
  );
}