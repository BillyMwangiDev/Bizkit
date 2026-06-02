import type {
  BizDocument,
  BusinessProfile,
  InvoiceData,
  QuotationData,
  ReceiptData,
  ServiceAgreementData,
} from '../types';

export interface ProfileCompleteness {
  score: number;
  completed: number;
  total: number;
  missing: string[];
}

function missing(value: string | null | undefined): boolean {
  return !value || !value.trim();
}

function hasPaymentDetails(profile: BusinessProfile): boolean {
  const bank = profile.bankDetails;
  return Boolean(
    profile.mpesaTillOrPaybill ||
      bank.bankName ||
      bank.accountName ||
      bank.accountNumber
  );
}

function moneyWarnings(doc: BizDocument): string[] {
  const warnings: string[] = [];
  if (doc.totals && doc.totals.total <= 0) {
    warnings.push('The total amount is zero.');
  }
  return warnings;
}

/** Soft client-readiness checks before saving or sharing a PDF. */
export function documentQualityWarnings(
  doc: BizDocument,
  profile: BusinessProfile
): string[] {
  const warnings: string[] = [];

  if (missing(profile.businessName)) warnings.push('Business name is missing.');
  if (missing(profile.phone) && missing(profile.email)) {
    warnings.push('Add a phone number or email so clients can contact you.');
  }
  if (missing(profile.logoUri)) warnings.push('No logo is set for your business profile.');

  if (['invoice', 'proforma', 'quotation'].includes(doc.type) && !hasPaymentDetails(profile)) {
    warnings.push('No bank or M-Pesa payment details are set.');
  }

  if (doc.type === 'invoice' || doc.type === 'proforma') {
    const data = doc.data as InvoiceData;
    if (missing(data.customer.name)) warnings.push('Customer name is missing.');
    if (!data.items.length || data.items.every((item) => missing(item.name))) {
      warnings.push('Line items are empty.');
    }
    if (data.items.some((item) => Number(item.quantity) <= 0)) {
      warnings.push('One or more item quantities are zero.');
    }
    if (missing(data.dueDate)) warnings.push('Due date is missing.');
  }

  if (doc.type === 'quotation') {
    const data = doc.data as QuotationData;
    if (missing(data.customer.name)) warnings.push('Customer name is missing.');
    if (missing(data.projectTitle)) warnings.push('Project title is missing.');
    if (!data.items.length || data.items.every((item) => missing(item.name))) {
      warnings.push('Line items are empty.');
    }
  }

  if (doc.type === 'receipt') {
    const data = doc.data as ReceiptData;
    if (missing(data.customer.name)) warnings.push('Received-from name is missing.');
    if (Number(data.amountPaid) <= 0) warnings.push('Amount paid is zero.');
    if (missing(data.referenceNumber)) warnings.push('Payment reference is missing.');
  }

  if (doc.type === 'service_agreement') {
    const data = doc.data as ServiceAgreementData;
    if (missing(data.clientName)) warnings.push('Client name is missing.');
    if (missing(data.serviceDescription)) warnings.push('Service description is missing.');
    if (Number(data.price) <= 0) warnings.push('Service fee is zero.');
  }

  return [...warnings, ...moneyWarnings(doc)];
}

/** Readiness score for settings, focused on client-facing document quality. */
export function profileCompleteness(profile: BusinessProfile): ProfileCompleteness {
  const checks = [
    { label: 'Business name', done: !missing(profile.businessName) },
    { label: 'Logo', done: !missing(profile.logoUri) },
    { label: 'Phone or email', done: !missing(profile.phone) || !missing(profile.email) },
    { label: 'Business address', done: !missing(profile.address) },
    { label: 'KRA PIN', done: !missing(profile.kraPin) },
    { label: 'Payment details', done: hasPaymentDetails(profile) },
    { label: 'Business description', done: !missing(profile.businessDescription) },
  ];
  const completed = checks.filter((check) => check.done).length;
  return {
    completed,
    total: checks.length,
    score: Math.round((completed / checks.length) * 100),
    missing: checks.filter((check) => !check.done).map((check) => check.label),
  };
}
