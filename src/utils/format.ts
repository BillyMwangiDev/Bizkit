import { CURRENCY } from '../constants';

/** Format a number as money. Defaults to KES with thousands separators. */
export function formatMoney(amount: number, currency = CURRENCY): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const formatted = safe.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

/** ISO date string -> friendly display (e.g. "30 May 2026"). */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Today's date as an ISO yyyy-mm-dd string. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Add `days` to an ISO date and return ISO yyyy-mm-dd. */
export function addDaysISO(iso: string, days: number): string {
  const d = iso ? new Date(iso) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Pad a counter to a 4-digit, prefixed document number (INV-0001). */
export function formatDocNumber(prefix: string, counter: number): string {
  return `${prefix}-${String(counter).padStart(4, '0')}`;
}

/** Escape user text before injecting into generated HTML. */
export function escapeHtml(input: string): string {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
