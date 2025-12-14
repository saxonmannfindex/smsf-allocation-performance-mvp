/**
 * Performance Report Parser
 * Parses CLASS Super "Investment Movement and Returns Report" PDFs
 * 
 * Extracts:
 * - Period dates (from/to)
 * - Starting and ending market values
 * - Total dollar return after expenses
 * - TWR (Time-Weighted Return) percentages
 * 
 * ASSUMPTIONS:
 * 1. Report follows CLASS Super standard format
 * 2. Section headers are consistent ("Movement in Value", "Portfolio Return")
 * 3. Values appear on the same line as or immediately after their labels
 * 4. Dates are in DD/MM/YYYY or "D Month YYYY" format
 * 5. Negative values may be in parentheses: (123.45) = -123.45
 */

import { parseDate, parseCurrency, parsePercentage } from '../utils/formatters.js';

/**
 * Parse a Performance Report from extracted PDF text
 * 
 * @param {string} fullText - Complete text content of the PDF
 * @param {Array} pages - Array of page objects with lines
 * @returns {Object} Parsed performance report data
 */
export function parsePerformanceReport(fullText, pages) {
  console.log('[PerformanceParser] Starting parse...');
  
  // Combine all lines for easier searching
  const allLines = pages.flatMap(p => p.lines);
  
  // Extract period dates from header
  const period = extractPeriodDates(fullText);
  
  // Extract Movement in Value section
  const movementData = extractMovementInValue(allLines);
  
  // Extract Portfolio Return section
  const portfolioReturn = extractPortfolioReturn(allLines);
  
  // Extract TWR values
  const twr = extractTWRValues(allLines);
  
  // Build the output structure
  const result = {
    reportType: 'performance',
    period,
    startingMarketValue: movementData.startingMarketValue,
    endingMarketValue: movementData.endingMarketValue,
    movementInValue: movementData.movementInValue,
    dollarReturnBeforeExpenses: portfolioReturn.totalBeforeExpenses,
    dollarReturnAfterExpenses: portfolioReturn.totalAfterExpenses,
    investmentExpenses: portfolioReturn.expenses,
    twr,
    // Include detailed breakdown for debugging/display
    details: {
      movementInValue: movementData,
      portfolioReturn,
    },
  };
  
  console.log('[PerformanceParser] Parsed result:', result);
  
  return result;
}

/**
 * Extract period dates from report header
 * Looks for pattern: "For the period from X to Y"
 */
function extractPeriodDates(text) {
  // Pattern: "For the period from 1 July 2025 to 7 December 2025"
  const periodPattern = /for\s+the\s+period\s+from\s+(\d{1,2}\s+\w+\s+\d{4})\s+to\s+(\d{1,2}\s+\w+\s+\d{4})/i;
  const match = text.match(periodPattern);
  
  if (match) {
    return {
      from: parseDate(match[1]),
      to: parseDate(match[2]),
      rawFrom: match[1],
      rawTo: match[2],
    };
  }
  
  // Alternative pattern with slashes
  const slashPattern = /period\s+from\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+to\s+(\d{1,2}\/\d{1,2}\/\d{4})/i;
  const slashMatch = text.match(slashPattern);
  
  if (slashMatch) {
    return {
      from: parseDate(slashMatch[1]),
      to: parseDate(slashMatch[2]),
      rawFrom: slashMatch[1],
      rawTo: slashMatch[2],
    };
  }
  
  console.warn('[PerformanceParser] Could not extract period dates');
  return { from: null, to: null };
}

/**
 * Extract Movement in Value section data
 * Looks for labeled values in the first section of the report
 */
function extractMovementInValue(lines) {
  const result = {
    startingMarketValue: null,
    netAddition: null,
    realisedGainsLosses: null,
    investmentIncome: null,
    other: null,
    endingMarketValue: null,
    movementInValue: null,
  };
  
  // Find the section
  let inSection = false;
  let sectionLines = [];
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Start of section
    if (lowerLine.includes('movement in value') && !lowerLine.includes('portfolio')) {
      inSection = true;
      continue;
    }
    
    // End of section (next major section)
    if (inSection && (lowerLine.includes('portfolio value versus') || 
                       lowerLine.includes('portfolio return'))) {
      break;
    }
    
    if (inSection) {
      sectionLines.push(line);
    }
  }
  
  // Parse each line for known labels
  for (const line of sectionLines) {
    const lowerLine = line.toLowerCase();
    
    // Extract value from line - assumes value is at the end after spaces
    const valueMatch = line.match(/([0-9,]+\.[0-9]{2}|\([0-9,]+\.[0-9]{2}\))\s*$/);
    const value = valueMatch ? parseCurrency(valueMatch[1]) : null;
    
    if (lowerLine.includes('starting market value') && value !== null) {
      result.startingMarketValue = value;
    } else if ((lowerLine.includes('net addition') || lowerLine.includes('net withdrawal')) && value !== null) {
      result.netAddition = value;
    } else if (lowerLine.includes('realised') && lowerLine.includes('gains') && value !== null) {
      result.realisedGainsLosses = value;
    } else if (lowerLine.includes('investment income') && value !== null) {
      result.investmentIncome = value;
    } else if (lowerLine.includes('other') && value !== null) {
      result.other = value;
    } else if (lowerLine.includes('ending market value') && value !== null) {
      result.endingMarketValue = value;
    } else if (lowerLine.match(/^movement\s+in\s+value/) && value !== null) {
      result.movementInValue = value;
    }
  }
  
  return result;
}

