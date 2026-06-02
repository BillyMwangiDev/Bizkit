import type {
  BizDocument,
  BusinessProfile,
  InvoiceData,
  QuotationData,
  ReceiptData,
} from '../types';
import { CURRENCY } from '../constants';
import { computeTotals } from '../utils/calc';
import { addDaysISO, todayISO } from '../utils/format';
import { invoiceBalance } from '../utils/payments';

export type ConversionTarget = 'invoice' | 'receipt';

export function conversionTarget(doc: BizDocument): ConversionTarget | null {
  if (doc.type === 'quotation' || doc.type === 'proforma') return 'invoice';
  if (doc.type === 'invoice') return 'receipt';
  return null;
}

export function conversionLabel(doc: BizDocument): string {
  const target = conversionTarget(doc);
  if (target === 'invoice') return 'Create invoice';
  if (target === 'receipt') return 'Create receipt';
  return '';
}

export function convertToInvoiceData(
  doc: BizDocument,
  profile: BusinessProfile
): InvoiceData | null {
  const currency = doc.currency || profile.currency || CURRENCY;
  if (doc.type === 'quotation') {
    const data = doc.data as QuotationData;
    return {
      customer: data.customer,
      invoiceDate: todayISO(),
      dueDate: addDaysISO(todayISO(), 14),
      items: data.items,
      vatEnabled: data.vatEnabled,
      currency: data.currency || currency,
      notes: data.projectTitle ? `Based on quotation ${doc.number}: ${data.projectTitle}` : '',
      terms: 'Payment due within 14 days.',
    };
  }
  if (doc.type === 'proforma') {
    const data = doc.data as InvoiceData;
    return {
      ...data,
      invoiceDate: todayISO(),
      dueDate: addDaysISO(todayISO(), 14),
      notes: data.notes || `Converted from proforma ${doc.number}.`,
      terms: data.terms || 'Payment due within 14 days.',
    };
  }
  return null;
}

export function convertToReceiptData(
  doc: BizDocument,
  profile: BusinessProfile
): ReceiptData | null {
  if (doc.type !== 'invoice') return null;
  const data = doc.data as InvoiceData;
  const totals = computeTotals(data.items, data.vatEnabled, profile.vatPercentage);
  return {
    customer: data.customer,
    amountPaid: invoiceBalance(doc) || totals.total,
    currency: data.currency || doc.currency || profile.currency || CURRENCY,
    paymentMethod: profile.mpesaTillOrPaybill ? 'M-Pesa' : 'Bank Transfer',
    paymentDate: todayISO(),
    referenceNumber: '',
    notes: `Payment received for invoice ${doc.number}.`,
    linkedInvoiceId: doc.id,
    linkedInvoiceNumber: doc.number,
  };
}
