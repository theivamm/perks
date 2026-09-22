import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraOff, Check, Eye, Gift, Loader2, PlusCircle, ScanLine, Ticket, UserCheck } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../api.js';
import { useTenant } from '../../context/TenantContext.jsx';
import { toast } from '../../components/ui.jsx';

const SCAN_ELEMENT = 'qr-reader-region';

export default function ScanPage() {
  const navigate = useNavigate();
  const { t } = useTenant();
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resolving, setResolving] = useState(false);
  const pausedRef = useRef(false);
  const resolvingRef = useRef(false);
  const [cameraError, setCameraError] = useState('');
  const [redeemed, setRedeemed] = useState(null);
  const [progress, setProgress] = useState(null);
  const [saving, setSaving] = useState(false);

  const setPausedState = (v) => {
    pausedRef.current = v;
    setPaused(v);
  };
  const setResolvingState = (v) => {
    resolvingRef.current = v;
    setResolving(v);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        /* noop */
      }
    }
  };

  const startScanner = async () => {
    try {
      await scannerRef.current?.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        onSuccess,
        () => {}
      );
      setScanning(true);
      setCameraError('');
      setPausedState(false);
      setResolvingState(false);
    } catch (err) {
      setCameraError(String(err?.message || err));
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode(SCAN_ELEMENT, { verbose: false });
    scannerRef.current = scanner;
    startScanner();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSuccess = async (decodedText) => {
    if (pausedRef.current || resolvingRef.current) return;
    setPausedState(true);
    setResolvingState(true);
    try {
      const res = await api('/api/clients/scan', { method: 'POST', body: { qr_code: decodedText.trim() } });
      setProgress(null);
      if (res.redeemed) {
        setRedeemed(res);
        await stopScanner();
        return;
      }
      setProgress(res);
      await stopScanner();
    } catch (err) {
      toast(err.message);
      setPausedState(false);
      setResolvingState(false);
    }
  };

  const resumeScanning = () => {
    setRedeemed(null);
    setProgress(null);
    setPausedState(false);
    setResolvingState(false);
    startScanner();
  };

  const addPoint = async () => {
    if (!progress) return;
    setSaving(true);
    try {
      const res = await api(`/api/clients/registered/${progress.client.id}/puntos`, {
        method: 'POST',
        body: { user_coupon_id: progress.user_coupon_id },
      });
      if (res.result?.status === 'completed') {
        toast('¡Cupón completado! Se generó el código de canje y el cliente fue notificado.');
        resumeScanning();
      } else {
        const next = res.result?.coupon;
        setProgress((p) => ({ ...p, coupon: next || p.coupon }));
        toast(`Punto sumado: ${next?.points ?? 0} de ${next?.target_points ?? 0} puntos`);
      }
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
<div>
          <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink">Escanear QR</h1>
        <p className="text-sm text-ink-muted">
          Apuntá la cámara al código QR del cupón activo del cliente para sumarle el punto, o al de un cupón listo
          para canjearlo directo.
        </p>
      </div>

      {progress ? (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-strong px-5 py-4 text-white">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
              <Ticket size={18} />
              Cupón en progreso
            </p>
          </div>
          <div className="p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-strong text-white shadow-glow">
              <Ticket size={26} />
            </span>
            <p className="mt-4 text-xl font-black text-ink">{progress.coupon?.title || 'Premio'}</p>
            <p className="mt-1 text-sm text-ink-muted">
              Cliente: <span className="font-bold text-ink">{progress.client?.name || '—'}</span>
            </p>
            <p className="mx-auto mt-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-black text-primary-strong">
              {progress.coupon?.points ?? 0} de {progress.coupon?.target_points ?? 0} puntos
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Este cupón todavía no está completo. Sumale el punto y escaneá el QR de nuevo cuando esté listo para
              canjear.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button className="btn-primary" onClick={addPoint} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                Sumar 1 punto
              </button>
              <button
                className="btn-ghost"
                onClick={() => navigate(t(`/dashboard/cliente/${progress.client.id}?cupon=${progress.user_coupon_id}`))}
              >
                <Eye size={16} />
                Ver perfil
              </button>
              <button className="btn-ghost" onClick={resumeScanning}>
                <ScanLine size={16} />
                Escanear otro
              </button>
            </div>
          </div>
        </div>
      ) : redeemed ? (
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em]">
              <Check size={18} />
              ¡Cupón canjeado!
            </p>
          </div>
          <div className="p-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
              <Gift size={26} />
            </span>
            <p className="mt-4 text-xl font-black text-ink">{redeemed.coupon?.title || 'Premio'}</p>
            <p className="mt-1 text-sm text-ink-muted">
              Cliente: <span className="font-bold text-ink">{redeemed.client?.name || '—'}</span>
            </p>
            <p className="mx-auto mt-2 inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
              {redeemed.coupon?.code}
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Ya pasó al historial de cupones del cliente y no puede volver a usarse.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button className="btn-primary" onClick={resumeScanning}>
                <ScanLine size={16} />
                Escanear otro
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <div id={SCAN_ELEMENT} className="mx-auto max-w-md overflow-hidden rounded-2xl" />

          {scanning && !cameraError && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
                {resolving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Buscando cupón...
                  </>
                ) : (
                  <>
                    <ScanLine size={16} className="text-primary-strong" /> Escaneando... esperando código
                  </>
                )}
              </p>
              {paused && !resolving && (
                <button className="btn-ghost" onClick={resumeScanning}>
                  Reanudar escaneo
                </button>
              )}
            </div>
          )}

          {!scanning && !cameraError && !redeemed && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-muted">
              <Loader2 className="animate-spin" size={16} />
              Iniciando cámara...
            </div>
          )}

          {resolving && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-primary-strong">
              <UserCheck size={16} />
              Cupón encontrado...
            </p>
          )}

          {cameraError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <CameraOff size={20} className="mx-auto mb-2 text-red-500" />
              <p className="text-sm font-bold text-ink">No se pudo iniciar la cámara</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {cameraError.includes('permiso') || cameraError.includes('Permission') || cameraError.includes('NotFound')
                  ? 'Otorgá permiso de cámara desde el navegador o probá con otro dispositivo.'
                  : cameraError}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}