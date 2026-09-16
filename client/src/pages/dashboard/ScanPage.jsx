import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraOff, Check, Gift, Loader2, ScanLine, UserCheck } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../../api.js';
import { toast } from '../../components/ui.jsx';

const SCAN_ELEMENT = 'qr-reader-region';

export default function ScanPage() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [lastError, setLastError] = useState('');
  const [redeemed, setRedeemed] = useState(null);
  const notifyTimer = useRef(null);

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
      setLastError('');
      setPaused(false);
      setResolving(false);
    } catch (err) {
      setLastError(String(err?.message || err));
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode(SCAN_ELEMENT, { verbose: false });
    scannerRef.current = scanner;
    startScanner();

    return () => {
      if (notifyTimer.current) clearTimeout(notifyTimer.current);
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSuccess = async (decodedText) => {
    if (paused || resolving) return;
    setPaused(true);
    setResolving(true);
    try {
      const res = await api('/api/clients/scan', { method: 'POST', body: { qr_code: decodedText.trim() } });
      setLastError('');
      if (res.redeemed) {
        setRedeemed(res);
        await stopScanner();
        return;
      }
      navigate(`/dashboard/cliente/${res.client.id}?cupon=${res.user_coupon_id}`);
    } catch (err) {
      setLastError(err.message);
      toast(err.message);
      setPaused(false);
      setResolving(false);
    }
  };

  const resume = () => {
    setRedeemed(null);
    setPaused(false);
    setResolving(false);
    startScanner();
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

      {redeemed ? (
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
            <p className="mx-auto mt-2 inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-black text-emerald-700">
              {redeemed.coupon?.code}
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Ya pasó al historial de cupones del cliente y no puede volver a usarse.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button className="btn-primary" onClick={resume}>
                <ScanLine size={16} />
                Escanear otro
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <div id={SCAN_ELEMENT} className="mx-auto max-w-md overflow-hidden rounded-2xl" />

          {scanning && !lastError && (
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
                <button className="btn-ghost" onClick={resume}>
                  Reanudar escaneo
                </button>
              )}
            </div>
          )}

          {!scanning && !lastError && !redeemed && (
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

          {lastError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <CameraOff size={20} className="mx-auto mb-2 text-red-500" />
              <p className="text-sm font-bold text-ink">No se pudo iniciar la cámara</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {lastError.includes('permiso') || lastError.includes('Permission') || lastError.includes('NotFound')
                  ? 'Otorgá permiso de cámara desde el navegador o probá con otro dispositivo.'
                  : lastError}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                Otorgá permiso de cámara desde el navegador o probá con otro dispositivo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}