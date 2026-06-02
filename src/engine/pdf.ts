import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import type { BizDocument, BusinessProfile } from '../types';
import { renderDocument } from './render';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

/** Render a document to a temporary PDF and return its file uri (in cache). */
export async function generatePdf(
  doc: BizDocument,
  profile: BusinessProfile
): Promise<string> {
  const html = renderDocument(doc, profile);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width: A4_WIDTH,
    height: A4_HEIGHT,
  });
  return uri;
}

/** Filesystem-safe filename for a document. */
export function safePdfFileName(doc: BizDocument): string {
  const type = doc.title || doc.type;
  const base = `${type}_${doc.number || doc.type}_${doc.customerName || doc.title}`;
  const cleaned = base.replace(/[^a-z0-9_-]+/gi, '_').replace(/_+/g, '_');
  return `${cleaned || 'document'}.pdf`;
}

/**
 * Persist a generated (cache) PDF into the app's document directory so it
 * survives cache eviction. Returns the saved file uri.
 */
export async function savePdfToDocuments(cacheUri: string, doc: BizDocument): Promise<string> {
  const source = new File(cacheUri);
  const dest = new File(Paths.document, safePdfFileName(doc));
  if (dest.exists) dest.delete();
  await source.copy(dest);
  return dest.uri;
}

/** Generate a PDF and copy it to a readable, client-ready filename. */
export async function generateNamedPdf(
  doc: BizDocument,
  profile: BusinessProfile
): Promise<string> {
  const cacheUri = await generatePdf(doc, profile);
  return savePdfToDocuments(cacheUri, doc);
}

/** Open the native share sheet for a PDF uri. */
export async function sharePdf(uri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share document',
    UTI: 'com.adobe.pdf',
  });
}
