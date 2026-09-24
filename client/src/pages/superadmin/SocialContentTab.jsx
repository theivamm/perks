import { useEffect, useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { CARD, EYEBROW, FIELD, BTN_INK } from './SuperAdmin.jsx';

const FORMATS = {
  post: { w: 1080, h: 1350, label: 'Post', dims: '1080 × 1350 · 4:5' },
  story: { w: 1080, h: 1920, label: 'Historia', dims: '1080 × 1920 · 9:16' },
};
const ACCENTS = ['#00cfcd', '#ffe9a8', '#ffc4e1', '#c9bbff', '#08282c'];
const LOGO_COLORS = ['#ffffff', '#00cfcd', '#08282c'];

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
function shade(hex, amt) {
  const c = hex.replace('#', '');
  let r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  r = Math.max(0, Math.min(255, Math.round(r * (1 + amt))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 + amt))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 + amt))));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
function hexToRgba(hex, a) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function layoutWrap(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function drawLines(ctx, lines, x, y, lineHeight) {
  lines.forEach((l) => {
    ctx.fillText(l, x, y);
    y += lineHeight;
  });
  return y;
}
function drawLogo(ctx, x, y, size, color, align) {
  ctx.font = `700 ${Math.round(size)}px Fredoka`;
  ctx.fillStyle = color;
  ctx.textAlign = align === 'center' ? 'center' : 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('wintuu', x, y);
  ctx.textAlign = 'left';
}
function drawPhoto(ctx, W, H, s, img) {
  if (img) coverImage(ctx, img, 0, 0, W, H);
  else placeholderImg(ctx, 0, 0, W, H, s.accent);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(8,40,44,0.82)');
  grad.addColorStop(0.5, 'rgba(8,40,44,0.15)');
  grad.addColorStop(1, 'rgba(8,40,44,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const pad = W * 0.08;
  let y = H * 0.075;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (s.showLogo) {
    drawLogo(ctx, pad, y + W * 0.05, W * 0.055, s.logoColor, 'left');
    y += W * 0.11;
  }
  if (s.tag) {
    ctx.font = `700 ${Math.round(W * 0.032)}px Inter`;
    const tagW = ctx.measureText(s.tag.toUpperCase()).width + W * 0.06;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = s.accent;
    roundRect(ctx, pad, y, tagW, W * 0.07, W * 0.035);
    ctx.fill();
    ctx.fillStyle = contrastColor(s.accent);
    ctx.fillText(s.tag.toUpperCase(), pad + W * 0.03, y + W * 0.035);
    y += W * 0.07 + W * 0.05;
    ctx.textBaseline = 'alphabetic';
  }
  ctx.fillStyle = '#fff';
  ctx.font = `600 ${Math.round(W * 0.085)}px Fredoka`;
  y = drawLines(ctx, layoutWrap(ctx, s.title, W - pad * 2), pad, y + W * 0.075, W * 0.095);
  ctx.font = `500 ${Math.round(W * 0.038)}px Inter`;
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  y = drawLines(ctx, layoutWrap(ctx, s.subtitle, W - pad * 2), pad, y + W * 0.025, W * 0.05) + W * 0.03;
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
function drawSolid(ctx, W, H, s) {
  if (s.bgStyle === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, s.accent);
    grad.addColorStop(1, shade(s.accent, -0.42));
    ctx.fillStyle = grad;
  } else ctx.fillStyle = s.accent;
  ctx.fillRect(0, 0, W, H);
  const ink = contrastColor(s.accent);
  const center = s.align === 'center';
  const pad = W * 0.1;
  const x = center ? W / 2 : pad;
  const maxW = center ? W * 0.82 : W - pad * 2;
  ctx.textAlign = center ? 'center' : 'left';
  const logoSize = W * 0.07, tagSize = W * 0.034, titleSize = W * 0.11, subSize = W * 0.042, ctaSize = W * 0.036;
  const logoH = s.showLogo ? logoSize * 1.5 : 0;
  const tagH = s.tag ? tagSize * 1.9 : 0;
  ctx.font = `700 ${Math.round(titleSize)}px Fredoka`;
  const titleLines = layoutWrap(ctx, s.title, maxW);
  const titleLH = titleSize * 1.06;
  ctx.font = `500 ${Math.round(subSize)}px Inter`;
  const subLines = s.subtitle ? layoutWrap(ctx, s.subtitle, maxW) : [];
  const subLH = subSize * 1.35;
  const ctaH = s.cta ? ctaSize * 2.3 : 0;
  const total = logoH + tagH + titleLines.length * titleLH + (subLines.length ? subLH * subLines.length + subSize * 0.7 : 0) + ctaH + (ctaH ? subSize * 0.6 : 0);
  let y = H / 2 - total / 2;
  if (s.showLogo) {
    drawLogo(ctx, x, y + logoSize * 0.78, logoSize, s.logoColor, s.align);
    y += logoH;
  }
  ctx.textBaseline = 'alphabetic';
  if (s.tag) {
    ctx.font = `700 ${Math.round(tagSize)}px Inter`;
    ctx.fillStyle = hexToRgba(ink, 0.72);
    ctx.fillText(s.tag.toUpperCase(), x, y + tagSize);
    y += tagH;
  }
  ctx.font = `700 ${Math.round(titleSize)}px Fredoka`;
  ctx.fillStyle = ink;
  y = drawLines(ctx, titleLines, x, y + titleSize * 0.9, titleLH) - titleLH + titleLines.length * titleLH;
  if (subLines.length) {
    ctx.font = `500 ${Math.round(subSize)}px Inter`;
    ctx.fillStyle = hexToRgba(ink, 0.82);
    y = drawLines(ctx, subLines, x, y + subSize * 1.1, subLH) + subSize * 0.5;
  }
  if (s.cta) {
    ctx.font = `700 ${Math.round(ctaSize)}px Inter`;
    const ctaW = ctx.measureText(s.cta).width + W * 0.09;
    const ctaX = center ? x - ctaW / 2 : x;
    ctx.textAlign = 'left';
    ctx.fillStyle = ink;
    roundRect(ctx, ctaX, y, ctaW, ctaSize * 2.2, ctaSize * 1.1);
    ctx.fill();
    ctx.fillStyle = s.accent;
    ctx.textBaseline = 'middle';
    ctx.fillText(s.cta, ctaX + W * 0.045, y + ctaSize * 1.1);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

/* ── Miniaturas de plantilla (solo CSS) ── */
function TemplateThumb({ id }) {
  if (id === 'photo')
    return (
      <div className="relative h-[52px] w-full overflow-hidden rounded-lg" style={{ background: 'linear-gradient(0deg,#e8e2d8 0%,#e8e2d8 55%,#08282c 100%)' }}>
        <div className="absolute top-4 left-1.5 h-2 w-[40%] rounded-sm bg-[#00cfcd]" />
        <div className="absolute top-1.5 left-1.5 h-1.5 w-[60%] rounded-sm bg-white" />
      </div>
    );
  return (
    <div className="relative h-[52px] w-full overflow-hidden rounded-lg" style={{ background: 'linear-gradient(135deg,#00cfcd,#08282c)' }}>
      <div className="absolute top-1/2 left-1/2 h-1.5 w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white" />
    </div>
  );
}

/* ── Componente principal ── */
export default function SocialContentTab() {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(null);
  const [format, setFormat] = useState('post');
  const [template, setTemplate] = useState('photo');
  const [bgStyle, setBgStyle] = useState('gradient');
  const [align, setAlign] = useState('center');
  const [showLogo, setShowLogo] = useState(true);
  const [logoColor, setLogoColor] = useState('#ffffff');
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
    const state = { accent, tag, title, subtitle, cta, showLogo, logoColor, bgStyle, align };
    if (template === 'solid') drawSolid(ctx, W, H, state);
    else drawPhoto(ctx, W, H, state, getImage());
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, template, bgStyle, align, showLogo, logoColor, accent, tag, title, subtitle, cta, imageSrc]);

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

  const segBtn = (active) => ({
    background: active ? '#08282c' : 'transparent',
    color: active ? '#fff' : '#66787a',
  });

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
            {[
              ['photo', 'Foto + texto arriba'],
              ['solid', 'Fondo de color'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTemplate(id)}
                className="flex flex-col gap-1.5 rounded-[14px] border-[1.5px] p-2"
                style={{ background: template === id ? '#e6faf6' : '#fff', borderColor: template === id ? '#00cfcd' : 'rgba(20,36,37,.12)' }}
              >
                <TemplateThumb id={id} />
                <span className="text-[11px] font-bold text-[#08282c]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {template === 'solid' && (
          <>
            <div>
              <p className={`mb-2 ${EYEBROW}`}>ESTILO DE FONDO</p>
              <div className="flex gap-1 rounded-full border border-[rgba(20,36,37,.08)] bg-[var(--wt-bg)] p-1">
                {[
                  ['solid', 'Sólido'],
                  ['gradient', 'Degradado'],
                ].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setBgStyle(id)} className="flex-1 rounded-full py-2 text-[12px] font-bold" style={segBtn(bgStyle === id)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={`mb-2 ${EYEBROW}`}>ALINEACIÓN DE TEXTO</p>
              <div className="flex gap-1 rounded-full border border-[rgba(20,36,37,.08)] bg-[var(--wt-bg)] p-1">
                {[
                  ['center', 'Centrado'],
                  ['left', 'Izquierda'],
                ].map(([id, label]) => (
                  <button key={id} type="button" onClick={() => setAlign(id)} className="flex-1 rounded-full py-2 text-[12px] font-bold" style={segBtn(align === id)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

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
          <p className={`mb-2 ${EYEBROW}`}>LOGO WINTUU</p>
          <div className="mb-2 flex gap-1 rounded-full border border-[rgba(20,36,37,.08)] bg-[var(--wt-bg)] p-1">
            {[
              [true, 'Con logo'],
              [false, 'Sin logo'],
            ].map(([val, label]) => (
              <button key={label} type="button" onClick={() => setShowLogo(val)} className="flex-1 rounded-full py-2 text-[12px] font-bold" style={segBtn(showLogo === val)}>
                {label}
              </button>
            ))}
          </div>
          {showLogo && (
            <div className="flex gap-2">
              {LOGO_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setLogoColor(c)}
                  aria-label={`Logo ${c}`}
                  className="h-7 w-7 rounded-full shadow-[0_0_0_1px_rgba(20,36,37,.1)_inset]"
                  style={{ background: c, border: logoColor === c ? '3px solid #08282c' : '3px solid rgba(20,36,37,.15)' }}
                />
              ))}
            </div>
          )}
        </div>

        {template === 'photo' && (
          <div>
            <p className={`mb-2 ${EYEBROW}`}>IMAGEN</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {imageSrc ? (
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 shrink-0 rounded-[10px] bg-[var(--wt-bg)] bg-cover bg-center" style={{ backgroundImage: `url(${imageSrc})` }} />
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
        )}

        <div className="flex flex-col gap-2.5">
          <p className={EYEBROW}>TEXTOS</p>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            Etiqueta
            <input className={FIELD} value={tag} onChange={(e) => setTag(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            Título
            <input className={FIELD} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            Subtítulo
            <input className={FIELD} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#08282c]">
            Texto del botón (opcional)
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
