import type {
  BusinessProfile,
  CustomerInfo,
  LineItem,
  MonetaryTotals,
} from '../types';
import { escapeHtml, formatMoney, formatDate } from '../utils/format';
import { lineTotal } from '../utils/calc';
import { applyPlaceholders, baseContext, customerContext } from './placeholders';

/**
 * The header is expressed as a placeholder template and resolved through the
 * shared engine, so every document literally renders via `{{token}}`
 * substitution (per spec).
 */
const HEADER_TEMPLATE = `
  {{logo}}
  <div class="biz-name">{{business_name}}</div>
  <div class="biz-meta">{{meta}}</div>
`;

const PARTY_TEMPLATE = `
  <div class="label">{{label}}</div>
  <div class="name">{{customer_name}}</div>
  {{lines}}
`;

/** Logo image, or a lettermark fallback built from the business name. */
function logoHtml(profile: BusinessProfile): string {
  if (profile.logoUri) {
    return `<img class="logo" src="${escapeHtml(profile.logoUri)}" alt="${escapeHtml(
      profile.businessName
    )} logo" />`;
  }
  const initials = profile.businessName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return `<div class="logo-fallback">${escapeHtml(initials || 'B')}</div>`;
}

function bizMetaLines(profile: BusinessProfile): string {
  const lines = [
    profile.address,
    profile.phone,
    profile.email,
    profile.website,
    profile.kraPin ? `KRA PIN: ${profile.kraPin}` : '',
  ]
    .filter(Boolean)
    .map((l) => escapeHtml(l))
    .join('<br/>');
  return lines;
}

/**
 * Standard document header: logo + business identity on the left, a document
 * title tag, number, and dates on the right.
 */
export function headerBlock(
  profile: BusinessProfile,
  opts: { title: string; number?: string; dates?: { label: string; value: string }[] }
): string {
  const datesHtml = (opts.dates ?? [])
    .filter((d) => d.value)
    .map((d) => `<div class="doc-dates">${escapeHtml(d.label)}: ${escapeHtml(d.value)}</div>`)
    .join('');
  const left = applyPlaceholders(HEADER_TEMPLATE, {
    ...baseContext(profile),
    // Override `logo` with the resolved <img>/lettermark markup.
    logo: logoHtml(profile),
    meta: bizMetaLines(profile),
  });
  return `
    <div class="doc-header">
      <div class="header-left">${left}</div>
      <div class="header-right">
        <span class="doc-title-tag">${escapeHtml(opts.title)}</span>
        ${opts.number ? `<div class="doc-number">${escapeHtml(opts.number)}</div>` : ''}
        ${datesHtml}
      </div>
    </div>
  `;
}

/** "Bill To" style customer card. */
export function partyBlock(label: string, customer: CustomerInfo): string {
  const lines = [
    customer.email,
    customer.phone,
    customer.kraPin ? `KRA PIN: ${customer.kraPin}` : '',
  ]
    .filter(Boolean)
    .map((l) => `<div class="line">${escapeHtml(l)}</div>`)
    .join('');
  const ctx = customerContext(customer);
  const inner = applyPlaceholders(PARTY_TEMPLATE, {
    ...ctx,
    label: escapeHtml(label),
    customer_name: ctx.customer_name || '—',
    lines,
  });
  return `<div class="party-card">${inner}</div>`;
}

/** Line-item table with name / qty / unit price / amount columns. */
export function itemsTable(items: LineItem[], currency: string): string {
  const rows = items
    .map(
      (item, index) => `
      <tr>
        <td class="item-index">${index + 1}</td>
        <td><div class="item-name">${escapeHtml(item.name || 'Item')}</div></td>
        <td class="num">${Number(item.quantity) || 0}</td>
        <td class="num">${formatMoney(Number(item.unitPrice) || 0, currency)}</td>
        <td class="num amount-cell">${formatMoney(lineTotal(item), currency)}</td>
      </tr>`
    )
    .join('');
  return `
    <table class="items">
      <thead>
        <tr>
          <th class="item-index">#</th>
          <th style="width:48%">Description</th>
          <th class="num">Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="5" class="empty-row">No line items added</td></tr>'}</tbody>
    </table>
  `;
}

