// src/routes/admin.js — Admin-only endpoints
import { Router } from 'express';
import { supabase, assertNoError } from '../lib/supabase.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAdmin);

// ─── GET /api/admin/stats ────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: totalUsers },
      { count: todayOrders },
      { count: pendingOrders },
      { data: revenue },
      { data: topFoods },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('orders').select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'preparing', 'out-for-delivery']),
      supabase.from('orders').select('total').eq('status', 'delivered'),
      supabase.from('foods').select('id, name, img_url').limit(5),
    ]);

    const totalRevenue = revenue?.reduce((s, o) => s + o.total, 0) || 0;

    res.json({
      stats: {
        totalUsers,
        todayOrders,
        pendingOrders,
        totalRevenue,
        avgDelivery: '28 mins',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/users ────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const from = (page - 1) * limit;

    let query = supabase.from('users')
      .select('id, name, email, phone, role, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    assertNoError(error, 'admin get users');
    res.json({ users: data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/admin/users/:id ────────────────────────────────
router.put('/users/:id', async (req, res) => {
  try {
    const { status, role } = req.body;
    const { data, error } = await supabase.from('users')
      .update({ status, role })
      .eq('id', req.params.id)
      .select('id, name, email, role, status').single();
    assertNoError(error, 'admin update user');
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/orders ───────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const from = (page - 1) * limit;

    let query = supabase.from('orders')
      .select(`*, users(name, email), addresses(label, line1, city)`, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;
    assertNoError(error, 'admin get orders');
    res.json({ orders: data, total: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/restaurants ─────────────────────────────
router.get('/restaurants', async (req, res) => {
  try {
    const { data, error } = await supabase.from('restaurants')
      .select('*').order('name');
    assertNoError(error, 'admin get restaurants');
    res.json({ restaurants: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/restaurants ─────────────────────────────
router.post('/restaurants', async (req, res) => {
  try {
    const { data, error } = await supabase.from('restaurants')
      .insert(req.body).select('*').single();
    assertNoError(error, 'admin create restaurant');
    res.status(201).json({ restaurant: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/admin/restaurants/:id ─────────────────────────
router.put('/restaurants/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('restaurants')
      .update(req.body).eq('id', req.params.id).select('*').single();
    assertNoError(error, 'admin update restaurant');
    res.json({ restaurant: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/foods ───────────────────────────────────
router.post('/foods', async (req, res) => {
  try {
    const { data, error } = await supabase.from('foods')
      .insert(req.body).select('*').single();
    assertNoError(error, 'admin create food');
    res.status(201).json({ food: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/admin/foods/:id ────────────────────────────────
router.put('/foods/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('foods')
      .update(req.body).eq('id', req.params.id).select('*').single();
    assertNoError(error, 'admin update food');
    res.json({ food: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/admin/revenue-chart ────────────────────────────
router.get('/revenue-chart', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const { data, error } = await supabase.from('orders')
      .select('total, created_at')
      .eq('status', 'delivered')
      .gte('created_at', from.toISOString())
      .order('created_at');
    assertNoError(error, 'revenue chart');

    // Group by day
    const chart = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      chart[key] = 0;
    }
    data.forEach(o => {
      const key = o.created_at.split('T')[0];
      if (chart[key] !== undefined) chart[key] += o.total;
    });

    res.json({ chart: Object.entries(chart).map(([date, revenue]) => ({ date, revenue })).reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/admin/promo-codes ─────────────────────────────
router.post('/promo-codes', async (req, res) => {
  try {
    const { code, discount, type, max_uses, expires_at } = req.body;
    const { data, error } = await supabase.from('promo_codes')
      .insert({ code: code.toUpperCase(), discount, type, max_uses, expires_at })
      .select('*').single();
    assertNoError(error, 'create promo');
    res.status(201).json({ promo: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
