const COUNTRIES = [
  { code: '+54', name: 'Argentina' },
  { code: '+56', name: 'Chile' },
  { code: '+57', name: 'Colombia' },
  { code: '+51', name: 'Perú' },
  { code: '+52', name: 'México' },
  { code: '+598', name: 'Uruguay' },
  { code: '+595', name: 'Paraguay' },
  { code: '+591', name: 'Bolivia' },
  { code: '+593', name: 'Ecuador' },
  { code: '+58', name: 'Venezuela' },
  { code: '+34', name: 'España' },
  { code: '+1', name: 'EE. UU.' },
];

const DEFAULT_PREFIX = '+54';

function detect(value) {
  const raw = String(value || '').trim();
  const m = /^\+(\d{1,4})[\s-]*(.*)$/.exec(raw);
  const prefix = m ? `+${m[1]}` : DEFAULT_PREFIX;
  const number = m ? m[2] : raw;
  return [COUNTRIES.some((c) => c.code === prefix) ? prefix : DEFAULT_PREFIX, number];
}

export default function PhoneInput({ value, onChange, placeholder = 'Ej: 11 6112 0433' }) {
  const [prefix, number] = detect(value);

  return (
    <div className="flex gap-2">
      <select
        className="input w-28 shrink-0"
        value={prefix}
        onChange={(e) => onChange(`${e.target.value} ${number}`.trim())}
        aria-label="Código de país"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} · {c.name}
          </option>
        ))}
      </select>
      <input
        className="input flex-1"
        value={number}
        onChange={(e) => onChange(`${prefix} ${e.target.value}`.trim())}
        placeholder={placeholder}
        inputMode="tel"
      />
    </div>
  );
}