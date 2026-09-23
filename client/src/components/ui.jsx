import { AlertTriangle, Check, ChevronDown, HelpCircle, Loader2, Minus, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Spinner({ label = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
      <Loader2 className="animate-spin text-primary" size={28} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-softer text-primary-strong">
        <Icon size={26} />
      </div>
      <p className="font-heading text-lg font-bold text-ink">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-ink-muted">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

// Campo de formulario: etiqueta + control + ayuda opcional.
export function Field({ label, htmlFor, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink">
          {label}
          {required && <span className="ml-0.5 text-primary-strong">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

// Interruptor en fila (reemplaza a los checkbox sueltos).
export function SwitchRow({ checked, onChange, title, subtitle, icon: Icon, tone = 'default', children }) {
  const on = Boolean(checked);
  const toneCls = tone === 'amber' && on ? 'border-amber-300/70 bg-amber-50/70 dark:border-amber-400/40 dark:bg-amber-400/10' : 'border-line bg-surface';
  return (
    <div className={`rounded-2xl border transition-colors ${toneCls}`}>
      <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone === 'amber' ? 'bg-amber-400/15 text-amber-600 dark:text-amber-400' : 'bg-primary-softer text-primary-strong'}`}>
            <Icon size={17} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{title}</span>
          {subtitle && <span className="mt-0.5 block text-xs text-ink-muted">{subtitle}</span>}
        </span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? (tone === 'amber' ? 'bg-amber-500' : 'bg-primary') : 'bg-line'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
        </span>
      </button>
      {on && children && <div className="animate-fade-up border-t border-line/70 px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

// Selector de opciones en píldora.
export function Segmented({ value, onChange, options, className = '' }) {
  return (
    <div className={`flex gap-1 rounded-2xl bg-surface-alt p-1 ${className}`}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const Icon = typeof o === 'string' ? null : o.icon;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition ${
              value === v ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {Icon && <Icon size={15} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Modal: hoja inferior en mobile, ventana centrada en desktop.
 * Props nuevas (opcionales): subtitle, icon, footer (se fija abajo), size ('md' | 'lg' | 'xl').
 * `wide` se mantiene por compatibilidad (= size 'lg').
 */
export function Modal({ open, onClose, title, subtitle, icon: Icon, footer, children, wide, size }) {
  const dialogRef = useRef(null);
  // onClose suele venir inline desde el padre (cambia en cada tecla). Lo guardamos
  // en un ref para que el efecto de abajo corra SOLO al abrir/cerrar; si no, cada
  // render volvía a enfocar el primer elemento (la X) y el input perdía el foco.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const sz = size || (wide ? 'lg' : 'md');
  const maxW = sz === 'xl' ? 'sm:max-w-4xl' : sz === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') return onCloseRef.current?.();
      if (e.key !== 'Tab') return;
      const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const previouslyFocused = document.activeElement;
    // Si algo dentro del modal ya tiene foco (p. ej. un input con autoFocus), lo respetamos.
    // Si no, enfocamos el primer campo; la X queda como último recurso.
    if (!dialogRef.current?.contains(document.activeElement)) {
      const target =
        dialogRef.current?.querySelector('[autofocus], [data-autofocus]') ||
        dialogRef.current?.querySelector('input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])') ||
        dialogRef.current?.querySelector(FOCUSABLE);
      target?.focus();
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="animate-fade-in absolute inset-0 bg-ink/40 backdrop-blur-[3px] dark:bg-black/60" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`animate-fade-up relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-line bg-surface shadow-2xl sm:max-h-[88vh] sm:rounded-[28px] ${maxW}`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden" />
        <div className="flex shrink-0 items-start gap-3 px-5 pb-4 pt-4 sm:px-6 sm:pt-6">
          {Icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-softer text-primary-strong">
              <Icon size={20} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 id="modal-title" className="font-heading text-xl font-bold leading-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <button className="btn-icon -mr-1.5 -mt-1 shrink-0" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-page/60 px-5 py-3.5 sm:px-6">{footer}</div>
        )}
      </div>
    </div>
  );
}

let toastTimer = null;
export function toast(msg) {
  const el = document.getElementById('toast-root');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('opacity-0', 'translate-y-2');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('opacity-0', 'translate-y-2'), 2400);
}

export function ToastHost() {
  return (
    <div
      id="toast-root"
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-surface-page opacity-0 shadow-soft transition-all duration-300 translate-y-2 lg:bottom-8 dark:border dark:border-line dark:bg-surface dark:text-ink"
    />
  );
}

/**
 * Dropdown propio (reemplaza <select> nativo).
 * options: [{ value, label, hint?, icon? }]. Opción con `divider: true` dibuja una línea antes.
 */
export function Select({ id, value, onChange, options, placeholder = 'Elegí una opción', className = '' }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    setHi(Math.max(0, options.findIndex((o) => o.value === value)));
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (o) => {
    onChange(o.value);
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      setHi((h) => (h + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    }
    if ((e.key === 'Enter' || e.key === ' ') && open && hi >= 0) { e.preventDefault(); pick(options[hi]); }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`input flex items-center justify-between gap-2 text-left ${open ? '!border-primary ring-4 ring-primary/15' : ''}`}
      >
        <span className={`flex min-w-0 items-center gap-2 truncate ${current ? 'text-ink' : 'text-ink-muted'}`}>
          {current?.icon && <current.icon size={15} className="shrink-0 text-primary-strong" />}
          <span className="truncate">{current ? current.label : placeholder}</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" className="animate-fade-up absolute left-0 right-0 top-full z-[70] mt-2 max-h-64 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-2xl">
          {options.map((o, i) => {
            const sel = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={sel}>
                {o.divider && <div className="mx-2 my-1 h-px bg-line" />}
                <button
                  type="button"
                  onMouseEnter={() => setHi(i)}
                  onClick={() => pick(o)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                    i === hi ? 'bg-surface-alt' : ''
                  } ${sel ? 'font-bold text-primary-strong' : o.accent ? 'font-semibold text-primary-strong' : 'font-medium text-ink'}`}
                >
                  {o.icon && <o.icon size={15} className="shrink-0" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.hint && <span className="block truncate text-[11px] font-normal text-ink-muted">{o.hint}</span>}
                  </span>
                  {sel && <Check size={15} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Número con botones − / +.
export function Stepper({ id, value, onChange, min = 1, max = 999, suffix }) {
  const n = Number(value) || 0;
  const set = (v) => onChange(String(Math.min(max, Math.max(min, v))));
  const btn = 'flex h-full w-11 shrink-0 items-center justify-center text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink disabled:opacity-30';
  return (
    <div className="flex h-[46px] items-stretch overflow-hidden rounded-2xl border border-line bg-surface focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
      <button type="button" className={btn} onClick={() => set(n - 1)} disabled={n <= min} aria-label="Restar">
        <Minus size={16} />
      </button>
      <div className="flex flex-1 items-center justify-center gap-1.5 border-x border-line">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 bg-transparent text-center font-heading text-lg font-bold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="text-sm font-semibold text-ink-muted">{suffix}</span>}
      </div>
      <button type="button" className={btn} onClick={() => set(n + 1)} disabled={n >= max} aria-label="Sumar">
        <Plus size={16} />
      </button>
    </div>
  );
}

/**
 * Reemplazo de window.confirm(): `if (!(await confirmDialog({ title, message }))) return;`
 * tone: 'danger' (rojo, por defecto) | 'default'.
 */
export function confirmDialog({ title = '¿Estás seguro?', message = '', confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', tone = 'danger' } = {}) {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const done = (v) => {
      resolve(v);
      root.unmount();
      host.remove();
    };
    root.render(<ConfirmBox {...{ title, message, confirmLabel, cancelLabel, tone }} onDone={done} />);
  });
}

function ConfirmBox({ title, message, confirmLabel, cancelLabel, tone, onDone }) {
  const okRef = useRef(null);
  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onDone(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onDone]);
  const danger = tone === 'danger';
  const Icon = danger ? AlertTriangle : HelpCircle;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="animate-fade-in absolute inset-0 bg-ink/40 backdrop-blur-[3px] dark:bg-black/60" onClick={() => onDone(false)} />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="animate-fade-up relative w-full max-w-sm rounded-[28px] border border-line bg-surface p-6 text-center shadow-2xl">
        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${danger ? 'bg-red-500/10 text-red-500' : 'bg-primary-softer text-primary-strong'}`}>
          <Icon size={26} />
        </span>
        <h3 id="confirm-title" className="mt-4 font-heading text-xl font-bold leading-tight text-ink">{title}</h3>
        {message && <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{message}</p>}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" className="btn-ghost justify-center" onClick={() => onDone(false)}>
            {cancelLabel}
          </button>
          <button
            ref={okRef}
            type="button"
            onClick={() => onDone(true)}
            className={danger ? 'btn-danger justify-center' : 'btn-primary justify-center'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
