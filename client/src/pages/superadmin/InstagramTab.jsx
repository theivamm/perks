import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, ImagePlus, Loader2, RefreshCw, Send, XCircle } from 'lucide-react';
import { api } from '../../api.js';
import { BTN_GHOST, BTN_INK, CARD, EYEBROW, FIELD, LABEL } from './SuperAdmin.jsx';

const MAX_CAPTION = 2200;
const MAX_SIDE = 1920;

// Instagram solo acepta JPEG: convertimos en el navegador para no depender de librerías en el server.
function toJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => (blob ? resolve({ blob, width: canvas.width, height: canvas.height }) : reject(new Error('No se pudo convertir la imagen'))),
        'image/jpeg',
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

function ratioWarning(kind, width, height) {
  const ratio = width / height;
  if (kind === 'story') {
    return Math.abs(ratio - 9 / 16) > 0.08 ? 'Para stories lo ideal es 9:16 (por ejemplo 1080×1920).' : '';
  }
  if (ratio < 0.8 || ratio > 1.91) return 'Para el feed, Instagram acepta formatos entre 4:5 (vertical) y 1.91:1 (horizontal).';
  return '';
}

export default function InstagramTab() {
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [kind, setKind] = useState('feed');
  const [caption, setCaption] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const input = useRef(null);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      setStatus(await api('/api/superadmin/instagram/status'));
    } catch (e) {
      setStatus({ configured: false, ok: false, error: e.message });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setDone(null);
    setConfirming(false);
    try {
      const jpeg = await toJpeg(file);
      setImage(jpeg);
      setPreview(URL.createObjectURL(jpeg.blob));
    } catch (err) {
      setError(err.message);
    }
  };

  const publish = async () => {
    if (!image) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', image.blob, 'post.jpg');
      fd.append('kind', kind);
      fd.append('caption', caption);
      const res = await api('/api/superadmin/instagram/publish', { method: 'POST', body: fd });
      setDone(res);
      setImage(null);
      setPreview('');
      setCaption('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const warn = image ? ratioWarning(kind, image.width, image.height) : '';
  const ready = status?.ok;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className={`${CARD} flex flex-col gap-5 p-5 sm:p-6`}>
        <div className="flex items-center justify-between gap-3">
          <p className={EYEBROW}>NUEVA PUBLICACIÓN</p>
          <div className="flex rounded-full border border-[rgba(20,36,37,0.12)] p-0.5">
            {[['feed', 'Post'], ['story', 'Story']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setKind(id)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition ${kind === id ? 'bg-[#08282c] text-white' : 'text-[var(--wt-muted)]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <input ref={input} type="file" accept="image/*" className="hidden" onChange={pick} />
        <button
          onClick={() => input.current?.click()}
          className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[rgba(20,36,37,0.15)] bg-[var(--wt-surface-raised)]/40 p-4 text-[var(--wt-muted)] transition hover:border-[var(--wt-mint)]"
        >
          {preview ? (
            <img src={preview} alt="Vista previa" className="max-h-[420px] rounded-xl object-contain" />
          ) : (
            <>
              <ImagePlus size={28} />
              <span className="text-[14px] font-semibold">Elegí una imagen (se convierte a JPG sola)</span>
            </>
          )}
        </button>
        {preview && <p className="-mt-2 text-[12.5px] text-[var(--wt-muted)]">Click en la imagen para cambiarla.</p>}
        {warn && <p className="rounded-xl bg-[#fff3cf] px-3.5 py-2.5 text-[13px] font-semibold text-[#8a5a00]">{warn}</p>}

        {kind === 'feed' ? (
          <label className={LABEL}>
            <span className="flex justify-between">
              Texto del post <span className="font-medium text-[var(--wt-muted)]">{caption.length}/{MAX_CAPTION}</span>
            </span>
            <textarea
              className={`${FIELD} min-h-[140px] resize-y`}
              value={caption}
              maxLength={MAX_CAPTION}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escribí el texto y los hashtags…"
            />
          </label>
        ) : (
          <p className="text-[13px] text-[var(--wt-muted)]">Las stories se publican solo con la imagen (la API no permite texto de caption).</p>
        )}

        {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-semibold text-red-600">{error}</p>}
        {done && (
          <p className="flex flex-wrap items-center gap-2 rounded-xl bg-[#dff8f1] px-3.5 py-2.5 text-[13px] font-semibold text-[#00705f]">
            <CheckCircle2 size={16} /> ¡Publicado!
            {done.permalink && (
              <a href={done.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                Ver en Instagram <ExternalLink size={12} />
              </a>
            )}
          </p>
        )}

        {confirming ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(20,36,37,0.1)] bg-[var(--wt-surface-raised)]/50 p-3.5">
            <p className="flex-1 text-[13.5px] font-semibold text-[var(--wt-ink)]">
              ¿Publicar ahora en @{status?.username || 'wintuu.app'}? Es público al instante.
            </p>
            <button onClick={() => setConfirming(false)} disabled={busy} className={BTN_GHOST}>Cancelar</button>
            <button onClick={publish} disabled={busy} className={BTN_INK}>
              {busy ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
              Sí, publicar
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} disabled={!image || !ready || busy} className={`${BTN_INK} self-start`}>
            <Send size={15} /> Publicar en Instagram
          </button>
        )}
      </div>

      <div className={`${CARD} flex h-fit flex-col gap-3 p-5`}>
        <div className="flex items-center justify-between">
          <p className={EYEBROW}>CONEXIÓN</p>
          <button onClick={check} disabled={checking} aria-label="Verificar de nuevo" className="text-[var(--wt-muted)] hover:text-[var(--wt-ink)]">
            <RefreshCw size={15} className={checking ? 'animate-spin' : ''} />
          </button>
        </div>
        {checking && !status ? (
          <p className="flex items-center gap-2 text-[13.5px] text-[var(--wt-muted)]"><Loader2 className="animate-spin" size={15} /> Verificando…</p>
        ) : ready ? (
          <p className="flex items-start gap-2 text-[13.5px] font-semibold text-[#00705f]">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>Conectado como <strong>@{status.username}</strong>{status.accountType ? ` (${status.accountType.toLowerCase()})` : ''}.</span>
          </p>
        ) : (
          <div className="flex items-start gap-2 text-[13.5px] font-semibold text-red-600">
            <XCircle size={17} className="mt-0.5 shrink-0" />
            <span>{status?.error || 'No conectado.'}</span>
          </div>
        )}
        <p className="text-[12.5px] leading-relaxed text-[var(--wt-muted)]">
          El token dura 60 días: si deja de funcionar, generá uno nuevo en Meta y actualizá <code>INSTAGRAM_ACCESS_TOKEN</code> en Vercel.
        </p>
      </div>
    </div>
  );
}
