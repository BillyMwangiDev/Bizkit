import { useDocumentStore } from '../../store/documentStore';
import type { DocumentData } from '../../types';

/**
 * Resolve initial form values: when a `prefillId` is provided (duplicate flow),
 * return that document's data; otherwise return the supplied defaults.
 */
export function usePrefill<T extends DocumentData>(
  prefillId: string | undefined,
  defaults: T
): T {
  const doc = useDocumentStore((s) =>
    prefillId ? s.documents.find((d) => d.id === prefillId) : undefined
  );
  return (doc?.data as T) ?? defaults;
}
