import type {
  BusinessProfile,
  NumberingPrefixes,
  NumberingCounters,
  DocumentType,
  DisplayStatus,
} from '../types';

export const STORAGE_KEYS = {
  profile: 'bizkit.profile.v1',
  onboarded: 'bizkit.onboarded.v1',
  documents: 'bizkit.documents.v1',
  numbering: 'bizkit.numbering.v1',
} as const;

export const DEFAULT_VAT_PERCENTAGE = 16; // Kenya standard VAT

export const DEFAULT_CURRENCY = 'KES';

export const DEFAULT_NUMBERING_PREFIXES: NumberingPrefixes = {
  invoice: 'INV',
  quotation: 'QT',
  receipt: 'RCT',
  proforma: 'PF',
};

export const DEFAULT_NUMBERING_COUNTERS: NumberingCounters = {
  invoice: 0,
  quotation: 0,
  receipt: 0,
  proforma: 0,
};

export const EMPTY_PROFILE: BusinessProfile = {
  businessName: '',
  logoUri: null,
  phone: '',
  email: '',
  address: '',
  website: '',
  kraPin: '',
  vatPercentage: DEFAULT_VAT_PERCENTAGE,
  bankDetails: {
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
  },
  mpesaTillOrPaybill: '',
  businessDescription: '',
  brandColor: '#4F46E5',
  theme: 'modern',
  currency: DEFAULT_CURRENCY,
};

export interface DocTypeMeta {
  type: DocumentType;
  title: string;
  subtitle: string;
  icon: string; // Ionicons name
  color: string;
  route: string; // navigation route name
}

/** Drives the dashboard grid and shared labels. */
export const DOC_TYPE_META: DocTypeMeta[] = [
  {
    type: 'invoice',
    title: 'New Invoice',
    subtitle: 'Bill a customer',
    icon: 'receipt-outline',
    color: '#4F46E5',
    route: 'InvoiceForm',
  },
  {
    type: 'quotation',
    title: 'New Quotation',
    subtitle: 'Send a quote',
    icon: 'pricetags-outline',
    color: '#0EA5E9',
    route: 'QuotationForm',
  },
  {
    type: 'receipt',
    title: 'New Receipt',
    subtitle: 'Confirm a payment',
    icon: 'checkmark-done-outline',
    color: '#059669',
    route: 'ReceiptForm',
  },
  {
    type: 'proforma',
    title: 'Proforma Invoice',
    subtitle: 'Pre-sale invoice',
    icon: 'document-text-outline',
    color: '#9333EA',
    route: 'ProformaForm',
  },
  {
    type: 'company_profile',
    title: 'Company Profile',
    subtitle: 'Tell your story',
    icon: 'business-outline',
    color: '#EA580C',
    route: 'CompanyProfileForm',
  },
  {
    type: 'service_agreement',
    title: 'Service Agreement',
    subtitle: 'Formal contract',
    icon: 'shield-checkmark-outline',
    color: '#0F766E',
    route: 'ServiceAgreementForm',
  },
  {
    type: 'letterhead',
    title: 'Letterhead',
    subtitle: 'Branded page',
    icon: 'newspaper-outline',
    color: '#DB2777',
    route: 'LetterheadForm',
  },
];

export const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: 'Invoice',
  quotation: 'Quotation',
  receipt: 'Receipt',
  proforma: 'Proforma Invoice',
  company_profile: 'Company Profile',
  service_agreement: 'Service Agreement',
  letterhead: 'Letterhead',
};

/** Label + pill color for each invoice payment status. */
export const PAYMENT_STATUS_META: Record<
  DisplayStatus,
  { label: string; color: string }
> = {
  paid: { label: 'Paid', color: '#059669' },
  partial: { label: 'Partial', color: '#0EA5E9' },
  unpaid: { label: 'Unpaid', color: '#D97706' },
  overdue: { label: 'Overdue', color: '#DC2626' },
};

export const PAYMENT_METHODS = [
  'M-Pesa',
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Card',
  'Other',
];

/** Currency codes offered when creating documents / setting the default. */
export const CURRENCIES = [
  'KES',
  'USD',
  'EUR',
  'GBP',
  'TZS',
  'UGX',
  'RWF',
  'NGN',
  'ZAR',
  'AED',
  'INR',
  'CNY',
];

/** Fallback currency for documents created before currency was selectable. */
export const CURRENCY = DEFAULT_CURRENCY;
