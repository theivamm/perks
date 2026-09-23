import {
  Beer, BookOpen, Cake, Camera, Car, Coffee, Dumbbell, Flower2, Gift, Hammer, Heart, IceCreamCone,
  Leaf, Music, Palette, PawPrint, Pizza, Scissors, Shirt, ShoppingBag, Sparkles, Stethoscope, Store,
  UtensilsCrossed, Wine, Wrench,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { getVocab } from '../lib/businessTypes.js';

// Íconos disponibles para el catálogo (id → componente). El tipo de negocio trae uno
// por defecto; el dueño puede elegir otro en Configuración (setting `catalogIcon`).
export const TYPE_ICONS = {
  coffee: Coffee, utensils: UtensilsCrossed, pizza: Pizza, cake: Cake, icecream: IceCreamCone,
  beer: Beer, wine: Wine, scissors: Scissors, sparkles: Sparkles, heart: Heart, dumbbell: Dumbbell,
  stethoscope: Stethoscope, paw: PawPrint, shirt: Shirt, bag: ShoppingBag, store: Store, gift: Gift,
  flower: Flower2, leaf: Leaf, book: BookOpen, palette: Palette, camera: Camera, music: Music,
  wrench: Wrench, hammer: Hammer, car: Car,
};

export function iconFor(id) {
  return TYPE_ICONS[id] || Store;
}

// Ícono del catálogo del negocio actual.
export function useCatalogIcon() {
  const { settings } = useTheme();
  return iconFor(getVocab(settings).icon);
}

export function CatalogIcon(props) {
  const Icon = useCatalogIcon();
  return <Icon {...props} />;
}
