import React from 'react';
import { InvoiceFormScreen } from './InvoiceFormScreen';

/** Proforma reuses the invoice form with a different document type. */
export function ProformaFormScreen() {
  return <InvoiceFormScreen docType="proforma" />;
}
