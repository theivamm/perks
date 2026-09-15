import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Coffee,
  Copy,
  Gift,
  Loader2,
  Mail,
  Phone,
  PlusCircle,
  QrCode,
  ReceiptText,
} from 'lucide-react';
import QRCode from 'qrcode';
import { api } from '../../api.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { EmptyState, Spinner, toast } from '../../components/ui.jsx';
import RewardGoals from '../../components/RewardGoals.jsx';
import { formatWhen } from '../../lib/notifications.js';

export default function ClientDetail() {
  const { id } = useParams();
  const { settings } = useTheme();
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
      if (res.user?.qr_code) {
        QRCode.toDataURL(res.user.qr_code, { margin: 1, width: 480, color: { dark: '#1f2937', light: '#ffffff' } })
          .then(setQrImg)
          .catch(() => {});
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

  const addCompra = async () => {
    setSaving(true);
    try {
      await api(`/api/clients/registered/${id}/compras`, { method: 'POST', body: { total: 0 } });
      toast('Compra sumada. El cliente ya recibió su notificación.');
      await load();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(detail.user.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('No se pudo copiar el código');
    }
  };

  if (loading && !detail) return <Spinner label="Cargando perfil del cliente..." />;
  if (!detail) return <EmptyState icon={Coffee} title="No se pudo cargar el cliente" />;

  const { user, orders, coupons, stats, rewardProgress } = detail;

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
        <button className="btn-primary" onClick={addCompra} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
          Sumar 1 compra
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
          <button className="btn-ghost ml-auto" onClick={() => copyCode()} title="Copiar código">
            <span className="font-mono text-sm font-bold tracking-wider text-ink">{user.qr_code || '—'}</span>
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
              <img src={qrImg} alt={`QR ${user.qr_code}`} className="h-24 w-24 rounded-lg bg-white p-1" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-surface text-ink-muted">
                <QrCode size={24} />
              </div>
            )}
            <p className="max-w-52 text-xs leading-relaxed text-ink-muted">
              Escaneá este QR con la cámara del panel para abrir este perfil y sumar compras.
            </p>
          </div>
          <div className="ml-auto flex flex-col items-center gap-1">
            <p className="text-3xl font-extrabold text-primary-strong">{stats.completedOrders}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              compra{stats.completedOrders !== 1 && 's'}
            </p>
          </div>
        </div>

        <RewardGoals completed={rewardProgress.completed} rules={rewardProgress.rules} coupons={coupons} currency={settings.currency} />
      </section>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-surface-alt p-3 text-center">
          <p className="text-xl font-extrabold text-ink">{stats.totalOrders}</p>
          <p className="text-[11px] text-ink-muted">Compras</p>
        </div>
        <div className="rounded-xl bg-surface-alt p-3 text-center">
          <p className="text-xl font-extrabold text-primary-strong">{stats.completedOrders}</p>
          <p className="text-[11px] text-ink-muted">Completadas</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
          <Gift size={20} className="text-primary-strong" />
          Cupones ({coupons.length})
        </h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-ink-muted">Todavía no ganó cupones.</p>
        ) : (
          <ul className="space-y-1.5">
            {coupons.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">
                    {c.type === 'descuento' ? `${c.value}% OFF` : c.type === 'regalo' ? 'Regalo' : `${formatMoney(c.value, settings.currency)}`}
                    {' · '}
                    {c.description || 'premio'}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    Compra #{c.milestone} · {c.code}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                    c.status === 'activo' ? 'bg-green-500/15 text-green-600' : 'bg-surface-alt text-ink-muted'
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
          <ReceiptText size={20} className="text-primary-strong" />
          Últimas compras
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-muted">Aún no registró compras.</p>
        ) : (
          <ul className="space-y-1.5">
            {orders.slice(0, 10).map((o, i) => (
              <li key={o.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm">
                <p className="flex items-center gap-2 text-xs text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                    <Check size={12} />
                  </span>
                  Compra registrada
                </p>
                <span className="shrink-0 text-xs font-semibold text-ink-muted">{formatWhen(o.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}