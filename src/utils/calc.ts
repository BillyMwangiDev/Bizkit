import type { LineItem, MonetaryTotals } from '../types';

/** Total for a single line item. */
export function lineTotal(item: LineItem): number {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  return qty * price;
}

/**
 * Compute subtotal / VAT / total for a set of line items.
 * VAT is only applied when `vatEnabled` and a positive `vatPercentage`.
 */
export function computeTotals(
  items: LineItem[],
  vatEnabled: boolean,
  vatPercentage: number
): MonetaryTotals {
  const subtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const vat = vatEnabled ? (subtotal * (Number(vatPercentage) || 0)) / 100 : 0;
  const total = subtotal + vat;
  return {
    subtotal: round2(subtotal),
    vat: round2(vat),
    total: round2(total),
  };
}

/** Round to 2 decimals, avoiding float drift. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
