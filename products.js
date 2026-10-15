/**
 * MAISON NOIR — Products Module
 * Handles loading, caching, filtering, and querying luxury product data.
 */

let cachedProducts = null;

export async function fetchProducts() {
  if (cachedProducts) return cachedProducts;
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    cachedProducts = await res.json();
    return cachedProducts;
  } catch (err) {
    console.error('Failed to load products.json:', err);
    return [];
  }
}

export async function getProductById(id) {
  const products = await fetchProducts();
  return products.find(p => p.id === id) || products[0];
}

export async function getFeaturedProducts() {
  const products = await fetchProducts();
  return products.filter(p => p.featured);
}

export async function getNewArrivals() {
  const products = await fetchProducts();
  return products.filter(p => p.newArrival);
}

export async function getAccessories() {
  const products = await fetchProducts();
  return products.filter(p => p.isAccessory || p.category === 'accessories');
}

export function formatPrice(amount) {
  if (typeof amount !== 'number') return 'LKR 0';
  return `LKR ${amount.toLocaleString('en-US')}`;
}

export function filterAndSortProducts(products, filters = {}) {
  let result = [...products];

  // Category filter
  if (filters.category && filters.category !== 'all') {
    const cat = filters.category.toLowerCase();
    result = result.filter(p => 
      p.category.toLowerCase() === cat || 
      p.gender?.toLowerCase() === cat ||
      p.categoryLabel?.toLowerCase() === cat
    );
  }

  // Size filter
  if (filters.size && filters.size !== 'all') {
    result = result.filter(p => p.sizes && p.sizes.includes(filters.size));
  }

  // Color filter
  if (filters.color && filters.color !== 'all') {
    const colorTerm = filters.color.toLowerCase();
    result = result.filter(p => 
      p.colors && p.colors.some(c => c.name.toLowerCase().includes(colorTerm))
    );
  }

  // Price range filter
  if (filters.priceRange && filters.priceRange !== 'all') {
    if (filters.priceRange === 'under-25k') {
      result = result.filter(p => p.price < 25000);
    } else if (filters.priceRange === '25k-50k') {
      result = result.filter(p => p.price >= 25000 && p.price <= 50000);
    } else if (filters.priceRange === 'over-50k') {
      result = result.filter(p => p.price > 50000);
    }
  }

  // Search query filter
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.subtitle.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        // Keep order or sort by newArrival
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
    }
  }

  return result;
}
