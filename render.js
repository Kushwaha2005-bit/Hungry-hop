// ============================================
//  render.js — All DOM rendering functions
// ============================================

import { CATEGORIES, FOODS, RESTAURANTS, TESTIMONIALS } from './data.js';
import { observeCards } from './ui.js';

function getCartState() {
  return import('./cart.js');
}

// ─── Categories ─────────────────────────────
export function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card" onclick="filterByCategory('${cat.name}')">
      <span class="category-emoji">${cat.emoji}</span>
      <div class="category-name">${cat.name}</div>
      <div class="category-count">${cat.count} items</div>
    </div>
  `).join('');
  setTimeout(observeCards, 50);
}

// ─── Restaurants ────────────────────────────
export function renderRestaurants() {
  const grid = document.getElementById('restaurantGrid');
  if (!grid) return;
  grid.innerHTML = RESTAURANTS.map(r => `
    <div class="restaurant-card ${r.isOpen ? '' : 'closed'}">
      <div class="restaurant-img-wrap">
        <img src="${r.img}" alt="${r.name}" loading="lazy" onerror="this.src='https://placehold.co/600x300/1A1A28/00E5FF?text=🍽️'"/>
        <div class="restaurant-logo">${r.logo}</div>
        ${r.offer ? `<div class="restaurant-offer">${r.offer}</div>` : ''}
        ${!r.isOpen ? '<div class="restaurant-closed-badge">Closed</div>' : ''}
      </div>
      <div class="restaurant-info">
        <div class="restaurant-top">
          <div class="restaurant-name">${r.name}</div>
          <div class="restaurant-rating"><i class="fas fa-star"></i> ${r.rating} <span class="rest-reviews">(${r.reviews})</span></div>
        </div>
        <div class="restaurant-cuisine">${r.cuisine}</div>
        <div class="restaurant-meta">
          <span class="rest-meta-item"><i class="fas fa-clock"></i> ${r.deliveryTime}</span>
          <span class="rest-meta-item"><i class="fas fa-motorcycle"></i> ${r.deliveryFee}</span>
          <span class="rest-meta-item"><i class="fas fa-map-marker-alt"></i> ${r.distance}</span>
        </div>
        <div class="restaurant-tags">
          ${r.tags.map(t => `<span class="rest-tag ${t}">${t === 'veg' ? '🌿 Veg' : t === 'non-veg' ? '🍗 Non-Veg' : t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
  setTimeout(observeCards, 50);
}

// ─── Filter Tabs ────────────────────────────
export function renderFilterTabs() {
  const tabs = document.getElementById('filterTabs');
  if (!tabs) return;
  getCartState().then(({ currentFilter }) => {
    const cats = ['All', ...CATEGORIES.map(c => c.name)];
    tabs.innerHTML = cats.map(c => `
      <button class="filter-tab${c === currentFilter ? ' active' : ''}" onclick="setFilter('${c}')">${c}</button>
    `).join('');
  });
}

// ─── Food Grid ──────────────────────────────
export function renderFoodGrid(filter = 'All') {
  const grid = document.getElementById('foodGrid');
  if (!grid) return;

  getCartState().then(({ getCartQty, favorites, dietFilter, sortOrder }) => {
    let items = filter === 'All' ? FOODS : FOODS.filter(f => f.category === filter);

    // Diet filter
    if (dietFilter === 'veg')     items = items.filter(f => f.tags.includes('veg') && !f.tags.includes('non-veg'));
    if (dietFilter === 'non-veg') items = items.filter(f => f.tags.includes('non-veg'));

    // Sort
    if (sortOrder === 'low-high') items = [...items].sort((a, b) => a.price - b.price);
    if (sortOrder === 'high-low') items = [...items].sort((a, b) => b.price - a.price);

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-muted);">
          <div style="font-size:3.5rem;margin-bottom:1rem;">🍽️</div>
          <h3 style="font-family:var(--font-display);color:var(--dark)">No items found</h3>
          <p>Try a different filter combination.</p>
        </div>`;
      return;
    }

    grid.innerHTML = items.map(food => {
      const qty   = getCartQty(food.id);
      const isFav = favorites.has(food.id);
      const qtyCtrl = qty === 0
        ? `<button class="btn-add" onclick="addToCart(${food.id})"><i class="fas fa-plus"></i></button>`
        : `<div class="btn-qty">
             <button onclick="decreaseQty(${food.id})"><i class="fas fa-minus"></i></button>
             <span>${qty}</span>
             <button onclick="addToCart(${food.id})"><i class="fas fa-plus"></i></button>
           </div>`;

      return `
      <div class="food-card">
        <div class="food-img-wrap">
          <img src="${food.img}" alt="${food.name}" loading="eager" onerror="this.src='https://placehold.co/400x300/1A1A28/00E5FF?text=🍽️'"/>
          <span class="food-badge ${food.badgeClass}">${food.badge}</span>
          <button class="food-fav${isFav ? ' active' : ''}" onclick="toggleFav(${food.id}, this)">
            <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
          </button>
        </div>
        <div class="food-info">
          <div class="food-meta">
            <span class="food-name">${food.name}</span>
            <span class="food-rating"><i class="fas fa-star"></i>${food.rating}</span>
          </div>
          <p class="food-desc">${food.desc}</p>
          <div class="food-footer">
            <div class="food-price">₹${food.price}<span class="old-price">₹${food.oldPrice}</span></div>
            ${qtyCtrl}
          </div>
        </div>
      </div>`;
    }).join('');
  });
}

