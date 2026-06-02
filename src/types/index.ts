/**
 * Core domain models for BizKit.
 * These types describe the business profile and every document the app can
 * generate. Documents share a common envelope (id, type, number, dates) and
 * carry a type-specific `data` payload.
 */

export type ThemeName = 'modern' | 'corporate' | 'minimal';

/** Stored payment state for an invoice. */
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

/** Status used for display; 'overdue' is derived from the due date, never stored. */
export type DisplayStatus = PaymentStatus | 'overdue';

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
}

export interface BusinessProfile {
  businessName: string;
  logoUri: string | null;
  phone: string;
  email: string;
  address: string;
  website: string;
  kraPin: string;
  vatPercentage: number;
  bankDetails: BankDetails;
  mpesaTillOrPaybill: string;
  businessDescription: string;
  brandColor: string;
  theme: ThemeName;
  /** Default currency code (e.g. "KES", "USD") for new documents. */
  currency: string;
}

/** Prefixes used to generate sequential, human-readable document numbers. */
export interface NumberingPrefixes {
  invoice: string;
  quotation: string;
  receipt: string;
  proforma: string;
}

/** Per-type counters backing the numbering scheme (e.g. INV-0001). */
export interface NumberingCounters {
  invoice: number;
  quotation: number;
  receipt: number;
  proforma: number;
}

export type DocumentType =
  | 'invoice'
  | 'quotation'
  | 'receipt'
  | 'proforma'
  | 'company_profile'
  | 'service_agreement'
  | 'letterhead';

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface MonetaryTotals {
  subtotal: number;
  vat: number;
  total: number;
}

/** Shared customer block reused by invoice / quotation / receipt / proforma. */
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  kraPin: string;
}

/* ---- Type-specific document payloads ---- */

export interface InvoiceData {
  customer: CustomerInfo;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  vatEnabled: boolean;
  currency: string;
  notes: string;
  terms: string;
}

/** Proforma uses the same shape as a full invoice. */
export type ProformaData = InvoiceData;

export interface QuotationData {
  customer: CustomerInfo;
  projectTitle: string;
  description: string;
  items: LineItem[];
  validUntil: string;
  vatEnabled: boolean;
  currency: string;
  notes: string;
}

export interface ReceiptData {
  customer: CustomerInfo;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber: string;
  notes: string;
  linkedInvoiceId?: string;
  linkedInvoiceNumber?: string;
}

export interface CompanyProfileData {
  overview: string;
  services: string[];
  mission: string;
  vision: string;
}

export interface ServiceAgreementData {
  clientName: string;
  serviceDescription: string;
  price: number;
  currency: string;
  timeline: string;
  terms: string;
  effectiveDate: string;
}

export interface LetterheadData {
  /** Optional body so the letterhead can double as a blank branded page. */
  body: string;
}

export type DocumentData =
  | InvoiceData
  | ProformaData
  | QuotationData
  | ReceiptData
  | CompanyProfileData
  | ServiceAgreementData
  | LetterheadData;

/**
 * A stored, generated document. `data` is the type-specific payload; `totals`
 * is cached for documents that have monetary values so history can show an
 * amount without recomputing.
 */
export interface BizDocument {
  id: string;
  type: DocumentType;
  number: string;
  title: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  totals: MonetaryTotals | null;
  /** Currency code for `totals`, cached so lists/format don't dig into `data`. */
  currency: string;
  /** Payment state for invoices; null for document types that aren't billed. */
  status: PaymentStatus | null;
  /** Amount received against an invoice total. Older documents default to 0. */
  paidAmount?: number;
  /** Date of the latest payment recorded against an invoice. */
  paidAt?: string | null;
  data: DocumentData;
}
