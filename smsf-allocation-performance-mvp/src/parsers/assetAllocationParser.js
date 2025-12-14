/**
 * Asset Allocation Report Parser (TOTAL ROW BASED)
 * Parses CLASS Super "Investment Allocation" PDFs
 *
 * Source of truth:
 * - The TOTAL row at the bottom of the allocation table
 */

import { parseDate, parseCurrency } from '../utils/formatters.js';

const ASSET_CLASS_COLUMNS = [
  'Australian Equities',
  'Australian Fixed Interest',
  'Cash',
  'International Equities',
  'Listed Property',
  'Other',
  'Unknown',
];

export function parseAssetAllocationReport(fullText, pages) {
  console.log('[AssetAllocationParser] Parsing TOTAL allocation row');

  const asAtDate = extractReportDate(fullText);

  const totalRow = findTotalRow(pages);
  if (!totalRow) {
    console.warn('[AssetAllocationParser] TOTAL row not found');
    return {
      reportType: 'asset_allocation',
      asAtDate,
      totalValue: null,
      assetClasses: [],
      holdings: [],
      holdingsCount: 0,
    };
  }

  const assetClasses = parseTotalRow(totalRow);

  const totalValue = assetClasses.reduce(
    (sum, ac) => sum + (ac.value || 0),
    0
  );

  return {
    reportType: 'asset_allocation',
    asAtDate,
    totalValue,
    assetClasses,
    holdings: [], // holdings are no longer needed for allocation
    holdingsCount: 0,
  };
}

/* ---------------------------------------------
   Find TOTAL row
---------------------------------------------- */
function findTotalRow(pages) {
  for (const page of pages) {
    for (const line of page.lines) {
      if (line.toLowerCase().startsWith('total')) {
        return line;
      }
    }
  }
  return null;
}

/* ---------------------------------------------
   Parse TOTAL row
---------------------------------------------- */
function parseTotalRow(line) {
  // Extract all dollar values and percentages in order
  const values = line.match(/\$?[0-9,]+\.\d{2}/g) || [];
  const percents = line.match(/\d+\.?\d*%/g) || [];

  const assetClasses = [];

  for (let i = 0; i < ASSET_CLASS_COLUMNS.length; i++) {
    const value = values[i] ? parseCurrency(values[i]) : null;
    const percent = percents[i]
      ? Number(percents[i].replace('%', ''))
      : null;

    if (value != null || percent != null) {
      assetClasses.push({
        name: ASSET_CLASS_COLUMNS[i],
        value,
        percent,
        source: 'total_row',
      });
    }
  }

  return assetClasses;
}

/* ---------------------------------------------
   Extract report date
---------------------------------------------- */
function extractReportDate(text) {
  const patterns = [
    /as\s+at\s+(\d{1,2}\s+\w+\s+\d{4})/i,
    /as\s+at\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ];

  for (const p of patterns) {
    const match = text.match(p);
    if (match) return parseDate(match[1]);
  }

  return null;
}

