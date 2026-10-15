/**
 * MAISON NOIR — Shared UI Components & Interactivity
 * Injects unified Header, Footer, Mobile Menu, Mini-Cart Drawer, Search Overlay, and Toasts.
 */

import { getCart, getCartCount, getCartSummary, updateQuantity, removeFromCart } from './cart.js';
import { formatPrice } from './products.js';

// Wishlist storage
const WISHLIST_KEY = 'maison_noir_wishlist';

export function getWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

export function toggleWishlist(productId) {
  let list = getWishlist();
  let added = false;
  if (list.includes(productId)) {
    list = list.filter(id => id !== productId);
    added = false;
  } else {
    list.push(productId);
    added = true;
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('wishlist:updated', { detail: { list, productId, added } }));
  return added;
}

// Toast notification helper
export function showToast(message, type = 'info') {
  let container = document.getElementById('noir-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'noir-toast-container';
    container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'noir-toast pointer-events-auto bg-black text-white px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-neutral-800 text-xs tracking-widest uppercase';
  toast.innerHTML = `
    <span class="inline-block w-2 h-2 rounded-full ${type === 'error' ? 'bg-red-500' : 'bg-white'}"></span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// Render Shared Header and Footer
export function initSharedLayout(activePage = '') {
  renderAnnouncementBar();
  renderHeader(activePage);
  renderFooter();
  renderMobileDrawer(activePage);
  renderSearchModal();
  renderMiniCartDrawer();
  setupGlobalListeners();
  setupScrollReveal();
  updateHeaderCartCount();
}

function renderAnnouncementBar() {
  const existing = document.getElementById('top-announcement-bar');
  if (existing) return;

  const bar = document.createElement('div');
  bar.id = 'top-announcement-bar';
  bar.className = 'bg-black text-white text-[11px] font-medium tracking-[0.2em] uppercase py-2 text-center border-b border-neutral-900';
  bar.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
      <span>COMPLIMENTARY GLOBAL & LOCAL DELIVERY ON ARCHIVAL ORDERS OVER LKR 50,000</span>
      <span class="hidden md:inline-block text-neutral-500">|</span>
      <span class="hidden md:inline-block text-neutral-400">COLOMBO ATELIER CAPSULE</span>
    </div>
  `;
  document.body.insertBefore(bar, document.body.firstChild);
}

function renderHeader(activePage = '') {
  const headerContainer = document.getElementById('site-header');
  if (!headerContainer) return;

  const navItems = [
    { label: 'NEW ARRIVALS', href: 'collection.html?category=all&sort=newest', id: 'new-arrivals' },
    { label: 'WOMEN', href: 'collection.html?category=women', id: 'women' },
    { label: 'MEN', href: 'collection.html?category=men', id: 'men' },
    { label: 'COLLECTIONS', href: 'collection.html', id: 'collections' },
    { label: 'SEARCH', href: '#', id: 'search', isAction: true },
    { label: 'CART', href: 'cart.html', id: 'cart' },
    { label: 'ACCOUNT', href: '#', id: 'account', isAction: true }
  ];

  const count = getCartCount();

  headerContainer.innerHTML = `
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e5e5] transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
        <!-- Brand Logo -->
        <a href="index.html" class="flex items-center gap-2 group focus-visible:ring-1 focus-visible:ring-black">
          <span class="text-xl sm:text-2xl font-bold tracking-[0.25em] uppercase text-black font-sans transition-opacity group-hover:opacity-75">
            MAISON NOIR
          </span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-7 lg:gap-9" aria-label="Main Navigation">
          ${navItems.map(item => {
            const isActive = activePage === item.id;
            const activeClass = isActive ? 'font-bold text-black border-b-2 border-black pb-1' : 'font-medium text-neutral-700 hover:text-black';
            
            if (item.id === 'search') {
              return `
                <button type="button" id="header-search-btn" class="text-xs uppercase tracking-[0.16em] ${activeClass} transition-colors" aria-label="Search Collection">
                  ${item.label}
                </button>
              `;
            }

            if (item.id === 'cart') {
              return `
                <div class="relative flex items-center">
                  <a href="${item.href}" id="header-cart-link" class="text-xs uppercase tracking-[0.16em] ${activeClass} flex items-center gap-1.5 transition-colors">
                    <span>${item.label}</span>
                    <span id="header-cart-badge" class="${count > 0 ? 'inline-flex' : 'hidden'} items-center justify-center bg-black text-white text-[10px] w-4 h-4 rounded-full font-sans font-bold">
                      ${count}
                    </span>
                  </a>
                  <button type="button" id="header-mini-cart-toggle" class="ml-1 text-neutral-400 hover:text-black text-xs" title="Quick Mini-Cart">
                    <span class="sr-only">Open Quick Cart</span>
                  </button>
                </div>
              `;
            }

            if (item.id === 'account') {
              return `
                <button type="button" id="header-account-btn" class="text-xs uppercase tracking-[0.16em] ${activeClass} transition-colors">
                  ${item.label}
                </button>
              `;
            }

            return `
              <a href="${item.href}" class="text-xs uppercase tracking-[0.16em] ${activeClass} transition-colors noir-link-hover">
                ${item.label}
              </a>
            `;
          }).join('')}
        </nav>

        <!-- Mobile Controls (Search, Cart, Menu) -->
        <div class="flex md:hidden items-center gap-5">
          <button type="button" id="mobile-search-btn" class="text-black text-xs tracking-widest uppercase" aria-label="Open Search">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
          </button>
          
          <a href="cart.html" class="relative text-black text-xs tracking-widest uppercase flex items-center" aria-label="Cart">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z"/></svg>
            <span id="mobile-cart-badge" class="${count > 0 ? 'inline-flex' : 'hidden'} absolute -top-1.5 -right-2 bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full items-center justify-center font-bold">
              ${count}
            </span>
          </a>

          <button type="button" id="mobile-menu-btn" class="text-black p-1 focus:outline-none" aria-label="Open Mobile Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  const footerContainer = document.getElementById('site-footer');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="bg-black text-white pt-16 pb-12 mt-auto border-t border-neutral-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-neutral-900">
          <!-- Brand Column -->
          <div class="lg:col-span-2">
            <a href="index.html" class="inline-block mb-4">
              <span class="text-2xl font-bold tracking-[0.25em] uppercase text-white font-sans">
                MAISON NOIR
              </span>
            </a>
            <p class="text-neutral-400 text-xs tracking-wider leading-relaxed max-w-sm mb-6">
              Refined essentials designed with intention, made for a wardrobe that lasts.
            </p>
            <div>
              <span class="block text-[11px] uppercase tracking-[0.2em] text-neutral-300 font-semibold mb-3">
                Follow Us
              </span>
              <div class="flex items-center gap-4 text-white">
                <a href="https://facebook.com" target="_blank" rel="noopener" class="hover:text-neutral-400 transition-colors" aria-label="Facebook">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z"/></svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener" class="hover:text-neutral-400 transition-colors" aria-label="TikTok">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.14 1.18 2.07 2.3 2.34 1.05.27 2.21.07 3.07-.63.74-.57 1.17-1.45 1.25-2.39.1-1.68.05-3.37.06-5.06V0h-.01z"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener" class="hover:text-neutral-400 transition-colors" aria-label="YouTube">
                  <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Column: SHOP -->
          <div>
            <h4 class="text-xs font-bold tracking-[0.2em] uppercase text-white mb-4">SHOP</h4>
            <ul class="space-y-2.5 text-xs tracking-wider text-neutral-400">
              <li><a href="collection.html?category=all&sort=newest" class="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="collection.html?category=women" class="hover:text-white transition-colors">Women</a></li>
              <li><a href="collection.html?category=men" class="hover:text-white transition-colors">Men</a></li>
              <li><a href="collection.html" class="hover:text-white transition-colors">Collections</a></li>
            </ul>
          </div>

          <!-- Column: CLIENT SERVICES -->
          <div>
            <h4 class="text-xs font-bold tracking-[0.2em] uppercase text-white mb-4">CLIENT SERVICES</h4>
            <ul class="space-y-2.5 text-xs tracking-wider text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors modal-trigger" data-modal="contact">Contact</a></li>
              <li><a href="#" class="hover:text-white transition-colors modal-trigger" data-modal="shipping">Shipping & Delivery</a></li>
              <li><a href="#" class="hover:text-white transition-colors modal-trigger" data-modal="returns">Returns</a></li>
              <li><a href="#" class="hover:text-white transition-colors modal-trigger" data-modal="size-guide">Size Guide</a></li>
              <li><a href="#" class="hover:text-white transition-colors modal-trigger" data-modal="faq">FAQ</a></li>
            </ul>
          </div>

          <!-- Column: ABOUT -->
          <div>
            <h4 class="text-xs font-bold tracking-[0.2em] uppercase text-white mb-4">ABOUT</h4>
            <ul class="space-y-2.5 text-xs tracking-wider text-neutral-400">
              <li><a href="index.html#manifesto" class="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="collection.html" class="hover:text-white transition-colors">Journal</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener" class="hover:text-white transition-colors">Instagram</a></li>
            </ul>
          </div>

          <!-- Column: LEGAL -->
          <div>
            <h4 class="text-xs font-bold tracking-[0.2em] uppercase text-white mb-4">LEGAL</h4>
            <ul class="space-y-2.5 text-xs tracking-wider text-neutral-400">
              <li><a href="#" class="hover:text-white transition-colors modal-trigger" data-modal="privacy">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white transition-colors modal-trigger" data-modal="terms">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        <!-- Copyright Line -->
        <div class="pt-8 text-center text-[11px] tracking-[0.2em] uppercase text-neutral-400 font-medium">
          © 2026 MAISON NOIR | COLOMBO, SRI LANKA
        </div>
      </div>
    </footer>
  `;
}

function renderMobileDrawer(activePage = '') {
  let drawer = document.getElementById('mobile-nav-drawer');
  if (drawer) drawer.remove();

  drawer = document.createElement('div');
  drawer.id = 'mobile-nav-drawer';
  drawer.className = 'fixed inset-0 z-50 pointer-events-none';
  drawer.innerHTML = `
    <!-- Backdrop -->
    <div id="mobile-drawer-backdrop" class="drawer-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"></div>
    
    <!-- Drawer Panel -->
    <div id="mobile-drawer-panel" class="drawer-panel-left fixed top-0 bottom-0 left-0 w-5/6 max-w-sm bg-white p-6 shadow-2xl flex flex-col pointer-events-auto overflow-y-auto">
      <div class="flex items-center justify-between pb-6 border-b border-neutral-200">
        <span class="text-lg font-bold tracking-[0.2em] uppercase text-black font-sans">
          MAISON NOIR
        </span>
        <button type="button" id="mobile-drawer-close" class="p-2 text-black hover:opacity-70" aria-label="Close menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <nav class="py-8 space-y-6 flex-1">
        <a href="index.html" class="block text-sm font-semibold tracking-[0.2em] uppercase ${activePage === '' ? 'text-black' : 'text-neutral-600'}">HOME</a>
        <a href="collection.html?category=all&sort=newest" class="block text-sm font-semibold tracking-[0.2em] uppercase ${activePage === 'new-arrivals' ? 'text-black' : 'text-neutral-600'}">NEW ARRIVALS</a>
        <a href="collection.html?category=women" class="block text-sm font-semibold tracking-[0.2em] uppercase ${activePage === 'women' ? 'text-black' : 'text-neutral-600'}">WOMEN</a>
        <a href="collection.html?category=men" class="block text-sm font-semibold tracking-[0.2em] uppercase ${activePage === 'men' ? 'text-black' : 'text-neutral-600'}">MEN</a>
        <a href="collection.html" class="block text-sm font-semibold tracking-[0.2em] uppercase ${activePage === 'collections' ? 'text-black' : 'text-neutral-600'}">COLLECTIONS</a>
        <a href="cart.html" class="block text-sm font-semibold tracking-[0.2em] uppercase ${activePage === 'cart' ? 'text-black' : 'text-neutral-600'} flex items-center justify-between">
          <span>CART</span>
          <span class="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold">${getCartCount()}</span>
        </a>
      </nav>

      <div class="pt-6 border-t border-neutral-200 text-xs text-neutral-500 space-y-3">
        <p class="tracking-widest uppercase font-medium text-black">COLOMBO ATELIER</p>
        <p class="tracking-wider">Bespoke tailoring & archival capsule collections.</p>
        <p class="text-[10px] tracking-widest uppercase pt-2">© 2026 MAISON NOIR</p>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);
}

function renderSearchModal() {
  let modal = document.getElementById('search-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'search-modal';
  modal.className = 'fixed inset-0 z-50 pointer-events-none';
  modal.innerHTML = `
    <!-- Backdrop -->
    <div id="search-backdrop" class="drawer-backdrop fixed inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"></div>

    <!-- Search Box -->
    <div id="search-container" class="fixed top-0 left-0 right-0 bg-white shadow-2xl p-6 sm:p-10 pointer-events-auto transform -translate-y-full transition-transform duration-300 ease-out z-50">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between pb-6 border-b border-black">
          <div class="flex items-center gap-3 flex-1 mr-4">
            <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
            <input type="text" id="site-search-input" placeholder="SEARCH PIECES, TAILORING, ACCESSORIES..." class="w-full text-base sm:text-xl font-medium tracking-wider uppercase border-none focus:outline-none placeholder-neutral-400 bg-transparent">
          </div>
          <button type="button" id="close-search-modal" class="p-2 text-black hover:opacity-60" aria-label="Close search">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Quick Tags & Live Results -->
        <div class="py-6">
          <div class="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-400 mb-3">SUGGESTED SEARCHES</div>
          <div class="flex flex-wrap gap-2 mb-8">
            <a href="collection.html?search=blazer" class="px-3 py-1.5 bg-[#f5f5f5] hover:bg-black hover:text-white text-xs tracking-wider uppercase transition-colors">THE NOIR BLAZER</a>
            <a href="collection.html?category=women" class="px-3 py-1.5 bg-[#f5f5f5] hover:bg-black hover:text-white text-xs tracking-wider uppercase transition-colors">WOMEN TAILORING</a>
            <a href="collection.html?category=accessories" class="px-3 py-1.5 bg-[#f5f5f5] hover:bg-black hover:text-white text-xs tracking-wider uppercase transition-colors">LEATHER ACCESSORIES</a>
            <a href="collection.html?search=shirt" class="px-3 py-1.5 bg-[#f5f5f5] hover:bg-black hover:text-white text-xs tracking-wider uppercase transition-colors">SIGNATURE SHIRTS</a>
          </div>

          <div id="search-live-results" class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function renderMiniCartDrawer() {
  let drawer = document.getElementById('mini-cart-drawer');
  if (drawer) drawer.remove();

  drawer = document.createElement('div');
  drawer.id = 'mini-cart-drawer';
  drawer.className = 'fixed inset-0 z-50 pointer-events-none';
  drawer.innerHTML = `
    <!-- Backdrop -->
    <div id="mini-cart-backdrop" class="drawer-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"></div>
    
    <!-- Panel -->
    <div id="mini-cart-panel" class="drawer-panel fixed top-0 bottom-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto">
      <div class="p-6 border-b border-neutral-200 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold tracking-[0.2em] uppercase text-black">YOUR ARCHIVAL BAG</h3>
          <p class="text-[11px] text-neutral-500 tracking-wider">PIECES HELD TEMPORARILY</p>
        </div>
        <button type="button" id="close-mini-cart" class="p-2 text-black hover:opacity-60" aria-label="Close cart">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Items List -->
      <div id="mini-cart-items" class="flex-1 overflow-y-auto p-6 space-y-4"></div>

      <!-- Footer Checkout -->
      <div class="p-6 border-t border-neutral-200 bg-[#fafafa]">
        <div class="flex items-center justify-between text-xs tracking-wider font-semibold mb-4">
          <span class="uppercase">SUBTOTAL</span>
          <span id="mini-cart-subtotal" class="font-bold text-black">LKR 0</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <a href="cart.html" class="btn-noir-outline text-center text-xs py-3">VIEW CART</a>
          <a href="checkout.html" class="btn-noir-solid text-center text-xs py-3">CHECKOUT</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(drawer);
}

export function openMiniCart() {
  updateMiniCartContent();
  const backdrop = document.getElementById('mini-cart-backdrop');
  const panel = document.getElementById('mini-cart-panel');
  if (backdrop && panel) {
    backdrop.classList.add('active');
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeMiniCart() {
  const backdrop = document.getElementById('mini-cart-backdrop');
  const panel = document.getElementById('mini-cart-panel');
  if (backdrop && panel) {
    backdrop.classList.remove('active');
    panel.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function updateMiniCartContent() {
  const container = document.getElementById('mini-cart-items');
  const subtotalEl = document.getElementById('mini-cart-subtotal');
  if (!container) return;

  const cart = getCart();
  const summary = getCartSummary();

  if (subtotalEl) {
    subtotalEl.textContent = formatPrice(summary.subtotal);
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <p class="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">YOUR ARCHIVAL BAG IS EMPTY</p>
        <a href="collection.html" class="btn-noir-outline text-xs px-6 py-2.5">EXPLORE THE COLLECTION</a>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="flex gap-4 p-3 bg-white border border-neutral-200">
      <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover">
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <span class="text-[9px] uppercase tracking-[0.2em] text-neutral-400 block">${item.edition}</span>
          <h4 class="text-xs font-semibold tracking-wider uppercase text-black">${item.name}</h4>
          <p class="text-[11px] text-neutral-500 uppercase mt-0.5">${item.color} / ${item.size}</p>
          <p class="text-xs font-medium text-black mt-1">${formatPrice(item.price)}</p>
        </div>
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center border border-neutral-300">
            <button type="button" class="mini-cart-qty px-2 py-0.5 text-xs text-neutral-600 hover:text-black" data-id="${item.cartItemId}" data-delta="-1">-</button>
            <span class="px-2 text-xs font-medium">${item.quantity}</span>
            <button type="button" class="mini-cart-qty px-2 py-0.5 text-xs text-neutral-600 hover:text-black" data-id="${item.cartItemId}" data-delta="1">+</button>
          </div>
          <button type="button" class="mini-cart-remove text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black" data-id="${item.cartItemId}">REMOVE</button>
        </div>
      </div>
    </div>
  `).join('');

  // Attach listeners
  container.querySelectorAll('.mini-cart-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      updateQuantity(id, delta);
      updateMiniCartContent();
      updateHeaderCartCount();
    });
  });

  container.querySelectorAll('.mini-cart-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
      updateMiniCartContent();
      updateHeaderCartCount();
      showToast('Item removed from cart');
    });
  });
}

