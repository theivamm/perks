import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useTenant } from '../context/TenantContext.jsx';

function daysLeft(value) {
  const ms = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

// Franja fina con los días de prueba gratuita restantes. Solo se muestra
// mientras la suscripción está en período de prueba (trial_ends_at futuro);
// se oculta sola apenas eso deja de ser cierto, sin que haga falta borrarla
// a mano al terminar el trial.
export default function TrialBanner() {
  const { t } = useTenant();
  const [trialEndsAt, setTrialEndsAt] = useState(null);

  useEffect(() => {
    let alive = true;
    api('/api/payments/subscription')
      .then((data) => {
        if (!alive) return;
        const ends = data?.subscription?.trial_ends_at;
        setTrialEndsAt(ends && new Date(ends) > new Date() ? ends : null);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!trialEndsAt) return null;
  const left = daysLeft(trialEndsAt);

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-primary/20 bg-primary-softer px-4 py-2 text-center text-[13px] font-semibold text-primary-strong">
      <Gift size={15} className="shrink-0" />
      <span>
        Prueba gratuita: {left <= 0 ? 'termina hoy' : `${left} día${left === 1 ? '' : 's'} restante${left === 1 ? '' : 's'}`}.
      </span>
      <Link to={t('/dashboard/configuracion?tab=plan')} className="font-bold underline underline-offset-2">
        Ver plan y facturación
      </Link>
    </div>
  );
}
