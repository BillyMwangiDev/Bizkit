import type { BusinessProfile, CustomerInfo } from '../types';
import { escapeHtml } from '../utils/format';

/**
 * Minimal, dependency-free placeholder engine.
 * Replaces `{{token}}` occurrences in a template string using a context map.
 * Unknown tokens collapse to an empty string so partial contexts are safe.
 *
 * Every document renderer ultimately funnels through this so the templating
 * behaviour is identical across all document types (per spec).
 */
export type PlaceholderContext = Record<string, string | number | null | undefined>;

export function applyPlaceholders(
  template: string,
  context: PlaceholderContext
): string {
  return template.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_match, key: string) => {
    const value = context[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

/**
 * Build the base placeholder context shared by all documents from the
 * business profile (and optionally a customer). Values are HTML-escaped here
 * so templates can interpolate them directly.
 */
export function baseContext(
  profile: BusinessProfile,
  extra: PlaceholderContext = {}
): PlaceholderContext {
  return {
    business_name: escapeHtml(profile.businessName),
    logo: profile.logoUri ?? '',
    phone: escapeHtml(profile.phone),
    email: escapeHtml(profile.email),
    address: escapeHtml(profile.address),
    website: escapeHtml(profile.website),
    kra_pin: escapeHtml(profile.kraPin),
    ...extra,
  };
}

export function customerContext(customer: CustomerInfo): PlaceholderContext {
  return {
    customer_name: escapeHtml(customer.name),
    customer_email: escapeHtml(customer.email),
    customer_phone: escapeHtml(customer.phone),
    customer_kra_pin: escapeHtml(customer.kraPin),
  };
}
