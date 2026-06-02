import { palette } from './tokens';
import type { ThemeName } from '../types';

export * from './tokens';

/** Color helpers shared by UI and document rendering. */

/** Returns a readable text color (#fff / dark) for a given background hex. */
export function readableTextOn(hex: string): string {
  const c = hex.replace('#', '');
  const full =
    c.length === 3
      ? c
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : c;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Perceived luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? palette.ink : palette.white;
}

/** Lighten a hex color toward white by `amount` (0..1). Used for soft tints. */
export function tint(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const full =
    c.length === 3
      ? c
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : c;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const mix = (v: number) => Math.round(v + (255 - v) * amount);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

/** Curated brand color choices offered during onboarding / settings. */
export const BRAND_COLORS = [
  '#4F46E5', // Indigo
  '#0EA5E9', // Sky
  '#059669', // Emerald
  '#DC2626', // Red
  '#EA580C', // Orange
  '#9333EA', // Purple
  '#0F172A', // Ink
  '#DB2777', // Pink
] as const;

export interface DocumentTheme {
  name: ThemeName;
  label: string;
  description: string;
  /** Heading font family stack used inside generated HTML/PDF. */
  headingFont: string;
  bodyFont: string;
  /** Whether the header band is filled with the brand color. */
  filledHeader: boolean;
  /** Whether to draw thin rules / borders (corporate style). */
  ruled: boolean;
  /** Corner radius (px) used in the document layout. */
  cornerRadius: number;
}

export const DOCUMENT_THEMES: Record<ThemeName, DocumentTheme> = {
  modern: {
    name: 'modern',
    label: 'Modern',
    description: 'Bold color band, rounded blocks, confident type.',
    headingFont: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
    bodyFont: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    filledHeader: true,
    ruled: false,
    cornerRadius: 14,
  },
  corporate: {
    name: 'corporate',
    label: 'Corporate',
    description: 'Classic ruled layout, serif headings, formal tone.',
    headingFont: "'Georgia', 'Times New Roman', serif",
    bodyFont: "'Helvetica Neue', Arial, sans-serif",
    filledHeader: false,
    ruled: true,
    cornerRadius: 4,
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal',
    description: 'Lots of whitespace, hairline accents, quiet elegance.',
    headingFont: "'Helvetica Neue', Arial, sans-serif",
    bodyFont: "'Helvetica Neue', Arial, sans-serif",
    filledHeader: false,
    ruled: false,
    cornerRadius: 0,
  },
};
