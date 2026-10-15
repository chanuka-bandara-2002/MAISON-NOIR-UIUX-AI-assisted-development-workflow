/**
 * MAISON NOIR — Main Application Logic
 * Coordinates page initialization, data fetching, filtering, cart management, and event handlers.
 */

import { 
  fetchProducts, 
  getProductById, 
  getFeaturedProducts, 
  getNewArrivals, 
  getAccessories, 
  filterAndSortProducts, 
  formatPrice 
} from './products.js';

import { 
  getCart, 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  getCartSummary, 
  applyPromo, 
  removePromo 
} from './cart.js';

import { 
  initSharedLayout, 
  showToast, 
  toggleWishlist, 
  isWishlisted, 
  openMiniCart 
} from './ui.js';

// Card Generator for Products (3:4 ratio with hover swap)
export function createProductCardHtml(product) {
  const wish = isWishlisted(product.id);
  const hoverImg = product.hoverImage || product.images[1] || product.images[0];
  const primaryImg = product.images[0];

  return `
    <article class="product-card group reveal-item flex flex-col justify-between" data-id="${product.id}">
      <div class="product-card-media relative overflow-hidden bg-[#f4f4f4] mb-3">
        <a href="product.html?id=${product.id}" class="block w-full h-full">
          <img src="${primaryImg}" alt="${product.name}" class="primary-img" loading="lazy">
          <img src="${hoverImg}" alt="${product.name} alternate view" class="hover-img" loading="lazy">
        </a>
        <button type="button" 
                class="wishlist-btn absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-200 shadow-sm" 
                data-id="${product.id}" 
                aria-label="Add ${product.name} to wishlist">
          <svg class="w-4 h-4 ${wish ? 'fill-current text-black' : 'stroke-current fill-none'}" viewBox="0 0 24 24" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <div class="flex items-start justify-between gap-2 pt-1">
        <div>
          <h3 class="text-xs sm:text-sm font-semibold tracking-wider uppercase text-black hover:opacity-75 transition-opacity">
            <a href="product.html?id=${product.id}">${product.name}</a>
          </h3>
          <p class="text-[11px] text-neutral-500 tracking-wide mt-0.5">${product.subtitle || ''}</p>
        </div>
        <span class="text-xs sm:text-sm font-medium tracking-wide text-black shrink-0">
          ${formatPrice(product.price)}
        </span>
      </div>
    </article>
  `;
}

// Card Generator for Accessories
export function createAccessoryCardHtml(product) {
  const wish = isWishlisted(product.id);
  const primaryImg = product.images[0];

  return `
    <article class="product-card group reveal-item flex flex-col justify-between" data-id="${product.id}">
      <div class="relative overflow-hidden bg-neutral-900 aspect-square mb-3">
        <a href="product.html?id=${product.id}" class="block w-full h-full">
          <img src="${primaryImg}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
        </a>
        <button type="button" 
                class="wishlist-btn absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-200 shadow-sm" 
                data-id="${product.id}" 
                aria-label="Add ${product.name} to wishlist">
          <svg class="w-4 h-4 ${wish ? 'fill-current text-black' : 'stroke-current fill-none'}" viewBox="0 0 24 24" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <div class="flex items-start justify-between gap-2 pt-1 text-left">
        <div>
          <h3 class="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white hover:opacity-75 transition-opacity">
            <a href="product.html?id=${product.id}">${product.name}</a>
          </h3>
          <p class="text-[11px] text-neutral-400 tracking-wide mt-0.5">${product.subtitle || ''}</p>
        </div>
        <span class="text-xs sm:text-sm font-medium tracking-wide text-white shrink-0">
          ${formatPrice(product.price)}
        </span>
      </div>
    </article>
  `;
}

