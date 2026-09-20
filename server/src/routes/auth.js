import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { supabase } from '../supabase.js';
import { authClient } from '../authClient.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { newQrCode } from '../qr.js';
import { verifyTOTP, randomSecret, otpauthURL } from '../otp.js';
import { ensureMembership, getMembership, membershipUserIds } from '../memberships.js';

const router = Router();
const SECRET = () => process.env.JWT_SECRET || 'dev-secret';
const LOGIN_SECRET = () => `${SECRET()}:login`;

const ADMIN_USERNAME_DEFAULT = 'administracion';

export function signToken(userRow, tenantSlug, membership = null) {
  const payload = {
    id: userRow.id,
    email: userRow.email,
    name: userRow.name,
    role: membership?.role || userRow.role,
    tenant_id: membership?.tenant_id ?? userRow.tenant_id ?? null,
    tenant_slug: tenantSlug || null,
  };
  const token = jwt.sign(payload, SECRET(), { expiresIn: '12h' });
  return { token, user: payload };
}

// Login del equipo PERKS (superadmin) con email y contraseña directos.
// No depende del tenant ni del username configurado en cada negocio.
router.post(
  '/superadmin/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const { data, error } = await authClient.auth.signInWithPassword({
      email: String(email).toLowerCase().trim(),
      password: String(password),
    });
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { data: userRow, error: rowErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .eq('role', 'superadmin')
      .maybeSingle();
    if (rowErr) throw rowErr;
    if (!userRow) {
      return res.status(403).json({ error: 'Esta cuenta no tiene permisos de superadministrador' });
    }

    res.json(signToken(userRow, null));
  })
);

// Refresca el rol de la sesión usando la membresía real de la app actual.
router.get(
  '/session',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await userByAuthId(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: req.membership.role,
        tenant_id: req.membership.tenant_id,
        tenant_slug: req.tenant.slug,
      },
    });
  })
);

function signLoginToken(userId, tenantId) {
  return jwt.sign({ step: 'otp', id: userId, tenant_id: tenantId }, LOGIN_SECRET(), { expiresIn: '5m' });
}

async function userByAuthId(authId) {
  const { data } = await supabase.from('users').select('*').eq('id', authId).maybeSingle();
  return data || null;
}

async function readAdminSettings(tenantId) {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .eq('tenant_id', tenantId);
  if (error) throw error;
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return {
    username: map.adminUsername || ADMIN_USERNAME_DEFAULT,
    otpSecret: map.adminOtpSecret || '',
    otpEnabled: map.adminOtpEnabled === 'true',
  };
}

async function writeAdminSettings(tenantId, partial) {
  const rows = Object.entries(partial).map(([key, value]) => ({
    tenant_id: tenantId,
    key,
    value: String(value),
  }));
  if (rows.length > 0) {
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'tenant_id,key' });
    if (error) throw error;
  }
}

async function singleAdmin(tenantId) {
  const ids = await membershipUserIds(tenantId, 'admin');
  if (ids.length !== 1) return null;
  const { data, error } = await supabase.from('users').select('*').eq('id', ids[0]).maybeSingle();
  if (error) throw error;
  return data || null;
}

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const admin = await singleAdmin(req.tenant.id);
    if (!admin) {
      return res.status(403).json({ error: 'Hay más de un administrador configurado. Contactá soporte.' });
    }
    const tenant = req.tenant;
    if (String(username).trim().toLowerCase() !== (await readAdminSettings(tenant.id)).username.toLowerCase()) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { data, error } = await authClient.auth.signInWithPassword({
      email: admin.email,
      password: String(password),
    });

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const settings = await readAdminSettings(tenant.id);
    if (settings.otpEnabled && settings.otpSecret) {
      return res.json({ step: 'otp', login_token: signLoginToken(admin.id, tenant.id) });
    }

    res.json(signToken(admin, tenant.slug, { role: 'admin', tenant_id: tenant.id }));
  })
);

