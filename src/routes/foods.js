// src/routes/foods.js — Foods, categories, favorites
import { Router } from 'express';
import { supabase, assertNoError } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/foods ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, diet, restaurant_id } = req.query;
    let query = supabase.from('foods').select('*').eq('is_available', true);

    if (category && category !== 'All') query = query.eq('category', category);
    if (restaurant_id) query = query.eq('restaurant_id', restaurant_id);
    if (search) query = query.ilike('name', `%${search}%`);
    if (diet === 'veg') query = query.contains('tags', ['veg']).not('tags', 'cs', '{"non-veg"}');
    if (diet === 'non-veg') query = query.contains('tags', ['non-veg']);
    if (sort === 'low-high') query = query.order('price', { ascending: true });
    else if (sort === 'high-low') query = query.order('price', { ascending: false });
    else query = query.order('id');

    const { data, error } = await query;
    assertNoError(error, 'get foods');
    res.json({ foods: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/foods/:id ──────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('foods')
      .select('*, restaurants(name, logo, rating, delivery_time, delivery_fee)')
      .eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Food not found' });
    res.json({ food: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/categories ─────────────────────────────────────
router.get('/meta/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    assertNoError(error, 'get categories');
    res.json({ categories: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/foods/favorites — user favorites ───────────────
router.get('/user/favorites', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase.from('favorites')
      .select('food_id, foods(*)')
      .eq('user_id', req.user.id);
    assertNoError(error, 'get favorites');
    res.json({ favorites: data.map(f => f.foods) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/foods/:id/favorite ───────────────────────────
router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const foodId = parseInt(req.params.id);
    const { data: existing } = await supabase.from('favorites')
      .select('id').eq('user_id', req.user.id).eq('food_id', foodId).single();

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      return res.json({ favorited: false, message: 'Removed from favorites' });
    }
    await supabase.from('favorites').insert({ user_id: req.user.id, food_id: foodId });
    res.json({ favorited: true, message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