// Global Wishlist Click Handler
function setupWishlistButtons(container) {
  const root = container || document;
  root.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const added = toggleWishlist(id);
      const svg = btn.querySelector('svg');
      if (svg) {
        if (added) {
          svg.classList.add('fill-current', 'text-black');
          svg.classList.remove('stroke-current', 'fill-none');
          showToast('Added to your archival wishlist');
        } else {
          svg.classList.remove('fill-current', 'text-black');
          svg.classList.add('stroke-current', 'fill-none');
          showToast('Removed from your wishlist');
        }
      }
    });
  });
}

// -----------------------------------------------------------------------------
// PAGE: HOME
// -----------------------------------------------------------------------------
export async function initHomePage() {
  initSharedLayout('');

  const products = await fetchProducts();
  const newArrivals = products.slice(0, 6);
  const curatedLooks = products.filter(p => !p.isAccessory).slice(6, 12);
  const accessories = products.filter(p => p.isAccessory || p.category === 'accessories').slice(0, 4);

  // Render New Arrivals Grid
  const newArrivalsContainer = document.getElementById('home-new-arrivals-grid');
  if (newArrivalsContainer) {
    newArrivalsContainer.innerHTML = newArrivals.map(createProductCardHtml).join('');
    setupWishlistButtons(newArrivalsContainer);
  }

  // Render Curated Looks Grid
  const curatedContainer = document.getElementById('home-curated-grid');
  if (curatedContainer) {
    curatedContainer.innerHTML = (curatedLooks.length >= 6 ? curatedLooks : products.slice(0, 6)).map(createProductCardHtml).join('');
    setupWishlistButtons(curatedContainer);
  }

  // Render Accessories Strip
  const accessoriesContainer = document.getElementById('home-accessories-grid');
  if (accessoriesContainer) {
    accessoriesContainer.innerHTML = accessories.map(createAccessoryCardHtml).join('');
    setupWishlistButtons(accessoriesContainer);
  }

  // Newsletter Validation
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterInput = document.getElementById('newsletter-email');
  if (newsletterForm && newsletterInput) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterInput.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValid) {
        newsletterInput.classList.add('error');
        showToast('Please provide a valid email address', 'error');
        return;
      }

      newsletterInput.classList.remove('error');
      newsletterInput.value = '';
      showToast('Welcome to The Maison Noir List. Privilege confirmed.');
    });
  }
}