router.post(
  '/otp',
  asyncHandler(async (req, res) => {
    const { login_token, code } = req.body || {};
    if (!login_token || !code) {
      return res.status(400).json({ error: 'Código requerido' });
    }

    let payload;
    try {
      payload = jwt.verify(login_token, LOGIN_SECRET());
    } catch {
      return res.status(401).json({ error: 'La sesión del primer paso expiró. Volvé a iniciar sesión.' });
    }
    if (payload.step !== 'otp' || !payload.id) {
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const tenant = req.tenant;
    const settings = await readAdminSettings(tenant.id);
    if (!settings.otpEnabled || !settings.otpSecret || !verifyTOTP(settings.otpSecret, code)) {
      return res.status(401).json({ error: 'Código incorrecto' });
    }

    const admin = await userByAuthId(payload.id);
    const membership = await getMembership(payload.id, tenant.id);
    if (!admin || payload.tenant_id !== tenant.id || membership?.role !== 'admin') {
      return res.status(403).json({ error: 'Cuenta sin permisos de administrador' });
    }

    res.json(signToken(admin, tenant.slug, membership));
  })
);

// ===== Cuenta del administrador (solo admin) =====

// Cambiar la contraseña pedida por la actual
router.post(
  '/admin/password',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { current_password, password } = req.body || {};
    if (!current_password || !password || String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const { error } = await authClient.auth.signInWithPassword({
      email: req.user.email,
      password: String(current_password),
    });
    if (error) return res.status(401).json({ error: 'La contraseña actual es incorrecta' });

    const { error: upErr } = await supabase.auth.admin.updateUserById(req.user.id, {
      password: String(password),
    });
    if (upErr) return res.status(400).json({ error: upErr.message });
    res.json({ ok: true });
  })
);

// Estado de la autenticación en 2 pasos
router.get(
  '/admin/otp/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const settings = await readAdminSettings(req.tenant.id);
    res.json({ enabled: settings.otpEnabled && Boolean(settings.otpSecret) });
  })
);

// Generar un secreto nuevo y mostrarlo como QR (aún no habilitado)
router.post(
  '/admin/otp/provision',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const tenant = _req.tenant;
    const secret = randomSecret();
    await writeAdminSettings(tenant.id, { adminOtpSecret: secret, adminOtpEnabled: 'false' });
    res.json({ secret, otpauth_url: otpauthURL(secret) });
  })
);

// Verificar el código del paso 1 y habilitar el 2FA
router.post(
  '/admin/otp/enable',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { code } = req.body || {};
    const tenant = req.tenant;
    const settings = await readAdminSettings(tenant.id);
    if (!settings.otpSecret) return res.status(400).json({ error: 'Primero generá el código QR' });
    if (!verifyTOTP(settings.otpSecret, code)) {
      return res.status(400).json({ error: 'Código incorrecto, verificá que tu app esté sincronizada' });
    }
    await writeAdminSettings(tenant.id, { adminOtpEnabled: 'true' });
    res.json({ enabled: true });
  })
);

// Deshabilitar el 2FA (pidiendo el código corriente)
router.post(
  '/admin/otp/disable',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { code } = req.body || {};
    const tenant = req.tenant;
    const settings = await readAdminSettings(tenant.id);
    if (!settings.otpSecret) {
      await writeAdminSettings(tenant.id, { adminOtpEnabled: 'false' });
      return res.json({ enabled: false });
    }
    if (!verifyTOTP(settings.otpSecret, code)) {
      return res.status(400).json({ error: 'Código incorrecto' });
    }
    await writeAdminSettings(tenant.id, { adminOtpSecret: '', adminOtpEnabled: 'false' });
    res.json({ enabled: false });
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
          tenant_id: req.tenant.id,
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

    const membership = await ensureMembership(userRow.id, req.tenant.id, 'cliente');

    res.status(201).json(signToken(userRow, req.tenant.slug, membership));
  })
);

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { access_token, global } = req.body || {};
    if (!access_token) {
      return res.status(400).json({ error: 'Token requerido' });
    }

    const { data, error } = await authClient.auth.getUser(access_token);
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
            tenant_id: req.tenant.id,
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

    if (global) {
      return res.json(signToken({ ...user, role: 'cliente', tenant_id: null }, null));
    }

    const membership = await ensureMembership(user.id, req.tenant.id, 'cliente');
    res.json(signToken(user, req.tenant.slug, membership));
  })
);

export default router;
