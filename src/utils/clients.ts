import type { BizDocument, CustomerInfo, InvoiceData, QuotationData, ReceiptData } from '../types';

function hasCustomerData(doc: BizDocument): doc is BizDocument & {
  data: InvoiceData | QuotationData | ReceiptData;
} {
  return (
    doc.type === 'invoice' ||
    doc.type === 'proforma' ||
    doc.type === 'quotation' ||
    doc.type === 'receipt'
  );
}

function mergeCustomer(existing: CustomerInfo, incoming: CustomerInfo): CustomerInfo {
  return {
    name: existing.name || incoming.name,
    email: existing.email || incoming.email,
    phone: existing.phone || incoming.phone,
    kraPin: existing.kraPin || incoming.kraPin,
  };
}

/** Build a recent-first list of distinct clients from saved documents. */
export function clientsFromDocuments(documents: BizDocument[]): CustomerInfo[] {
  const byName = new Map<string, CustomerInfo>();

  documents.forEach((doc) => {
    if (!hasCustomerData(doc)) return;
    const customer = doc.data.customer;
    const key = customer.name.trim().toLowerCase();
    if (!key) return;
    const existing = byName.get(key);
    byName.set(key, existing ? mergeCustomer(existing, customer) : customer);
  });

  return [...byName.values()];
}

export function matchClients(clients: CustomerInfo[], query: string, limit = 4): CustomerInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return clients.slice(0, limit);
  return clients
    .filter(
      (client) =>
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q) ||
        client.kraPin.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

