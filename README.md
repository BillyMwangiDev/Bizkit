# BizKit

Mobile-first business document generator for freelancers & SMEs. Enter your
business details once; they auto-populate professional, branded documents
(invoices, quotations, receipts, proforma invoices, company profiles, service
agreements, letterheads) exportable as PDF — no Word, Canva, or design skills
needed.

## Stack

- **Expo (SDK 56)** + **React Native** + **TypeScript**
- **React Navigation** (native-stack + bottom-tabs)
- **Zustand** (state) with **AsyncStorage** persistence
- **React Hook Form** (forms + validation)
- **expo-print** (HTML → PDF), **expo-sharing**, **expo-file-system**, **expo-image-picker**
- **react-native-webview** (exact on-device document preview)

## Getting started

```bash
npm install
npm run ios      # or: npm run android
```

First launch shows a 4-step onboarding wizard that captures the business
profile. After that you land on the dashboard.

## Architecture

```
src/
  types/        Domain models (BusinessProfile, BizDocument, line items…)
  constants/    Storage keys, defaults, document-type metadata
  theme/        Design tokens + 3 document themes (modern/corporate/minimal)
  utils/        Money/date formatting, totals calc, id generation
  store/        Zustand stores (profile + numbering, documents) w/ persistence
  engine/       Document → HTML → PDF pipeline
    placeholders.ts  {{token}} template engine (shared by all docs)
    styles.ts        Theme/brand-color-aware CSS generator
    blocks.ts        Reusable HTML fragments (header, table, totals…)
    render.ts        renderDocument(doc, profile): one entry point per type
    factory.ts       Build a stored BizDocument from form data
    pdf.ts           generate / save / share
  components/   Reusable UI (Button, Card, TextField, FormField, controls…)
  navigation/   Route types, root stack, bottom tabs
  screens/      Onboarding, dashboard, document forms, preview, history, settings
```

### Document engine

Every document type funnels through `renderDocument()`, which composes themed
HTML from shared building blocks. The header and customer blocks are resolved
through a `{{placeholder}}` engine (`engine/placeholders.ts`), so all documents
share the same templating system. `documentStyles()` derives the full
stylesheet from the chosen brand color + theme, so a single set of component
classes restyles across Modern / Corporate / Minimal.

### Numbering

Sequential, prefixed numbers (INV-0001, QT-0001, RCT-0001, PF-0001) are managed
in the profile store. Forms *peek* the next number for display and *consume* it
on submit. Prefixes are editable in Settings.

### Persistence

Two Zustand stores persist to AsyncStorage; the app shows a splash until both
have rehydrated. SecureStore is installed and available for future secrets.

## Future-ready

The engine and stores are deliberately decoupled from the UI so cloud sync
(Firebase), M-Pesa/KRA integration, AI proposal generation, and email
automation can be layered on without reworking document rendering. None of
those are implemented yet.
