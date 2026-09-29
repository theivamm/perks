// Versión vigente de los Términos/Privacidad que se le pide aceptar a quien
// crea una app. Mantenerla igual a la fecha de "Última actualización" que
// figura en client/src/pages/legal/TermsOfService.jsx y PrivacyPolicy.jsx;
// si el contenido legal cambia de forma relevante, subir esta fecha para que
// quede registrado qué versión aceptó cada negocio.
export const TERMS_VERSION = '2026-09-29';

// IP real del cliente, considerando que en producción suele haber un proxy
// (Vercel) delante del server: usamos el primer valor de x-forwarded-for si
// existe, y si no, la conexión directa.
export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || null;
}
