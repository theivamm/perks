import { Loader2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
  const sz = size || (wide ? 'lg' : 'md');
  const maxW = sz === 'xl' ? 'sm:max-w-4xl' : sz === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
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
    const first = dialogRef.current?.querySelector('[autofocus]') || dialogRef.current?.querySelector(FOCUSABLE);
    first?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

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
