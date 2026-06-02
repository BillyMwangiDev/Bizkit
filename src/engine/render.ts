import type {
  BizDocument,
  BusinessProfile,
  InvoiceData,
  QuotationData,
  ReceiptData,
  CompanyProfileData,
  ServiceAgreementData,
  LetterheadData,
} from '../types';
import { DOC_TYPE_LABELS, CURRENCY } from '../constants';
import { documentStyles } from './styles';
import {
  headerBlock,
  partyBlock,
  itemsTable,
  totalsBlock,
  noteBlock,
  paymentBlock,
  footerBlock,
  infoGrid,
  amountHero,
} from './blocks';
import { computeTotals } from '../utils/calc';
import { escapeHtml, formatMoney, formatDate } from '../utils/format';
import { invoiceBalance, invoicePaidAmount } from '../utils/payments';

/** Wrap a body fragment in a full HTML document with the themed stylesheet. */
function shell(profile: BusinessProfile, body: string, title = 'BizKit Document'): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=595" />
<title>${escapeHtml(title)}</title>
<style>${documentStyles(profile)}</style>
</head><body><main class="document-shell">${body}${footerBlock(profile)}</main></body></html>`;
}

function multiline(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br/>');
}

/* ---- Invoice / Proforma ---- */

function renderInvoice(
  profile: BusinessProfile,
  doc: BizDocument,
  data: InvoiceData,
  title: string
): string {
  const totals = computeTotals(data.items, data.vatEnabled, profile.vatPercentage);
  const currency = data.currency || CURRENCY;
  const isProforma = title === DOC_TYPE_LABELS.proforma;
  const paid = doc.type === 'invoice' ? invoicePaidAmount(doc) : 0;
  const balance = doc.type === 'invoice' ? invoiceBalance(doc) : totals.total;
  const body = `
    ${headerBlock(profile, {
      title,
      number: doc.number,
      dates: [
        { label: 'Date', value: formatDate(data.invoiceDate) },
        { label: 'Due', value: formatDate(data.dueDate) },
      ],
    })}
    ${amountHero(
      isProforma ? 'Estimated Total' : balance > 0 ? 'Balance Due' : 'Paid in Full',
      isProforma ? totals.total : balance,
      currency,
      data.dueDate ? `Due ${formatDate(data.dueDate)}` : undefined
    )}
    ${infoGrid(
      [
        { label: 'Document No.', value: doc.number, strong: true },
        { label: 'Issue Date', value: formatDate(data.invoiceDate) },
        { label: isProforma ? 'Valid / Due Date' : 'Due Date', value: formatDate(data.dueDate) },
      ],
      { columns: 3 }
    )}
    ${
      doc.type === 'invoice'
        ? infoGrid(
            [
              { label: 'Invoice Total', value: formatMoney(totals.total, currency), strong: true },
              { label: 'Paid', value: formatMoney(paid, currency) },
              { label: 'Balance Due', value: formatMoney(balance, currency), strong: balance > 0 },
            ],
            { columns: 3 }
          )
        : ''
    }
    <div class="section">${partyBlock('Bill To', data.customer)}</div>
    <div class="section">${itemsTable(data.items, currency)}</div>
    ${totalsBlock(totals, { vatEnabled: data.vatEnabled, vatPercentage: profile.vatPercentage, currency })}
    ${paymentBlock(profile)}
    ${noteBlock('Notes', data.notes)}
    ${noteBlock('Terms & Conditions', data.terms)}
  `;
  return shell(profile, body, `${title} ${doc.number}`);
}

/* ---- Quotation ---- */

function renderQuotation(
  profile: BusinessProfile,
  doc: BizDocument,
  data: QuotationData
): string {
  const totals = computeTotals(data.items, data.vatEnabled, profile.vatPercentage);
  const currency = data.currency || CURRENCY;
  const body = `
    ${headerBlock(profile, {
      title: 'Quotation',
      number: doc.number,
      dates: [{ label: 'Valid Until', value: formatDate(data.validUntil) }],
    })}
    ${amountHero(
      'Quoted Total',
      totals.total,
      currency,
      data.validUntil ? `Valid until ${formatDate(data.validUntil)}` : undefined
    )}
    ${infoGrid(
      [
        { label: 'Quotation No.', value: doc.number, strong: true },
        { label: 'Project', value: data.projectTitle },
        { label: 'Valid Until', value: formatDate(data.validUntil) },
      ],
      { columns: 3 }
    )}
    <div class="section">${partyBlock('Prepared For', data.customer)}</div>
    ${
      data.projectTitle
        ? `<div class="section"><div class="section-title">Project Summary</div><div style="font-size:15px;font-weight:700;color:#0F172A">${escapeHtml(
            data.projectTitle
          )}</div></div>`
        : ''
    }
    ${
      data.description
        ? `<div class="section"><div class="section-title">Scope of Work</div><div class="note-block">${multiline(
            data.description
          )}</div></div>`
        : ''
    }
    <div class="section">${itemsTable(data.items, currency)}</div>
    ${totalsBlock(totals, { vatEnabled: data.vatEnabled, vatPercentage: profile.vatPercentage, currency })}
    ${noteBlock('Notes', data.notes)}
  `;
  return shell(profile, body, `Quotation ${doc.number}`);
}

/* ---- Receipt ---- */

function renderReceipt(
  profile: BusinessProfile,
  doc: BizDocument,
  data: ReceiptData
): string {
  const body = `
    ${headerBlock(profile, {
      title: 'Receipt',
      number: doc.number,
      dates: [{ label: 'Date', value: formatDate(data.paymentDate) }],
    })}
    ${amountHero(
      'Payment Received',
      data.amountPaid,
      data.currency || CURRENCY,
      data.paymentMethod || undefined
    )}
    ${infoGrid(
      [
        { label: 'Receipt No.', value: doc.number, strong: true },
        { label: 'Payment Date', value: formatDate(data.paymentDate) },
        { label: 'Reference', value: data.referenceNumber },
        { label: 'Invoice', value: data.linkedInvoiceNumber ?? '' },
      ],
      { columns: 3 }
    )}
    <div class="section">${partyBlock('Received From', data.customer)}</div>
    <div class="section">
      <div class="section-title">Payment Information</div>
      <div class="pay-grid">
        <div class="pay-card"><div class="k">Method</div><div class="v">${escapeHtml(
          data.paymentMethod || '—'
        )}</div></div>
        ${
          data.referenceNumber
            ? `<div class="pay-card"><div class="k">Reference</div><div class="v">${escapeHtml(
                data.referenceNumber
              )}</div></div>`
            : ''
        }
      </div>
    </div>
    ${noteBlock('Notes', data.notes)}
  `;
  return shell(profile, body, `Receipt ${doc.number}`);
}

/* ---- Company Profile ---- */

function renderCompanyProfile(
  profile: BusinessProfile,
  data: CompanyProfileData
): string {
  const services = data.services
    .filter((s) => s.trim())
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('');
  const missionVision =
    data.mission || data.vision
      ? `<div class="row">
      ${
        data.mission
          ? `<div class="col section"><div class="section-title">Mission</div><div class="muted">${multiline(
              data.mission
            )}</div></div>`
          : ''
      }
      ${
        data.vision
          ? `<div class="col section"><div class="section-title">Vision</div><div class="muted">${multiline(
              data.vision
            )}</div></div>`
          : ''
      }
    </div>`
      : '';
  const body = `
    <div class="cover">
      <h1>${escapeHtml(profile.businessName)}</h1>
      <div class="tagline">${escapeHtml(profile.businessDescription || 'Company Profile')}</div>
    </div>
    ${
      data.overview
        ? `<div class="section"><div class="section-title">About Us</div><div style="font-size:12.5px;line-height:1.7">${multiline(
            data.overview
          )}</div></div>`
        : ''
    }
    ${
      services
        ? `<div class="section"><div class="section-title">Our Services</div><ul class="service-list">${services}</ul></div>`
        : ''
    }
    ${missionVision}
    <div class="section">
      <div class="section-title">Contact Information</div>
      <div class="pay-grid">
        ${profile.phone ? `<div class="pay-card"><div class="k">Phone</div><div class="v">${escapeHtml(profile.phone)}</div></div>` : ''}
        ${profile.email ? `<div class="pay-card"><div class="k">Email</div><div class="v">${escapeHtml(profile.email)}</div></div>` : ''}
        ${profile.website ? `<div class="pay-card"><div class="k">Website</div><div class="v">${escapeHtml(profile.website)}</div></div>` : ''}
        ${profile.address ? `<div class="pay-card"><div class="k">Address</div><div class="v">${escapeHtml(profile.address)}</div></div>` : ''}
      </div>
    </div>
  `;
  return shell(profile, body, `${profile.businessName} Company Profile`);
}

/* ---- Service Agreement ---- */

function renderServiceAgreement(
  profile: BusinessProfile,
  doc: BizDocument,
  data: ServiceAgreementData
): string {
  const body = `
    ${headerBlock(profile, {
      title: 'Service Agreement',
      number: doc.number,
      dates: [{ label: 'Effective', value: formatDate(data.effectiveDate) }],
    })}
    ${infoGrid(
      [
        { label: 'Agreement No.', value: doc.number, strong: true },
        { label: 'Effective Date', value: formatDate(data.effectiveDate) },
        { label: 'Service Fee', value: formatMoney(data.price, data.currency || CURRENCY), strong: true },
      ],
      { columns: 3 }
    )}
    <div class="section">
      <div class="section-title">Parties</div>
      ${infoGrid(
        [
          { label: 'Service Provider', value: profile.businessName, strong: true },
          { label: 'Client', value: data.clientName || 'Client', strong: true },
        ],
        { columns: 2 }
      )}
    </div>
    <div class="agreement section">
      <p>This Service Agreement ("Agreement") is entered into on
      <strong>${escapeHtml(formatDate(data.effectiveDate))}</strong> between
      <strong>${escapeHtml(profile.businessName)}</strong> ("Service Provider") and
      <strong>${escapeHtml(data.clientName || '—')}</strong> ("Client").</p>

      <div class="clause"><h4>1. Services</h4><p>${multiline(
        data.serviceDescription
      )}</p></div>

      <div class="clause"><h4>2. Fees</h4><p>The Client agrees to pay the Service Provider
      <strong>${formatMoney(data.price, data.currency || CURRENCY)}</strong> for the services described herein.</p></div>

      <div class="clause"><h4>3. Timeline</h4><p>${multiline(
        data.timeline || 'As mutually agreed by both parties.'
      )}</p></div>

      ${
        data.terms
          ? `<div class="clause"><h4>4. Terms &amp; Conditions</h4><p>${multiline(
              data.terms
            )}</p></div>`
          : ''
      }
    </div>
    <div class="sign-row">
      <div class="sign-box"><div class="sign-line">${escapeHtml(
        profile.businessName
      )} (Service Provider)</div></div>
      <div class="sign-box"><div class="sign-line">${escapeHtml(
        data.clientName || 'Client'
      )} (Client)</div></div>
    </div>
  `;
  return shell(profile, body, `Service Agreement ${doc.number}`);
}

/* ---- Letterhead ---- */

function renderLetterhead(
  profile: BusinessProfile,
  data: LetterheadData
): string {
  const body = `
    ${headerBlock(profile, { title: 'Letterhead' })}
    <div class="letter-date">${formatDate(new Date().toISOString())}</div>
    <div class="letterhead-body">${
      data.body ? multiline(data.body) : ''
    }</div>
  `;
  return shell(profile, body, `${profile.businessName} Letterhead`);
}

/**
 * Single entry point: render any stored document to printable HTML using the
 * business profile for branding. All document types funnel through here.
 */
export function renderDocument(doc: BizDocument, profile: BusinessProfile): string {
  switch (doc.type) {
    case 'invoice':
      return renderInvoice(profile, doc, doc.data as InvoiceData, DOC_TYPE_LABELS.invoice);
    case 'proforma':
      return renderInvoice(profile, doc, doc.data as InvoiceData, DOC_TYPE_LABELS.proforma);
    case 'quotation':
      return renderQuotation(profile, doc, doc.data as QuotationData);
    case 'receipt':
      return renderReceipt(profile, doc, doc.data as ReceiptData);
    case 'company_profile':
      return renderCompanyProfile(profile, doc.data as CompanyProfileData);
    case 'service_agreement':
      return renderServiceAgreement(profile, doc, doc.data as ServiceAgreementData);
    case 'letterhead':
      return renderLetterhead(profile, doc.data as LetterheadData);
    default:
      return shell(profile, '<p>Unsupported document.</p>');
  }
}
