import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Check, Loader2, X, ZoomIn } from 'lucide-react';

function createImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = src;
  });
}

export default function ImageCropper({ src, aspect = 4 / 3, cropShape = 'rect', outputSize, onSave, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!cropPixels) return;
    setSaving(true);
    try {
      const image = await createImage(src);
      const out = outputSize || { width: cropPixels.width, height: cropPixels.height };
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(out.width);
      canvas.height = Math.round(out.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      const blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la imagen'))), 'image/jpeg', 0.92)
      );
      const file = new File([blob], `imagen-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await onSave(file);
      onCancel();
    } catch (err) {
      onCancel();
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-ink">Encuadrar imagen</h3>
          <button className="btn-icon" onClick={onCancel} aria-label="Cancelar">
            <X size={20} />
          </button>
        </div>

        <div className="relative h-80 w-full overflow-hidden rounded-xl bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCropPixels(pixels)}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn size={16} className="shrink-0 text-ink-muted" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[hsl(var(--primary))]"
            aria-label="Zoom"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving || !cropPixels}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  );
}