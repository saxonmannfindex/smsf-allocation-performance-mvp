/**
 * Fund Model
 * 
 * Normalizes parsed report data into a unified fund structure.
 * Combines data from multiple report types (asset allocation + performance)
 * into a single coherent model.
 * 
 * UPDATED: Ensures all dashboard-required fields are properly computed.
 */

import { analyzeFund } from '../engines/performanceEngine.js';

/**
 * Create a new fund model from parsed reports
 * 
 * @param {string} fundId - Unique identifier for the fund
 * @param {Object} options - Parsed report data
 * @param {Object} options.assetAllocation - Parsed asset allocation report
 * @param {Object} options.performance - Parsed performance report
 * @returns {Object} Normalized fund model
 */
export function createFundModel(fundId, { assetAllocation, performance }) {
  // Run analysis on the combined data
  const analysis = analyzeFund(assetAllocation, performance);
  
  // Normalize performance TWR data - ensure all expected fields exist
  const normalizedTwr = normalizePerformanceTwr(performance?.twr);
  
  // Build the normalized model
  const fund = {
    fundId,
    lastUpdated: new Date().toISOString(),
    
    // Asset Allocation data (if available)
    assetAllocation: assetAllocation ? {
      asAtDate: assetAllocation.asAtDate,
      totalValue: assetAllocation.totalValue,
      assetClasses: normalizeAssetClasses(assetAllocation.assetClasses, assetAllocation.totalValue),
      holdings: assetAllocation.holdings || [],
      holdingsCount: assetAllocation.holdingsCount || (assetAllocation.holdings?.length || 0),
    } : null,
    
    // Performance data (if available)
    performance: performance ? {
      period: normalizePeriod(performance.period),
      startingValue: performance.startingMarketValue ?? performance.startingValue ?? null,
      endingValue: performance.endingMarketValue ?? performance.endingValue ?? null,
      dollarReturn: performance.dollarReturnAfterExpenses ?? performance.dollarReturn ?? null,
      twr: normalizedTwr,
    } : null,
    
    // Classification and analysis (from performanceEngine)
    classification: {
      classification: analysis.classification?.classification || 'unknown',
      growthPercent: analysis.classification?.growthPercent ?? 0,
      defensivePercent: analysis.classification?.defensivePercent ?? 0,
      otherPercent: analysis.classification?.otherPercent ?? 0,
    },
    
    // Benchmark comparison
    benchmark: analysis.benchmark ? {
      name: analysis.benchmark.name || 'Benchmark',
      description: analysis.benchmark.description || '',
      composition: analysis.benchmark.composition || null,
      riskLevel: analysis.benchmark.riskLevel || null,
    } : null,
    
    benchmarkComparison: analysis.benchmarkComparison || null,
    
    // Performance score (0-100)
    performanceScore: analysis.performanceScore,
    
    // Derived insights
    derivedInsights: analysis.insights || [],
    
    // Analysis status
    analysisStatus: analysis.status || 'unknown',
    analysisMessage: analysis.message || null,
  };
  
  return fund;
}

/**
 * Normalize asset classes to ensure consistent structure
 * Calculates percentages if missing
 */
function normalizeAssetClasses(assetClasses, totalValue) {
  if (!Array.isArray(assetClasses) || assetClasses.length === 0) {
    return [];
  }
  
  return assetClasses.map(ac => {
    const value = ac.value ?? 0;
    // Calculate percent if not provided or if it's null
    let percent = ac.percent;
    if ((percent === null || percent === undefined) && totalValue > 0) {
      percent = (value / totalValue) * 100;
    }
    
    return {
      name: ac.name || 'Unknown',
      value: value,
      percent: percent ?? 0,
      source: ac.source || 'parsed',
    };
  });
}

/**
 * Normalize performance period to ensure start/end dates exist
 */
function normalizePeriod(period) {
  if (!period) {
    return { start: null, end: null };
  }
  
  return {
    start: period.start || period.startDate || null,
    end: period.end || period.endDate || null,
  };
}

/**
 * Normalize TWR (Time-Weighted Return) data
 * Ensures all expected fields exist with consistent naming
 */
function normalizePerformanceTwr(twr) {
  if (!twr) {
    return null;
  }
  
  return {
    oneYear: twr.oneYear ?? twr['1year'] ?? twr['1Year'] ?? null,
    threeYears: twr.threeYears ?? twr['3years'] ?? twr['3Years'] ?? null,
    fiveYears: twr.fiveYears ?? twr['5years'] ?? twr['5Years'] ?? null,
    sinceStart: twr.sinceStart ?? twr.sinceInception ?? twr.inception ?? null,
  };
}

/**
 * Generate a unique fund ID from report data
 * Uses a combination of date and hash of content
 */
export function generateFundId(reports) {
  const timestamp = Date.now();
  const contentHash = hashContent(JSON.stringify(reports));
  return `FUND-${timestamp}-${contentHash}`;
}

/**
 * Simple hash function for content-based ID generation
 */
