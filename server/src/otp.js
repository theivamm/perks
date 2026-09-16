import crypto from 'crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(secret) {
  const clean = String(secret).toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    value = (value << 5) | BASE32.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// TOTP con ventana de tolerancia en pasos de 30s (RFC 6238)
export function verifyTOTP(secret, token, window = 1) {
  const code = String(token || '').replace(/\D/g, '');
  if (code.length !== 6) return false;
  const key = base32Decode(secret);
  const step = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    const counter = step + i;
    const msg = Buffer.alloc(8);
    msg.writeUInt32BE(counter >>> 0, 4);
    msg.writeUInt32BE(Math.floor(counter / 0x100000000) >>> 0, 0);
    const hash = crypto.createHmac('sha1', key).update(msg).digest();
    const offset = hash[hash.length - 1] & 0x0f;
    const bin =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);
    if (String(bin % 1000000).padStart(6, '0') === code) return true;
  }
  return false;
}

export function randomSecret(bytes = 20) {
  return base32Encode(crypto.randomBytes(bytes));
}

export function otpauthURL(secret, label = 'Administrador') {
  const clean = label.replace(/:/g, '');
  const params = new URLSearchParams({
    secret,
    issuer: 'Fidelizacion',
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/Fidelizacion:${encodeURIComponent(clean)}?${params.toString()}`;
}