/** Compact key/value grid used for document facts, project details, and receipts. */
export function infoGrid(
  items: { label: string; value: string; strong?: boolean }[],
  opts: { columns?: 2 | 3 } = {}
): string {
  const visible = items.filter((item) => item.value && item.value.trim());
  if (!visible.length) return '';
  const columns = opts.columns ?? 3;
  return `
    <div class="info-grid cols-${columns}">
      ${visible
        .map(
          (item) => `
        <div class="info-card">
          <div class="k">${escapeHtml(item.label)}</div>
          <div class="v${item.strong ? ' strong' : ''}">${escapeHtml(item.value)}</div>
        </div>`
        )
        .join('')}
    </div>
  `;
}

/** Client-facing amount highlight for invoices, quotations, and receipts. */
export function amountHero(
  label: string,
  amount: number,
  currency: string,
  helper?: string
): string {
  return `
    <div class="amount-hero">
      <div>
        <div class="amount-label">${escapeHtml(label)}</div>
        ${helper ? `<div class="amount-helper">${escapeHtml(helper)}</div>` : ''}
      </div>
      <div class="amount-value">${formatMoney(amount, currency)}</div>
    </div>
  `;
}

/** Subtotal / VAT / grand-total panel. */
export function totalsBlock(
  totals: MonetaryTotals,
  opts: { vatEnabled: boolean; vatPercentage: number; currency: string }
): string {
  const vatRow = opts.vatEnabled
    ? `<div class="totals-row"><span>VAT (${opts.vatPercentage}%)</span><span>${formatMoney(
        totals.vat,
        opts.currency
      )}</span></div>`
    : '';
  return `
    <div class="totals">
      <div class="totals-inner">
        <div class="totals-row"><span>Subtotal</span><span>${formatMoney(
          totals.subtotal,
          opts.currency
        )}</span></div>
        ${vatRow}
        <div class="totals-row grand"><span>Total</span><span>${formatMoney(
          totals.total,
          opts.currency
        )}</span></div>
      </div>
    </div>
  `;
}

/** Optional titled note/terms block. Returns '' when empty. */
export function noteBlock(title: string, text: string): string {
  if (!text || !text.trim()) return '';
  return `
    <div class="section">
      <div class="section-title">${escapeHtml(title)}</div>
      <div class="note-block">${escapeHtml(text).replace(/\n/g, '<br/>')}</div>
    </div>
  `;
}

/** Bank + M-Pesa payment details, sourced from the business profile. */
export function paymentBlock(profile: BusinessProfile): string {
  const { bankDetails, mpesaTillOrPaybill } = profile;
  const hasBank =
    bankDetails.bankName || bankDetails.accountNumber || bankDetails.accountName;
  if (!hasBank && !mpesaTillOrPaybill) return '';

  const cards: string[] = [];
  if (hasBank) {
    cards.push(`
      <div class="pay-card">
        <div class="k">Bank</div>
        <div class="v">${escapeHtml(bankDetails.bankName)}</div>
        ${bankDetails.accountName ? `<div class="k" style="margin-top:6px">Account Name</div><div class="v">${escapeHtml(bankDetails.accountName)}</div>` : ''}
        ${bankDetails.accountNumber ? `<div class="k" style="margin-top:6px">Account No.</div><div class="v">${escapeHtml(bankDetails.accountNumber)}</div>` : ''}
        ${bankDetails.branch ? `<div class="k" style="margin-top:6px">Branch</div><div class="v">${escapeHtml(bankDetails.branch)}</div>` : ''}
      </div>`);
  }
  if (mpesaTillOrPaybill) {
    cards.push(`
      <div class="pay-card">
        <div class="k">M-Pesa Till / Paybill</div>
        <div class="v">${escapeHtml(mpesaTillOrPaybill)}</div>
      </div>`);
  }
  return `
    <div class="section">
      <div class="section-title">Payment Details</div>
      <div class="pay-grid">${cards.join('')}</div>
    </div>
  `;
}

export function footerBlock(profile: BusinessProfile): string {
  const bits = [profile.businessName, profile.phone, profile.email]
    .filter(Boolean)
    .map((b) => escapeHtml(b))
    .join(' | ');
  return `<div class="footer">${bits}<br/>Generated with BizKit</div>`;
}

export { formatDate };
