// Tipos de negocio: definen cómo se llama el catálogo, cada ítem, los ejemplos
// del formulario y si los ítems son productos o servicios.
// Settings usados: businessType, businessTypeOther, catalogKind, catalogLabel, itemLabel, itemLabelPlural, catalogIcon.
import { useTheme } from '../context/ThemeContext.jsx';

export const BUSINESS_TYPES = [
  {
    id: 'cafeteria', label: 'Cafetería / Bar', kind: 'food', icon: 'coffee',
    section: 'Menú', item: 'producto', items: 'productos', f: false,
    ph: { title: 'Flat White', description: 'Doble ristretto con leche texturizada…', hint: 'Ingredientes, tamaño o lo que ayude a elegir.' },
    categories: ['Cafés', 'Bebidas frías', 'Pastelería', 'Salados'],
  },
  {
    id: 'restaurante', label: 'Restaurante', kind: 'food', icon: 'utensils',
    section: 'Carta', item: 'plato', items: 'platos', f: false,
    ph: { title: 'Milanesa napolitana', description: 'Con papas fritas o puré, para una persona…', hint: 'Ingredientes, guarnición o porción.' },
    categories: ['Entradas', 'Principales', 'Postres', 'Bebidas'],
  },
  {
    id: 'pasteleria', label: 'Pastelería / Panadería', kind: 'retail', icon: 'cake',
    section: 'Catálogo', item: 'producto', items: 'productos', f: false,
    ph: { title: 'Torta Rogel', description: 'Para 12 porciones. Por encargo con 48 h de anticipación…', hint: 'Tamaño, porciones o si es por encargo.' },
    categories: ['Tortas', 'Budines', 'Facturas', 'Por encargo'],
  },
  {
    id: 'barberia', label: 'Barbería / Peluquería', kind: 'service', icon: 'scissors',
    section: 'Servicios', item: 'servicio', items: 'servicios', f: false,
    ph: { title: 'Corte + barba', description: 'Corte a máquina y tijera, perfilado con toalla caliente…', hint: 'Qué incluye el servicio.' },
    categories: ['Cortes', 'Barba', 'Color', 'Combos'],
  },
  {
    id: 'estetica', label: 'Estética / Spa / Uñas', kind: 'service', icon: 'sparkles',
    section: 'Tratamientos', item: 'tratamiento', items: 'tratamientos', f: false,
    ph: { title: 'Esmaltado semipermanente', description: 'Limado, cutículas y esmaltado de larga duración…', hint: 'Qué incluye y cuidados posteriores.' },
    categories: ['Manos', 'Pies', 'Facial', 'Corporal'],
  },
  {
    id: 'tienda', label: 'Tienda / Indumentaria', kind: 'retail', icon: 'shirt',
    section: 'Catálogo', item: 'producto', items: 'productos', f: false,
    ph: { title: 'Remera oversize', description: 'Algodón peinado, talles S a XL…', hint: 'Material, talles o colores.' },
    categories: ['Remeras', 'Pantalones', 'Abrigos', 'Accesorios'],
  },
  {
    id: 'almacen', label: 'Almacén / Dietética', kind: 'retail', icon: 'store',
    section: 'Productos', item: 'producto', items: 'productos', f: false,
    ph: { title: 'Granola sin azúcar 500 g', description: 'Avena, almendras y miel. Sin TACC…', hint: 'Presentación, peso o marca.' },
    categories: ['Almacén', 'Frutos secos', 'Sin TACC', 'Bebidas'],
  },
  {
    id: 'gimnasio', label: 'Gimnasio / Estudio', kind: 'service', icon: 'dumbbell',
    section: 'Clases y planes', item: 'clase', items: 'clases', f: true,
    ph: { title: 'Funcional', description: 'Grupos reducidos, todos los niveles…', hint: 'Días, horarios o nivel.' },
    categories: ['Clases', 'Planes mensuales', 'Personalizado'],
  },
  {
    id: 'taller', label: 'Taller / Servicio técnico', kind: 'service', icon: 'wrench',
    section: 'Servicios', item: 'servicio', items: 'servicios', f: false,
    ph: { title: 'Cambio de aceite y filtro', description: 'Incluye revisión de niveles y frenos…', hint: 'Qué incluye y tiempo estimado.' },
    categories: ['Mantenimiento', 'Reparaciones', 'Diagnóstico'],
  },
  {
    id: 'veterinaria', label: 'Veterinaria / Pet shop', kind: 'service', icon: 'paw',
    section: 'Servicios y productos', item: 'ítem', items: 'ítems', f: false,
    ph: { title: 'Baño y corte', description: 'Para perros medianos, incluye corte de uñas…', hint: 'Tamaño de mascota o qué incluye.' },
    categories: ['Consultas', 'Vacunas', 'Baño y corte', 'Alimentos'],
  },
  {
    id: 'otro', label: 'Otro', kind: 'retail', icon: 'store',
    section: 'Catálogo', item: 'producto', items: 'productos', f: false,
    ph: { title: 'Nombre', description: 'Contá qué es y qué incluye…', hint: 'Lo que ayude a tus clientes a elegir.' },
    categories: ['General'],
  },
];

