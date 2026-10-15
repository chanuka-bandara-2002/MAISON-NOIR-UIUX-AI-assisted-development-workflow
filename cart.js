/**
 * MAISON NOIR — Cart State Module
 * Manages shopping cart state, persistence in localStorage, calculations, and promo codes.
 */

const CART_STORAGE_KEY = 'maison_noir_cart_v1';
const CART_INIT_KEY = 'maison_noir_cart_initialized';

const INITIAL_DEMO_ITEMS = [
  {
    cartItemId: 'item-demo-1',
    productId: 'noir-blazer',
    name: 'THE NOIR BLAZER',
    edition: 'EDITION 04 / TAILORING',
    price: 48500,
    color: 'Noir Black',
    size: 'M',
    image: 'assets/images/noir-blazer-main.jpg',
    quantity: 1
  },
  {
    cartItemId: 'item-demo-2',
    productId: 'noir-blazer',
    name: 'THE NOIR BLAZER',
    edition: 'EDITION 04 / TAILORING',
    price: 48500,
    color: 'Blush Pink',
    size: 'S',
    image: 'assets/images/blazer-pink.jpg',
    quantity: 1
  },
  {
    cartItemId: 'item-demo-3',
    productId: 'noir-blazer',
    name: 'THE NOIR BLAZER',
    edition: 'EDITION 04 / TAILORING',
    price: 48500,
    color: 'Mustard Ochre',
    size: 'M',
    image: 'assets/images/blazer-mustard.jpg',
    quantity: 1
  }
];

export function getCart() {
  const initialized = localStorage.getItem(CART_INIT_KEY);
  if (!initialized) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ITEMS));
    localStorage.setItem(CART_INIT_KEY, 'true');
    return INITIAL_DEMO_ITEMS;
  }

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading cart from localStorage:', err);
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.setItem(CART_INIT_KEY, 'true');
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
  } catch (err) {
    console.error('Error saving cart:', err);
  }
}

export function addToCart(product, options = {}) {
  const cart = getCart();
  const color = options.color || (product.colors?.[0]?.name || 'Standard');
  const size = options.size || (product.sizes?.[0] || 'M');
  const quantity = Math.max(1, options.quantity || 1);
  const selectedImage = options.image || product.images?.[0] || 'assets/images/noir-blazer-main.jpg';

  const existingIndex = cart.findIndex(
    item => item.productId === product.id && item.color === color && item.size === size
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    const newItem = {
      cartItemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: product.id,
      name: product.name,
      edition: product.edition || 'EDITION 01 / ESSENTIALS',
      price: product.price,
      color,
      size,
      image: selectedImage,
      quantity
    };
    cart.push(newItem);
  }

  saveCart(cart);
  return cart;
}

export function updateQuantity(cartItemId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.cartItemId === cartItemId);
  if (!item) return cart;

  item.quantity += delta;
  if (item.quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(cartItemId) {
  let cart = getCart();
  cart = cart.filter(i => i.cartItemId !== cartItemId);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.quantity || 1), 0);
}

export function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
}

export function getActivePromo() {
  try {
    const raw = sessionStorage.getItem('maison_noir_promo');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function applyPromo(code) {
  const cleanCode = code ? code.trim().toUpperCase() : '';
  if (cleanCode === 'MAISON10' || cleanCode === 'NOIR10') {
    const promo = { code: cleanCode, discountPercent: 10, label: '10% ARCHIVAL PRIVILEGE' };
    sessionStorage.setItem('maison_noir_promo', JSON.stringify(promo));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: getCart() } }));
    return { success: true, message: 'Privilege code applied: 10% reduction', promo };
  } else if (cleanCode === 'VIP2026' || cleanCode === 'COLOMBO') {
    const promo = { code: cleanCode, discountPercent: 15, label: '15% ATELIER VIP' };
    sessionStorage.setItem('maison_noir_promo', JSON.stringify(promo));
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: getCart() } }));
    return { success: true, message: 'VIP code applied: 15% reduction', promo };
  } else {
    return { success: false, message: 'Invalid or expired privilege code' };
  }
}

export function removePromo() {
  sessionStorage.removeItem('maison_noir_promo');
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: getCart() } }));
}

export function getCartSummary(deliveryMethod = 'standard') {
  const subtotal = getCartSubtotal();
  const promo = getActivePromo();
  let discount = 0;
  if (promo && promo.discountPercent) {
    discount = Math.round(subtotal * (promo.discountPercent / 100));
  }

  // Delivery: over 50,000 is complimentary standard; checkout allows express
  let shipping = 0;
  let shippingLabel = 'COMPLIMENTARY';

  if (deliveryMethod === 'express') {
    shipping = 4000;
    shippingLabel = 'LKR 4,000';
  } else if (subtotal >= 50000) {
    shipping = 0;
    shippingLabel = 'COMPLIMENTARY';
  } else if (subtotal > 0) {
    shipping = 2000;
    shippingLabel = 'LKR 2,000';
  } else {
    shipping = 0;
    shippingLabel = 'LKR 0';
  }

  const total = Math.max(0, subtotal - discount + (deliveryMethod === 'express' ? 4000 : 0));

  return {
    subtotal,
    discount,
    promo,
    shipping,
    shippingLabel,
    total,
    count: getCartCount()
  };
}
