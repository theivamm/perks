import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgePercent, Gift, Loader2, QrCode, ScanLine, Smartphone, UserRound } from 'lucide-react';
import { api } from '../api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { couponValue } from './CouponCards.jsx';
import { EmptyState, toast } from './ui.jsx';

export default function AdminSummary() {
  const navigate = useNavigate();
  const { settings } = useTheme();
  const [clients, setClients] = useState(null);

  const load = () =>
    api('/api/clients/summary')
      .then(setClients)
      .catch((e) => toast(e.message));

  useEffect(() => {
    load();
  }, []);

  const withCoupons = (clients || []).filter((c) => c.couponsReady.length > 0);

  if (clients === null) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-primary-strong" size={26} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button className="card flex w-full items-center gap-4 p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-surface-alt lg:hidden" onClick={() => navigate('/dashboard/escanear')}>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
          <ScanLine size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-ink">Escanear QR</p>
          <p className="text-sm text-ink-muted">Escanéá el QR de un cliente para abrir su perfil y sumarle un punto.</p>
        </div>
        <QrCode size={20} className="shrink-0 text-primary-strong" />
      </button>

      <div className="card hidden items-center gap-4 p-5 lg:flex">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-alt text-primary-strong">
          <Smartphone size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-ink">Escaneá desde tu celular</p>
          <p className="text-sm text-ink-muted">
            Iniciá sesión con tu celular para escanear el QR de un cliente y sumarle un punto a su cupón.
          </p>
        </div>
      </div>

      {withCoupons.length === 0 ? (
        <EmptyState
          icon={BadgePercent}
          title="No hay cupones listos para canjear"
          subtitle="Cuando un cliente complete un cupón, vas a ver su código acá para canjearlo."
        />
      ) : (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
            <BadgePercent size={20} className="text-primary-strong" />
            Cupones listos para canjear
          </h2>
          <div className="space-y-4">
            {withCoupons.map((c) => (
              <div key={c.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-alt/50 px-4 py-2.5">
                  <p className="flex items-center gap-2 font-extrabold text-ink">
                    <Gift size={15} className="text-primary-strong" />
                    {c.name}
                  </p>
                  <button className="btn-ghost !px-2.5 !py-1 !text-xs" onClick={() => navigate(`/dashboard/cliente/${c.id}`)}>
                    <UserRound size={13} />
                    Ver perfil
                  </button>
                </div>
                <ul className="divide-y divide-line px-4">
                  {c.couponsReady.map((cp) => (
                    <li key={cp.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">
                          {couponValue(cp, settings.currency)}
                          <span className="text-ink-muted"> · {cp.title || 'premio'}</span>
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          Código <span className="font-mono font-bold">{cp.code}</span>
                        </p>
                      </div>
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                        listo para canjear
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}