// src/routes/addresses.js — Full CRUD for user addresses
import { Router } from 'express';
import { supabase, assertNoError } from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
// All address routes require login
router.use(requireAuth);

// ─── GET /api/addresses ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    assertNoError(error, 'get addresses');
    res.json({ addresses: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/addresses/:id ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('addresses')
      .select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (error || !data) return res.status(404).json({ error: 'Address not found' });
    res.json({ address: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/addresses ─────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { label, line1, line2, city, pincode, lat, lng, delivery_notes, is_default } = req.body;
    if (!line1 || !city || !pincode)
      return res.status(400).json({ error: 'line1, city and pincode are required' });

    // If setting as default, unset all others first
    if (is_default) {
      await supabase.from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data, error } = await supabase.from('addresses')
      .insert({ user_id: req.user.id, label, line1, line2, city, pincode, lat, lng, delivery_notes, is_default: is_default || false })
      .select('*').single();
    assertNoError(error, 'create address');

    // If first address, auto-set as default
    const { count } = await supabase.from('addresses')
      .select('*', { count: 'exact', head: true }).eq('user_id', req.user.id);
    if (count === 1) {
      await supabase.from('addresses').update({ is_default: true }).eq('id', data.id);
      data.is_default = true;
    }

    res.status(201).json({ address: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/addresses/:id ──────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    // Verify ownership
    const { data: existing } = await supabase.from('addresses')
      .select('id').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!existing) return res.status(404).json({ error: 'Address not found' });

    const { label, line1, line2, city, pincode, lat, lng, delivery_notes, is_default } = req.body;

    if (is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
    }

    const { data, error } = await supabase.from('addresses')
      .update({ label, line1, line2, city, pincode, lat, lng, delivery_notes, is_default })
      .eq('id', req.params.id)
      .select('*').single();
    assertNoError(error, 'update address');
    res.json({ address: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/addresses/:id ───────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { data: existing } = await supabase.from('addresses')
      .select('id, is_default').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!existing) return res.status(404).json({ error: 'Address not found' });

    await supabase.from('addresses').delete().eq('id', req.params.id);

    // If deleted was default, promote next address to default
    if (existing.is_default) {
      const { data: next } = await supabase.from('addresses')
        .select('id').eq('user_id', req.user.id).limit(1).single();
      if (next) await supabase.from('addresses').update({ is_default: true }).eq('id', next.id);
    }

    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/addresses/:id/set-default ─────────────────────
router.put('/:id/set-default', async (req, res) => {
  try {
    const { data: existing } = await supabase.from('addresses')
      .select('id').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!existing) return res.status(404).json({ error: 'Address not found' });

    await supabase.from('addresses').update({ is_default: false }).eq('user_id', req.user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', req.params.id);
    res.json({ message: 'Default address updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