export const KINDS = {
  food: 'Gastronomía',
  retail: 'Productos',
  service: 'Servicios',
};

// Negocios existentes (sin businessType) quedan como gastronomía / cafetería.
export const DEFAULT_TYPE = 'cafeteria';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function getBusinessType(id) {
  return BUSINESS_TYPES.find((t) => t.id === id) || BUSINESS_TYPES[0];
}

export function getVocab(settings = {}) {
  const preset = getBusinessType(settings.businessType || DEFAULT_TYPE);
  const kind = KINDS[settings.catalogKind] ? settings.catalogKind : preset.kind;
  const item = (settings.itemLabel || '').trim().toLowerCase() || preset.item;
  const custom = !!(settings.itemLabel || '').trim();
  const items = (settings.itemLabelPlural || '').trim().toLowerCase() || (custom ? `${item}s` : preset.items);
  // Género gramatical: el del preset, o por la terminación si el dueño lo escribió.
  const f = custom ? /a$/.test(item) : preset.f;
  const section = (settings.catalogLabel || '').trim() || preset.section;
  return {
    type: preset.id,
    typeLabel: preset.id === 'otro' ? (settings.businessTypeOther || '').trim() || 'Otro' : preset.label,
    kind,
    isService: kind === 'service',
    section, // "Servicios"
    sectionLower: section.toLowerCase(), // "servicios"
    item, // "servicio"
    items, // "servicios"
    Item: cap(item),
    Items: cap(items),
    newItem: `${f ? 'Nueva' : 'Nuevo'} ${item}`, // "Nuevo servicio"
    created: `${cap(item)} ${f ? 'creada' : 'creado'}`,
    updated: `${cap(item)} ${f ? 'actualizada' : 'actualizado'}`,
    deleted: `${cap(item)} ${f ? 'eliminada' : 'eliminado'}`,
    the: `${f ? 'La' : 'El'} ${item}`, // "El servicio"
    hidden: f ? 'oculta' : 'oculto',
    all: 'Todo',
    ph: preset.ph,
    categories: preset.categories,
    icon: settings.catalogIcon || preset.icon,
    defaultIcon: preset.icon,
  };
}

export function useVocab() {
  const { settings } = useTheme();
  return getVocab(settings);
}

// Precio según el modo del ítem: 'fixed' | 'from' | 'ask'
export function priceLabel(item, formatted) {
  if (item?.price_mode === 'ask') return 'A consultar';
  if (item?.price_mode === 'from') return `Desde ${formatted}`;
  return formatted;
}

export function durationLabel(min) {
  const n = Number(min) || 0;
  if (!n) return '';
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const m = n % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function whatsappBookingUrl(phone, item, businessName) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const text = `Hola ${businessName || ''}! Quiero reservar: ${item.title}${item.professional ? ` con ${item.professional}` : ''}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
