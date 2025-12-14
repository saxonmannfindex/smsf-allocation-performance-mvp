/**
 * PerformanceAnalysis Component
 * 
 * Presentation-grade performance display
 * Hero-sized 1-Year TWR as the primary KPI
 */
export default function PerformanceAnalysis({ fund }) {
  if (!fund?.performance) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm h-full">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Performance</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center max-w-[200px]">
              Upload Performance (TWR) report to view results
            </p>
          </div>
        </div>
      </div>
    );
  }

  const twrValue = fund.performance.twr?.oneYear;
  const hasTwr = typeof twrValue === 'number';
  const isPositive = hasTwr && twrValue >= 0;
  const dollarReturn = fund.performance.dollarReturn;

  // Format dollar return
  const formatCurrency = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Time-Weighted Return
          </h3>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            1 Year
          </span>
        </div>
      </div>

      {/* Hero KPI */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="text-center">
          {/* Main TWR Value */}
          <div className="mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-5xl font-bold tracking-tight tabular-nums ${
                hasTwr 
                  ? isPositive 
                    ? 'text-emerald-600' 
                    : 'text-red-600'
                  : 'text-gray-300'
              }`}>
                {hasTwr ? (isPositive ? '+' : '') : ''}
                {hasTwr ? twrValue.toFixed(2) : '—'}
              </span>
              {hasTwr && (
                <span className={`text-2xl font-semibold ${
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  %
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          {hasTwr && (
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isPositive 
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                  : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
              }`}>
                {isPositive ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {isPositive ? 'Positive Return' : 'Negative Return'}
              </span>
            </div>
          )}

          {/* Dollar Return */}
          {dollarReturn != null && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Dollar Return
              </p>
              <p className={`text-lg font-bold tabular-nums ${
                dollarReturn >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {dollarReturn >= 0 ? '+' : ''}{formatCurrency(dollarReturn)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}