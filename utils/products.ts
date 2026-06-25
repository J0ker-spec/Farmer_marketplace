import { MOCK_LISTED_ITEMS, MOCK_PRODUCTS } from '../services/mockData';
import { withProductIds } from './documents';

/** Normalize mock rows and merge with Firestore results (Firestore wins on duplicate ids). */
export function mergeWithListedCatalog(firestoreProducts: any[]) {
  if (firestoreProducts.length > 0) {
    return firestoreProducts;
  }
  return MOCK_PRODUCTS.map((p) =>
    withProductIds(p.product_id, { ...p } as Record<string, unknown>)
  );
}

export function getFeaturedListedItems(firestoreProducts: any[]) {
  if (firestoreProducts.length >= 3) {
    return firestoreProducts.slice(0, 3);
  }
  if (firestoreProducts.length > 0) {
    const ids = new Set(firestoreProducts.map((p) => p.product_id));
    const extras = MOCK_LISTED_ITEMS.filter((m) => !ids.has(m.product_id)).slice(0, 3 - firestoreProducts.length);
    return [...firestoreProducts, ...extras];
  }
  return MOCK_LISTED_ITEMS;
}
