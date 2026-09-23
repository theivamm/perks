// Formato de precios: $3.900 (sin decimales si es entero), $3.900,50 si tiene centavos.
export function money(value, symbol = '$') {
  const n = Number(value || 0);
  return `${symbol}${n.toLocaleString('es-AR', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
