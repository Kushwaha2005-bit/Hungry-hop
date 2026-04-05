// src/routes/orders.js — Place, track, list orders
import { Router } from 'express';
import { supabase, assertNoError } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function generateOrderId() {
  return 'HH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000 + 1000));
}

// ─── GET /api/orders ─────────────────────────────────────────
// User: get their own orders | Admin: get all
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('orders')
      .select(`*, addresses(label, line1, city)`)
      .order('created_at', { ascending: false });

    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);

    const { data, error } = await query;
    assertNoError(error, 'get orders');
    res.json({ orders: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/orders/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data: order, error } = await supabase.from('orders')
      .select(`*, addresses(*), order_status_history(status, note, created_at)`)
      .eq('id', req.params.id)
      .single();

    if (error || !order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role !== 'admin' && order.user_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/orders ────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { address_id, restaurant_id, items, promo_code, payment_method, notes } = req.body;

    if (!address_id || !items || items.length === 0)
      return res.status(400).json({ error: 'address_id and items are required' });

    // Verify address belongs to user
    const { data: address } = await supabase.from('addresses')
      .select('id').eq('id', address_id).eq('user_id', req.user.id).single();
    if (!address) return res.status(400).json({ error: 'Invalid address' });

    // Calculate subtotal from food prices in DB
    const foodIds = items.map(i => i.food_id);
    const { data: foods } = await supabase.from('foods')
      .select('id, price').in('id', foodIds);

    const subtotal = items.reduce((sum, item) => {
      const food = foods.find(f => f.id === item.food_id);
      return sum + (food?.price || 0) * item.qty;
    }, 0);

    // Validate promo code
    let promoDiscount = 0;
    if (promo_code) {
      const { data: promo } = await supabase.from('promo_codes')
        .select('*').eq('code', promo_code.toUpperCase()).eq('is_active', true).single();
      if (promo) {
        promoDiscount = Math.round(subtotal * promo.discount);
        await supabase.from('promo_codes').update({ used_count: promo.used_count + 1 }).eq('id', promo.id);
      }
    }

    const delivery_fee = 40;
    const total = Math.max(subtotal + delivery_fee - promoDiscount, delivery_fee);
    const eta = `${Math.floor(Math.random() * 15 + 20)} mins`;
    const orderId = generateOrderId();

    const { data: order, error } = await supabase.from('orders')
      .insert({
        id: orderId, user_id: req.user.id, address_id, restaurant_id,
        items, subtotal, delivery_fee, promo_discount: promoDiscount,
        promo_code, total, payment_method: payment_method || 'online',
        status: 'confirmed', eta, notes,
      })
      .select('*').single();
    assertNoError(error, 'create order');

    // Log initial status
    await supabase.from('order_status_history').insert({
      order_id: orderId, status: 'confirmed', note: 'Order received'
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/orders/:id/status — Admin only ─────────────────
router.put('/:id/status', async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ error: 'Admin only' });

    const { status, note, rider_lat, rider_lng } = req.body;
    const validStatuses = ['confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const update = { status };
    if (rider_lat) update.rider_lat = rider_lat;
    if (rider_lng) update.rider_lng = rider_lng;
    if (status === 'delivered') update.eta = 'Delivered!';

    const { data: order, error } = await supabase.from('orders')
      .update(update).eq('id', req.params.id).select('*').single();
    assertNoError(error, 'update order status');

    await supabase.from('order_status_history').insert({
      order_id: req.params.id, status, note: note || ''
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/orders/:id/cancel ─────────────────────────────
router.put('/:id/cancel', async (req, res) => {
  try {
    const { data: order } = await supabase.from('orders')
      .select('status, user_id').eq('id', req.params.id).single();

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied' });
    if (['delivered', 'cancelled'].includes(order.status))
      return res.status(400).json({ error: `Cannot cancel a ${order.status} order` });
    if (order.status === 'out-for-delivery')
      return res.status(400).json({ error: 'Order is already out for delivery' });

    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', req.params.id);
    await supabase.from('order_status_history').insert({
      order_id: req.params.id, status: 'cancelled', note: 'Cancelled by user'
    });
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