export function updateHeaderCartCount() {
  const count = getCartCount();
  const desktopBadge = document.getElementById('header-cart-badge');
  const mobileBadge = document.getElementById('mobile-cart-badge');

  if (desktopBadge) {
    desktopBadge.textContent = count;
    desktopBadge.className = count > 0 
      ? 'inline-flex items-center justify-center bg-black text-white text-[10px] w-4 h-4 rounded-full font-sans font-bold'
      : 'hidden';
  }

  if (mobileBadge) {
    mobileBadge.textContent = count;
    mobileBadge.className = count > 0 
      ? 'inline-flex absolute -top-1.5 -right-2 bg-black text-white text-[9px] w-3.5 h-3.5 rounded-full items-center justify-center font-bold'
      : 'hidden';
  }
}

function setupGlobalListeners() {
  // Mini cart listeners
  document.addEventListener('click', (e) => {
    if (e.target.closest('#header-mini-cart-toggle')) {
      e.preventDefault();
      openMiniCart();
    }
    if (e.target.closest('#close-mini-cart') || e.target.id === 'mini-cart-backdrop') {
      closeMiniCart();
    }
  });

  // Mobile menu listeners
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('mobile-drawer-close');
  const mobileBackdrop = document.getElementById('mobile-drawer-backdrop');
  const mobilePanel = document.getElementById('mobile-drawer-panel');

  if (menuBtn && mobileBackdrop && mobilePanel) {
    menuBtn.addEventListener('click', () => {
      mobileBackdrop.classList.add('active');
      mobilePanel.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeMobile = () => {
      mobileBackdrop.classList.remove('active');
      mobilePanel.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeMenuBtn?.addEventListener('click', closeMobile);
    mobileBackdrop.addEventListener('click', closeMobile);
  }

  // Search modal listeners
  const searchBtn = document.getElementById('header-search-btn');
  const mobileSearchBtn = document.getElementById('mobile-search-btn');
  const closeSearchBtn = document.getElementById('close-search-modal');
  const searchBackdrop = document.getElementById('search-backdrop');
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('site-search-input');

  const openSearch = (e) => {
    e.preventDefault();
    searchBackdrop.classList.add('active');
    searchContainer.style.transform = 'translateY(0)';
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput?.focus(), 100);
  };

  const closeSearch = () => {
    searchBackdrop.classList.remove('active');
    searchContainer.style.transform = 'translateY(-100%)';
    document.body.style.overflow = '';
  };

  searchBtn?.addEventListener('click', openSearch);
  mobileSearchBtn?.addEventListener('click', openSearch);
  closeSearchBtn?.addEventListener('click', closeSearch);
  searchBackdrop?.addEventListener('click', closeSearch);

  // Live search input
  if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
      const q = e.target.value.toLowerCase().trim();
      const resultsContainer = document.getElementById('search-live-results');
      if (!resultsContainer) return;

      if (!q) {
        resultsContainer.innerHTML = '';
        return;
      }

      const { fetchProducts } = await import('./products.js');
      const all = await fetchProducts();
      const matches = all.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.subtitle.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      ).slice(0, 4);

      if (matches.length === 0) {
        resultsContainer.innerHTML = `<div class="col-span-4 text-xs text-neutral-400 py-4 uppercase tracking-widest">No archival pieces found for "${q}"</div>`;
      } else {
        resultsContainer.innerHTML = matches.map(p => `
          <a href="product.html?id=${p.id}" class="group block border border-neutral-200 p-2 hover:border-black transition-colors">
            <div class="aspect-[3/4] overflow-hidden mb-2">
              <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            </div>
            <div class="text-[10px] tracking-wider uppercase font-semibold text-black truncate">${p.name}</div>
            <div class="text-[10px] text-neutral-500">${formatPrice(p.price)}</div>
          </a>
        `).join('');
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) window.location.href = `collection.html?search=${encodeURIComponent(q)}`;
      }
      if (e.key === 'Escape') closeSearch();
    });
  }

  // Listen to cart updates globally
  window.addEventListener('cart:updated', () => {
    updateHeaderCartCount();
  });
}

function setupScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  items.forEach(el => observer.observe(el));
}
