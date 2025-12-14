// PRESENTATION-GRADE FINANCIAL DASHBOARD
// Designed for: Executive board decks, screenshots, presentations
// Aesthetic: Dark luxury with refined typography and bold data emphasis
// 
// REFACTORED: All displayed values are now derived from the fund model.
// No hard-coded numbers - the dashboard dynamically reflects parsed report data.

/**
 * Format a number as currency with appropriate suffix (K, M, B)
 */
function formatCurrencyCompact(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000).toFixed(2)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(2)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}$${Math.round(absValue / 1_000)}K`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
}

/**
 * Format large currency for hero display (split into number and suffix)
 */
function formatHeroCurrency(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { number: '—', suffix: '' };
  }
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000_000) {
    return { number: `${sign}$${(absValue / 1_000_000_000).toFixed(2)}`, suffix: 'B' };
  }
  if (absValue >= 1_000_000) {
    return { number: `${sign}$${(absValue / 1_000_000).toFixed(2)}`, suffix: 'M' };
  }
  if (absValue >= 1_000) {
    return { number: `${sign}$${Math.round(absValue / 1_000)}`, suffix: 'K' };
  }
  return { number: `${sign}$${absValue.toFixed(0)}`, suffix: '' };
}

/**
 * Format a percentage with sign
 */
function formatPercent(value, decimals = 2, showSign = false) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a date string for display
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date for short period display (e.g., "Jul 2025")
 */
function formatPeriodDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get risk level label from classification
 */
function getRiskLevel(classification) {
  const levels = {
    defensive: 'Low Risk',
    balanced: 'Medium Risk',
    growth: 'High Risk',
    unknown: '—'
  };
  return levels[classification] || '—';
}

/**
 * Get fund title based on classification
 */
function getFundTitle(classification) {
  const titles = {
    defensive: 'Defensive Income Fund',
    balanced: 'Balanced Growth Fund',
    growth: 'Growth Strategy Fund',
    unknown: 'Investment Portfolio'
  };
  return titles[classification] || 'Investment Portfolio';
}

/**
 * Asset class color mapping
 */
const ASSET_CLASS_COLORS = {
  'Australian Equities': '#4299e1',
  'Australian Fixed Interest': '#48bb78',
  'Cash': '#ecc94b',
  'International Equities': '#9f7aea',
  'Listed Property': '#ed8936',
  'Other': '#718096',
  'Unknown': '#a0aec0'
};

/**
 * Asset class short labels for display
 */
const ASSET_CLASS_LABELS = {
  'Australian Equities': 'AU Equities',
  'Australian Fixed Interest': 'Fixed Interest',
  'Cash': 'Cash',
  'International Equities': 'Intl Equities',
  'Listed Property': 'Property',
  'Other': 'Other',
  'Unknown': 'Unknown'
};

/**
 * Calculate bar height based on percentage (for benchmark comparison)
 * Maps percentage to pixel height, with a baseline for visibility
 */
function calcBarHeight(percent, maxHeight = 100) {
  if (percent === null || percent === undefined || !Number.isFinite(percent)) {
    return 0;
  }
  // Scale: 0% = 0px, ~15% = maxHeight
  const scaled = Math.min(Math.abs(percent) / 15 * maxHeight, maxHeight);
  return Math.max(scaled, 10); // minimum 10px for visibility
}

export default function FinancialDashboard({ fund }) {
  // === EXTRACT ALL DATA FROM FUND MODEL ===
  
  // Classification data
  const classification = fund?.classification?.classification || 'unknown';
  const growthPercent = fund?.classification?.growthPercent ?? 0;
  const defensivePercent = fund?.classification?.defensivePercent ?? 0;
  const otherPercent = fund?.classification?.otherPercent ?? 0;
  
  // Asset allocation data
  const totalValue = fund?.assetAllocation?.totalValue || fund?.performance?.endingValue || null;
  const assetClasses = fund?.assetAllocation?.assetClasses || [];
  const asAtDate = fund?.assetAllocation?.asAtDate || null;
  
  // Performance data
  const dollarReturn = fund?.performance?.dollarReturn || null;
  const periodStart = fund?.performance?.period?.start || null;
  const periodEnd = fund?.performance?.period?.end || null;
  const oneYearReturn = fund?.performance?.twr?.oneYear ?? null;
  const threeYearsReturn = fund?.performance?.twr?.threeYears ?? null;
  const sinceStartReturn = fund?.performance?.twr?.sinceStart ?? null;
  
  // Benchmark data
  const benchmarkName = fund?.benchmark?.name || 'Benchmark';
  const benchmarkComparison = fund?.benchmarkComparison || {};
  
  // Performance score
  const performanceScore = fund?.performanceScore ?? null;
  
  // Fund metadata
  const fundId = fund?.fundId || '—';
  const lastUpdated = fund?.lastUpdated || null;
  
  // Derived insights
  const derivedInsights = fund?.derivedInsights || [];
  
  // === COMPUTED VALUES FOR DISPLAY ===
  
  // Hero currency display
  const heroTotal = formatHeroCurrency(totalValue);
  const heroDollarReturn = formatHeroCurrency(dollarReturn);
  
  // Period string
  const periodString = periodStart && periodEnd 
    ? `${formatPeriodDate(periodStart)} – ${formatPeriodDate(periodEnd)}`
    : '—';
  
  // Benchmark comparison values
  const oneYearBenchmark = benchmarkComparison?.oneYear?.benchmarkReturn ?? null;
  const oneYearDiff = benchmarkComparison?.oneYear?.difference ?? null;
  const sinceInceptionBenchmark = benchmarkComparison?.sinceInception?.benchmarkReturn ?? null;
  const sinceInceptionDiff = benchmarkComparison?.sinceInception?.difference ?? null;
  
  // Performance score for conic gradient (clamp between 0-100)
  const scorePercent = performanceScore !== null ? Math.min(Math.max(performanceScore, 0), 100) : 0;
  
  // Prepare asset class data for visualization
  const sortedAssetClasses = [...assetClasses]
    .filter(ac => ac.value && ac.value > 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
  
  // Calculate percentages for asset classes
  const assetClassesWithPercent = sortedAssetClasses.map(ac => {
    const percent = totalValue > 0 ? (ac.value / totalValue) * 100 : 0;
    return {
      ...ac,
      percent: percent,
      color: ASSET_CLASS_COLORS[ac.name] || '#718096',
      label: ASSET_CLASS_LABELS[ac.name] || ac.name
    };
  });
  
  // Top asset classes for the bar chart (show top 4 in main bar, rest in legend)
  const topAssetClasses = assetClassesWithPercent.slice(0, 4);
  const allAssetClassesForLegend = assetClassesWithPercent.slice(0, 6);
  
  // Generate dynamic insights for the insights panel
  const displayInsights = generateDisplayInsights({
    classification,
    growthPercent,
    oneYearDiff,
    dollarReturn
  });

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background:
          'linear-gradient(165deg, #0a0a0f 0%, #12121a 50%, #0d0d14 100%)',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        color: '#ffffff',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          padding: '48px 56px',
          maxWidth: '1600px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >

        {/* Ambient glow effects */}
        <div style={{
          position: 'absolute',
          top: '-200px',
          right: '-100px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 179, 237, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-300px',
          left: '-200px',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(72, 187, 120, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: HEADER - Fund Identity & Performance Score
            ═══════════════════════════════════════════════════════════════════ */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '56px',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Fund Analytics Report
            </div>
            <h1 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '42px',
              fontWeight: '600',
              margin: 0,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {getFundTitle(classification)}
            </h1>
            <div style={{
              marginTop: '12px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              As of {asAtDate ? formatDate(asAtDate) : (periodEnd ? formatDate(periodEnd) : '—')}
            </div>
          </div>

          {/* Performance Score - Large visual emphasis */}
          <div style={{
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: performanceScore !== null 
                ? `conic-gradient(from 0deg, #48bb78 0%, #38a169 ${scorePercent}%, rgba(255,255,255,0.08) ${scorePercent}%)`
                : 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: '#0d0d14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: '48px',
                  fontWeight: '700',
                  lineHeight: 1
                }}>{performanceScore !== null ? performanceScore : '—'}</span>
              </div>
            </div>
            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)'
            }}>
              Performance Score
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: PRIMARY KPIs - Hero Numbers
            Large, unmissable metrics for executive focus
            ═══════════════════════════════════════════════════════════════════ */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '32px',
          marginBottom: '56px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Total Portfolio Value */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: '20px',
            padding: '36px 40px',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '16px'
            }}>
              Total Portfolio Value
            </div>
            <div style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '52px',
              fontWeight: '600',
              letterSpacing: '-1px',
              lineHeight: 1
            }}>
              {heroTotal.number}<span style={{ fontSize: '32px', color: 'rgba(255,255,255,0.6)' }}>{heroTotal.suffix}</span>
            </div>
          </div>

          {/* Dollar Return */}
          <div style={{
            background: dollarReturn !== null && dollarReturn >= 0
              ? 'linear-gradient(145deg, rgba(72, 187, 120, 0.15) 0%, rgba(72, 187, 120, 0.05) 100%)'
              : 'linear-gradient(145deg, rgba(245, 101, 101, 0.15) 0%, rgba(245, 101, 101, 0.05) 100%)',
            borderRadius: '20px',
            padding: '36px 40px',
            border: dollarReturn !== null && dollarReturn >= 0
              ? '1px solid rgba(72, 187, 120, 0.25)'
              : '1px solid rgba(245, 101, 101, 0.25)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: dollarReturn !== null && dollarReturn >= 0
                ? 'rgba(72, 187, 120, 0.8)'
                : 'rgba(245, 101, 101, 0.8)',
              marginBottom: '16px'
            }}>
              Period Return
            </div>
            <div style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '52px',
              fontWeight: '600',
              letterSpacing: '-1px',
              lineHeight: 1,
              color: dollarReturn !== null && dollarReturn >= 0 ? '#48bb78' : '#f56565'
            }}>
              {dollarReturn !== null ? (dollarReturn >= 0 ? '+' : '') : ''}{heroDollarReturn.number}{heroDollarReturn.suffix}
            </div>
            <div style={{
              marginTop: '12px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.5)'
            }}>
              {periodString}
            </div>
          </div>

          {/* 1-Year Return */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(99, 179, 237, 0.12) 0%, rgba(99, 179, 237, 0.04) 100%)',
            borderRadius: '20px',
            padding: '36px 40px',
            border: '1px solid rgba(99, 179, 237, 0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(99, 179, 237, 0.8)',
              marginBottom: '16px'
            }}>
              1-Year Return
            </div>
            <div style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '52px',
              fontWeight: '600',
              letterSpacing: '-1px',
              lineHeight: 1,
              color: '#63b3ed'
            }}>
              {oneYearReturn !== null ? (oneYearReturn >= 0 ? '+' : '') : ''}{formatPercent(oneYearReturn, 2, false).replace('%', '')}<span style={{ fontSize: '28px' }}>%</span>
            </div>
            <div style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {oneYearDiff !== null && (
                <span style={{
                  background: oneYearDiff >= 0 ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)',
                  color: oneYearDiff >= 0 ? '#48bb78' : '#f56565',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {formatPercent(oneYearDiff, 2, true)} vs benchmark
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: MIDDLE ROW - Allocation & Benchmark Comparison
            Visual data representations
            ═══════════════════════════════════════════════════════════════════ */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '32px',
          marginBottom: '56px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Asset Allocation Chart */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '20px',
            padding: '32px 36px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '28px'
            }}>
              Asset Allocation
            </div>
            
            {/* Horizontal bar visualization */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'flex',
                height: '48px',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                {topAssetClasses.length > 0 ? (
                  topAssetClasses.map((ac, i) => (
                    <div 
                      key={ac.name}
                      style={{ 
                        width: `${ac.percent}%`, 
                        background: `linear-gradient(135deg, ${ac.color}, ${adjustColor(ac.color, -20)})`,
                        position: 'relative' 
                      }}
                    >
                      {ac.percent > 8 && (
                        <span style={{ 
                          position: 'absolute', 
                          left: '12px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          fontSize: '13px', 
                          fontWeight: '600' 
                        }}>
                          {ac.percent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    width: '100%', 
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '13px'
                  }}>
                    No allocation data
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              {allAssetClassesForLegend.length > 0 ? (
                allAssetClassesForLegend.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      background: item.color
                    }} />
                    <div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{item.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatCurrencyCompact(item.value)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: 'span 3', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                  Upload asset allocation report for breakdown
                </div>
              )}
            </div>
          </div>

          {/* Benchmark Comparison */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '20px',
            padding: '32px 36px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '28px'
            }}>
              vs {benchmarkName}
            </div>

            {/* 1-Year Comparison */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>1 Year</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '8px' }}>
                    {/* Fund bar */}
                    <div style={{
                      height: `${calcBarHeight(oneYearReturn, 80)}px`,
                      width: '48px',
                      background: oneYearReturn !== null && oneYearReturn >= 0 
                        ? 'linear-gradient(180deg, #48bb78 0%, #38a169 100%)'
                        : 'linear-gradient(180deg, #f56565 0%, #c53030 100%)',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '-28px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: oneYearReturn !== null && oneYearReturn >= 0 ? '#48bb78' : '#f56565'
                      }}>{formatPercent(oneYearReturn, 2)}</span>
                    </div>
                    {/* Benchmark bar */}
                    <div style={{
                      height: `${calcBarHeight(oneYearBenchmark, 80)}px`,
                      width: '48px',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '-28px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'rgba(255,255,255,0.6)'
                      }}>{formatPercent(oneYearBenchmark, 2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ width: '48px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Fund</span>
                    <span style={{ width: '48px', fontSize: '10px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Bench</span>
                  </div>
                </div>
                {oneYearDiff !== null && (
                  <div style={{
                    background: oneYearDiff >= 0 ? 'rgba(72, 187, 120, 0.15)' : 'rgba(245, 101, 101, 0.15)',
                    border: oneYearDiff >= 0 ? '1px solid rgba(72, 187, 120, 0.3)' : '1px solid rgba(245, 101, 101, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '10px', color: oneYearDiff >= 0 ? 'rgba(72, 187, 120, 0.8)' : 'rgba(245, 101, 101, 0.8)', marginBottom: '4px' }}>ALPHA</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: oneYearDiff >= 0 ? '#48bb78' : '#f56565' }}>{formatPercent(oneYearDiff, 2, true)}</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: BOTTOM ROW - Risk Profile & Key Insights
            ═══════════════════════════════════════════════════════════════════ */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '0.7fr 1.3fr',
          gap: '32px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Risk Profile */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '20px',
            padding: '32px 36px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '24px'
            }}>
              Risk Profile
            </div>
            
            {/* Growth vs Defensive visual */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                height: '12px',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <div style={{ width: `${growthPercent}%`, background: 'linear-gradient(90deg, #4299e1, #63b3ed)' }} />
                <div style={{ width: `${defensivePercent}%`, background: 'linear-gradient(90deg, #48bb78, #68d391)' }} />
                {otherPercent > 0 && <div style={{ width: `${otherPercent}%`, background: '#718096' }} />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#63b3ed' }}>Growth {formatPercent(growthPercent, 1)}</span>
                <span style={{ color: '#68d391' }}>Defensive {formatPercent(defensivePercent, 1)}</span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '16px 20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Classification</div>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>{capitalize(classification)}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{getRiskLevel(classification)}</div>
            </div>
          </div>

          {/* Key Insights */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
            borderRadius: '20px',
            padding: '32px 36px',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '24px'
            }}>
              Key Insights
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {displayInsights.map((insight, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '14px',
                  padding: '20px',
                  borderLeft: `3px solid ${insight.accent}`
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>{insight.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>{insight.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{insight.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            Fund ID: {fundId}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            Last updated: {lastUpdated ? formatDate(lastUpdated) : '—'} • Confidential
          </div>
        </footer>

        {/* Google Fonts Import */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        `}</style>

      </div>
    </div>
  );
}

/**
 * Generate display insights based on fund data
 * Returns exactly 3 insights for the UI grid
 */
function generateDisplayInsights({ classification, growthPercent, oneYearDiff, dollarReturn }) {
  const insights = [];
  
  // Insight 1: Strategy classification
  if (classification && classification !== 'unknown') {
    const strategyIcons = { defensive: '🛡️', balanced: '📊', growth: '🚀' };
    const strategyTitles = { defensive: 'Defensive Strategy', balanced: 'Balanced Strategy', growth: 'Growth Strategy' };
    insights.push({
      icon: strategyIcons[classification] || '📊',
      title: strategyTitles[classification] || 'Investment Strategy',
      desc: growthPercent > 0 ? `${growthPercent.toFixed(1)}% growth allocation` : 'Classification determined',
      accent: '#63b3ed'
    });
  } else {
    insights.push({
      icon: '📋',
      title: 'Awaiting Data',
      desc: 'Upload allocation report',
      accent: '#718096'
    });
  }
  
  // Insight 2: Performance vs benchmark
  if (oneYearDiff !== null) {
    const isOutperforming = oneYearDiff >= 0;
    insights.push({
      icon: isOutperforming ? '🏆' : '📉',
      title: isOutperforming ? 'Strong Outperformance' : 'Below Benchmark',
      desc: `${oneYearDiff >= 0 ? '+' : ''}${oneYearDiff.toFixed(2)}% vs benchmark`,
      accent: isOutperforming ? '#48bb78' : '#f56565'
    });
  } else {
    insights.push({
      icon: '📈',
      title: 'Benchmark Pending',
      desc: 'Upload performance report',
      accent: '#718096'
    });
  }
  
  // Insight 3: Dollar return
  if (dollarReturn !== null) {
    const isPositive = dollarReturn >= 0;
    insights.push({
      icon: isPositive ? '💰' : '💸',
      title: isPositive ? 'Capital Growth' : 'Capital Loss',
      desc: `${isPositive ? '+' : ''}${formatCurrencyCompact(dollarReturn)} this period`,
      accent: isPositive ? '#ecc94b' : '#f56565'
    });
  } else {
    insights.push({
      icon: '💼',
      title: 'Returns Pending',
      desc: 'Upload performance report',
      accent: '#718096'
    });
  }
  
  return insights;
}

/**
 * Darken or lighten a hex color
 */
function adjustColor(hex, amount) {
  const clamp = (num) => Math.min(255, Math.max(0, num));
  
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust
  const newR = clamp(r + amount);
  const newG = clamp(g + amount);
  const newB = clamp(b + amount);
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}