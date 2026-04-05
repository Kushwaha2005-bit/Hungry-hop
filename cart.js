// ============================================
//  cart.js — Cart state, actions & persistence
// ============================================

import { FOODS, PROMO_CODES, DEMO_ORDERS } from './data.js';
import { showToast, startModalTracker } from './ui.js';

// ─── State ──────────────────────────────────
export let cart          = JSON.parse(localStorage.getItem('hh_cart') || '[]');
export let promoDiscount = 0;
export let promoApplied  = false;
export let currentFilter = 'All';
export let dietFilter    = 'all';   // 'all' | 'veg' | 'non-veg'
export let sortOrder     = 'default'; // 'default' | 'low-high' | 'high-low'
export let paymentMethod = 'online'; // 'online' | 'cod'

export function setPaymentMethod(method) {
  paymentMethod = method;
  document.querySelectorAll('.payment-option').forEach(el => {
    el.classList.toggle('active', el.dataset.method === method);
  });
}

function saveCart() {
  localStorage.setItem('hh_cart', JSON.stringify(cart));
}

// ─── Lazy render helpers ─────────────────────
function doRenderGrid() {
  import('./render.js').then(({ renderFoodGrid }) => renderFoodGrid(currentFilter));
}
function doRenderCart() {
  import('./render.js').then(({ renderCartItems }) => renderCartItems());
}
function doRenderBoth() {
  import('./render.js').then(({ renderFoodGrid, renderCartItems }) => {
    renderFoodGrid(currentFilter);
    renderCartItems();
  });
}

// ─── Helpers ────────────────────────────────
export function getCartQty(id) {
  const item = cart.find(i => i.id === id);
  return item ? item.qty : 0;
}
export function getCartTotal() {
  return cart.reduce((sum, item) => {
    const food = FOODS.find(f => f.id === item.id);
    return sum + food.price * item.qty;
  }, 0);
}
export function getCartItemCount() {
  return cart.reduce((s, i) => s + i.qty, 0);
}

// ─── Badge ──────────────────────────────────
export function updateBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.textContent = getCartItemCount();
  badge.classList.add('pop');
  setTimeout(() => badge.classList.remove('pop'), 350);
}

// ─── Add / Remove ───────────────────────────
export function addToCart(id) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) cart[idx].qty++;
  else cart.push({ id, qty: 1 });
  saveCart(); updateBadge(); doRenderBoth();
  const food = FOODS.find(f => f.id === id);
  showToast(`${food.name} added to cart! 🛒`, 'success');
}

export function decreaseQty(id) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) { cart[idx].qty--; if (cart[idx].qty <= 0) cart.splice(idx, 1); }
  saveCart(); updateBadge(); doRenderBoth();
}

export function cartIncrease(id) { addToCart(id); }

export function cartDecrease(id) {
  const idx = cart.findIndex(i => i.id === id);
  if (idx > -1) { cart[idx].qty--; if (cart[idx].qty <= 0) cart.splice(idx, 1); }
  saveCart(); updateBadge(); doRenderCart();
}

export function clearCart() {
  cart.length = 0; promoDiscount = 0; promoApplied = false;
  saveCart(); updateBadge();
}

// ─── Promo ──────────────────────────────────
export function validatePromo() {
  const code     = document.getElementById('promoInput').value.trim().toUpperCase();
  const discount = PROMO_CODES[code];
  if (discount) {
    promoDiscount = Math.round(getCartTotal() * discount);
    promoApplied  = true;
    doRenderCart();
    showToast(`Promo applied! You save ₹${promoDiscount} 🎉`, 'success');
  } else {
    showToast('Invalid promo code', 'error');
  }
}

export function applyPromo() {
  toggleCart();
  setTimeout(() => {
    document.getElementById('promoInput').value = 'HOP20';
    validatePromo();
  }, 400);
}

// ─── Cart sidebar toggle ─────────────────────
export function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
  doRenderCart();
}

// ─── Filter / Sort ──────────────────────────
export function setFilter(cat) {
  currentFilter = cat;
  import('./render.js').then(({ renderFilterTabs, renderFoodGrid }) => {
    renderFilterTabs(); renderFoodGrid(cat);
  });
}

export function filterByCategory(name) {
  currentFilter = name;
  import('./render.js').then(({ renderFilterTabs, renderFoodGrid }) => {
    renderFilterTabs(); renderFoodGrid(name);
    document.getElementById('popular').scrollIntoView({ behavior: 'smooth' });
  });
}

export function setDietFilter(val) {
  dietFilter = val;
  document.querySelectorAll('.diet-btn').forEach(b => b.classList.toggle('active', b.dataset.diet === val));
  doRenderGrid();
}

export function setSortOrder(val) {
  sortOrder = val;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === val));
  doRenderGrid();
}

// ─── Favourites ─────────────────────────────
export const favorites = new Set(JSON.parse(localStorage.getItem('hh_favs') || '[]'));

export function toggleFav(id, btn) {
  if (favorites.has(id)) {
    favorites.delete(id);
    btn.classList.remove('active');
    btn.innerHTML = '<i class="far fa-heart"></i>';
    showToast('Removed from favourites', '');
  } else {
    favorites.add(id);
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-heart"></i>';
    showToast('Added to favourites ❤️', 'success');
  }
  localStorage.setItem('hh_favs', JSON.stringify([...favorites]));
}

// ─── Checkout ───────────────────────────────
export function checkout() {
  if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }

  const subtotal  = getCartTotal();
  const total     = subtotal + 40 - promoDiscount;
  const itemCount = getCartItemCount();
  const genId     = 'HH-2024-' + (Math.floor(Math.random() * 9000) + 1000);

  DEMO_ORDERS[genId] = {
    step: 0,
    items: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
    total: `₹${total}`,
    dist: (Math.random() * 4 + 0.5).toFixed(1) + ' km',
    eta: Math.floor(Math.random() * 15 + 20) + ' mins',
    times: [new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), '--', '--', '--'],
    payment: paymentMethod,
  };
  document.getElementById('trackOrderInput').value = genId;

  const trackingEl = document.getElementById('successTrackingId');
  if (trackingEl) trackingEl.textContent = genId;
  const paymentEl = document.getElementById('successPaymentMethod');
  if (paymentEl) paymentEl.textContent = paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment';

  toggleCart();
  clearCart();

  setTimeout(() => {
    doRenderGrid();
    document.getElementById('successOverlay').classList.add('active');
    startModalTracker();
  }, 400);
}