// -----------------------------------------------------------------------------
// PAGE: COLLECTION
// -----------------------------------------------------------------------------
export async function initCollectionPage() {
  initSharedLayout('collections');

  const products = await fetchProducts();
  const urlParams = new URLSearchParams(window.location.search);

  // Active filter state
  const state = {
    category: urlParams.get('category') || 'all',
    size: urlParams.get('size') || 'all',
    color: urlParams.get('color') || 'all',
    priceRange: urlParams.get('price') || 'all',
    sort: urlParams.get('sort') || 'newest',
    searchQuery: urlParams.get('search') || '',
    visibleCount: 9
  };

  const gridContainer = document.getElementById('collection-grid');
  const countIndicator = document.getElementById('collection-count');
  const loadMoreBtn = document.getElementById('collection-load-more');
  const filterSummary = document.getElementById('active-filters-summary');

  function render() {
    const filtered = filterAndSortProducts(products, state);
    const visibleProducts = filtered.slice(0, state.visibleCount);

    if (countIndicator) {
      countIndicator.textContent = `Showing ${visibleProducts.length} of ${filtered.length} pieces`;
    }

    if (filterSummary) {
      const activeTags = [];
      if (state.category !== 'all') activeTags.push(`Category: ${state.category.toUpperCase()}`);
      if (state.size !== 'all') activeTags.push(`Size: ${state.size}`);
      if (state.color !== 'all') activeTags.push(`Color: ${state.color.toUpperCase()}`);
      if (state.priceRange !== 'all') activeTags.push(`Price: ${state.priceRange}`);
      if (state.searchQuery) activeTags.push(`Search: "${state.searchQuery}"`);

      if (activeTags.length > 0) {
        filterSummary.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap py-3 text-xs">
            <span class="text-neutral-500 uppercase tracking-widest text-[11px]">Active Filters:</span>
            ${activeTags.map(tag => `
              <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ececec] text-black uppercase tracking-wider text-[11px] font-medium">
                ${tag}
              </span>
            `).join('')}
            <button type="button" id="clear-all-filters" class="text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black underline ml-2">
              Clear All
            </button>
          </div>
        `;
        document.getElementById('clear-all-filters')?.addEventListener('click', () => {
          state.category = 'all';
          state.size = 'all';
          state.color = 'all';
          state.priceRange = 'all';
          state.searchQuery = '';
          updateDropdownSelects();
          render();
        });
      } else {
        filterSummary.innerHTML = '';
      }
    }

    if (gridContainer) {
      if (filtered.length === 0) {
        gridContainer.innerHTML = `
          <div class="col-span-full py-20 text-center">
            <p class="text-sm uppercase tracking-[0.2em] text-neutral-400 mb-4">No pieces match your selected criteria</p>
            <button type="button" id="reset-filter-btn" class="btn-noir-solid text-xs">Reset All Filters</button>
          </div>
        `;
        document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
          state.category = 'all';
          state.size = 'all';
          state.color = 'all';
          state.priceRange = 'all';
          state.searchQuery = '';
          updateDropdownSelects();
          render();
        });
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
      }

      gridContainer.innerHTML = visibleProducts.map(createProductCardHtml).join('');
      setupWishlistButtons(gridContainer);
    }

    if (loadMoreBtn) {
      loadMoreBtn.style.display = state.visibleCount >= filtered.length ? 'none' : 'inline-flex';
    }
  }

  function updateDropdownSelects() {
    const catSelect = document.getElementById('filter-category');
    const sizeSelect = document.getElementById('filter-size');
    const colorSelect = document.getElementById('filter-color');
    const priceSelect = document.getElementById('filter-price');
    const sortSelect = document.getElementById('filter-sort');

    if (catSelect) catSelect.value = state.category;
    if (sizeSelect) sizeSelect.value = state.size;
    if (colorSelect) colorSelect.value = state.color;
    if (priceSelect) priceSelect.value = state.priceRange;
    if (sortSelect) sortSelect.value = state.sort;
  }

  // Setup dropdown listeners
  document.getElementById('filter-category')?.addEventListener('change', (e) => {
    state.category = e.target.value;
    state.visibleCount = 9;
    render();
  });

  document.getElementById('filter-size')?.addEventListener('change', (e) => {
    state.size = e.target.value;
    state.visibleCount = 9;
    render();
  });

  document.getElementById('filter-color')?.addEventListener('change', (e) => {
    state.color = e.target.value;
    state.visibleCount = 9;
    render();
  });

  document.getElementById('filter-price')?.addEventListener('change', (e) => {
    state.priceRange = e.target.value;
    state.visibleCount = 9;
    render();
  });

  document.getElementById('filter-sort')?.addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
  });

  loadMoreBtn?.addEventListener('click', () => {
    state.visibleCount += 6;
    render();
  });

  updateDropdownSelects();
  render();
}

// -----------------------------------------------------------------------------
// PAGE: PRODUCT
// -----------------------------------------------------------------------------
export async function initProductPage() {
  initSharedLayout('');

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'noir-blazer';
  const product = await getProductById(productId);

  // Set document title
  document.title = `${product.name} — MAISON NOIR`;

  // Breadcrumbs
  const breadcrumbEl = document.getElementById('product-breadcrumbs');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <a href="index.html" class="hover:text-black">HOME</a>
      <span>/</span>
      <a href="collection.html?category=${product.category}" class="hover:text-black">${product.categoryLabel?.toUpperCase() || 'COLLECTION'}</a>
      <span>/</span>
      <span class="text-black font-semibold">${product.name}</span>
    `;
  }

  // Main Info
  const titleEl = document.getElementById('product-title');
  const priceEl = document.getElementById('product-price');
  const descEl = document.getElementById('product-desc');
  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (descEl) descEl.textContent = product.description;

  // Selected options state
  let selectedColor = product.colors?.[0]?.name || 'Standard';
  let selectedSize = product.sizes?.[0] || 'M';
  let selectedImage = product.colors?.[0]?.image || product.images[0];
  let quantity = 1;

  // Main Image and Thumbnails
  const mainImgEl = document.getElementById('product-main-img');
  const thumbOneEl = document.getElementById('product-thumb-1');
  const thumbTwoEl = document.getElementById('product-thumb-2');

  const updateGallery = (mainSrc, thumb1Src, thumb2Src) => {
    if (mainImgEl) mainImgEl.src = mainSrc;
    if (thumbOneEl && thumb1Src) thumbOneEl.src = thumb1Src;
    if (thumbTwoEl && thumb2Src) thumbTwoEl.src = thumb2Src;
  };

  updateGallery(
    selectedImage,
    product.images[1] || product.images[0],
    product.images[2] || product.images[0]
  );

  // Allow clicking thumbnails to swap to main
  [thumbOneEl, thumbTwoEl].forEach(thumb => {
    if (thumb) {
      thumb.addEventListener('click', () => {
        const temp = mainImgEl.src;
        mainImgEl.src = thumb.src;
        thumb.src = temp;
      });
    }
  });

  // Color Swatches
  const swatchesContainer = document.getElementById('product-color-swatches');
  if (swatchesContainer && product.colors) {
    swatchesContainer.innerHTML = product.colors.map((c, i) => `
      <button type="button" 
              class="color-swatch-btn w-7 h-7 rounded-full border-2 transition-transform ${i === 0 ? 'ring-2 ring-black ring-offset-2 scale-110' : 'border-neutral-300 hover:scale-105'}"
              style="background-color: ${c.hex};" 
              data-name="${c.name}"
              data-img="${c.image}"
              title="${c.name}"
              aria-label="Select color ${c.name}">
      </button>
    `).join('');

    swatchesContainer.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        swatchesContainer.querySelectorAll('.color-swatch-btn').forEach(b => {
          b.className = 'color-swatch-btn w-7 h-7 rounded-full border-2 border-neutral-300 transition-transform hover:scale-105';
        });
        btn.className = 'color-swatch-btn w-7 h-7 rounded-full border-2 ring-2 ring-black ring-offset-2 scale-110';
        selectedColor = btn.getAttribute('data-name');
        selectedImage = btn.getAttribute('data-img');
        if (mainImgEl && selectedImage) mainImgEl.src = selectedImage;
      });
    });
  }

  // Size Selector
  const sizeContainer = document.getElementById('product-sizes');
  if (sizeContainer && product.sizes) {
    sizeContainer.innerHTML = product.sizes.map((s, i) => `
      <button type="button" 
              class="size-btn flex-1 py-3 text-xs uppercase font-medium tracking-widest border transition-all ${i === 2 || (i === 0 && product.sizes.length < 3) ? 'bg-black text-white border-black font-semibold' : 'bg-white text-black border-neutral-300 hover:border-black'}"
              data-size="${s}">
        ${s}
      </button>
    `).join('');

    selectedSize = product.sizes.length >= 3 ? product.sizes[2] : product.sizes[0];

    sizeContainer.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sizeContainer.querySelectorAll('.size-btn').forEach(b => {
          b.className = 'size-btn flex-1 py-3 text-xs uppercase font-medium tracking-widest border bg-white text-black border-neutral-300 hover:border-black transition-all';
        });
        btn.className = 'size-btn flex-1 py-3 text-xs uppercase font-semibold tracking-widest border bg-black text-white border-black transition-all';
        selectedSize = btn.getAttribute('data-size');
      });
    });
  }

  // Stepper / Quantity
  const qtyInput = document.getElementById('product-qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  qtyMinus?.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      if (qtyInput) qtyInput.textContent = quantity;
    }
  });

  qtyPlus?.addEventListener('click', () => {
    quantity++;
    if (qtyInput) qtyInput.textContent = quantity;
  });

  // Add to Cart Buttons (Main CTA & Mobile Sticky Bar)
  const handleAddToCart = () => {
    addToCart(product, {
      color: selectedColor,
      size: selectedSize,
      image: selectedImage,
      quantity
    });
    showToast(`Added ${quantity}x ${product.name} to archival cart`);
    openMiniCart();
  };

  document.getElementById('btn-add-to-cart')?.addEventListener('click', handleAddToCart);
  document.getElementById('mobile-sticky-add-cart')?.addEventListener('click', handleAddToCart);

  // Add to Wishlist Button
  const wishlistMainBtn = document.getElementById('btn-add-wishlist');
  if (wishlistMainBtn) {
    const isW = isWishlisted(product.id);
    const updateBtnText = (w) => {
      wishlistMainBtn.innerHTML = `
        <span>${w ? 'IN YOUR WISHLIST' : 'ADD TO WISHLIST'}</span>
        <svg class="w-4 h-4 ${w ? 'fill-current text-black' : 'stroke-current fill-none'}" viewBox="0 0 24 24" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      `;
    };
    updateBtnText(isW);

    wishlistMainBtn.addEventListener('click', () => {
      const added = toggleWishlist(product.id);
      updateBtnText(added);
      showToast(added ? 'Saved to archival wishlist' : 'Removed from wishlist');
    });
  }

  // Accordion Logic
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const isOpen = item.classList.contains('active');

      // Close all siblings for clean look
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // Mobile Sticky Add to Cart Visibility
  const stickyBar = document.getElementById('mobile-sticky-bar');
  const mainAddBtn = document.getElementById('btn-add-to-cart');
  if (stickyBar && mainAddBtn) {
    window.addEventListener('scroll', () => {
      const rect = mainAddBtn.getBoundingClientRect();
      if (rect.bottom < 0) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    }, { passive: true });
  }

  // Complete The Look Grid
  const lookContainer = document.getElementById('product-complete-look-grid');
  if (lookContainer) {
    const allProducts = await fetchProducts();
    const recommendations = allProducts
      .filter(p => p.id !== product.id)
      .slice(0, 3);
    lookContainer.innerHTML = recommendations.map(createProductCardHtml).join('');
    setupWishlistButtons(lookContainer);
  }
}

