import { useEffect, useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { CARD, EYEBROW, FIELD, BTN_INK } from './SuperAdmin.jsx';

const FORMATS = {
  post: { w: 1080, h: 1350, label: 'Post', dims: '1080 × 1350 · 4:5' },
  story: { w: 1080, h: 1920, label: 'Historia', dims: '1080 × 1920 · 9:16' },
};
const ACCENTS = ['#00cfcd', '#ffe9a8', '#ffc4e1', '#c9bbff', '#08282c'];
const TEMPLATES = [
  { id: 'bottom', label: 'Foto + texto abajo' },
  { id: 'top', label: 'Foto + texto arriba' },
  { id: 'coupon', label: 'Cupón destacado' },
  { id: 'frame', label: 'Marco con imagen' },
];

/* ── Helpers de canvas (dibujo puro, sin estado de React) ── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  let cy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, x, cy);
      line = w;
      cy += lineHeight;
    } else line = test;
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}
function coverImage(ctx, img, x, y, w, h) {
  const ir = img.width / img.height;
  const r = w / h;
  let sx, sy, sw, sh;
  if (ir > r) {
    sh = img.height;
    sw = sh * r;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / r;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}
function placeholderImg(ctx, x, y, w, h, accent) {
  ctx.save();
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.18;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(2, w * 0.006);
  ctx.setLineDash([w * 0.02, w * 0.015]);
  ctx.strokeRect(x + w * 0.01, y + h * 0.01, w * 0.98, h * 0.98);
  ctx.setLineDash([]);
  ctx.fillStyle = accent;
  ctx.font = `600 ${Math.round(w * 0.045)}px Inter`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Imagen sin cargar', x + w / 2, y + h / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}
function contrastColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#08282c' : '#fff';
}
function fitFontSize(ctx, text, maxWidth, maxSize, minSize, family, weight) {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `${weight} ${Math.round(size)}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return Math.round(size);
}
function drawPhotoText(ctx, W, H, s, pos, img) {
  if (img) coverImage(ctx, img, 0, 0, W, H);
  else placeholderImg(ctx, 0, 0, W, H, s.accent);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  if (pos === 'bottom') {
    grad.addColorStop(0, 'rgba(8,40,44,0)');
    grad.addColorStop(0.55, 'rgba(8,40,44,0)');
    grad.addColorStop(1, 'rgba(8,40,44,0.88)');
  } else {
    grad.addColorStop(0, 'rgba(8,40,44,0.85)');
    grad.addColorStop(0.45, 'rgba(8,40,44,0)');
    grad.addColorStop(1, 'rgba(8,40,44,0)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const pad = W * 0.08;
  let y = pos === 'bottom' ? H * 0.72 : H * 0.08;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(W * 0.032)}px Inter`;
  const tagW = ctx.measureText(s.tag.toUpperCase()).width + W * 0.06;
  ctx.fillStyle = s.accent;
  roundRect(ctx, pad, y, tagW, W * 0.07, W * 0.035);
  ctx.fill();
  ctx.fillStyle = contrastColor(s.accent);
  ctx.fillText(s.tag.toUpperCase(), pad + W * 0.03, y + W * 0.035);
  y += W * 0.07 + W * 0.06;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  ctx.font = `600 ${Math.round(W * 0.09)}px Fredoka`;
  y = wrapText(ctx, s.title, pad, y, W - pad * 2, W * 0.1);
  ctx.font = `500 ${Math.round(W * 0.038)}px Inter`;
  ctx.fillStyle = 'rgba(255,255,255,.88)';
  y = wrapText(ctx, s.subtitle, pad, y + W * 0.02, W - pad * 2, W * 0.05) + W * 0.03;
  if (s.cta) {
    ctx.font = `700 ${Math.round(W * 0.034)}px Inter`;
    const ctaW = ctx.measureText(s.cta).width + W * 0.09;
    ctx.fillStyle = '#fff';
    roundRect(ctx, pad, y, ctaW, W * 0.075, W * 0.0375);
    ctx.fill();
    ctx.fillStyle = '#08282c';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.cta, pad + W * 0.045, y + W * 0.0375);
  }
}
function drawCoupon(ctx, W, H, s) {
  ctx.fillStyle = '#fffbf5';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = s.accent;
  ctx.fillRect(0, 0, W, H * 0.42);
  const cardX = W * 0.08, cardY = H * 0.36, cardW = W * 0.84, cardH = H * 0.5;
  ctx.fillStyle = '#fff';
  roundRect(ctx, cardX, cardY, cardW, cardH, W * 0.04);
  ctx.fill();
  ctx.setLineDash([W * 0.02, W * 0.015]);
  ctx.strokeStyle = s.accent;
  ctx.lineWidth = W * 0.006;
  roundRect(ctx, cardX + W * 0.03, cardY + W * 0.03, cardW - W * 0.06, cardH - W * 0.06, W * 0.03);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(W * 0.034)}px Inter`;
  ctx.fillStyle = contrastColor(s.accent);
  ctx.fillText(s.tag.toUpperCase(), W / 2, H * 0.18);
  const titleSize = fitFontSize(ctx, s.title, cardW * 0.82, W * 0.17, W * 0.06, 'Fredoka', '600');
  ctx.font = `600 ${titleSize}px Fredoka`;
  ctx.fillStyle = '#08282c';
  ctx.fillText(s.title, W / 2, cardY + cardH * 0.4);
  ctx.font = `500 ${Math.round(W * 0.04)}px Inter`;
  ctx.fillStyle = '#66787a';
  wrapText(ctx, s.subtitle, W / 2, cardY + cardH * 0.62, cardW * 0.78, W * 0.048);
  if (s.cta) {
    ctx.font = `700 ${Math.round(W * 0.036)}px ui-monospace, monospace`;
    ctx.fillStyle = s.accent;
    ctx.fillText(s.cta.toUpperCase(), W / 2, cardY + cardH * 0.88);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
function drawFrame(ctx, W, H, s, img) {
  ctx.fillStyle = '#fffbf5';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = s.accent;
  ctx.fillRect(0, 0, W, H * 0.06);
  const imgX = W * 0.08, imgY = H * 0.12, imgW = W * 0.84, imgH = H * 0.46;
  ctx.save();
  roundRect(ctx, imgX, imgY, imgW, imgH, W * 0.05);
  ctx.clip();
  if (img) coverImage(ctx, img, imgX, imgY, imgW, imgH);
  else placeholderImg(ctx, imgX, imgY, imgW, imgH, s.accent);
  ctx.restore();
  let y = imgY + imgH + H * 0.07;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${Math.round(W * 0.032)}px Inter`;
  ctx.fillStyle = s.accent;
  ctx.fillText(s.tag.toUpperCase(), imgX, y);
  y += W * 0.09;
  ctx.font = `600 ${Math.round(W * 0.075)}px Fredoka`;
  ctx.fillStyle = '#08282c';
  y = wrapText(ctx, s.title, imgX, y, W - imgX * 2, W * 0.085);
  ctx.font = `500 ${Math.round(W * 0.036)}px Inter`;
  ctx.fillStyle = '#66787a';
  y = wrapText(ctx, s.subtitle, imgX, y + W * 0.015, W - imgX * 2, W * 0.05) + W * 0.03;
  if (s.cta) {
    ctx.font = `700 ${Math.round(W * 0.032)}px Inter`;
    const ctaW = ctx.measureText(s.cta).width + W * 0.08;
    ctx.fillStyle = '#08282c';
    roundRect(ctx, imgX, y, ctaW, W * 0.07, W * 0.035);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.cta, imgX + W * 0.04, y + W * 0.035);
  }
}

/* ── Miniaturas de plantilla (solo CSS) ── */
function TemplateThumb({ id }) {
  const base = 'relative h-[52px] w-full overflow-hidden rounded-lg bg-[#e8e2d8]';
  if (id === 'bottom')
    return (
      <div className={base} style={{ background: 'linear-gradient(180deg,#e8e2d8 0%,#e8e2d8 55%,#08282c 100%)' }}>
        <div className="absolute bottom-4 left-1.5 h-2 w-[40%] rounded-sm bg-[#00cfcd]" />
        <div className="absolute bottom-1.5 left-1.5 h-1.5 w-[60%] rounded-sm bg-white" />
      </div>
    );
  if (id === 'top')
    return (
      <div className={base} style={{ background: 'linear-gradient(0deg,#e8e2d8 0%,#e8e2d8 55%,#08282c 100%)' }}>
        <div className="absolute top-4 left-1.5 h-2 w-[40%] rounded-sm bg-[#00cfcd]" />
        <div className="absolute top-1.5 left-1.5 h-1.5 w-[60%] rounded-sm bg-white" />
      </div>
    );
  if (id === 'coupon')
    return (
      <div className={base}>
        <div className="absolute inset-x-1 top-1 h-4 rounded bg-[#00cfcd]" />
        <div className="absolute inset-x-3.5 bottom-1.5 h-5 rounded border-[1.5px] border-dashed border-[#00cfcd] bg-white" />
      </div>
    );
  return (
    <div className={base}>
      <div className="absolute inset-x-2.5 top-1 h-6 rounded-md bg-[#00cfcd]" />
      <div className="absolute bottom-3.5 left-2.5 h-1.5 w-[70%] rounded-sm bg-[#66787a]" />
      <div className="absolute bottom-1.5 left-2.5 h-1.5 w-[50%] rounded-sm bg-[#08282c]" />
    </div>
  );
}

/* ── Componente principal ── */
export default function SocialContentTab() {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const [format, setFormat] = useState('post');
  const [template, setTemplate] = useState('bottom');
  const [accent, setAccent] = useState('#00cfcd');
  const [tag, setTag] = useState('PROMO');
  const [title, setTitle] = useState('20% OFF');
  const [subtitle, setSubtitle] = useState('Válido todo el fin de semana');
  const [cta, setCta] = useState('Reservar ahora');
  const [imageSrc, setImageSrc] = useState(null);
  const [imageName, setImageName] = useState('');
  const [, bump] = useState(0);

  const dims = FORMATS[format];

  function getImage() {
    if (!imageSrc) return null;
    const cur = imgRef.current;
    if (cur && cur._src === imageSrc && cur.complete) return cur;
    const img = new Image();
    img._src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      bump((n) => n + 1);
    };
    img.src = imageSrc;
    return null;
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { w: W, h: H } = dims;
    ctx.clearRect(0, 0, W, H);
    const state = { accent, tag, title, subtitle, cta };
    const img = getImage();
    if (template === 'coupon') drawCoupon(ctx, W, H, state);
    else if (template === 'frame') drawFrame(ctx, W, H, state, img);
    else drawPhotoText(ctx, W, H, state, template === 'top' ? 'top' : 'bottom', img);
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, template, accent, tag, title, subtitle, cta, imageSrc]);

  useEffect(() => {
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imgRef.current = null;
      setImageSrc(reader.result);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `wintuu-${template}-${format}.png`;
    a.click();
  }

  const scale = 620 / dims.h;
  const previewW = Math.round(dims.w * scale);
  const previewH = Math.round(dims.h * scale);
  const labels =
    template === 'coupon'
      ? { tag: 'Etiqueta (ej. CUPÓN)', title: 'Descuento grande', subtitle: 'Condición', cta: 'Código' }
      : { tag: 'Etiqueta', title: 'Título', subtitle: 'Subtítulo', cta: 'Texto del botón (opcional)' };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
      <div className={`${CARD} flex flex-col gap-5 p-[18px] lg:sticky lg:top-4`}>
        <div>
          <p className={`mb-2 ${EYEBROW}`}>FORMATO</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FORMATS).map(([id, f]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFormat(id)}
                className="rounded-[14px] border-[1.5px] px-3 py-3 text-left text-[12.5px] font-bold text-[#08282c]"
                style={{ background: format === id ? '#e6faf6' : '#fff', borderColor: format === id ? '#00cfcd' : 'rgba(20,36,37,.12)' }}
              >
                {f.label}
                <span className="mt-0.5 block text-[11px] font-medium text-[var(--wt-muted)]">{f.dims}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={`mb-2 ${EYEBROW}`}>PLANTILLA</p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className="flex flex-col gap-1.5 rounded-[14px] border-[1.5px] p-2"
                style={{ background: template === t.id ? '#e6faf6' : '#fff', borderColor: template === t.id ? '#00cfcd' : 'rgba(20,36,37,.12)' }}
              >
                <TemplateThumb id={t.id} />
                <span className="text-[11px] font-bold text-[#08282c]">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={`mb-2 ${EYEBROW}`}>COLOR DE ACENTO</p>
          <div className="flex gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                aria-label={`Color ${c}`}
                className="h-8 w-8 rounded-full"
                style={{ background: c, border: accent === c ? '3px solid #08282c' : '3px solid transparent' }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className={`mb-2 ${EYEBROW}`}>IMAGEN</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {imageSrc ? (
            <div className="flex items-center gap-2">
              <img src={imageSrc} alt="" className="h-11 w-11 shrink-0 rounded-[10px] object-cover" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-[var(--wt-text)]">{imageName}</span>
              <button
                type="button"
                onClick={() => {
                  imgRef.current = null;
                  setImageSrc(null);
                  setImageName('');
                }}
                className="shrink-0 text-[12px] font-bold text-[#9b1c4b]"
              >
                Quitar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-[rgba(20,36,37,.25)] bg-[var(--wt-bg)] px-4 py-4 text-[13px] font-semibold text-[var(--wt-muted)]"
            >
              <Upload size={15} /> Cargar imagen
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <p className={EYEBROW}>TEXTOS</p>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            {labels.tag}
            <input className={FIELD} value={tag} onChange={(e) => setTag(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            {labels.title}
            <input className={FIELD} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            {labels.subtitle}
            <input className={FIELD} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            {labels.cta}
            <input className={FIELD} value={cta} onChange={(e) => setCta(e.target.value)} />
          </label>
        </div>

        <button type="button" onClick={exportPng} className={BTN_INK}>
          <Download size={15} /> Descargar PNG
        </button>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <div className={`${CARD} flex w-full justify-center p-5`}>
          <canvas
            ref={canvasRef}
            width={dims.w}
            height={dims.h}
            style={{ width: previewW, height: previewH, borderRadius: 16, boxShadow: '0 20px 50px -25px rgba(8,40,44,.35)' }}
          />
        </div>
        <p className="text-[12.5px] text-[var(--wt-muted)]">
          {dims.w} × {dims.h} px · PNG lista para Instagram/Facebook
        </p>
      </div>
    </div>
  );
}
