import {
  AlertTriangle,
  Bell,
  Cake,
  Coffee,
  CreditCard,
  Leaf,
  Milk,
  Package,
  ShoppingBag,
  Sprout,
  Truck,
  Wheat,
} from 'lucide-react';

const DEFAULT_PREFS = () => ({
  diet: [],
  allergies: [],
  religions: [],
  milk: '',
  sweetener: '',
  coffee: '',
  toppings: [],
  pickup: '',
  packaging: [],
  schedule: '',
  birthday: '',
  alerts: [],
  payment: '',
});

function Chip({ label, active, onClick }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
        active
          ? 'border-primary bg-primary-soft text-primary-strong'
          : 'border-line bg-surface text-ink-muted hover:bg-surface-alt'
      }`}
    >
      <input type="checkbox" className="hidden" checked={Boolean(active)} onChange={onClick} />
      {label}
    </label>
  );
}

export default function PreferencesEditor({ value, onChange }) {
  const prefs = { ...DEFAULT_PREFS(), ...(value || {}), diet: value?.diet || [], allergies: value?.allergies || [], religions: value?.religions || [], toppings: value?.toppings || [], packaging: value?.packaging || [], alerts: value?.alerts || [] };

  const set = (patch) => onChange({ ...prefs, ...patch });

  const toggleMulti = (key, item) =>
    set({ [key]: prefs[key].includes(item) ? prefs[key].filter((x) => x !== item) : [...prefs[key], item] });

  const setSingle = (key, item) => set({ [key]: prefs[key] === item ? '' : item });

  const section = (title, Icon, children) => (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-ink">
        <Icon size={16} className="text-primary-strong" />
        {title}
      </h4>
      {children}
      <div className="my-5 border-t border-line" />
    </div>
  );

  const chips = (key, list, single) => (
    <div className="flex flex-wrap gap-2.5">
      {list.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          active={single ? prefs[key] === opt.value : prefs[key].includes(opt.value)}
          onClick={() => (single ? setSingle(key, opt.value) : toggleMulti(key, opt.value))}
        />
      ))}
    </div>
  );

  return (
    <div>
      {section('Estilo de Alimentación', Sprout,
        chips('diet', [
          { value: 'vegan', label: 'Vegano' },
          { value: 'vegetarian', label: 'Vegetariano' },
          { value: 'celiac', label: 'Celiaco / Sin TACC' },
          { value: 'lactoVegetarian', label: 'Lacto-vegetariano' },
          { value: 'ovoVegetarian', label: 'Ovovegetariano' },
          { value: 'pescatarian', label: 'Pescetariano' },
          { value: 'keto', label: 'Keto / Low Carb' },
        ]))}

      {section('Alergias e Intolerancias (Alertas automáticas)', AlertTriangle,
        chips('allergies', [
          { value: 'nuts', label: 'Frutos secos (maní, nueces, almendras)' },
          { value: 'lactose', label: 'Lactosa' },
          { value: 'gluten', label: 'Gluten' },
          { value: 'soy', label: 'Soja' },
          { value: 'egg', label: 'Huevo' },
          { value: 'sesame', label: 'Sésamo' },
        ]))}

      {section('Restricciones Religiosas o éticas', Wheat,
        chips('religions', [
          { value: 'kosher', label: 'Kosher' },
          { value: 'halal', label: 'Halal' },
        ]))}

      {section('Preferencias de Preparación de Bebidas', Coffee, (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Tipo de Leche Preferida</p>
            {chips('milk', [
              { value: 'whole', label: 'Entera' },
              { value: 'skim', label: 'Descremada' },
              { value: 'lactoseFree', label: 'Sin Lactosa' },
              { value: 'almond', label: 'Leche de Almendras' },
              { value: 'oat', label: 'Leche de Avena' },
              { value: 'soy', label: 'Leche de Soja' },
            ], true)}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Nivel de Endulzante</p>
            {chips('sweetener', [
              { value: 'none', label: 'Sin azúcar' },
              { value: 'whiteSugar', label: 'Azúcar blanca' },
              { value: 'brownSugar', label: 'Azúcar moscabado / rubia' },
              { value: 'honey', label: 'Miel' },
              { value: 'sweetener', label: 'Edulcorante (Stevia, Sucralosa)' },
            ], true)}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Intensidad del Café</p>
            {chips('coffee', [
              { value: 'single', label: 'Espresso simple' },
              { value: 'double', label: 'Doble shot' },
              { value: 'decaf', label: 'Descafeinado' },
              { value: 'extraHot', label: 'Extra caliente' },
              { value: 'drinkNow', label: 'Con temperatura de consumo inmediato' },
            ], true)}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Toppings / Extras recurrentes</p>
            {chips('toppings', [
              { value: 'whippedCream', label: 'Con/Sin crema batida' },
              { value: 'cinnamon', label: 'Canela' },
              { value: 'cocoa', label: 'Cacao en polvo' },
              { value: 'noIce', label: 'Sin hielo (para bebidas frías)' },
            ])}
          </div>
        </div>
      ))}

      {section('Experiencia de Retiro y Entrega', Truck, (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Método Preferido</p>
            {chips('pickup', [
              { value: 'dineIn', label: 'Para consumir en el local' },
              { value: 'takeaway', label: 'Para llevar (Takeaway)' },
              { value: 'table', label: 'Pedir a la mesa (Scan QR)' },
              { value: 'delivery', label: 'Delivery' },
            ], true)}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Empaque y Sustentabilidad</p>
            {chips('packaging', [
              { value: 'noDisposables', label: 'No incluir cubiertos ni sorbetes descartables' },
              { value: 'ownMug', label: 'Usar mi propio vaso / mug reutilizable (puntos extra)' },
            ])}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Horario Habitual / Pedido Programado</p>
            <input
              className="input"
              value={prefs.schedule}
              onChange={(e) => set({ schedule: e.target.value })}
              placeholder="Ej: Lunes a Viernes 08:30 AM"
            />
          </div>
        </div>
      ))}

      {section('Fidelización y Comunicación', Bell, (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Beneficio de Cumpleaños</p>
            <input
              type="date"
              className="input max-w-xs"
              value={prefs.birthday}
              onChange={(e) => set({ birthday: e.target.value })}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Alertas y Notificaciones</p>
            {chips('alerts', [
              { value: 'stock', label: 'Aviso de stock de productos favoritos' },
              { value: 'orderStatus', label: 'Avisos de estado del pedido ("Tu café está listo")' },
              { value: 'happyHour', label: 'Promociones por horario (Happy Hour)' },
            ])}
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Método de Pago Predeterminado</p>
            {chips('payment', [
              { value: 'card', label: 'Tarjeta de crédito/débito' },
              { value: 'wallet', label: 'Saldo precargado en la app (Billetera digital)' },
              { value: 'mercadoPago', label: 'Mercado Pago / Wallet externa' },
            ], true)}
          </div>
        </div>
      ))}
    </div>
  );
}

export const PREF_SECTIONS = [
  { title: 'Estilo de Alimentación', icon: Sprout, key: 'diet', options: [
    ['vegan', 'Vegano'], ['vegetarian', 'Vegetariano'], ['celiac', 'Celiaco / Sin TACC'],
    ['lactoVegetarian', 'Lacto-vegetariano'], ['ovoVegetarian', 'Ovovegetariano'],
    ['pescatarian', 'Pescetariano'], ['keto', 'Keto / Low Carb'],
  ]},
  { title: 'Alergias e Intolerancias', icon: AlertTriangle, key: 'allergies', options: [
    ['nuts', 'Frutos secos'], ['lactose', 'Lactosa'], ['gluten', 'Gluten'],
    ['soy', 'Soja'], ['egg', 'Huevo'], ['sesame', 'Sésamo'],
  ]},
  { title: 'Restricciones Religiosas o éticas', icon: Wheat, key: 'religions', options: [
    ['kosher', 'Kosher'], ['halal', 'Halal'],
  ]},
  { title: 'Tipo de Leche', icon: Milk, key: 'milk', single: true, options: [
    ['whole', 'Entera'], ['skim', 'Descremada'], ['lactoseFree', 'Sin Lactosa'],
    ['almond', 'Leche de Almendras'], ['oat', 'Leche de Avena'], ['soy', 'Leche de Soja'],
  ]},
  { title: 'Nivel de Endulzante', icon: Leaf, key: 'sweetener', single: true, options: [
    ['none', 'Sin azúcar'], ['whiteSugar', 'Azúcar blanca'], ['brownSugar', 'Azúcar moscabado'],
    ['honey', 'Miel'], ['sweetener', 'Edulcorante'],
  ]},
  { title: 'Intensidad del Café', icon: Coffee, key: 'coffee', single: true, options: [
    ['single', 'Espresso simple'], ['double', 'Doble shot'], ['decaf', 'Descafeinado'],
    ['extraHot', 'Extra caliente'], ['drinkNow', 'Consumo inmediato'],
  ]},
  { title: 'Toppings / Extras', icon: ShoppingBag, key: 'toppings', options: [
    ['whippedCream', 'Crema batida'], ['cinnamon', 'Canela'], ['cocoa', 'Cacao en polvo'], ['noIce', 'Sin hielo'],
  ]},
  { title: 'Método de Retiro', icon: Truck, key: 'pickup', single: true, options: [
    ['dineIn', 'En el local'], ['takeaway', 'Takeaway'], ['table', 'Pedir a la mesa'], ['delivery', 'Delivery'],
  ]},
  { title: 'Empaque y Sustentabilidad', icon: Package, key: 'packaging', options: [
    ['noDisposables', 'Sin cubiertos/sorbetes'], ['ownMug', 'Vaso propio'],
  ]},
  { title: 'Alertas y Notificaciones', icon: Bell, key: 'alerts', options: [
    ['stock', 'Stock favoritos'], ['orderStatus', 'Estado del pedido'], ['happyHour', 'Happy Hour'],
  ]},
  { title: 'Método de Pago', icon: CreditCard, key: 'payment', single: true, options: [
    ['card', 'Tarjeta'], ['wallet', 'Billetera digital'], ['mercadoPago', 'Mercado Pago'],
  ]},
  { title: 'Fecha de Nacimiento', icon: Cake, key: 'birthday', text: true },
  { title: 'Horario Habitual', icon: Package, key: 'schedule', text: true },
];

export function prefsSummary(preferences = {}) {
  const prefs = { ...DEFAULT_PREFS(), ...preferences };
  const labels = [];
  for (const sec of PREF_SECTIONS) {
    const opts = new Map(sec.options?.map(([v, l]) => [v, l]));
    if (sec.text) {
      if (prefs[sec.key]) labels.push({ group: sec.title, label: prefs[sec.key] });
      continue;
    }
    if (sec.single) {
      const v = prefs[sec.key];
      if (v && opts.has(v)) labels.push({ group: sec.title, label: opts.get(v) });
      continue;
    }
    for (const v of prefs[sec.key] || []) {
      if (opts.has(v)) labels.push({ group: sec.title, label: opts.get(v) });
    }
  }
  if (prefs.birthday) labels.push({ group: 'Cumpleaños', label: prefs.birthday });
  if (prefs.schedule) labels.push({ group: 'Horario', label: prefs.schedule });
  return labels;
}