import type { DocumentType } from '../types';

/** Params shared by every document form screen. */
export interface DocFormParams {
  /** When set, pre-fill the form from an existing document (duplicate flow). */
  prefillId?: string;
  /**
   * When set, edit this existing document in place: the form loads its data and
   * submitting overwrites it (keeping the same number) instead of creating a new
   * document.
   */
  editId?: string;
  /** When creating a receipt from an invoice, prefill and link the payment. */
  sourceInvoiceId?: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;

  InvoiceForm: DocFormParams;
  ProformaForm: DocFormParams;
  QuotationForm: DocFormParams;
  ReceiptForm: DocFormParams;
  CompanyProfileForm: DocFormParams;
  ServiceAgreementForm: DocFormParams;
  LetterheadForm: DocFormParams;

  Preview: { documentId: string };
  ProfileEdit: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

/** Maps a document type to its form route name. */
export const FORM_ROUTE: Record<DocumentType, keyof RootStackParamList> = {
  invoice: 'InvoiceForm',
  proforma: 'ProformaForm',
  quotation: 'QuotationForm',
  receipt: 'ReceiptForm',
  company_profile: 'CompanyProfileForm',
  service_agreement: 'ServiceAgreementForm',
  letterhead: 'LetterheadForm',
};