// -----------------------------------------------------------------------------
// PAGE: CART
// -----------------------------------------------------------------------------
export async function initCartPage() {
  initSharedLayout('cart');

  const itemsContainer = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const cartContent = document.getElementById('cart-content-wrapper');

  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');
  const promoDiscountRow = document.getElementById('cart-promo-row');
  const promoDiscountAmount = document.getElementById('cart-promo-amount');
  const countIndicator = document.getElementById('cart-header-count');

  function renderCartView() {
    const cart = getCart();
    const summary = getCartSummary();

    if (countIndicator) {
      countIndicator.textContent = `${summary.count} CURATED ${summary.count === 1 ? 'PIECE' : 'PIECES'} ARCHIVED — HELD TEMPORARILY`;
    }

    if (cart.length === 0) {
      if (cartContent) cartContent.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (cartContent) cartContent.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    // Render items matching the screenshot
    if (itemsContainer) {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item-row flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-neutral-200 gap-4 mb-4" data-id="${item.cartItemId}">
          <div class="flex items-center gap-5">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-24 sm:w-24 sm:h-28 object-cover shrink-0 bg-neutral-100">
            <div>
              <span class="text-[10px] tracking-[0.2em] uppercase text-neutral-400 block">${item.edition}</span>
              <h3 class="text-xs sm:text-sm font-semibold tracking-wider uppercase text-black mt-0.5">
                <a href="product.html?id=${item.productId}" class="hover:underline">${item.name}</a>
              </h3>
              <p class="text-xs font-medium text-black mt-1">${formatPrice(item.price)}</p>
              <button type="button" class="btn-remove-item text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black mt-2 flex items-center gap-1" data-id="${item.cartItemId}">
                REMOVE &times;
              </button>
            </div>
          </div>

          <div class="flex items-center self-end sm:self-center gap-3">
            <div class="flex items-center border border-neutral-300">
              <button type="button" class="btn-qty px-3 py-1 text-sm text-neutral-600 hover:text-black" data-id="${item.cartItemId}" data-delta="-1">-</button>
              <span class="px-3 text-xs font-semibold">${item.quantity}</span>
              <button type="button" class="btn-qty px-3 py-1 text-sm text-neutral-600 hover:text-black" data-id="${item.cartItemId}" data-delta="1">+</button>
            </div>
          </div>
        </div>
      `).join('');

      // Wire steppers
      itemsContainer.querySelectorAll('.btn-qty').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const delta = parseInt(btn.getAttribute('data-delta'), 10);
          updateQuantity(id, delta);
          renderCartView();
        });
      });

      // Wire remove
      itemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          removeFromCart(id);
          renderCartView();
          showToast('Archival piece removed from cart');
        });
      });
    }

    // Summary calculations
    if (subtotalEl) subtotalEl.textContent = formatPrice(summary.subtotal);
    if (shippingEl) shippingEl.textContent = summary.shippingLabel;
    if (totalEl) totalEl.textContent = formatPrice(summary.total);

    if (promoDiscountRow && promoDiscountAmount) {
      if (summary.discount > 0) {
        promoDiscountRow.classList.remove('hidden');
        promoDiscountAmount.textContent = `- ${formatPrice(summary.discount)}`;
      } else {
        promoDiscountRow.classList.add('hidden');
      }
    }
  }

  // Promo Code Handler
  const promoInput = document.getElementById('cart-promo-input');
  const promoBtn = document.getElementById('cart-promo-btn');
  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim();
      const res = applyPromo(code);
      if (res.success) {
        showToast(res.message);
        promoInput.value = '';
        renderCartView();
      } else {
        showToast(res.message, 'error');
      }
    });
  }

  // Render Accessories Strip (Complete Your Look)
  const accessoriesContainer = document.getElementById('cart-accessories-grid');
  if (accessoriesContainer) {
    const products = await fetchProducts();
    const accessories = products.filter(p => p.isAccessory || p.category === 'accessories').slice(0, 4);
    accessoriesContainer.innerHTML = accessories.map(createAccessoryCardHtml).join('');
    setupWishlistButtons(accessoriesContainer);
  }

  renderCartView();
}

// -----------------------------------------------------------------------------
// PAGE: CHECKOUT
// -----------------------------------------------------------------------------
export async function initCheckoutPage() {
  initSharedLayout('');

  const cart = getCart();
  let deliveryMethod = 'standard';

  // Delivery Method Radio Selectors
  const standardRadio = document.getElementById('delivery-standard');
  const expressRadio = document.getElementById('delivery-express');
  const standardLabel = document.getElementById('label-delivery-standard');
  const expressLabel = document.getElementById('label-delivery-express');

  function updateDeliveryMethod(method) {
    deliveryMethod = method;
    if (method === 'standard') {
      standardLabel?.classList.add('active');
      expressLabel?.classList.remove('active');
    } else {
      expressLabel?.classList.add('active');
      standardLabel?.classList.remove('active');
    }
    renderCheckoutSummary();
  }

  standardRadio?.addEventListener('change', () => updateDeliveryMethod('standard'));
  expressRadio?.addEventListener('change', () => updateDeliveryMethod('express'));

  // Payment Tabs (VISA, MASTERCARD, AMERICAN EXPRESS)
  const paymentTabs = document.querySelectorAll('.payment-method-tab');
  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      paymentTabs.forEach(t => {
        t.className = 'payment-method-tab px-4 py-2 text-xs uppercase font-bold tracking-widest border border-neutral-300 bg-white text-black hover:border-black transition-colors';
      });
      tab.className = 'payment-method-tab px-4 py-2 text-xs uppercase font-bold tracking-widest border border-black bg-black text-white transition-colors';
    });
  });

  // Render Order Summary in solid black box
  function renderCheckoutSummary() {
    const summary = getCartSummary(deliveryMethod);
    const summaryContainer = document.getElementById('checkout-items-list');
    const shippingEl = document.getElementById('checkout-shipping-val');
    const totalEl = document.getElementById('checkout-total-val');

    if (summaryContainer) {
      if (cart.length === 0) {
        summaryContainer.innerHTML = `
          <div class="py-2 text-xs text-neutral-400 uppercase tracking-widest">NO ITEMS IN ARCHIVE</div>
        `;
      } else {
        summaryContainer.innerHTML = cart.map(item => `
          <div class="flex items-center justify-between py-1 text-xs tracking-wider">
            <span class="text-white font-medium uppercase truncate pr-4">${item.name} (${item.quantity}x)</span>
            <span class="text-neutral-300 shrink-0">${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('');
      }
    }

    if (shippingEl) shippingEl.textContent = summary.shippingLabel;
    if (totalEl) totalEl.textContent = formatPrice(summary.total);
  }

  // Credit Card formatting
  const cardInput = document.getElementById('checkout-card-number');
  cardInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formatted;
  });

  const expiryInput = document.getElementById('checkout-expiry');
  expiryInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + ' / ' + value.substring(2);
    }
    e.target.value = value;
  });

  // Form Validation & Submission
  const checkoutBtn = document.getElementById('checkout-submit-btn');
  checkoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();

    let hasError = false;
    const requiredIds = [
      'checkout-email',
      'checkout-phone',
      'checkout-first-name',
      'checkout-last-name',
      'checkout-address',
      'checkout-city',
      'checkout-postal',
      'checkout-card-number',
      'checkout-expiry',
      'checkout-cvv'
    ];

    requiredIds.forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        if (!field.value.trim()) {
          field.classList.add('error');
          hasError = true;
        } else {
          field.classList.remove('error');
        }
      }
    });

    if (hasError) {
      showToast('Please complete all required fields with accurate information', 'error');
      return;
    }

    // Success State
    const orderNumber = `MN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const summary = getCartSummary(deliveryMethod);
    const email = document.getElementById('checkout-email')?.value || 'client@maisonnoir.com';

    // Show Confirmation Modal
    showOrderConfirmationModal({
      orderNumber,
      email,
      total: formatPrice(summary.total),
      deliveryMethod: deliveryMethod === 'express' ? 'Express Delivery (1-2 Days)' : 'Standard Delivery (3-5 Days)'
    });

    clearCart();
  });

  function showOrderConfirmationModal(orderData) {
    let modal = document.getElementById('order-confirmation-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'order-confirmation-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in';
    modal.innerHTML = `
      <div class="bg-white max-w-lg w-full p-8 sm:p-12 shadow-2xl text-center border border-neutral-300">
        <div class="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 class="text-2xl font-bold tracking-[0.2em] uppercase text-black font-sans mb-2">ORDER CONFIRMED</h2>
        <p class="text-xs tracking-widest uppercase text-neutral-500 mb-6">ARCHIVE REFERENCE: ${orderData.orderNumber}</p>
        
        <div class="bg-[#f7f7f7] p-5 text-left text-xs tracking-wider space-y-2 mb-8">
          <div class="flex justify-between"><span class="text-neutral-500">CLIENT EMAIL:</span> <span class="font-medium text-black">${orderData.email}</span></div>
          <div class="flex justify-between"><span class="text-neutral-500">DISPATCH METHOD:</span> <span class="font-medium text-black">${orderData.deliveryMethod}</span></div>
          <div class="flex justify-between"><span class="text-neutral-500">AMOUNT BILLED:</span> <span class="font-bold text-black">${orderData.total}</span></div>
        </div>

        <p class="text-xs text-neutral-600 leading-relaxed tracking-wide mb-8">
          Thank you for choosing Maison Noir. Your pieces are now being prepared at our Colombo atelier with meticulous care and archival presentation packaging.
        </p>

        <a href="index.html" class="btn-noir-solid w-full block text-center">RETURN TO ATELIER</a>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  }

  renderCheckoutSummary();
}
