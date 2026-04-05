// api.js — Drop this into your project root alongside index.html
// Replaces the mock DB with real backend calls
// Usage: import { api } from './api.js'

const BASE = '/api';// Change to your deployed URL in production

// ─── Token helpers ───────────────────────────────────────────
export const token = {
  get: () => localStorage.getItem('hh_token'),
  set: (t) => localStorage.setItem('hh_token', t),
  clear: () => localStorage.removeItem('hh_token'),
};

// ─── Core fetch wrapper ──────────────────────────────────────
async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = token.get();
  if (t) headers['Authorization'] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const get  = (path)        => req('GET',    path);
const post = (path, body)  => req('POST',   path, body);
const put  = (path, body)  => req('PUT',    path, body);
const del  = (path)        => req('DELETE', path);

// ─── Auth ────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (name, email, phone, password) =>
      post('/auth/register', { name, email, phone, password }),
    login: (email, password) =>
      post('/auth/login', { email, password }),
    me: () => get('/auth/me'),
    update: (data) => put('/auth/me', data),
    changePassword: (currentPassword, newPassword) =>
      put('/auth/change-password', { currentPassword, newPassword }),
  },

  // ─── Foods ─────────────────────────────────────────────────
  foods: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/foods${q ? '?' + q : ''}`);
    },
    get: (id) => get(`/foods/${id}`),
    categories: () => get('/foods/meta/categories'),
    favorites: () => get('/foods/user/favorites'),
    toggleFavorite: (foodId) => post(`/foods/${foodId}/favorite`),
  },

  // ─── Restaurants ───────────────────────────────────────────
  restaurants: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/restaurants${q ? '?' + q : ''}`);
    },
    get: (id) => get(`/restaurants/${id}`),
  },

  // ─── Addresses ─────────────────────────────────────────────
  addresses: {
    list: () => get('/addresses'),
    get: (id) => get(`/addresses/${id}`),
    create: (data) => post('/addresses', data),
    update: (id, data) => put(`/addresses/${id}`, data),
    delete: (id) => del(`/addresses/${id}`),
    setDefault: (id) => put(`/addresses/${id}/set-default`),
  },

  // ─── Orders ────────────────────────────────────────────────
  orders: {
    list: () => get('/orders'),
    get: (id) => get(`/orders/${id}`),
    create: (data) => post('/orders', data),
    cancel: (id) => put(`/orders/${id}/cancel`),
    updateStatus: (id, status, extras = {}) =>
      put(`/orders/${id}/status`, { status, ...extras }),
  },

  // ─── Promos ────────────────────────────────────────────────
  promos: {
    validate: (code, cart_total) => post('/promos/validate', { code, cart_total }),
  },

  // ─── Admin ─────────────────────────────────────────────────
  admin: {
    stats: () => get('/admin/stats'),
    orders: (params = {}) => get(`/admin/orders?${new URLSearchParams(params)}`),
    users: (params = {}) => get(`/admin/users?${new URLSearchParams(params)}`),
    updateUser: (id, data) => put(`/admin/users/${id}`, data),
    restaurants: () => get('/admin/restaurants'),
    createRestaurant: (data) => post('/admin/restaurants', data),
    updateRestaurant: (id, data) => put(`/admin/restaurants/${id}`, data),
    createFood: (data) => post('/admin/foods', data),
    updateFood: (id, data) => put(`/admin/foods/${id}`, data),
    revenueChart: (days = 7) => get(`/admin/revenue-chart?days=${days}`),
    createPromo: (data) => post('/admin/promo-codes', data),
  },
};

// ─── Auth helpers for your existing ui.js ────────────────────
export async function loginUser(email, password) {
  const { token: t, user } = await api.auth.login(email, password);
  token.set(t);
  localStorage.setItem('hh_user_name', user.name);
  localStorage.setItem('hh_user_email', user.email);
  return user;
}

export async function registerUser(name, email, phone, password) {
  const { token: t, user } = await api.auth.register(name, email, phone, password);
  token.set(t);
  localStorage.setItem('hh_user_name', user.name);
  localStorage.setItem('hh_user_email', user.email);
  return user;
}

export function logoutUser() {
  token.clear();
  localStorage.removeItem('hh_user_name');
  localStorage.removeItem('hh_user_email');
}

export function isLoggedIn() {
  return !!token.get();
}
