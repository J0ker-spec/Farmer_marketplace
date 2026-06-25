/** Normalize Firestore docs so both `id` and legacy alias fields exist. */

export function withProductIds<T extends Record<string, unknown>>(docId: string, data: T) {
  return { ...data, id: docId, product_id: docId };
}

export function withOrderIds<T extends Record<string, unknown>>(docId: string, data: T) {
  return { ...data, id: docId, order_id: docId };
}

export function withReviewIds<T extends Record<string, unknown>>(docId: string, data: T) {
  return { ...data, id: docId, review_id: docId };
}

export function withMessageIds<T extends Record<string, unknown>>(docId: string, data: T) {
  return { ...data, id: docId, message_id: docId };
}

export function withUserIds<T extends Record<string, unknown>>(docId: string, data: T) {
  return { ...data, id: docId, user_id: docId };
}
