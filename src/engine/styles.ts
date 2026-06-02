import type { BusinessProfile } from '../types';
import { DOCUMENT_THEMES, readableTextOn, tint } from '../theme';

/**
 * Generates the full <style> block for a document. The same component classes
 * are emitted for every theme; only the variables/rules differ so the HTML
 * building blocks (header, table, totals…) stay theme-agnostic.
 */
export function documentStyles(profile: BusinessProfile): string {
  const theme = DOCUMENT_THEMES[profile.theme] ?? DOCUMENT_THEMES.modern;
  const brand = profile.brandColor || '#4F46E5';
  const onBrand = readableTextOn(brand);
  const brandSoft = tint(brand, 0.88);
  const brandSofter = tint(brand, 0.94);
  const radius = theme.cornerRadius;

  // Header style differs the most between themes.
  const headerCss = theme.filledHeader
    ? `
      .doc-header {
        background: ${brand};
        color: ${onBrand};
        padding: 28px 32px;
        border-radius: ${radius}px;
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 28px;
      }
      .doc-header .biz-name { color: ${onBrand}; }
      .doc-header .biz-meta { color: ${onBrand}; opacity: 0.92; }
      .doc-title-tag { background: rgba(255,255,255,0.18); color: ${onBrand}; }
    `
    : theme.ruled
    ? `
      .doc-header {
        border-bottom: 3px solid ${brand};
        padding: 0 0 18px 0;
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 26px;
      }
      .doc-header .biz-name { color: ${brand}; }
      .doc-header .biz-meta { color: #475569; }
      .doc-title-tag { background: ${brandSoft}; color: ${brand}; }
    `
    : `
      .doc-header {
        padding: 0 0 16px 0;
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 30px;
      }
      .doc-header .biz-name { color: #0F172A; }
      .doc-header .biz-meta { color: #64748B; }
      .doc-title-tag { background: ${brandSoft}; color: ${brand}; }
    `;

  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page {
      size: A4;
      margin: 28px;
    }
    html, body {
      font-family: ${theme.bodyFont};
      color: #1E293B;
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #FFFFFF;
    }
    body { padding: 28px; }
    .document-shell {
      width: 100%;
      min-height: 100%;
      position: relative;
    }
    h1, h2, h3, h4 { font-family: ${theme.headingFont}; color: #0F172A; }
    p { orphans: 3; widows: 3; }

    .logo { max-height: 64px; max-width: 180px; object-fit: contain; }
    .logo-fallback {
      width: 56px; height: 56px; border-radius: ${Math.min(radius, 12)}px;
      background: ${brand}; color: ${onBrand};
      display: flex; align-items: center; justify-content: center;
      font-family: ${theme.headingFont}; font-weight: 700; font-size: 24px;
    }

    .biz-name { font-size: 22px; font-weight: 700; margin-top: 10px; }
    .biz-meta { font-size: 11px; line-height: 1.6; margin-top: 6px; }
    .header-left { max-width: 62%; }
    .header-right { text-align: right; min-width: 190px; }
    .doc-title-tag {
      display: inline-block; padding: 6px 14px; border-radius: 999px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .doc-number { font-size: 13px; font-weight: 600; margin-top: 10px; }
    .doc-dates { font-size: 11px; color: #64748B; margin-top: 4px; }

    ${headerCss}

    .section { margin-bottom: 22px; page-break-inside: avoid; break-inside: avoid; }
    .section-title {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; color: ${brand}; margin-bottom: 8px;
    }
    .muted { color: #64748B; }
    .row { display: flex; gap: 24px; }
    .col { flex: 1; }

    .amount-hero {
      margin: -6px 0 22px;
      padding: 16px 18px;
      border: 1px solid ${brandSoft};
      border-left: 5px solid ${brand};
      border-radius: ${radius}px;
      background: linear-gradient(90deg, ${brandSofter}, #FFFFFF 72%);
      display: flex; justify-content: space-between; align-items: center;
      gap: 18px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .amount-label {
      font-size: 10px; font-weight: 800; letter-spacing: 0.7px;
      color: ${brand}; text-transform: uppercase;
    }
    .amount-helper { color: #64748B; font-size: 11px; margin-top: 3px; }
    .amount-value {
      color: #0F172A; font-size: 22px; font-weight: 800;
      white-space: nowrap; font-family: ${theme.headingFont};
    }

    .info-grid { display: grid; gap: 10px; margin-bottom: 22px; }
    .info-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
    .info-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
    .info-card {
      border: 1px solid #E2E8F0;
      background: #FFFFFF;
      border-radius: ${radius}px;
      padding: 12px 14px;
      min-height: 62px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .info-card .k,
    .pay-card .k {
      font-size: 9.5px; text-transform: uppercase; color: #64748B;
      letter-spacing: 0.55px; font-weight: 700;
    }
    .info-card .v {
      font-size: 12px; font-weight: 600; color: #0F172A; margin-top: 4px;
      overflow-wrap: anywhere;
    }
    .info-card .v.strong { font-size: 13px; font-weight: 800; color: ${brand}; }

    .party-card {
      background: ${brandSofter};
      border-radius: ${radius}px;
      padding: 16px 18px;
      ${theme.ruled ? `border: 1px solid #E2E8F0;` : ''}
    }
    .party-card .label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.6px; color: ${brand}; margin-bottom: 6px;
    }
    .party-card .name { font-size: 15px; font-weight: 700; color: #0F172A; }
    .party-card .line { font-size: 11px; color: #475569; margin-top: 2px; }

    table.items {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-top: 6px;
      border: 1px solid #E2E8F0;
      border-radius: ${Math.min(radius, 10)}px;
      overflow: hidden;
      page-break-inside: auto;
    }
    table.items thead th {
      background: ${theme.filledHeader || theme.ruled ? brand : brandSoft};
      color: ${theme.filledHeader || theme.ruled ? onBrand : brand};
      font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;
      text-align: left; padding: 10px 12px; font-weight: 700;
    }
    table.items tbody td {
      padding: 11px 12px; font-size: 12px; border-bottom: 1px solid #EEF2F6;
      vertical-align: top;
    }
    table.items tbody tr { page-break-inside: avoid; break-inside: avoid; }
    table.items tbody tr:last-child td { border-bottom: 0; }
    table.items tbody tr:nth-child(even) td { background: #FAFBFC; }
    .num { text-align: right; white-space: nowrap; }
    .item-index { width: 34px; text-align: center; color: #64748B; }
    .item-name { font-weight: 600; color: #0F172A; }
    .amount-cell { font-weight: 700; color: #0F172A; }
    .empty-row { padding: 18px 12px; text-align: center; color: #94A3B8; }

    .totals { margin-top: 18px; display: flex; justify-content: flex-end; }
    .totals-inner {
      width: 300px;
      border: 1px solid #E2E8F0;
      border-radius: ${Math.min(radius, 10)}px;
      padding: 6px;
      background: #FFFFFF;
      page-break-inside: avoid; break-inside: avoid;
    }
    .totals-row {
      display: flex; justify-content: space-between;
      padding: 7px 12px; font-size: 12px;
    }
    .totals-row.grand {
      background: ${brand}; color: ${onBrand};
      border-radius: ${Math.min(radius, 10)}px; margin-top: 6px;
      font-size: 15px; font-weight: 700; padding: 12px;
    }

    .note-block {
      background: ${brandSofter}; border-radius: ${radius}px;
      padding: 14px 16px; font-size: 11px; color: #475569; margin-top: 8px;
      ${theme.ruled ? `border-left: 3px solid ${brand};` : ''}
      page-break-inside: avoid; break-inside: avoid;
    }
    .pay-grid { display: flex; gap: 14px; flex-wrap: wrap; }
    .pay-card {
      flex: 1; min-width: 160px; background: #fff; border: 1px solid #E2E8F0;
      border-radius: ${radius}px; padding: 12px 14px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .pay-card .v {
      font-size: 12px; font-weight: 600; color: #0F172A; margin-top: 3px;
      overflow-wrap: anywhere;
    }

    .cover {
      background: ${brand}; color: ${onBrand};
      border-radius: ${radius}px; padding: 48px 36px; margin-bottom: 28px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .cover h1 { color: ${onBrand}; font-size: 30px; letter-spacing: -0.5px; }
    .cover .tagline { color: ${onBrand}; opacity: 0.9; margin-top: 8px; font-size: 13px; }

    .service-list { list-style: none; columns: 2; column-gap: 24px; }
    .service-list li {
      padding: 9px 0 9px 22px; position: relative; font-size: 12.5px;
      border-bottom: 1px solid #EEF2F6;
      break-inside: avoid;
    }
    .service-list li:before {
      content: ''; position: absolute; left: 0; top: 13px;
      width: 8px; height: 8px; border-radius: 2px; background: ${brand};
    }

    .agreement {
      border: 1px solid #E2E8F0;
      border-radius: ${radius}px;
      padding: 18px 20px;
      background: #FFFFFF;
    }
    .agreement p { margin-bottom: 12px; font-size: 12.5px; }
    .clause {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #EEF2F6;
      page-break-inside: avoid; break-inside: avoid;
    }
    .clause h4 { font-size: 12px; color: ${brand}; margin-bottom: 4px; }
    .sign-row {
      display: flex; gap: 40px; margin-top: 48px;
      page-break-inside: avoid; break-inside: avoid;
    }
    .sign-box { flex: 1; }
    .sign-line { border-top: 1px solid #94A3B8; padding-top: 6px; font-size: 11px; color: #64748B; }

    .footer {
      margin-top: 40px; padding-top: 16px; border-top: 1px solid #E2E8F0;
      font-size: 10px; color: #94A3B8; text-align: center;
    }
    .letterhead-body {
      margin-top: 40px; font-size: 13px; line-height: 1.8;
      white-space: pre-wrap; min-height: 430px;
    }
    .letter-date { text-align: right; color: #64748B; font-size: 12px; margin-top: -8px; }

    @media print {
      body { padding: 0; }
      .doc-header, .amount-hero, .party-card, .info-card, .pay-card, .note-block,
      .cover, .agreement, .sign-row, .totals-inner {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
}
