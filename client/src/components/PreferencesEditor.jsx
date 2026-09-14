import {
  AlertTriangle,
  Ban,
  Bean,
  Bell,
  BellRing,
  Bike,
  Cake,
  Check,
  CircleDot,
  CircleOff,
  Clock,
  Coffee,
  Cookie,
  CreditCard,
  CupSoda,
  Droplets,
  Egg,
  EggOff,
  Fish,
  Flame,
  IceCream,
  Landmark,
  Leaf,
  Milk,
  MilkOff,
  MoonStar,
  Nut,
  Package,
  Recycle,
  Scan,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sprout,
  Square,
  Star,
  Timer,
  Truck,
  Utensils,
  Wallet,
  Wand2,
  Wheat,
  WheatOff,
  Zap,
} from 'lucide-react';

const DIET = Sprout;
const ALERGY = AlertTriangle;
const RELIGION = MoonStar;
const MILK = Milk;
const SWEETENER = Cookie;
const COFFEE = Coffee;
const TOPPINGS = IceCream;
const PICKUP = Truck;
const PACKAGING = Recycle;
const BIRTHDAY = Cake;
const NOTIF = Bell;
const PAYMENT = Wallet;

const CATS = [
  {
    key: 'diet',
    title: 'Estilo de Alimentación',
    subtitle: 'Cómo te gusta comer',
    icon: DIET,
    none: { value: 'ninguna', label: 'Ninguna' },
    gradient: 'from-emerald-50 to-teal-100 dark:from-emerald-500/15 dark:to-teal-500/10',
    border: 'border-emerald-200 dark:border-emerald-400/25',
    badge: 'bg-emerald-500 text-white',
    tint: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    options: [
      { value: 'vegan', label: 'Vegano', icon: Leaf },
      { value: 'vegetarian', label: 'Vegetariano', icon: Sprout },
      { value: 'celiac', label: 'Celiaco / Sin TACC', icon: Wheat },
      { value: 'lactoVegetarian', label: 'Lacto-vegetariano', icon: Milk },
      { value: 'ovoVegetarian', label: 'Ovovegetariano', icon: Egg },
      { value: 'pescatarian', label: 'Pescetariano', icon: Fish },
      { value: 'keto', label: 'Keto / Low Carb', icon: Flame },
    ],
  },
  {
    key: 'allergies',
    title: 'Alergias e Intolerancias',
    subtitle: 'Alerta automática al pedir',
    icon: ALERGY,
    none: { value: 'ninguna', label: 'Ninguna' },
    gradient: 'from-rose-50 to-red-100 dark:from-rose-500/15 dark:to-red-500/10',
    border: 'border-rose-200 dark:border-rose-400/25',
    badge: 'bg-rose-500 text-white',
    tint: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    options: [
      { value: 'nuts', label: 'Frutos secos', icon: Nut },
      { value: 'lactose', label: 'Lactosa', icon: MilkOff },
      { value: 'gluten', label: 'Gluten', icon: WheatOff },
      { value: 'soy', label: 'Soja', icon: Bean },
      { value: 'egg', label: 'Huevo', icon: EggOff },
      { value: 'sesame', label: 'Sésamo', icon: CircleDot },
    ],
  },
  {
    key: 'religions',
    title: 'Restricciones Religiosas o éticas',
    subtitle: 'Preferencias para respetar siempre',
    icon: RELIGION,
    none: { value: 'ninguna', label: 'Ninguna' },
    gradient: 'from-violet-50 to-purple-100 dark:from-violet-500/15 dark:to-purple-500/10',
    border: 'border-violet-200 dark:border-violet-400/25',
    badge: 'bg-violet-500 text-white',
    tint: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    options: [
      { value: 'kosher', label: 'Kosher', icon: Star },
      { value: 'halal', label: 'Halal', icon: MoonStar },
    ],
  },
  {
    key: 'milk',
    title: 'Tipo de Leche',
    subtitle: 'Base de tus bebidas',
    icon: MILK,
    single: true,
    none: { value: 'indistinta', label: 'Indistinta' },
    gradient: 'from-sky-50 to-cyan-100 dark:from-sky-500/15 dark:to-cyan-500/10',
    border: 'border-sky-200 dark:border-sky-400/25',
    badge: 'bg-sky-500 text-white',
    tint: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    options: [
      { value: 'whole', label: 'Entera', icon: Milk },
      { value: 'skim', label: 'Descremada', icon: Droplets },
      { value: 'lactoseFree', label: 'Sin Lactosa', icon: MilkOff },
      { value: 'almond', label: 'Almendras', icon: Nut },
      { value: 'oat', label: 'Avena', icon: Sprout },
      { value: 'soy', label: 'Soja', icon: Bean },
    ],
  },
  {
    key: 'sweetener',
    title: 'Nivel de Endulzante',
    subtitle: 'Cuánto azúcar en tus bebidas',
    icon: SWEETENER,
    single: true,
    none: { value: 'indistinto', label: 'Indistinto' },
    gradient: 'from-orange-50 to-amber-100 dark:from-orange-500/15 dark:to-amber-500/10',
    border: 'border-orange-200 dark:border-orange-400/25',
    badge: 'bg-orange-500 text-white',
    tint: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
    options: [
      { value: 'none', label: 'Sin azúcar', icon: Ban },
      { value: 'whiteSugar', label: 'Azúcar blanca', icon: Square },
      { value: 'brownSugar', label: 'Moscabado / rubia', icon: Cookie },
      { value: 'honey', label: 'Miel', icon: Droplets },
      { value: 'sweetener', label: 'Edulcorante', icon: Sparkles },
    ],
  },
  {
    key: 'coffee',
    title: 'Intensidad del Café',
    subtitle: 'Tu preparación ideal',
    icon: COFFEE,
    single: true,
    none: { value: 'indistinta', label: 'Indistinta' },
    gradient: 'from-amber-50 to-yellow-100 dark:from-amber-500/15 dark:to-yellow-500/10',
    border: 'border-amber-200 dark:border-amber-400/25',
    badge: 'bg-amber-500 text-white',
    tint: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    options: [
      { value: 'single', label: 'Espresso simple', icon: Coffee },
      { value: 'double', label: 'Doble shot', icon: Zap },
      { value: 'decaf', label: 'Descafeinado', icon: Coffee },
      { value: 'extraHot', label: 'Extra caliente', icon: Flame },
      { value: 'drinkNow', label: 'Consumo inmediato', icon: Timer },
    ],
  },
  {
    key: 'toppings',
    title: 'Toppings / Extras',
    subtitle: 'Con lo que te encanta',
    icon: TOPPINGS,
    none: { value: 'ninguno', label: 'Ninguno' },
    gradient: 'from-pink-50 to-fuchsia-100 dark:from-pink-500/15 dark:to-fuchsia-500/10',
    border: 'border-pink-200 dark:border-pink-400/25',
    badge: 'bg-pink-500 text-white',
    tint: 'bg-pink-500/15 text-pink-700 dark:text-pink-300',
    options: [
      { value: 'whippedCream', label: 'Crema batida', icon: IceCream },
      { value: 'cinnamon', label: 'Canela', icon: Wand2 },
      { value: 'cocoa', label: 'Cacao en polvo', icon: Sparkles },
      { value: 'noIce', label: 'Sin hielo', icon: Snowflake },
    ],
  },
  {
    key: 'pickup',
    title: 'Método de Retiro',
    subtitle: '¿Cómo preferís recibirlo?',
    icon: PICKUP,
    single: true,
    none: { value: 'indistinto', label: 'Indistinto' },
    gradient: 'from-indigo-50 to-blue-100 dark:from-indigo-500/15 dark:to-blue-500/10',
    border: 'border-indigo-200 dark:border-indigo-400/25',
    badge: 'bg-indigo-500 text-white',
    tint: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    options: [
      { value: 'dineIn', label: 'En el local', icon: Utensils },
      { value: 'takeaway', label: 'Para llevar', icon: ShoppingBag },
      { value: 'table', label: 'A la mesa (QR)', icon: Scan },
      { value: 'delivery', label: 'Delivery', icon: Bike },
    ],
  },
  {
    key: 'packaging',
    title: 'Empaque y Sustentabilidad',
    subtitle: 'Menos residuos, más puntos',
    icon: PACKAGING,
    none: { value: 'ninguno', label: 'Ninguno' },
    gradient: 'from-lime-50 to-green-100 dark:from-lime-500/15 dark:to-green-500/10',
    border: 'border-lime-200 dark:border-lime-400/25',
    badge: 'bg-lime-600 text-white',
    tint: 'bg-lime-600/15 text-lime-700 dark:text-lime-300',
    options: [
      { value: 'noDisposables', label: 'Sin cubiertos ni sorbetes', icon: Recycle },
      { value: 'ownMug', label: 'Mi vaso / mug reutilizable', icon: CupSoda },
    ],
  },
  {
    key: 'alerts',
    title: 'Alertas y Notificaciones',
    subtitle: 'Avisame cuando pase algo bueno',
    icon: NOTIF,
    none: { value: 'ninguna', label: 'Ninguna' },
    gradient: 'from-yellow-50 to-amber-100 dark:from-yellow-500/15 dark:to-amber-500/10',
    border: 'border-yellow-200 dark:border-yellow-400/25',
    badge: 'bg-yellow-500 text-white',
    tint: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300',
    options: [
      { value: 'stock', label: 'Stock de favoritos', icon: Package },
      { value: 'orderStatus', label: 'Estado del pedido', icon: BellRing },
      { value: 'happyHour', label: 'Happy Hour', icon: Clock },
    ],
  },
  {
    key: 'payment',
    title: 'Método de Pago',
    subtitle: 'Tu forma preferida de pagar',
    icon: PAYMENT,
    single: true,
    none: { value: 'indistinto', label: 'Indistinto' },
    gradient: 'from-teal-50 to-emerald-100 dark:from-teal-500/15 dark:to-emerald-500/10',
    border: 'border-teal-200 dark:border-teal-400/25',
    badge: 'bg-teal-600 text-white',
    tint: 'bg-teal-600/15 text-teal-700 dark:text-teal-300',
    options: [
      { value: 'card', label: 'Tarjeta', icon: CreditCard },
      { value: 'wallet', label: 'Billetera digital', icon: Wallet },
      { value: 'mercadoPago', label: 'Mercado Pago', icon: Landmark },
    ],
  },
];