function hashContent(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Validate that a fund model has minimum required data
 */
export function validateFundModel(fund) {
  const errors = [];
  const warnings = [];
  
  if (!fund.assetAllocation && !fund.performance) {
    errors.push('Fund must have at least one report type parsed');
  }
  
  if (!fund.classification || fund.classification.classification === 'unknown') {
    if (!fund.assetAllocation) {
      warnings.push('Cannot classify fund without asset allocation data');
    } else {
      warnings.push('Fund classification could not be determined');
    }
  }
  
  if (fund.performance && !fund.benchmarkComparison) {
    warnings.push('Benchmark comparison not available');
  }
  
  // Check for dashboard-critical fields
  if (fund.assetAllocation) {
    if (!fund.assetAllocation.totalValue || fund.assetAllocation.totalValue <= 0) {
      warnings.push('Total portfolio value is missing or zero');
    }
    if (!fund.assetAllocation.assetClasses || fund.assetAllocation.assetClasses.length === 0) {
      warnings.push('Asset class breakdown is missing');
    }
  }
  
  if (fund.performance) {
    if (fund.performance.dollarReturn === null) {
      warnings.push('Dollar return figure is missing');
    }
    if (!fund.performance.twr || fund.performance.twr.oneYear === null) {
      warnings.push('1-year TWR is missing');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    hasAssetAllocation: !!fund.assetAllocation,
    hasPerformance: !!fund.performance,
    isComplete: !!fund.assetAllocation && !!fund.performance,
  };
}

/**
 * Merge new report data into an existing fund model
 */
export function updateFundModel(existingFund, newReportType, newReportData) {
  const updates = { ...existingFund };
  
  if (newReportType === 'asset_allocation') {
    const totalValue = newReportData.totalValue || 0;
    updates.assetAllocation = {
      asAtDate: newReportData.asAtDate,
      totalValue: totalValue,
      assetClasses: normalizeAssetClasses(newReportData.assetClasses, totalValue),
      holdings: newReportData.holdings || [],
      holdingsCount: newReportData.holdingsCount || (newReportData.holdings?.length || 0),
    };
  } else if (newReportType === 'performance') {
    updates.performance = {
      period: normalizePeriod(newReportData.period),
      startingValue: newReportData.startingMarketValue ?? newReportData.startingValue ?? null,
      endingValue: newReportData.endingMarketValue ?? newReportData.endingValue ?? null,
      dollarReturn: newReportData.dollarReturnAfterExpenses ?? newReportData.dollarReturn ?? null,
      twr: normalizePerformanceTwr(newReportData.twr),
    };
  }
  
  // Re-run analysis with updated data
  const analysis = analyzeFund(updates.assetAllocation, updates.performance);
  
  updates.lastUpdated = new Date().toISOString();
  updates.classification = {
    classification: analysis.classification?.classification || 'unknown',
    growthPercent: analysis.classification?.growthPercent ?? 0,
    defensivePercent: analysis.classification?.defensivePercent ?? 0,
    otherPercent: analysis.classification?.otherPercent ?? 0,
  };
  updates.benchmark = analysis.benchmark ? {
    name: analysis.benchmark.name || 'Benchmark',
    description: analysis.benchmark.description || '',
    composition: analysis.benchmark.composition || null,
    riskLevel: analysis.benchmark.riskLevel || null,
  } : null;
  updates.benchmarkComparison = analysis.benchmarkComparison || null;
  updates.performanceScore = analysis.performanceScore;
  updates.derivedInsights = analysis.insights || [];
  updates.analysisStatus = analysis.status || 'unknown';
  updates.analysisMessage = analysis.message || null;
  
  return updates;
}

/**
 * Get summary statistics for display
 * Used for quick access to key metrics without traversing the full model
 */
export function getFundSummary(fund) {
  // Calculate total value - prefer asset allocation, fallback to performance
  const totalValue = fund.assetAllocation?.totalValue || fund.performance?.endingValue || null;
  
  // Get classification data with defaults
  const classification = fund.classification?.classification || 'unknown';
  const growthPercent = fund.classification?.growthPercent ?? 0;
  const defensivePercent = fund.classification?.defensivePercent ?? 0;
  
  // Get performance metrics
  const oneYearReturn = fund.performance?.twr?.oneYear ?? null;
  const dollarReturn = fund.performance?.dollarReturn ?? null;
  
  // Get benchmark comparison
  const oneYearDiff = fund.benchmarkComparison?.oneYear?.difference ?? null;
  
  return {
    // Core values
    totalValue,
    classification,
    growthPercent,
    defensivePercent,
    
    // Performance
    oneYearReturn,
    dollarReturn,
    performanceScore: fund.performanceScore,
    
    // Benchmark
    benchmarkName: fund.benchmark?.name || null,
    oneYearVsBenchmark: oneYearDiff,
    
    // Holdings
    holdingsCount: fund.assetAllocation?.holdingsCount || 0,
    assetClassCount: fund.assetAllocation?.assetClasses?.length || 0,
    
    // Status flags
    hasAssetAllocation: !!fund.assetAllocation,
    hasPerformance: !!fund.performance,
    hasAllData: !!fund.assetAllocation && !!fund.performance,
    
    // Dates
    asAtDate: fund.assetAllocation?.asAtDate || null,
    periodStart: fund.performance?.period?.start || null,
    periodEnd: fund.performance?.period?.end || null,
  };
}

/**
 * Create an empty fund model for initial state
 * Useful for UI initialization before data is loaded
 */
export function createEmptyFundModel(fundId = null) {
  return {
    fundId: fundId || `FUND-${Date.now()}-empty`,
    lastUpdated: new Date().toISOString(),
    assetAllocation: null,
    performance: null,
    classification: {
      classification: 'unknown',
      growthPercent: 0,
      defensivePercent: 0,
      otherPercent: 0,
    },
    benchmark: null,
    benchmarkComparison: null,
    performanceScore: null,
    derivedInsights: [],
    analysisStatus: 'empty',
    analysisMessage: 'No reports uploaded. Please upload asset allocation and/or performance reports.',
  };
}