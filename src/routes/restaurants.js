// src/routes/restaurants.js — Public restaurant listing
import { Router } from 'express';
import { supabase, assertNoError } from '../lib/supabase.js';

const router = Router();

// ─── GET /api/restaurants ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { city, cuisine, is_open, search } = req.query;
    let query = supabase.from('restaurants').select('*').order('rating', { ascending: false });

    if (city) query = query.eq('city', city);
    if (cuisine) query = query.eq('cuisine', cuisine);
    if (is_open !== undefined) query = query.eq('is_open', is_open === 'true');
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    assertNoError(error, 'get restaurants');
    res.json({ restaurants: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/restaurants/:id ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('restaurants')
      .select('*, foods(*)').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Restaurant not found' });
    res.json({ restaurant: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


// src/routes/promos.js — Validate promo codes
import { Router as PromoRouter } from 'express';
import { supabase as sb } from '../lib/supabase.js';
import { requireAuth as ra } from '../middleware/auth.js';

export const promoRouter = PromoRouter();
promoRouter.use(ra);

promoRouter.post('/validate', async (req, res) => {
  try {
    const { code, cart_total } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const { data: promo } = await sb.from('promo_codes')
      .select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();

    if (!promo) return res.status(404).json({ error: 'Invalid promo code' });
    if (promo.expires_at && new Date(promo.expires_at) < new Date())
      return res.status(400).json({ error: 'Promo code has expired' });
    if (promo.used_count >= promo.max_uses)
      return res.status(400).json({ error: 'Promo code limit reached' });

    const discount = Math.round(cart_total * promo.discount);
    res.json({ valid: true, discount, code: promo.code, percent: promo.discount * 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