const TEXT_FIELDS = [
  { key: 'birthday', title: 'Beneficio de Cumpleaños', subtitle: 'Recibí un obsequio en tu día', icon: BIRTHDAY, type: 'date', gradient: 'from-fuchsia-50 to-pink-100 dark:from-fuchsia-500/15 dark:to-pink-500/10', border: 'border-fuchsia-200 dark:border-fuchsia-400/25', badge: 'bg-fuchsia-500 text-white', tint: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300' },
  { key: 'schedule', title: 'Horario Habitual', subtitle: 'Para preparar tu pedido a tiempo', icon: Clock, type: 'text', gradient: 'from-blue-50 to-indigo-100 dark:from-blue-500/15 dark:to-indigo-500/10', border: 'border-blue-200 dark:border-blue-400/25', badge: 'bg-blue-500 text-white', tint: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
];

function OptionChip({ option, active, onClick, none = false }) {
  const Icon = option.icon;
  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-2.5 rounded-2xl border-2 px-4 py-2.5 text-[15px] font-bold transition-all duration-200 ${
        none
          ? active
            ? 'border-line bg-surface-alt text-ink'
            : 'border-dashed border-line bg-surface/40 text-ink-muted hover:-translate-y-0.5 hover:bg-surface hover:text-ink'
          : active
            ? 'animate-pop border-transparent bg-gradient-to-r from-primary to-primary-strong text-primary-contrast shadow-md'
            : 'border-line bg-surface/70 text-ink hover:-translate-y-0.5 hover:bg-surface hover:shadow-sm'
      }`}
    >
      <input type="checkbox" className="hidden" checked={Boolean(active)} onChange={onClick} />
      <Icon size={19} className={active ? (none ? 'text-ink-muted' : 'text-primary-contrast') : 'text-primary-strong'} />
      <span className="whitespace-nowrap">{option.label}</span>
      {active && <Check size={17} className={none ? 'text-ink-muted' : ''} />}
    </label>
  );
}

export default function PreferencesEditor({ value, onChange }) {
  const prefs = {
    diet: [], allergies: [], religions: [], toppings: [], packaging: [], alerts: [],
    milk: '', sweetener: '', coffee: '', pickup: '', payment: '', birthday: '', schedule: '',
    ...(value || {}),
  };

  const set = (patch) => onChange({ ...prefs, ...patch });

  const toggleMulti = (key, item) =>
    set({ [key]: prefs[key].includes(item) ? prefs[key].filter((x) => x !== item) : [...prefs[key], item] });

  const setSingle = (key, item) => set({ [key]: prefs[key] === item ? '' : item });

  return (
    <div className="space-y-4">
      <div className="animate-fade-up rounded-3xl border border-line bg-surface/60 p-5 text-center">
        <p className="text-base font-extrabold text-ink">Preferencias de Perfil y Filtros Generales</p>
        <p className="mt-1 text-sm text-ink-muted">
          Contanos cómo te gusta todo: te lo preparamos exactamente como más te gusta.
        </p>
      </div>

      {CATS.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <div
            key={cat.key}
            className={`animate-fade-up rounded-3xl border bg-gradient-to-br ${cat.gradient} ${cat.border} p-5 shadow-sm`}
            style={{ animationDelay: `${60 + i * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${cat.badge}`}>
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-extrabold leading-tight text-ink">{cat.title}</h4>
                {cat.subtitle && <p className="text-sm font-medium text-ink-muted">{cat.subtitle}</p>}
              </div>
              {cat.single && prefs[cat.key] && prefs[cat.key] !== cat.none.value && (
                <span className="ml-auto hidden rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-ink-muted dark:bg-surface/50 sm:block">
                  1 selección
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {cat.options.map((opt) => (
                <OptionChip
                  key={opt.value}
                  option={opt}
                  active={cat.single ? prefs[cat.key] === opt.value : prefs[cat.key].includes(opt.value)}
                  onClick={() => (cat.single ? setSingle(cat.key, opt.value) : toggleMulti(cat.key, opt.value))}
                />
              ))}
              <OptionChip
                key="none"
                none
                option={{ value: cat.none.value, label: cat.none.label, icon: CircleOff }}
                active={cat.single ? prefs[cat.key] === cat.none.value : prefs[cat.key].length === 0}
                onClick={() => (cat.single ? setSingle(cat.key, cat.none.value) : set({ [cat.key]: [] }))}
              />
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-4">
        {TEXT_FIELDS.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.key}
              className={`animate-fade-up min-w-0 flex-1 rounded-3xl border bg-gradient-to-br ${f.gradient} ${f.border} p-5 shadow-sm`}
              style={{ animationDelay: `${200 + i * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${f.badge}`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-extrabold leading-tight text-ink">{f.title}</h4>
                  {f.subtitle && <p className="text-sm font-medium text-ink-muted">{f.subtitle}</p>}
                </div>
              </div>
              <input
                type={f.type}
                className="input !mt-4 !bg-surface/80 !py-3 !text-base"
                value={prefs[f.key]}
                onChange={(e) => set({ [f.key]: e.target.value })}
                placeholder={f.key === 'schedule' ? 'Ej: Lunes a Viernes 08:30 AM' : 'AAAA-MM-DD'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function profileProgress({ name = '', phone = '', email = '', preferences = {} } = {}) {
  const prefs = {
    diet: [], allergies: [], religions: [], toppings: [], packaging: [], alerts: [],
    milk: '', sweetener: '', coffee: '', pickup: '', payment: '', birthday: '', schedule: '',
    ...(preferences || {}),
  };
  const fields = [Boolean(name), Boolean(phone), Boolean(email)];
  for (const cat of CATS) {
    const v = prefs[cat.key];
    fields.push(Boolean(cat.single ? v : v && v.length > 0));
  }
  for (const f of TEXT_FIELDS) fields.push(Boolean(prefs[f.key]));
  const done = fields.filter(Boolean).length;
  const total = fields.length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

export function prefsSummary(preferences = {}) {
  const prefs = {
    diet: [], allergies: [], religions: [], toppings: [], packaging: [], alerts: [],
    milk: '', sweetener: '', coffee: '', pickup: '', payment: '', birthday: '', schedule: '',
    ...(preferences || {}),
  };

  const groups = [];
  for (const cat of CATS) {
    const picked = [];
    if (cat.single) {
      const v = prefs[cat.key];
      if (v && v !== cat.none.value) {
        const opt = cat.options.find((o) => o.value === v);
        if (opt) picked.push(opt);
      }
    } else if ((prefs[cat.key] || []).length > 0) {
      for (const v of prefs[cat.key]) {
        const opt = cat.options.find((o) => o.value === v);
        if (opt) picked.push(opt);
      }
    }
    if (picked.length > 0) {
      groups.push({
        key: cat.key,
        title: cat.title,
        icon: cat.icon,
        gradient: cat.gradient,
        border: cat.border,
        badge: cat.badge,
        tint: cat.tint,
        items: picked,
      });
    }
  }
  for (const f of TEXT_FIELDS) {
    if (prefs[f.key]) {
      groups.push({
        key: f.key,
        title: f.title,
        icon: f.icon,
        gradient: f.gradient,
        border: f.border,
        badge: f.badge,
        tint: f.tint,
        value: f.key === 'birthday' && prefs[f.key] ? `Cumpleaños: ${prefs[f.key]}` : prefs[f.key],
      });
    }
  }
  return groups;
}