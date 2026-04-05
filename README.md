# HungryHop Backend — Setup Guide

## Your complete stack
```
Frontend  →  index.html + admin.html (your existing files)
Backend   →  Node.js + Express (this folder)
Database  →  Supabase (PostgreSQL, free tier)
Hosting   →  Render (backend, free) + Vercel/Netlify (frontend, free)
```

---

## STEP 1 — Create your Supabase project (5 minutes)

1. Go to **https://supabase.com** → Sign up (free)
2. Click **"New Project"** → give it a name like `hungryhop`
3. Choose a region closest to India (e.g. Singapore)
4. Wait ~2 minutes for the project to be ready
5. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_KEY` ⚠️ keep this secret!

---

## STEP 2 — Set up the database (2 minutes)

1. In your Supabase project, go to **SQL Editor → New Query**
2. Copy the entire contents of `sql/schema.sql`
3. Paste it into the editor and click **"Run"**
4. You should see: "Success. No rows returned"
5. Your tables are now created with seed data ✅

---

## STEP 3 — Configure your environment

```bash
# In the hungryhop-backend folder:
cp .env.example .env
```

Open `.env` and fill in your values:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
JWT_SECRET=run-this-to-generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
PORT=5000
CLIENT_URL=http://127.0.0.1:5500
```

---

## STEP 4 — Install and run locally

```bash
cd hungryhop-backend
npm install
npm run dev
```

You should see:
```
🚀 HungryHop API running on http://localhost:5000
```

Test it works:
```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"..."}
```

---

## STEP 5 — Connect your frontend

Copy `api.js` from this folder into your project root (next to `index.html`).

### Update your `ui.js` — login and register:

```js
// At the top of ui.js, add:
import { loginUser, registerUser } from './api.js';

// Replace handleLogin():
export async function handleLogin() {
  const email = document.querySelector('#loginForm input[type="email"]').value;
  const password = document.querySelector('#loginForm input[type="password"]').value;
  try {
    const user = await loginUser(email, password);
    closeAuthModal();
    showAccountSuccess(false);
    updateProfileBtn();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Replace handleRegister():
export async function handleRegister() {
  const name  = document.querySelector('#registerForm input[type="text"]').value;
  const email = document.querySelector('#registerForm input[type="email"]').value;
  const phone = document.querySelector('#registerForm input[type="tel"]')?.value || '';
  const pass  = document.querySelector('#registerForm input[type="password"]').value;
  try {
    const user = await registerUser(name, email, phone, pass);
    closeAuthModal();
    showAccountSuccess(true);
    updateProfileBtn();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
```

### Update your `cart.js` — real orders:

```js
import { api, isLoggedIn } from './api.js';

// Replace checkout():
export async function checkout() {
  if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
  if (!isLoggedIn()) { showToast('Please login to place an order', 'error'); window.showAuthModal(); return; }

  try {
    // Get user's default address
    const { addresses } = await api.addresses.list();
    const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
    if (!defaultAddr) { showToast('Please add a delivery address first', 'error'); return; }

    const orderItems = cart.map(i => ({ food_id: i.id, qty: i.qty }));

    const { order } = await api.orders.create({
      address_id: defaultAddr.id,
      items: orderItems,
      payment_method: paymentMethod,
      promo_code: promoApplied ? document.getElementById('promoInput')?.value : null,
    });

    document.getElementById('trackOrderInput').value = order.id;
    const trackingEl = document.getElementById('successTrackingId');
    if (trackingEl) trackingEl.textContent = order.id;

    toggleCart();
    clearCart();
    setTimeout(() => {
      document.getElementById('successOverlay').classList.add('active');
    }, 400);

    showToast(`Order ${order.id} placed! 🎉`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
```

### Update your `data.js` — load from API:

```js
import { api } from './api.js';

// In main.js DOMContentLoaded, replace static renders with:
const [{ foods }, { categories }, { restaurants }] = await Promise.all([
  api.foods.list(),
  api.foods.categories(),
  api.restaurants.list(),
]);
// Then pass these to your render functions
```

### Connect `admin.html` to the real backend:

In your `admin.html`, replace the `DB` object methods with `api.admin.*` calls:

```js
// Replace DB.getStats() with:
const { stats } = await api.admin.stats();

// Replace DB.getOrders() with:
const { orders } = await api.admin.orders();

// Replace DB.updateOrderStatus() with:
await api.orders.updateStatus(id, newStatus);
```

---

## STEP 6 — Deploy to production (free)

### Backend → Render

1. Push `hungryhop-backend/` to a GitHub repo
2. Go to **https://render.com** → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** Add all your `.env` variables
5. Deploy → you get a URL like `https://hungryhop-api.onrender.com`

### Frontend → Vercel / Netlify

1. Push your project folder (with `index.html`, `admin.html`, `api.js`) to GitHub
2. Go to **https://vercel.com** → Import project
3. No build config needed — it serves static files directly
4. Update `api.js` BASE URL to your Render URL:
   ```js
   const BASE = 'https://hungryhop-api.onrender.com/api';
   ```

---

## All API endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login, get JWT |
| GET | /api/auth/me | ✅ | Get own profile |
| PUT | /api/auth/me | ✅ | Update profile |
| GET | /api/foods | ❌ | List foods (filter/sort) |
| GET | /api/categories | ❌ | List categories |
| POST | /api/foods/:id/favorite | ✅ | Toggle favorite |
| GET | /api/restaurants | ❌ | List restaurants |
| GET | /api/addresses | ✅ | Get my addresses |
| POST | /api/addresses | ✅ | Add new address |
| PUT | /api/addresses/:id | ✅ | Update address |
| DELETE | /api/addresses/:id | ✅ | Delete address |
| PUT | /api/addresses/:id/set-default | ✅ | Set default |
| GET | /api/orders | ✅ | My order history |
| POST | /api/orders | ✅ | Place new order |
| PUT | /api/orders/:id/cancel | ✅ | Cancel order |
| POST | /api/promos/validate | ✅ | Validate promo code |
| GET | /api/admin/stats | 👑 | Dashboard stats |
| GET | /api/admin/orders | 👑 | All orders |
| GET | /api/admin/users | 👑 | All users |
| PUT | /api/admin/users/:id | 👑 | Update user status |
| GET | /api/admin/restaurants | 👑 | All restaurants |
| POST | /api/admin/foods | 👑 | Add food item |
| GET | /api/admin/revenue-chart | 👑 | Revenue data |

✅ = requires user token | 👑 = requires admin token

---

## Project file structure

```
your-project/
├── index.html          ← customer app (existing)
├── admin.html          ← admin dashboard (existing)
├── api.js              ← NEW: copy from this folder
├── style.css
├── animations.css
├── main.js             ← update handleLogin/handleRegister
├── cart.js             ← update checkout()
├── render.js
├── data.js
└── ui.js

hungryhop-backend/      ← this folder → deploy to Render
├── src/
│   ├── index.js        ← Express server entry point
│   ├── lib/
│   │   └── supabase.js ← Supabase client
│   ├── middleware/
│   │   └── auth.js     ← JWT middleware
│   └── routes/
│       ├── auth.js     ← register, login, profile
│       ├── addresses.js← full address CRUD
│       ├── orders.js   ← order management
│       ├── foods.js    ← foods + favorites
│       ├── restaurants.js
│       └── admin.js    ← admin endpoints
├── sql/
│   └── schema.sql      ← run this in Supabase SQL editor
├── api.js              ← copy to your frontend project
├── package.json
└── .env.example        ← copy to .env and fill in values
```
