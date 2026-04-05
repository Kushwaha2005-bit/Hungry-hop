// ============================================
//  ui.js — Scroll effects, modals, toast, tracking, map
// ============================================

import { DEMO_ORDERS } from './data.js';

// ─── Toast ──────────────────────────────────
let toastTimer;
export function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast${type ? ' ' + type : ''} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Account Success Notification + Confetti ─
export function showAccountSuccess(isRegister = true) {
  launchConfetti();
  const existing = document.getElementById('accountToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'accountToast';
  toast.className = 'account-toast';
  toast.innerHTML = `
    <div class="account-toast-icon">${isRegister ? '🎉' : '👋'}</div>
    <div class="account-toast-body">
      <div class="account-toast-title">${isRegister ? 'Account Created!' : 'Welcome Back!'}</div>
      <div class="account-toast-msg">${isRegister
        ? 'Your HungryHop account is ready. Enjoy exclusive deals & fast delivery!'
        : 'Great to see you again on HungryHop. Your cart is waiting!'}</div>
    </div>
    <button class="account-toast-close" onclick="document.getElementById('accountToast')?.remove()">✕</button>
    <div class="account-toast-progress"></div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 600); }, 5000);
}

// ─── Confetti ────────────────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas') || (() => {
    const c = document.createElement('canvas'); c.id = 'confettiCanvas'; document.body.appendChild(c); return c;
  })();
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#00E5FF','#39FF14','#FFD60A','#FF2D55','#BF5FFF','#80FFFF','#FF6B6B','#00B8D4'];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width, y: -Math.random() * canvas.height * 0.4,
    w: Math.random() * 10 + 5, h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2, vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 4 + 2, vr: (Math.random() - 0.5) * 0.2, opacity: 1,
  }));
  let frame; const startTime = Date.now();
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;
    for (const p of pieces) {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.08;
      if (elapsed > 2000) p.opacity = Math.max(0, p.opacity - 0.012);
      ctx.save(); ctx.globalAlpha = p.opacity; ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.shadowBlur = 6; ctx.shadowColor = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    const allGone = pieces.every(p => p.opacity <= 0 || p.y > canvas.height + 50);
    if (!allGone && elapsed < 5000) frame = requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); cancelAnimationFrame(frame); }
  }
  draw();
}

// ─── Scroll effects ─────────────────────────
export function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 60), { passive: true });
}

export function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(sec => observer.observe(sec));
}

export function initAnimateOnScroll() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.animate-in').forEach(el => io.observe(el));
}

export function observeCards() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); } });
  }, { threshold: 0, rootMargin: '0px 0px 60px 0px' });
  document.querySelectorAll('.food-card, .category-card, .testimonial-card, .step-card, .restaurant-card').forEach(card => io.observe(card));
}

// ─── Hamburger ──────────────────────────────
export function toggleMenu() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

// ─── Auth modal ─────────────────────────────
export function showAuthModal() { document.getElementById('authOverlay')?.classList.add('active'); }
export function closeAuthModal() { document.getElementById('authOverlay')?.classList.remove('active'); }
export function switchTab(tab) {
  const lf = document.getElementById('loginForm');
  const rf = document.getElementById('registerForm');
  if (lf) lf.style.display = tab === 'login' ? 'block' : 'none';
  if (rf) rf.style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.modal-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}
export function handleLogin() {
  // Save logged-in user name from input if available
  const emailInput = document.querySelector('#loginForm input[type="email"]');
  const email = emailInput?.value.trim();
  if (email) {
    const name = email.split('@')[0];
    localStorage.setItem('hh_user_name', name.charAt(0).toUpperCase() + name.slice(1));
    localStorage.setItem('hh_user_email', email);
    updateProfileBtn();
  }
  closeAuthModal();
  showAccountSuccess(false);
}
export function handleRegister() {
  const nameInput = document.querySelector('#registerForm input[type="text"]');
  const emailInput = document.querySelector('#registerForm input[type="email"]');
  if (nameInput?.value.trim()) {
    localStorage.setItem('hh_user_name', nameInput.value.trim());
    localStorage.setItem('hh_user_email', emailInput?.value.trim() || '');
    updateProfileBtn();
  }
  closeAuthModal();
  showAccountSuccess(true);
}

function updateProfileBtn() {
  const name = localStorage.getItem('hh_user_name');
  const btn = document.getElementById('profileBtn');
  if (btn && name) btn.innerHTML = `<i class="fas fa-user-circle"></i> ${name.split(' ')[0]}`;
}

// ─── Profile Modal ───────────────────────────
export function showProfileModal() {
  const overlay = document.getElementById('profileOverlay');
  if (!overlay) return;
  // Populate with saved data
  const name  = localStorage.getItem('hh_user_name') || '';
  const email = localStorage.getItem('hh_user_email') || '';
  const phone = localStorage.getItem('hh_user_phone') || '';
  const addr  = localStorage.getItem('hh_user_addr') || '';
  const el = id => document.getElementById(id);
  if (el('profileName'))  el('profileName').value  = name;
  if (el('profileEmail')) el('profileEmail').value = email;
  if (el('profilePhone')) el('profilePhone').value = phone;
  if (el('profileAddr'))  el('profileAddr').value  = addr;
  // Avatar initials
  const avatar = document.getElementById('profileAvatar');
  if (avatar) avatar.textContent = name ? name.charAt(0).toUpperCase() : '👤';
  overlay.classList.add('active');
}
export function closeProfileModal() {
  document.getElementById('profileOverlay')?.classList.remove('active');
}
export function saveProfile() {
  const el = id => document.getElementById(id);
  const name  = el('profileName')?.value.trim();
  const email = el('profileEmail')?.value.trim();
  const phone = el('profilePhone')?.value.trim();
  const addr  = el('profileAddr')?.value.trim();
  if (name)  localStorage.setItem('hh_user_name', name);
  if (email) localStorage.setItem('hh_user_email', email);
  if (phone) localStorage.setItem('hh_user_phone', phone);
  if (addr)  localStorage.setItem('hh_user_addr', addr);
  updateProfileBtn();
  closeProfileModal();
  showToast('Profile saved successfully! ✅', 'success');
}

// ─── Success / order modal ───────────────────
export function closeSuccess() {
  document.getElementById('successOverlay')?.classList.remove('active');
  clearInterval(modalTrackInterval);
}

let modalTrackInterval = null;
export function startModalTracker() {
  let step = 0;
  const widths = ['0%', '33%', '66%', '100%'];
  function update(s) {
    [0, 1, 2, 3].forEach(i => {
      const el = document.getElementById(`mts${i}`);
      if (!el) return;
      el.classList.remove('done', 'active');
      if (i < s) el.classList.add('done');
      else if (i === s) el.classList.add('active');
    });
    const line = document.getElementById('modalProgressLine');
    if (line) setTimeout(() => { line.style.setProperty('--w', widths[s]); }, 100);
  }
  update(0);
  clearInterval(modalTrackInterval);
  modalTrackInterval = setInterval(() => { step++; update(step); if (step >= 3) clearInterval(modalTrackInterval); }, 4000);
}

export function goToTrackSection() {
  closeSuccess();
  trackOrder();
  document.getElementById('track-order')?.scrollIntoView({ behavior: 'smooth' });
}

// ─── Order tracking ──────────────────────────
export function trackOrder() {
  const rawInput = document.getElementById('trackOrderInput')?.value.trim().toUpperCase() || '';
  const orderId  = rawInput || 'HH-2024-0042';
  const order    = DEMO_ORDERS[orderId] || DEMO_ORDERS['HH-2024-0042'];
  const el = id => document.getElementById(id);

  if (el('displayOrderId')) el('displayOrderId').textContent = orderId in DEMO_ORDERS ? orderId : 'HH-2024-0042 (demo)';
  if (el('etaText'))        el('etaText').textContent = `ETA: ${order.eta}`;
  if (el('trackerItems'))   el('trackerItems').textContent = order.items;
  if (el('trackerTotal'))   el('trackerTotal').textContent = order.total;
  if (el('trackerDist'))    el('trackerDist').textContent = order.dist;

  order.times.forEach((t, i) => { const timeEl = el(`tt${i}`); if (timeEl) timeEl.textContent = t; });

  const progressWidths = ['0%', '33%', '66%', '100%'];
  [0, 1, 2, 3].forEach(i => {
    const stepEl = el(`ts${i}`);
    if (!stepEl) return;
    stepEl.classList.remove('done', 'active');
    if (i < order.step) stepEl.classList.add('done');
    else if (i === order.step) stepEl.classList.add('active');
  });

  const card = el('trackerCard');
  if (card) {
    card.classList.add('visible');
    setTimeout(() => { const line = el('progressLine'); if (line) line.style.width = progressWidths[order.step]; }, 200);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (rawInput && !(rawInput in DEMO_ORDERS)) showToast('Order not found. Showing demo order.', 'error');
  else showToast(`Tracking order ${orderId} 📦`, 'success');

  // Show the live map
  showLiveMap(order);
}

// ─── Live Map Tracking ───────────────────────
let mapAnimFrame = null;
let riderAngle = 0;
let riderPos = { x: 0.3, y: 0.7 };
let riderTarget = { x: 0.7, y: 0.35 };

export function showMapModal() {
  document.getElementById('mapOverlay')?.classList.add('active');
  startMapAnimation();
}
export function closeMapModal() {
  document.getElementById('mapOverlay')?.classList.remove('active');
  if (mapAnimFrame) cancelAnimationFrame(mapAnimFrame);
}

function showLiveMap(order) {
  const mapSection = document.getElementById('liveMapSection');
  if (!mapSection) return;
  mapSection.style.display = 'block';
  mapSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  drawMap(order);
}

function drawMap(order) {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 600;
  const H = canvas.height = 300;

  // Road color based on theme
  const isDark = !document.body.classList.contains('light-mode');
  const bgColor     = isDark ? '#0F0F18' : '#E8EDF8';
  const roadColor   = isDark ? '#1A1A28' : '#CBD5E0';
  const roadLine    = isDark ? 'rgba(0,229,255,0.15)' : 'rgba(0,150,200,0.2)';
  const buildingClr = isDark ? '#151520' : '#D1D9E6';
  const textClr     = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

  if (mapAnimFrame) cancelAnimationFrame(mapAnimFrame);

  // Destination fixed at top-right area
  const destX = W * 0.78, destY = H * 0.22;
  // Restaurant fixed at bottom-left
  const restX = W * 0.18, restY = H * 0.78;

  // Rider moves from restaurant toward dest
  let t = 0;
  if (order.step >= 3) t = 1;
  else if (order.step === 2) t = 0.6 + Math.random() * 0.25;
  else if (order.step === 1) t = 0.25 + Math.random() * 0.2;
  else t = 0.05;

  function lerp(a, b, t) { return a + (b - a) * t; }
  let rX = lerp(restX, destX, t);
  let rY = lerp(restY, destY, t);
  let direction = 0;

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, W, H);

    // Draw some fake buildings
    const buildings = [
      {x:0.05,y:0.1,w:0.08,h:0.25},{x:0.20,y:0.05,w:0.06,h:0.3},{x:0.42,y:0.08,w:0.07,h:0.22},
      {x:0.60,y:0.05,w:0.09,h:0.28},{x:0.85,y:0.08,w:0.08,h:0.2},
      {x:0.05,y:0.65,w:0.07,h:0.3},{x:0.50,y:0.6,w:0.1,h:0.35},{x:0.75,y:0.65,w:0.08,h:0.3},
    ];
    ctx.fillStyle = buildingClr;
    buildings.forEach(b => ctx.fillRect(b.x*W, b.y*H, b.w*W, b.h*H));

    // Roads
    ctx.strokeStyle = roadColor; ctx.lineWidth = 28;
    // Horizontal road
    ctx.beginPath(); ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5); ctx.stroke();
    // Vertical road
    ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H); ctx.stroke();
    // Diagonal path
    ctx.lineWidth = 20;
    ctx.beginPath(); ctx.moveTo(restX, restY); ctx.quadraticCurveTo(W*0.5, H*0.5, destX, destY); ctx.stroke();

    // Road dashes
    ctx.strokeStyle = roadLine; ctx.lineWidth = 2; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H); ctx.stroke();
    ctx.setLineDash([]);

    // Route line (dashed, glowing)
    ctx.strokeStyle = isDark ? 'rgba(0,229,255,0.5)' : 'rgba(0,150,200,0.5)';
    ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(restX, restY); ctx.quadraticCurveTo(W*0.5, H*0.5, destX, destY); ctx.stroke();
    ctx.setLineDash([]);

    // Restaurant pin
    ctx.fillStyle = isDark ? '#39FF14' : '#27B800';
    ctx.beginPath(); ctx.arc(restX, restY, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🏪', restX, restY + 4);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
    ctx.font = '11px sans-serif'; ctx.fillText('Restaurant', restX, restY + 22);

    // Destination pin
    ctx.fillStyle = isDark ? '#FF2D55' : '#CC0033';
    ctx.beginPath(); ctx.arc(destX, destY, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif';
    ctx.fillText('🏠', destX, destY + 4);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
    ctx.font = '11px sans-serif'; ctx.fillText('Your Home', destX, destY + 22);

    // Rider ping animation
    const pingR = 18 + 6 * Math.sin(Date.now() / 300);
    ctx.beginPath(); ctx.arc(rX, rY, pingR, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(0,229,255,0.12)' : 'rgba(0,150,200,0.15)'; ctx.fill();

    // Rider icon
    ctx.fillStyle = isDark ? '#00E5FF' : '#0077AA';
    ctx.beginPath(); ctx.arc(rX, rY, 14, 0, Math.PI * 2); ctx.fill();
    ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🛵', rX, rY + 5);

    // ETA bubble
    ctx.fillStyle = isDark ? '#0F0F18' : '#fff';
    ctx.strokeStyle = isDark ? 'rgba(0,229,255,0.4)' : 'rgba(0,150,200,0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, rX - 28, rY - 38, 56, 22, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = isDark ? '#00E5FF' : '#0077AA';
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(order.eta === 'Delivered!' ? '✅ Done' : `ETA ${order.eta}`, rX, rY - 23);

    // Animate rider slightly
    if (t < 1) {
      t += 0.0008;
      rX = lerp(restX, destX, Math.min(t, 1));
      rY = lerp(restY, destY, Math.min(t, 1));
    }
    mapAnimFrame = requestAnimationFrame(frame);
  }
  frame();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Search ─────────────────────────────────
export function handleSearch() {
  const val = document.getElementById('addressInput')?.value.trim();
  if (!val) { showToast('Please enter your delivery address', 'error'); return; }
  showToast(`Finding restaurants near "${val}"... 🔍`, 'success');
  document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth' });
}

// ─── Global keyboard handler ─────────────────
export function initKeyboardHandlers() {
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeAuthModal();
    closeSuccess();
    closeProfileModal();
    closeMapModal();
    const cartEl = document.getElementById('cartSidebar');
    if (cartEl?.classList.contains('active')) import('./cart.js').then(({ toggleCart }) => toggleCart());
  });
}

export function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('navLinks')?.classList.remove('open');
    }
  });
}

export function subscribeNewsletter() {
  const input = document.getElementById('newsletterEmail');
  const email = input?.value.trim();
  if (!email || !email.includes('@')) { showToast('Please enter a valid email address', 'error'); return; }
  input.value = '';
  showToast("You're subscribed! 🎉 Expect amazing deals soon.", 'success');
}

// ─── Theme Toggle ────────────────────────────
export function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('hh_theme', isLight ? 'light' : 'dark');
  const btn = document.getElementById('themeToggle');
  if (btn) btn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}
export function initTheme() {
  if (localStorage.getItem('hh_theme') === 'light') {
    document.body.classList.add('light-mode');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
  }
  // Restore profile button
  const name = localStorage.getItem('hh_user_name');
  if (name) {
    const btn = document.getElementById('profileBtn');
    if (btn) btn.innerHTML = `<i class="fas fa-user-circle"></i> ${name.split(' ')[0]}`;
  }
}