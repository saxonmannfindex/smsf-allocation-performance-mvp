/**
 * Constants for SMSF Intelligence Platform
 * Contains benchmarks, thresholds, and classification rules
 */

// ============================================================================
// FUND CLASSIFICATION THRESHOLDS
// ============================================================================

/**
 * Classification is based on Growth Assets percentage (Equities + Property)
 * - Defensive: < 30% growth assets
 * - Balanced: 30-70% growth assets  
 * - Growth: > 70% growth assets
 */
export const CLASSIFICATION_THRESHOLDS = {
  DEFENSIVE_MAX: 30,  // Less than 30% = Defensive
  GROWTH_MIN: 70,     // More than 70% = Growth
  // Between 30-70% = Balanced
};

/**
 * Asset classes considered as "Growth" assets for classification
 */
export const GROWTH_ASSET_CLASSES = [
  'Australian Equities',
  'International Equities',
  'Listed Property',
  'Direct Property',
];

/**
 * Asset classes considered as "Defensive" assets for classification
 */
export const DEFENSIVE_ASSET_CLASSES = [
  'Australian Fixed Interest',
  'International Fixed Interest',
  'Cash',
  'Foreign Cash',
  'Mortgages',
];

// ============================================================================
// BENCHMARK SETS BY CLASSIFICATION
// ============================================================================

/**
 * Benchmarks are hypothetical returns for comparison purposes
 * These would typically come from actual index data in production
 */
export const BENCHMARKS = {
  defensive: {
    name: 'Conservative Benchmark',
    description: 'Weighted average of defensive asset indices',
    composition: '70% Fixed Interest, 20% Cash, 10% Equities',
    returns: {
      oneYear: 5.5,
      threeYears: 4.2,
      fiveYears: 3.8,
      sinceInception: 4.0,
    },
    riskLevel: 'Low',
    volatility: 3.5, // Standard deviation percentage
  },
  balanced: {
    name: 'Balanced Benchmark',
    description: 'Diversified multi-asset benchmark',
    composition: '50% Equities, 30% Fixed Interest, 15% Property, 5% Cash',
    returns: {
      oneYear: 8.5,
      threeYears: 6.8,
      fiveYears: 7.2,
      sinceInception: 7.0,
    },
    riskLevel: 'Medium',
    volatility: 8.5,
  },
  growth: {
    name: 'Growth Benchmark',
    description: 'High equity exposure benchmark',
    composition: '80% Equities, 10% Property, 10% Other',
    returns: {
      oneYear: 11.5,
      threeYears: 9.2,
      fiveYears: 10.5,
      sinceInception: 9.8,
    },
    riskLevel: 'High',
    volatility: 14.0,
  },
};

// ============================================================================
// PERFORMANCE THRESHOLDS
// ============================================================================

/**
 * Thresholds for determining performance quality
 */
export const PERFORMANCE_THRESHOLDS = {
  // Outperformance vs benchmark (percentage points)
  STRONG_OUTPERFORMANCE: 2.0,
  SLIGHT_OUTPERFORMANCE: 0.5,
  SLIGHT_UNDERPERFORMANCE: -0.5,
  STRONG_UNDERPERFORMANCE: -2.0,
  
  // Absolute return thresholds
  EXCELLENT_RETURN: 15.0,
  GOOD_RETURN: 8.0,
  MODERATE_RETURN: 4.0,
  POOR_RETURN: 0.0,
};

// ============================================================================
// REPORT TYPE IDENTIFIERS
// ============================================================================

/**
 * Text patterns used to identify report types
 * These are case-insensitive fingerprints found in the PDF text
 */

export const REPORT_FINGERPRINTS = {
  ASSET_ALLOCATION: [
    'investment allocation',
    'asset allocation',
    'allocation as at',
    'current allocation',
    'australian equities',
    'international equities',
    'fixed interest',
    'listed property',
    'cash',
  ],

  PERFORMANCE: [
    'investment movement',
    'movement and returns',
    'time weighted',
    'time weighted return',
    'twr',
    'opening balance',
    'closing balance',
    'net return',
  ],
};



// ============================================================================
// UI MESSAGES
// ============================================================================

export const UI_MESSAGES = {
  UPLOAD: {
    IDLE: 'Drag and drop your PDF report here, or click to browse',
    DRAGGING: 'Drop your PDF here',
    PROCESSING: 'Processing PDF...',
    SUCCESS: 'Report parsed successfully',
    ERROR: 'Failed to parse PDF',
  },
  VALIDATION: {
    INVALID_FILE_TYPE: 'Please upload a PDF file',
    EMPTY_FILE: 'The uploaded file appears to be empty',
    UNRECOGNIZED_FORMAT: 'Could not recognize this report format',
    PARSE_ERROR: 'Failed to extract data from PDF',
  },
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULTS = {
  // Minimum characters required in extracted PDF text
  MIN_TEXT_LENGTH: 100,
  
  // Number formatting
  DECIMAL_PLACES: 2,
  CURRENCY: 'AUD',
  
  // Date format expected from reports (DD/MM/YYYY)
  DATE_FORMAT_REGEX: /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
};
