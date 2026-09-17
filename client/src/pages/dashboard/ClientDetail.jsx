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
  PlusCircle,
  QrCode,
  Ticket,
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useTenant } from '../../context/TenantContext.jsx';
import { EmptyState, Spinner, toast } from '../../components/ui.jsx';
import { ActiveCouponCard, couponValue } from '../../components/CouponCards.jsx';
import { formatDateTime } from '../../lib/notifications.js';

export default function ClientDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const scannedCouponId = searchParams.get('cupon');
  const { settings } = useTheme();
  const { t } = useTenant();
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to={t('/dashboard/clientes')} className="btn-ghost !px-2.5 !py-2">
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
          <div className="flex flex-1 flex-wrap items-center justify-center gap-4 sm:justify-start">
            {user.image ? (
              <img src={user.image} alt={user.name} className="h-28 w-28 shrink-0 rounded-3xl object-cover shadow-md" />
            ) : (
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-strong text-4xl font-extrabold text-primary-contrast shadow-md">
                {(user.name || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {user.email && (
                <a
                  href={`mailto:${user.email}`}
                  title={`Enviar mail a ${user.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary-soft px-3.5 py-2 text-xs font-bold text-primary-strong transition-colors hover:bg-primary hover:text-primary-contrast"
                >
                  <Mail size={14} />
                  <span className="max-w-52 truncate">{user.email}</span>
                </a>
              )}
              {user.phone && (
                <a
                  href={`https://wa.me/${waNumber(user.phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  title={`Enviar WhatsApp a ${user.phone}`}
                  className="inline-flex items-center gap-2 rounded-full border border-green-600/25 bg-green-500/10 px-3.5 py-2 text-xs font-bold text-green-700 transition-colors hover:bg-green-500 hover:text-white dark:text-green-400 dark:hover:text-white"
                >
                  <WhatsAppIcon size={14} />
                  <span>{user.phone}</span>
                </a>
              )}
              {!user.email && !user.phone && <p className="text-sm text-ink-muted">Sin datos de contacto</p>}
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
              <img src={qrImg} alt={`QR ${activeCoupon?.qr_code}`} className="h-24 w-24 rounded-lg bg-white p-1 dark:bg-surface" />
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
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
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
                        ? 'bg-green-500/15 text-green-600 dark:text-green-400'
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

function waNumber(phone = '') {
  return String(phone).replace(/\D/g, '');
}

function WhatsAppIcon({ size = 14, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}