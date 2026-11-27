import type { Product } from '@/types/store.types';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface CatalogFilterCriteria {
  query: string;
  category: string;
  sortBy: SortOption;
}

/**
 * ES: Quita los diacríticos y pasa el texto a minúsculas para que la búsqueda no dependa de las tildes.
 * EN: Removes diacritics and lowercases text so searches do not depend on accents.
 * @param value ES: Texto que se va a normalizar. EN: Text to normalize.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * ES: Cada término debe aparecer en nombre, subtítulo, categoría, SKU, distintivo o variante. El ordenamiento trabaja sobre una copia.
 * EN: Every term must match the name, subtitle, category, SKU, badge, or variant. Sorting uses a copy of the array.
 */
export function filterAndSortProducts(
  products: readonly Product[],
  criteria: CatalogFilterCriteria,
): Product[] {
  const normalizedQuery = normalizeText(criteria.query);
  const normalizedCategory = normalizeText(criteria.category);
  const tokens = normalizedQuery.length > 0 ? normalizedQuery.split(/\s+/) : [];

  const filtered = products.filter((product) => {
    if (
      normalizedCategory &&
      normalizedCategory !== 'todo' &&
      normalizeText(product.category) !== normalizedCategory
    ) {
      return false;
    }

    if (tokens.length === 0) {
      return true;
    }

    const variantLabels = product.variants.map((v) => v.label).join(' ');
    const searchableCorpus = normalizeText(
      `${product.name} ${product.subtitle} ${product.category} ${product.sku} ${product.badge ?? ''} ${variantLabels}`,
    );

    return tokens.every((token) => searchableCorpus.includes(token));
  });

  if (criteria.sortBy === 'featured') {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    switch (criteria.sortBy) {
      case 'price-asc':
        return a.priceUsd - b.priceUsd;
      case 'price-desc':
        return b.priceUsd - a.priceUsd;
      case 'name-asc':
        return a.name.localeCompare(b.name, 'es');
      default:
        return 0;
    }
  });
}