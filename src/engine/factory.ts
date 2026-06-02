import type {
  BizDocument,
  BusinessProfile,
  DocumentType,
  DocumentData,
  InvoiceData,
  QuotationData,
  ReceiptData,
  CompanyProfileData,
  ServiceAgreementData,
} from '../types';
import { DOC_TYPE_LABELS, CURRENCY } from '../constants';
import { computeTotals } from '../utils/calc';
import { uid } from '../utils/id';

/** Derive a human title + customer name + cached totals for a document. */
function deriveMeta(
  type: DocumentType,
  data: DocumentData,
  profile: BusinessProfile
): Pick<BizDocument, 'title' | 'customerName' | 'totals'> {
  switch (type) {
    case 'invoice':
    case 'proforma': {
      const d = data as InvoiceData;
      return {
        title: DOC_TYPE_LABELS[type],
        customerName: d.customer.name,
        totals: computeTotals(d.items, d.vatEnabled, profile.vatPercentage),
      };
    }
    case 'quotation': {
      const d = data as QuotationData;
      return {
        title: d.projectTitle || DOC_TYPE_LABELS.quotation,
        customerName: d.customer.name,
        totals: computeTotals(d.items, d.vatEnabled, profile.vatPercentage),
      };
    }
    case 'receipt': {
      const d = data as ReceiptData;
      return {
        title: DOC_TYPE_LABELS.receipt,
        customerName: d.customer.name,
        totals: { subtotal: d.amountPaid, vat: 0, total: d.amountPaid },
      };
    }
    case 'service_agreement': {
      const d = data as ServiceAgreementData;
      return {
        title: DOC_TYPE_LABELS.service_agreement,
        customerName: d.clientName,
        totals: { subtotal: d.price, vat: 0, total: d.price },
      };
    }
    case 'company_profile': {
      const _d = data as CompanyProfileData;
      return { title: DOC_TYPE_LABELS.company_profile, customerName: profile.businessName, totals: null };
    }
    case 'letterhead':
      return { title: DOC_TYPE_LABELS.letterhead, customerName: profile.businessName, totals: null };
    default:
      return { title: 'Document', customerName: '', totals: null };
  }
}

/** Build a brand-new document ready to store/render. */
export function createDocument(
  type: DocumentType,
  number: string,
  data: DocumentData,
  profile: BusinessProfile
): BizDocument {
  const now = new Date().toISOString();
  const meta = deriveMeta(type, data, profile);
  // Monetary documents carry their own currency; others inherit the profile's.
  const currency =
    'currency' in data && data.currency ? data.currency : profile.currency || CURRENCY;
  return {
    id: uid('doc_'),
    type,
    number,
    createdAt: now,
    updatedAt: now,
    ...meta,
    currency,
    // Only invoices carry a payment lifecycle; everything else is null.
    status: type === 'invoice' ? 'unpaid' : null,
    paidAmount: type === 'invoice' ? 0 : undefined,
    paidAt: type === 'invoice' ? null : undefined,
    data,
  };
}
