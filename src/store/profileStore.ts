import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  BusinessProfile,
  NumberingPrefixes,
  NumberingCounters,
  DocumentType,
} from '../types';
import {
  EMPTY_PROFILE,
  DEFAULT_NUMBERING_PREFIXES,
  DEFAULT_NUMBERING_COUNTERS,
  STORAGE_KEYS,
} from '../constants';
import { formatDocNumber } from '../utils/format';

/** Document types that participate in sequential numbering. */
type NumberedType = keyof NumberingCounters;

const NUMBERED: Record<DocumentType, NumberedType | null> = {
  invoice: 'invoice',
  quotation: 'quotation',
  receipt: 'receipt',
  proforma: 'proforma',
  company_profile: null,
  service_agreement: null,
  letterhead: null,
};

interface ProfileState {
  profile: BusinessProfile;
  onboarded: boolean;
  prefixes: NumberingPrefixes;
  counters: NumberingCounters;
  hydrated: boolean;

  setProfile: (profile: BusinessProfile) => void;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  completeOnboarding: (profile: BusinessProfile) => void;
  setPrefix: (key: keyof NumberingPrefixes, value: string) => void;

  /** Preview the next number for a type without consuming it. */
  peekNextNumber: (type: DocumentType) => string;
  /** Consume and return the next number for a type (increments counter). */
  consumeNextNumber: (type: DocumentType) => string;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: EMPTY_PROFILE,
      onboarded: false,
      prefixes: DEFAULT_NUMBERING_PREFIXES,
      counters: DEFAULT_NUMBERING_COUNTERS,
      hydrated: false,

      setProfile: (profile) => set({ profile }),

      updateProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),

      completeOnboarding: (profile) => set({ profile, onboarded: true }),

      setPrefix: (key, value) =>
        set((s) => ({ prefixes: { ...s.prefixes, [key]: value } })),

      peekNextNumber: (type) => {
        const key = NUMBERED[type];
        if (!key) return '';
        const { prefixes, counters } = get();
        return formatDocNumber(prefixes[key], counters[key] + 1);
      },

      consumeNextNumber: (type) => {
        const key = NUMBERED[type];
        if (!key) return '';
        const { prefixes, counters } = get();
        const next = counters[key] + 1;
        set({ counters: { ...counters, [key]: next } });
        return formatDocNumber(prefixes[key], next);
      },
    }),
    {
      name: STORAGE_KEYS.profile,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        profile: s.profile,
        onboarded: s.onboarded,
        prefixes: s.prefixes,
        counters: s.counters,
      }),
      // Deep-merge the persisted profile over defaults so profiles saved before
      // a field existed (e.g. `currency`) still pick up its default value.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProfileState>;
        return {
          ...current,
          ...p,
          profile: { ...current.profile, ...(p.profile ?? {}) },
          prefixes: { ...current.prefixes, ...(p.prefixes ?? {}) },
          counters: { ...current.counters, ...(p.counters ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        // Flag hydration so the app can show a splash until storage is read.
        useProfileStore.setState({ hydrated: true });
      },
    }
  )
);
