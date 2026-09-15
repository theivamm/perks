import {
  BadgeCheck,
  BadgePercent,
  Bell,
  CheckCircle2,
  Gift,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  XCircle,
} from 'lucide-react';

const META = {
  new_order: { icon: ShoppingCart, style: 'bg-primary-soft text-primary-strong' },
  order_dispatched: { icon: Truck, style: 'bg-amber-500/15 text-amber-500' },
  order_shipped: { icon: Truck, style: 'bg-amber-500/15 text-amber-500' },
  order_completed: { icon: CheckCircle2, style: 'bg-green-500/15 text-green-500' },
  order_cancelled: { icon: XCircle, style: 'bg-red-500/15 text-red-500' },
  purchase_added: { icon: ShoppingBag, style: 'bg-green-500/15 text-green-500' },
  coupon_won: { icon: Gift, style: 'bg-primary-soft text-primary-strong' },
  coupon_used: { icon: BadgeCheck, style: 'bg-green-500/15 text-green-500' },
  coupons_available: { icon: BadgePercent, style: 'bg-amber-500/15 text-amber-500' },
  reward_progress: { icon: Sparkles, style: 'bg-purple-500/15 text-purple-500' },
  milestone_reached: { icon: Gift, style: 'bg-primary-soft text-primary-strong' },
};

export function notificationMeta(type) {
  return META[type] || { icon: Bell, style: 'bg-surface-alt text-ink-muted' };
}

export function formatWhen(value) {
  if (!value) return '';
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(d.getTime())) return '';
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `hace ${days} día${days > 1 ? 's' : ''}`;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}