import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BizDocument } from '../types';
import { STORAGE_KEYS } from '../constants';

interface DocumentState {
  documents: BizDocument[];
  hydrated: boolean;

  /** Insert a freshly generated document at the top of history. */
  addDocument: (doc: BizDocument) => void;
  updateDocument: (id: string, patch: Partial<BizDocument>) => void;
  removeDocument: (id: string) => void;
  getDocument: (id: string) => BizDocument | undefined;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      hydrated: false,

      addDocument: (doc) =>
        set((s) => ({ documents: [doc, ...s.documents] })),

      updateDocument: (id, patch) =>
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id
              ? { ...d, ...patch, updatedAt: new Date().toISOString() }
              : d
          ),
        })),

      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

      getDocument: (id) => get().documents.find((d) => d.id === id),
    }),
    {
      name: STORAGE_KEYS.documents,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ documents: s.documents }),
      onRehydrateStorage: () => () => {
        useDocumentStore.setState({ hydrated: true });
      },
    }
  )
);
