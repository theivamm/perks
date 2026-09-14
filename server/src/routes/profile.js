import { Router } from 'express';
import { supabase } from '../supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../asyncHandler.js';
import { countCompletedOrders } from '../rewards.js';

const router = Router();

const USER_FIELDS = 'id, name, email, phone, preferences, role, created_at';

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data: user, error } = await supabase
      .from('users')
      .select(USER_FIELDS)
      .eq('id', req.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado. Volvé a iniciar sesión.' });

    const [ordersRes, couponsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, total, created_at, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('coupons').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (couponsRes.error) throw couponsRes.error;

    const completed = await countCompletedOrders(user.id);

    const suggestions = await buildSuggestions(ordersRes.data || []);

    res.json({
      user,
      orders: ordersRes.data || [],
      coupons: couponsRes.data || [],
      stats: { completedOrders: completed, totalOrders: (ordersRes.data || []).length },
      suggestions,
    });
  })
);

router.put(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, phone, preferences } = req.body || {};
    const patch = {};
    if (name !== undefined && String(name).trim()) patch.name = String(name).trim();
    if (phone !== undefined) patch.phone = String(phone).trim();
    if (preferences !== undefined) {
      const allowed = ['vegetarian', 'glutenFree', 'vegan', 'notes'];
      const next = {};
      for (const k of Object.keys(preferences || {})) {
        if (allowed.includes(k)) next[k] = preferences[k];
      }
      patch.preferences = next;
    }

    const { data, error } = await supabase
      .from('users')
      .update(patch)
      .eq('id', req.user.id)
      .select(USER_FIELDS)
      .single();
    if (error) throw error;
    res.json({ user: data });
  })
);

async function buildSuggestions(orders) {
  const counts = {};
  const snap = {};
  for (const order of orders) {
    for (const it of order.order_items || []) {
      const key = it.menu_item_id || `t:${it.title}`;
      counts[key] = (counts[key] || 0) + (Number(it.qty) || 1);
      snap[key] = it;
    }
  }

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const ids = top.map(([k]) => (k.startsWith('t:') ? null : k)).filter(Boolean);
  let menuMap = {};
  if (ids.length > 0) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, title, price, image, available, category')
      .in('id', ids);
    if (!error) menuMap = Object.fromEntries((data || []).map((m) => [m.id, m]));
  }

  const suggestions = [];
  for (const [key, times] of top) {
    const row = key.startsWith('t:') ? null : menuMap[key];
    if (row) {
      suggestions.push({
        menu_item_id: row.id,
        title: row.title,
        price: row.price,
        image: row.image,
        category: row.category,
        available: row.available,
        times,
      });
    } else if (snap[key]) {
      suggestions.push({
        menu_item_id: null,
        title: snap[key].title,
        price: snap[key].price,
        image: '',
        category: '',
        available: true,
        times,
      });
    }
  }
  return suggestions;
}

export default router;