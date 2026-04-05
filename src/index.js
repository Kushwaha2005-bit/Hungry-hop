// src/index.js — HungryHop API server
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import addressRoutes from './routes/addresses.js';
import orderRoutes from './routes/orders.js';
import foodRoutes from './routes/foods.js';
import restaurantRoutes from './routes/restaurants.js';
import adminRoutes from './routes/admin.js';
import { promoRouter } from './routes/restaurants.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many attempts, try again later' } });
app.use('/api/auth', authLimiter);
app.use(limiter);

// ─── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Health check ────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/addresses',   addressRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/foods',       foodRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/promos',      promoRouter);

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// ─── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 HungryHop API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📌 Available endpoints:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/foods`);
  console.log(`   GET    /api/restaurants`);
  console.log(`   GET    /api/addresses`);
  console.log(`   POST   /api/addresses`);
  console.log(`   GET    /api/orders`);
  console.log(`   POST   /api/orders`);
  console.log(`   GET    /api/admin/stats`);
  console.log(`   GET    /api/admin/orders`);
  console.log(`   GET    /api/admin/users\n`);
});

export default app;
