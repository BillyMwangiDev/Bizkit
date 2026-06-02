import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProfileStore } from '../../store/profileStore';
import { useDocumentStore } from '../../store/documentStore';
import { createDocument } from '../../engine/factory';
import type { DocumentType, DocumentData } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Shared submit pipeline for every document form.
 *
 * New document: consume the next number, persist it, open its preview.
 * Edit (`editId` set): rebuild the document from the new form data while
 * preserving its id, number and creation date, then update it in place.
 *
 * `replace` is used so the back button returns to the dashboard, not the form.
 */
export function useDocSubmit(
  type: DocumentType,
  editId?: string,
  opts: { afterCreate?: (doc: ReturnType<typeof createDocument>) => void } = {}
) {
  const navigation = useNavigation<Nav>();
  const profile = useProfileStore((s) => s.profile);
  const consumeNextNumber = useProfileStore((s) => s.consumeNextNumber);
  const addDocument = useDocumentStore((s) => s.addDocument);
  const updateDocument = useDocumentStore((s) => s.updateDocument);
  const existing = useDocumentStore((s) =>
    editId ? s.documents.find((d) => d.id === editId) : undefined
  );

  return (data: DocumentData) => {
    if (editId && existing) {
      const rebuilt = createDocument(type, existing.number, data, profile);
      updateDocument(editId, {
        ...rebuilt,
        id: existing.id,
        number: existing.number,
        createdAt: existing.createdAt,
        // Editing the invoice content must not silently reset its payment state.
        status: existing.status ?? rebuilt.status,
        paidAmount: existing.paidAmount ?? rebuilt.paidAmount,
        paidAt: existing.paidAt ?? rebuilt.paidAt,
      });
      navigation.replace('Preview', { documentId: editId });
      return;
    }
    const number = consumeNextNumber(type);
    const doc = createDocument(type, number, data, profile);
    addDocument(doc);
    opts.afterCreate?.(doc);
    navigation.replace('Preview', { documentId: doc.id });
  };
}
