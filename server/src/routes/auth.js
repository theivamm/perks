import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { supabase } from '../supabase.js';
import { asyncHandler } from '../asyncHandler.js';
import { newQrCode } from '../qr.js';

const router = Router();
const SECRET = () => process.env.JWT_SECRET || 'dev-secret';

function signToken(userRow) {
  const payload = { id: userRow.id, email: userRow.email, name: userRow.name, role: userRow.role };
  const token = jwt.sign(payload, SECRET(), { expiresIn: '12h' });
  return { token, user: payload };
}

async function userByAuthId(authId) {
  const { data } = await supabase.from('users').select('*').eq('id', authId).maybeSingle();
  return data || null;
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password,
    });

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = await userByAuthId(data.user.id);
    if (!user) {
      return res.status(403).json({ error: 'Tu cuenta no tiene permisos de administrador' });
    }

    res.json(signToken(user));
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(name || '').trim() || cleanEmail.split('@')[0];

    const { data, error } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { name: cleanName },
    });

    if (error) {
      if (/registered|already|exist/i.test(error.message)) {
        return res.status(409).json({ error: 'Ese email ya está registrado. Inicia sesión.' });
      }
      throw error;
    }

    const { data: userRow, error: insErr } = await supabase
      .from('users')
      .upsert(
        {
          id: data.user.id,
          name: cleanName,
          email: cleanEmail,
          password_hash: '',
          role: 'cliente',
          qr_code: newQrCode(),
        },
        { onConflict: 'email' }
      )
      .select()
      .single();
    if (insErr) throw insErr;

    res.status(201).json(signToken(userRow));
  })
);

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { access_token } = req.body || {};
    if (!access_token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Sesión de Google inválida o expirada' });
    }

    const authUser = data.user;
    let user = await userByAuthId(authUser.id);

    if (!user) {
      const { data: created, error: insErr } = await supabase
        .from('users')
        .upsert(
          {
            id: authUser.id,
            name: authUser.user_metadata?.name || 'Cliente',
            email: authUser.email,
            password_hash: '',
            role: 'cliente',
            qr_code: newQrCode(),
          },
          { onConflict: 'email' }
        )
        .select()
        .single();
      if (insErr) throw insErr;
      user = created;
    }

    res.json(signToken(user));
  })
);

export default router;