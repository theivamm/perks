export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isForm = options.body instanceof FormData;
  if (!isForm) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers,
      body: isForm ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    if (options.signal?.aborted) throw new Error('La operación tardó demasiado. Probá de nuevo.');
    throw new Error('No se pudo conectar con el servidor');
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      /* noop */
    }
    throw new Error(message);
  }
  return res.json();
}

export function formatMoney(value, symbol = '$') {
  return `${symbol}${Number(value || 0).toFixed(2)}`;
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}