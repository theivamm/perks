import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraOff, Loader2, ScanLine, UserCheck } from 'lucide-react';
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

  useEffect(() => {
    const scanner = new Html5Qrcode(SCAN_ELEMENT, { verbose: false });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        onSuccess,
        () => {}
      )
      .then(() => setScanning(true))
      .catch((err) => setLastError(String(err?.message || err)));

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
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
      navigate(`/dashboard/cliente/${res.client.id}?cupon=${res.user_coupon_id}`);
    } catch (err) {
      setLastError(err.message);
      toast(err.message);
      setPaused(false);
      setResolving(false);
    }
  };

  const resume = () => {
    setPaused(false);
    setResolving(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink">Escanear QR</h1>
        <p className="text-sm text-ink-muted">
          Apuntá la cámara al código QR del cupón activo del cliente para abrir su perfil y sumarle el punto.
        </p>
      </div>

      <div className="card p-6">
        <div id={SCAN_ELEMENT} className="mx-auto max-w-md overflow-hidden rounded-2xl" />

        {scanning && !lastError && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
              {resolving ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Buscando cliente...
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

        {!scanning && !lastError && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-ink-muted">
            <Loader2 className="animate-spin" size={16} />
            Iniciando cámara...
          </div>
        )}

        {resolving && (
          <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-primary-strong">
            <UserCheck size={16} />
            Cliente encontrado, abriendo perfil...
          </p>
        )}

        {lastError && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <CameraOff size={20} className="mx-auto mb-2 text-red-500" />
            <p className="text-sm font-bold text-ink">No se pudo iniciar la cámara</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {lastError}
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Otorgá permiso de cámara desde el navegador o probá con otro dispositivo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}