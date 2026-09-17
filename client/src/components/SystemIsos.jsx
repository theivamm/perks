import { ChefHat, Coffee, CupSoda, Pizza, Store, UtensilsCrossed } from 'lucide-react';

export const SYSTEM_ISOS = [
  { key: 'chef-hat', label: 'Chef', Icon: ChefHat },
  { key: 'store', label: 'Local', Icon: Store },
  { key: 'utensils', label: 'Cubiertos', Icon: UtensilsCrossed },
  { key: 'pizza', label: 'Pizza', Icon: Pizza },
  { key: 'cup-soda', label: 'Bebida', Icon: CupSoda },
  { key: 'coffee', label: 'Café', Icon: Coffee },
];

const FALLBACK = SYSTEM_ISOS[0];

export function getSystemIso(key) {
  return SYSTEM_ISOS.find((iso) => iso.key === key) || FALLBACK;
}