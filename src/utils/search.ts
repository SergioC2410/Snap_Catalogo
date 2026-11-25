import type { Product } from '@/types/store.types';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface CatalogFilterCriteria {
  query: string;
  category: string;
  sortBy: SortOption;
}

/**
 * Normaliza texto eliminando diacríticos (tildes/eñes compuestas) y espacios redundantes.
 * Garantiza búsquedas tolerantes a errores de escritura en teclados móviles.
 * @param value Cadena de entrada a normalizar.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra y ordena un catálogo de productos sin mutar el arreglo original.
 * Evalúa coincidencias en nombre, subtítulo, categoría, SKU y etiquetas de variantes.
 * @param products Lista completa del inventario activo.
 * @param criteria Criterios combinados de búsqueda, categoría y ordenamiento.
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