// ─── Testimonials ───────────────────────────
export function renderTestimonials() {
  const grid = document.getElementById('testimonialGrid');
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="stars">${'★'.repeat(t.stars)}</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <img class="author-avatar" src="${t.avatar}" alt="${t.name}"/>
        <div>
          <div class="author-name">${t.name}</div>
          <div class="author-loc">📍 ${t.loc}</div>
        </div>
      </div>
    </div>
  `).join('');
  setTimeout(observeCards, 50);
}

// ─── Cart Items ─────────────────────────────
export function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer    = document.getElementById('cartFooter');
  if (!container) return;

  getCartState().then(({ cart, promoDiscount }) => {
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <div class="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <small>Add some delicious food!</small>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    container.innerHTML = cart.map(item => {
      const food = FOODS.find(f => f.id === item.id);
      return `
      <div class="cart-item">
        <img class="cart-item-img" src="${food.img}" alt="${food.name}"/>
        <div class="cart-item-info">
          <div class="cart-item-name">${food.name}</div>
          <div class="cart-item-price">₹${food.price * item.qty}</div>
        </div>
        <div class="cart-item-controls">
          <button class="cart-item-btn" onclick="cartDecrease(${item.id})"><i class="fas fa-minus"></i></button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-item-btn" onclick="cartIncrease(${item.id})"><i class="fas fa-plus"></i></button>
        </div>
      </div>`;
    }).join('');

    const subtotal = cart.reduce((sum, item) => {
      const food = FOODS.find(f => f.id === item.id);
      return sum + food.price * item.qty;
    }, 0);
    const total = Math.max(subtotal + 40 - promoDiscount, 40);

    const el = id => document.getElementById(id);
    if (el('subtotalAmt')) el('subtotalAmt').textContent = `₹${subtotal}`;
    if (el('discountAmt')) el('discountAmt').textContent = `-₹${promoDiscount}`;
    if (el('totalAmt'))    el('totalAmt').textContent    = `₹${total}`;
    if (footer)            footer.style.display          = 'block';
  });
}

export function renderSkeletons(count = 6) {
  const grid = document.getElementById('foodGrid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="food-card skeleton-card" style="pointer-events:none;">
      <div class="food-img-wrap" style="background:var(--surface-2);"><div class="shimmer" style="width:100%;height:100%;"></div></div>
      <div class="food-info">
        <div class="shimmer" style="height:18px;width:65%;border-radius:8px;margin-bottom:.6rem;"></div>
        <div class="shimmer" style="height:13px;width:90%;border-radius:8px;margin-bottom:.4rem;"></div>
        <div class="shimmer" style="height:13px;width:75%;border-radius:8px;margin-bottom:1rem;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="shimmer" style="height:22px;width:60px;border-radius:8px;"></div>
          <div class="shimmer" style="height:38px;width:38px;border-radius:12px;"></div>
        </div>
      </div>
    </div>
  `).join('');
}