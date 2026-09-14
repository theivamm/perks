import { useState } from 'react';
import { BadgePercent, CheckCircle2, Gift, Loader2, Search, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { api, formatDate } from '../../api.js';
import { toast } from '../../components/ui.jsx';

function prizeLabel(c, currency = '$') {
  if (c.type === 'descuento') return `${Number(c.value) || 0}% OFF`;
  if (c.type === 'regalo') return 'Regalo';
  return `${currency === '$' ? '$' : currency} ` + (Number(c.value) || 0);
}

export default function Coupons() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setErr('');
    try {
      const data = await api('/api/coupons/validate', { method: 'POST', body: { code } });
      setResult(data);
      toast('Cupón validado y marcado como usado');
    } catch (err) {
      setErr(err.message);
      toast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink">Validar cupón</h1>
        <p className="text-sm text-ink-muted">
          Cuando un cliente muestre su código en el local, comprobalo acá para canjearlo.
        </p>
      </div>

      <form
        onSubmit={validate}
        className="animate-fade-up flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:flex-nowrap"
      >
        <div className="min-w-0 flex-1">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <Search size={13} />
            Código del cupón
          </label>
          <input
            className="input !py-3 !text-base !font-extrabold !uppercase tracking-widest"
            placeholder="CW-XXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
          />
        </div>
        <button className="btn-primary !self-end !py-3 !text-base" disabled={loading || !code.trim()}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
          Validar
        </button>
      </form>

      {err && (
        <div className="animate-pop mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-500/10 p-4">
          <XCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="font-extrabold text-ink">Cupón no válido</p>
            <p className="mt-0.5 text-sm text-ink-muted">{err}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="animate-pop mt-5 overflow-hidden rounded-3xl border border-line shadow-soft">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={22} className="animate-pop" />
              <p className="text-base font-extrabold">Cupón válido</p>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              marcado como usado
            </span>
          </div>

          <div className="grid gap-5 bg-surface p-5 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-primary-contrast shadow-glow">
                  <Gift size={22} />
                </div>
                <div>
                  <p className="text-xl font-black text-ink">{prizeLabel(result)}</p>
                  <p className="text-sm font-semibold text-ink-muted">
                    {result.description || 'Premio por tus pedidos'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge-outline">
                  <BadgePercent size={13} />
                  Cada {result.milestone} pedidos completados
                </span>
                <span className="badge-outline">
                  {result.mode === 'web' || result.mode === 'ambos' ? 'Canje por web' : 'Canje en local'}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-1 rounded-2xl bg-surface-alt p-4 text-center sm:min-w-44">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Código canjeado
              </p>
              <p className="text-2xl font-black tracking-widest text-primary-strong">{result.code}</p>
              <p className="text-xs text-ink-muted">{formatDate(result.used_at)}</p>
            </div>
          </div>
        </div>
      )}

      {!result && !err && (
        <div className="animate-fade-up mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface/60 p-5">
          <Sparkles size={18} className="shrink-0 text-primary" />
          <p className="text-sm text-ink-muted">
            Probá pegando el código que te muestra el cliente en su perfil. Si ya fue usado, te va a avisar.
          </p>
        </div>
      )}
    </div>
  );
}