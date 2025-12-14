/**
 * Report Registry and Dispatcher
 * 
 * Identifies PDF report types based on text fingerprints and routes
 * to the appropriate parser. Designed for extensibility - add new
 * report types by:
 * 1. Creating a new parser in /parsers/
 * 2. Registering it here with fingerprints
 */

import { REPORT_FINGERPRINTS } from '../utils/constants.js';
import { parsePerformanceReport } from './performanceReportParser.js';
import { parseAssetAllocationReport } from './assetAllocationParser.js';

/**
 * Registry of all supported report parsers
 * Each entry contains:
 * - fingerprints: Array of text patterns that identify this report type
 * - parser: Function that parses the PDF text and returns structured data
 * - name: Human-readable name for the report type
 */
const REPORT_PARSERS = {
  performance: {
    name: 'Investment Movement and Returns Report',
    fingerprints: REPORT_FINGERPRINTS.PERFORMANCE,
    parser: parsePerformanceReport,
    // Minimum number of fingerprints that must match
    minMatchCount: 1,
  },
  asset_allocation: {
    name: 'Investment Allocation Report',
    fingerprints: REPORT_FINGERPRINTS.ASSET_ALLOCATION,
    parser: parseAssetAllocationReport,
    minMatchCount: 1,
  },
};

/**
 * Identify the type of report based on text content
 * Uses fuzzy matching of fingerprints to determine report type
 * 
 * @param {string} text - Full text content of the PDF
 * @returns {{type: string, confidence: number, name: string}|null}
 */
export function identifyReportType(text) {
  const normalizedText = text.toLowerCase();
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [type, config] of Object.entries(REPORT_PARSERS)) {
    // Count how many fingerprints match
    const matchCount = config.fingerprints.filter(fp => 
      normalizedText.includes(fp.toLowerCase())
    ).length;
    
    // Calculate confidence as percentage of fingerprints matched
    const confidence = (matchCount / config.fingerprints.length) * 100;
    
    // Check if this matches better than current best
    if (matchCount >= config.minMatchCount && confidence > bestScore) {
      bestScore = confidence;
      bestMatch = {
        type,
        confidence,
        name: config.name,
        matchCount,
        totalFingerprints: config.fingerprints.length,
      };
    }
  }
  
  return bestMatch;
}

/**
 * Parse a PDF report by automatically detecting type and routing to correct parser
 * 
 * @param {Object} extractedPdf - Output from extractTextFromPDF
 * @returns {Promise<{reportType: string, data: Object, metadata: Object}>}
 */
export async function parseReport(extractedPdf) {
  const { fullText, pages } = extractedPdf;
  
  // Identify report type
  const identification = identifyReportType(fullText);
  
  if (!identification) {
    throw new Error(
      'Could not identify report type. Please ensure this is a supported ' +
      'CLASS Super report (Investment Allocation or Movement and Returns).'
    );
  }
  
  console.log(`[Registry] Identified report as: ${identification.name} (${identification.confidence.toFixed(1)}% confidence)`);
  
  // Get the appropriate parser
  const parserConfig = REPORT_PARSERS[identification.type];
  
  if (!parserConfig || !parserConfig.parser) {
    throw new Error(`No parser registered for report type: ${identification.type}`);
  }
  
  // Parse the report
  const parsedData = await parserConfig.parser(fullText, pages);
  
  return {
    reportType: identification.type,
    reportName: identification.name,
    confidence: identification.confidence,
    data: parsedData,
  };
}

/**
 * Get list of all supported report types
 * @returns {Array<{type: string, name: string}>}
 */
export function getSupportedReportTypes() {
  return Object.entries(REPORT_PARSERS).map(([type, config]) => ({
    type,
    name: config.name,
    fingerprints: config.fingerprints,
  }));
}

/**
 * Validate that a parsed report has required fields
 * @param {Object} report - Parsed report data
 * @param {string} type - Report type
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateReport(report, type) {
  const errors = [];
  
  if (type === 'performance') {
    if (!report.period?.from || !report.period?.to) {
      errors.push('Missing report period dates');
    }
    if (report.dollarReturnAfterExpenses === null || report.dollarReturnAfterExpenses === undefined) {
      errors.push('Missing total dollar return');
    }
  }
  
  if (type === 'asset_allocation') {
    if (!report.assetClasses || report.assetClasses.length === 0) {
      errors.push('No asset classes found');
    }
    if (!report.holdings || report.holdings.length === 0) {
      errors.push('No holdings found');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export { REPORT_PARSERS };