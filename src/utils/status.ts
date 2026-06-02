import type { BizDocument, DisplayStatus, InvoiceData } from '../types';
import { todayISO } from './format';
import { invoicePaymentStatus } from './payments';

/**
 * Effective payment status for display. Only invoices have a payment lifecycle;
 * other document types return null. An unpaid invoice whose due date has passed
 * is reported as 'overdue'. Invoices stored before `status` existed (undefined)
 * are treated as 'unpaid'.
 */
export function displayStatus(
  doc: BizDocument,
  today = todayISO()
): DisplayStatus | null {
  if (doc.type !== 'invoice') return null;
  const paymentStatus = invoicePaymentStatus(doc);
  if (paymentStatus === 'paid' || paymentStatus === 'partial') return paymentStatus;
  const due = (doc.data as InvoiceData).dueDate;
  if (due && due.slice(0, 10) < today) return 'overdue';
  return 'unpaid';
}
