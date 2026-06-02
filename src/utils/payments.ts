import type { BizDocument, InvoiceData, PaymentStatus } from '../types';

export function invoicePaidAmount(doc: BizDocument): number {
  if (doc.type !== 'invoice') return 0;
  if (doc.status === 'paid' && (doc.paidAmount == null || Number(doc.paidAmount) === 0)) {
    return invoiceTotal(doc);
  }
  return Math.max(0, Number(doc.paidAmount) || 0);
}

export function invoiceTotal(doc: BizDocument): number {
  return Math.max(0, Number(doc.totals?.total) || 0);
}

export function invoiceBalance(doc: BizDocument): number {
  if (doc.type !== 'invoice') return 0;
  return Math.max(0, invoiceTotal(doc) - invoicePaidAmount(doc));
}

export function invoicePaymentStatus(doc: BizDocument): PaymentStatus {
  if (doc.type !== 'invoice') return 'unpaid';
  const total = invoiceTotal(doc);
  const paid = invoicePaidAmount(doc);
  if (total > 0 && paid >= total) return 'paid';
  if (paid > 0) return 'partial';
  return doc.status === 'paid' ? 'paid' : 'unpaid';
}

export function applyInvoicePayment(
  doc: BizDocument,
  amount: number,
  paidAt: string
): Pick<BizDocument, 'paidAmount' | 'paidAt' | 'status'> {
  const total = invoiceTotal(doc);
  const nextPaid = Math.min(total || Number.MAX_SAFE_INTEGER, invoicePaidAmount(doc) + Math.max(0, amount));
  const status: PaymentStatus =
    total > 0 && nextPaid >= total ? 'paid' : nextPaid > 0 ? 'partial' : 'unpaid';
  return {
    paidAmount: nextPaid,
    paidAt,
    status,
  };
}

export function invoiceDueDate(doc: BizDocument): string {
  return doc.type === 'invoice' ? (doc.data as InvoiceData).dueDate : '';
}
