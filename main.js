// ============================================
//  main.js — App entry point
// ============================================

import { renderCategories, renderFilterTabs, renderFoodGrid, renderRestaurants, renderTestimonials } from './render.js';
import {
  addToCart, decreaseQty, cartIncrease, cartDecrease,
  toggleCart, toggleFav, validatePromo, applyPromo,
  setFilter, filterByCategory, checkout,
  setPaymentMethod, setDietFilter, setSortOrder,
} from './cart.js';
import {
  showToast, initScrollEffects, initNavHighlight,
  initAnimateOnScroll, observeCards, toggleMenu,
  showAuthModal, closeAuthModal, switchTab, handleLogin, handleRegister,
  closeSuccess, goToTrackSection, trackOrder, handleSearch,
  initKeyboardHandlers, initSmoothScroll, subscribeNewsletter,
  toggleTheme, initTheme,
  showProfileModal, closeProfileModal, saveProfile,
  showMapModal, closeMapModal,
} from './ui.js';

Object.assign(window, {
  addToCart, decreaseQty, cartIncrease, cartDecrease,
  toggleCart, toggleFav, validatePromo, applyPromo,
  setFilter, filterByCategory, checkout,
  setPaymentMethod, setDietFilter, setSortOrder,
  showToast, toggleMenu,
  showAuthModal, closeAuthModal, switchTab, handleLogin, handleRegister,
  closeSuccess, goToTrackSection, trackOrder, handleSearch,
  subscribeNewsletter, toggleTheme,
  showProfileModal, closeProfileModal, saveProfile,
  showMapModal, closeMapModal,
});

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderFilterTabs();
  renderFoodGrid('All');
  renderRestaurants();
  renderTestimonials();

  initTheme();
  initScrollEffects();
  initNavHighlight();
  initAnimateOnScroll();
  initKeyboardHandlers();
  initSmoothScroll();

  import('./cart.js').then(({ updateBadge }) => updateBadge());
  setTimeout(observeCards, 100);
});