/**
 * Extract Portfolio Return section data
 * Contains dollar returns and TWR percentages
 */
function extractPortfolioReturn(lines) {
  const result = {
    realisedGainsLosses: null,
    investmentIncome: null,
    credits: null,
    totalBeforeExpenses: null,
    expenses: null,
    totalAfterExpenses: null,
  };
  
  // Find the section
  let inSection = false;
  let sectionLines = [];
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Start of section
    if (lowerLine.includes('portfolio return') && !lowerLine.includes('investment return')) {
      inSection = true;
      continue;
    }
    
    // End of section
    if (inSection && (lowerLine.includes('return over time') || 
                       lowerLine.includes('1 year') ||
                       lowerLine.includes('investment return before expenses'))) {
      break;
    }
    
    if (inSection) {
      sectionLines.push(line);
    }
  }
  
  // Parse each line
  for (const line of sectionLines) {
    const lowerLine = line.toLowerCase();
    
    // Extract value from line
    const valueMatch = line.match(/([0-9,]+\.[0-9]{2}|\([0-9,]+\.[0-9]{2}\))\s*$/);
    const value = valueMatch ? parseCurrency(valueMatch[1]) : null;
    
    if (lowerLine.includes('realised') && lowerLine.includes('gains') && value !== null) {
      result.realisedGainsLosses = value;
    } else if (lowerLine.includes('investment income') && value !== null) {
      result.investmentIncome = value;
    } else if (lowerLine.includes('credits') && !lowerLine.includes('excluding') && value !== null) {
      result.credits = value;
    } else if (lowerLine.includes('total dollar return before expenses') && value !== null) {
      result.totalBeforeExpenses = value;
    } else if (lowerLine.includes('investment expenses') && value !== null) {
      result.expenses = value;
    } else if (lowerLine.includes('total dollar return after expenses') && value !== null) {
      result.totalAfterExpenses = value;
    }
  }
  
  return result;
}

/**
 * Extract TWR (Time-Weighted Return) values
 * Looks for the row containing "Investment return before expenses (TWR)"
 */
function extractTWRValues(lines) {
  const result = {
    oneYear: null,
    threeYears: null,
    sinceStart: null,
    sincePeriodStart: null,
    sinceDates: [], // Store any "Since XX/XX/XXXX" dates with their values
  };
  
  // Find the TWR row and header row
  let headerLine = null;
  let twrLine = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Look for header row with periods
    if (lowerLine.includes('1 year') || lowerLine.includes('3 year')) {
      headerLine = line;
      continue;
    }
    
    // Look for TWR data row
    if (lowerLine.includes('investment return before expenses') && 
        lowerLine.includes('twr')) {
      twrLine = line;
      break;
    }
  }
  
  if (!twrLine) {
    console.warn('[PerformanceParser] Could not find TWR row');
    return result;
  }
  
  // Parse TWR values - they appear after the label
  // Pattern: "Investment return before expenses (TWR) 12.95% - 33.82% 4.47%"
  const percentages = twrLine.match(/(-?\d+\.?\d*%|-)/g);
  
  if (percentages && percentages.length > 0) {
    // First percentage is typically 1 year
    result.oneYear = parsePercentage(percentages[0]);
    
    // Second is 3 years (may be "-" if not available)
    if (percentages.length > 1) {
      result.threeYears = parsePercentage(percentages[1]);
    }
    
    // Third is often "Since inception" or first "Since" date
    if (percentages.length > 2) {
      result.sinceStart = parsePercentage(percentages[2]);
    }
    
    // Fourth is often "Since period start"
    if (percentages.length > 3) {
      result.sincePeriodStart = parsePercentage(percentages[3]);
    }
  }
  
  // Also try to extract "Since XX/XX/XXXX" column headers for context
  if (headerLine) {
    const sincePattern = /since\s+(\d{2}\/\d{2}\/\d{4})/gi;
    let match;
    let index = 2; // Start after 1yr and 3yr
    
    while ((match = sincePattern.exec(headerLine)) !== null) {
      if (percentages && percentages[index]) {
        result.sinceDates.push({
          date: parseDate(match[1]),
          rawDate: match[1],
          value: parsePercentage(percentages[index]),
        });
      }
      index++;
    }
  }
  
  return result;
}

/**
 * Validate the parsed performance report
 * @param {Object} report - Parsed report data
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validatePerformanceReport(report) {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!report.period?.from || !report.period?.to) {
    errors.push('Could not extract report period dates');
  }
  
  if (report.dollarReturnAfterExpenses === null) {
    errors.push('Could not extract total dollar return after expenses');
  }
  
  // Recommended fields
  if (report.startingMarketValue === null) {
    warnings.push('Starting market value not found');
  }
  
  if (report.endingMarketValue === null) {
    warnings.push('Ending market value not found');
  }
  
  if (report.twr.oneYear === null) {
    warnings.push('1-year TWR not found');
  }
  
  // Sanity checks
  if (report.startingMarketValue !== null && 
      report.endingMarketValue !== null &&
      report.movementInValue !== null) {
    const expected = report.endingMarketValue - report.startingMarketValue;
    const actual = report.movementInValue;
    const diff = Math.abs(expected - actual);
    
    if (diff > 1) { // Allow $1 rounding tolerance
      warnings.push(`Movement in value (${actual}) doesn't match start/end difference (${expected.toFixed(2)})`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}