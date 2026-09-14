import { app } from './app.js';
import { runSeed } from './seed.js';
import { ensureBucket } from './supabase.js';

const PORT = process.env.PORT || 4000;

try {
  await ensureBucket();
} catch (e) {
  console.warn('[SUPABASE] Bucket no disponible:', e.message);
}

try {
  await runSeed();
} catch (e) {
  console.warn('[Seed] No se pudo completar el seed:', e.message);
}

app.listen(PORT, () => {
  console.log(`API Fidelización escuchando en http://localhost:${PORT}`);
});