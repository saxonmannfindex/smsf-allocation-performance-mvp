/**
 * Performance Analysis Engine
 *
 * Analyzes fund performance metrics including:
 * - Comparison to benchmarks
 * - Risk classification
 * - Performance scoring
 */

import {
  BENCHMARKS,
  PERFORMANCE_THRESHOLDS,
  CLASSIFICATION_THRESHOLDS,
  GROWTH_ASSET_CLASSES,
  DEFENSIVE_ASSET_CLASSES,
} from '../utils/constants.js';

/**
 * Helpers
 */
function toNumber(x) {
  const n = typeof x === 'number' ? x : Number(x);
  return Number.isFinite(n) ? n : 0;
}

function safePercent(n) {
  return Number.isFinite(n) ? n : 0;
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Classify a fund based on its asset allocation (VALUE-BASED)
 *
 * @param {Array} assetClasses - Array of asset class objects with name and value
 * @returns {{classification: string, growthPercent: number, defensivePercent: number, otherPercent: number}}
 */
export function classifyFund(assetClasses = []) {
  if (!Array.isArray(assetClasses) || assetClasses.length === 0) {
    return {
      classification: 'unknown',
      growthPercent: 0,
      defensivePercent: 0,
      otherPercent: 0,
    };
  }

  const totalValue = assetClasses.reduce((sum, ac) => sum + toNumber(ac?.value), 0);

  // If we don't have values, we cannot classify reliably.
  if (totalValue <= 0) {
    return {
      classification: 'unknown',
      growthPercent: 0,
      defensivePercent: 0,
      otherPercent: 0,
    };
  }

  const growthValue = assetClasses
    .filter(ac => GROWTH_ASSET_CLASSES.includes(ac?.name))
    .reduce((sum, ac) => sum + toNumber(ac?.value), 0);

  const defensiveValue = assetClasses
    .filter(ac => DEFENSIVE_ASSET_CLASSES.includes(ac?.name))
    .reduce((sum, ac) => sum + toNumber(ac?.value), 0);

  const growthPercent = (growthValue / totalValue) * 100;
  const defensivePercent = (defensiveValue / totalValue) * 100;
  const otherPercent = Math.max(0, 100 - growthPercent - defensivePercent);

  let classification = 'balanced';
  if (growthPercent < CLASSIFICATION_THRESHOLDS.DEFENSIVE_MAX) {
    classification = 'defensive';
  } else if (growthPercent > CLASSIFICATION_THRESHOLDS.GROWTH_MIN) {
    classification = 'growth';
  }

  return {
    classification,
    growthPercent: round1(safePercent(growthPercent)),
    defensivePercent: round1(safePercent(defensivePercent)),
    otherPercent: round1(safePercent(otherPercent)),
  };
}

/**
 * Get the appropriate benchmark for a fund classification
 *
 * @param {string} classification - defensive/balanced/growth
 * @returns {Object} Benchmark data
 */
export function getBenchmark(classification) {
  const key = typeof classification === 'string' ? classification : 'balanced';
  return BENCHMARKS[key] ?? BENCHMARKS.balanced;
}

/**
 * Compare fund performance to its benchmark
 *
 * @param {Object} fundPerformance - Fund's TWR values { oneYear, threeYears, sinceStart }
 * @param {Object} benchmark - Benchmark data
 * @returns {Object} Comparison results
 */
export function compareToBenchmark(fundPerformance, benchmark) {
  const comparisons = {
    oneYear: null,
    threeYears: null,
    sinceInception: null,
  };

  if (!fundPerformance || !benchmark?.returns) return comparisons;

  const oneYear = fundPerformance.oneYear;
  const threeYears = fundPerformance.threeYears;
  const sinceStart = fundPerformance.sinceStart;

  if (oneYear !== null && oneYear !== undefined && benchmark.returns.oneYear !== undefined) {
    const diff = oneYear - benchmark.returns.oneYear;
    comparisons.oneYear = {
      fundReturn: oneYear,
      benchmarkReturn: benchmark.returns.oneYear,
      difference: diff,
      status: getPerformanceStatus(diff),
    };
  }

  if (threeYears !== null && threeYears !== undefined && benchmark.returns.threeYears !== undefined) {
    const diff = threeYears - benchmark.returns.threeYears;
    comparisons.threeYears = {
      fundReturn: threeYears,
      benchmarkReturn: benchmark.returns.threeYears,
      difference: diff,
      status: getPerformanceStatus(diff),
    };
  }

  // Use sinceStart as "since inception" proxy
  if (sinceStart !== null && sinceStart !== undefined && benchmark.returns.sinceInception !== undefined) {
    const diff = sinceStart - benchmark.returns.sinceInception;
    comparisons.sinceInception = {
      fundReturn: sinceStart,
      benchmarkReturn: benchmark.returns.sinceInception,
      difference: diff,
      status: getPerformanceStatus(diff),
    };
  }

  return comparisons;
}

/**
 * Determine performance status based on difference from benchmark
 */
function getPerformanceStatus(difference) {
  if (difference >= PERFORMANCE_THRESHOLDS.STRONG_OUTPERFORMANCE) return 'strong_outperformance';
  if (difference >= PERFORMANCE_THRESHOLDS.SLIGHT_OUTPERFORMANCE) return 'slight_outperformance';
  if (difference >= PERFORMANCE_THRESHOLDS.SLIGHT_UNDERPERFORMANCE) return 'inline';
  if (difference >= PERFORMANCE_THRESHOLDS.STRONG_UNDERPERFORMANCE) return 'slight_underperformance';
  return 'strong_underperformance';
}

/**
 * Analyze complete fund data including allocation and performance
 *
 * IMPORTANT:
 * - If allocation is missing, return a partial analysis (don’t pretend we classified).
 *
 * @param {Object|null} assetAllocation - Parsed asset allocation data
 * @param {Object|null} performance - Parsed performance data
 * @returns {Object} Complete analysis results
 */
export function analyzeFund(assetAllocation, performance) {
  const hasAllocation = !!assetAllocation && Array.isArray(assetAllocation.assetClasses) && assetAllocation.assetClasses.length > 0;
  const hasPerformance = !!performance && !!performance.twr;

  const classification = hasAllocation
    ? classifyFund(assetAllocation.assetClasses)
    : { classification: 'unknown', growthPercent: 0, defensivePercent: 0, otherPercent: 0 };

  const benchmark = getBenchmark(classification.classification);

  const fundPerf = hasPerformance
    ? {
        oneYear: performance.twr.oneYear ?? null,
        threeYears: performance.twr.threeYears ?? null,
        sinceStart: performance.twr.sinceStart ?? null,
      }
    : null;

  const benchmarkComparison = fundPerf ? compareToBenchmark(fundPerf, benchmark) : null;

  const performanceScore = calculatePerformanceScore(performance, benchmarkComparison);

  const insights = generateInsights(assetAllocation, performance, classification, benchmarkComparison, {
    hasAllocation,
    hasPerformance,
  });

  // Keep same return shape your UI expects
  return {
    classification,
    benchmark: {
      name: benchmark.name,
      description: benchmark.description,
      composition: benchmark.composition,
      riskLevel: benchmark.riskLevel,
    },
    benchmarkComparison,
    performanceScore,
    insights,
    // extra fields are safe; UI can ignore if not used
    status: hasAllocation && hasPerformance ? 'complete' : 'partial',
    message:
      hasAllocation && hasPerformance
        ? null
        : 'Upload both reports for complete analysis. Cannot classify fund without asset allocation data.',
  };
}

/**
 * Calculate an overall performance score
 */
function calculatePerformanceScore(performance, comparison) {
  if (!performance || !comparison) return null;

  let score = 50;

  if (comparison.oneYear) {
    const diff = comparison.oneYear.difference;
    score += Math.min(Math.max(diff * 5, -25), 25);
  }

  const oneYear = performance.twr?.oneYear;
  if (oneYear !== null && oneYear !== undefined) {
    if (oneYear >= PERFORMANCE_THRESHOLDS.EXCELLENT_RETURN) score += 15;
    else if (oneYear >= PERFORMANCE_THRESHOLDS.GOOD_RETURN) score += 10;
    else if (oneYear >= PERFORMANCE_THRESHOLDS.MODERATE_RETURN) score += 5;
    else if (oneYear < PERFORMANCE_THRESHOLDS.POOR_RETURN) score -= 10;
  }

  return Math.min(Math.max(Math.round(score), 0), 100);
}

/**
 * Generate human-readable insights about the fund
 */
function generateInsights(assetAllocation, performance, classification, comparison, flags) {
  const insights = [];

  // If allocation is missing, show a clear diagnostic insight (helps debugging + user clarity)
  if (!flags?.hasAllocation) {
    insights.push({
      type: 'data',
      title: 'Asset Allocation Missing',
      description:
        'Asset allocation data was not detected. Please upload the Investment Allocation report to enable classification and allocation insights.',
      importance: 'high',
    });
  }

  // Classification insight (null-safe)
  if (classification?.classification && classification.classification !== 'unknown') {
    const classLabel =
      classification.classification.charAt(0).toUpperCase() + classification.classification.slice(1);

    const growthText =
      typeof classification.growthPercent === 'number' && Number.isFinite(classification.growthPercent)
        ? `${classification.growthPercent.toFixed(1)}%`
        : 'N/A';

    insights.push({
      type: 'classification',
      title: `${classLabel} Investment Profile`,
      description: `With ${growthText} in growth assets, this fund follows a ${classification.classification} strategy.`,
      importance: 'high',
    });
  }

  // Performance vs benchmark insight
  if (comparison?.oneYear) {
    const diff = comparison.oneYear.difference;
    const status = comparison.oneYear.status;

    let description;
    if (status.includes('outperformance')) {
      description = `The fund outperformed its benchmark by ${Math.abs(diff).toFixed(2)}% over the past year.`;
    } else if (status === 'inline') {
      description = `The fund performed in line with its benchmark over the past year.`;
    } else {
      description = `The fund underperformed its benchmark by ${Math.abs(diff).toFixed(2)}% over the past year.`;
    }

    insights.push({
      type: 'performance',
      title: 'Benchmark Comparison',
      description,
      importance: status.includes('strong') ? 'high' : 'medium',
    });
  }

  // Concentration insight (only if holdings exist)
  if (assetAllocation?.holdings && Array.isArray(assetAllocation.holdings)) {
    const topHoldings = [...assetAllocation.holdings]
      .sort((a, b) => toNumber(b?.value) - toNumber(a?.value))
      .slice(0, 5);

    if (topHoldings.length > 0 && toNumber(assetAllocation.totalValue) > 0) {
      const top5Value = topHoldings.reduce((sum, h) => sum + toNumber(h?.value), 0);
      const top5Percent = (top5Value / toNumber(assetAllocation.totalValue)) * 100;

      if (top5Percent > 40) {
        insights.push({
          type: 'concentration',
          title: 'Portfolio Concentration',
          description: `The top 5 holdings represent ${top5Percent.toFixed(1)}% of the portfolio. Consider reviewing diversification.`,
          importance: 'medium',
        });
      }
    }
  }

  // Dollar return insight — your parsed JSON uses `dollarReturn`, not `dollarReturnAfterExpenses`
  const dollarReturn =
    performance?.dollarReturnAfterExpenses ?? performance?.dollarReturn ?? null;

  if (dollarReturn !== null && dollarReturn !== undefined) {
    const isPositive = dollarReturn > 0;
    insights.push({
      type: 'return',
      title: 'Total Dollar Return',
      description: `The fund ${isPositive ? 'gained' : 'lost'} $${Math.abs(dollarReturn).toLocaleString()} during the reporting period.`,
      importance: 'high',
    });
  }

  return insights;
}

/**
 * Get classification badge styling
 */
export function getClassificationStyle(classification) {
  const styles = {
    defensive: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: '🛡️',
    },
    balanced: {
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-200',
      icon: '⚖️',
    },
    growth: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: '📈',
    },
    unknown: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      icon: '❓',
    },
  };

  return styles[classification] || styles.unknown;
}
