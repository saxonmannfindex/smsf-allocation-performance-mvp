/**
 * AssetAllocation Component
 * 
 * Presentation-grade asset allocation display
 * Visual bars and clean data presentation
 */
export default function AssetAllocation({ fund }) {
  if (!fund?.assetAllocation?.assetClasses) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm h-full">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Asset Allocation</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center max-w-[200px]">
              Upload Asset Allocation report to view breakdown
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { assetClasses, totalValue, asAtDate } = fund.assetAllocation;
  
  // Calculate percentages if not provided
  const classesWithPercent = assetClasses.map(ac => ({
    ...ac,
    calculatedPercent: totalValue > 0 ? (ac.value / totalValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  // Color palette for asset classes
  const colorMap = {
    'Australian Equities': { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    'International Equities': { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
    'Australian Fixed Interest': { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    'International Fixed Interest': { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600' },
    'Cash': { bg: 'bg-slate-400', light: 'bg-slate-50', text: 'text-slate-600' },
    'Listed Property': { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
    'Other': { bg: 'bg-gray-400', light: 'bg-gray-50', text: 'text-gray-600' },
    'Unknown': { bg: 'bg-gray-300', light: 'bg-gray-50', text: 'text-gray-500' },
  };

  const getColor = (name) => {
    return colorMap[name] || { bg: 'bg-gray-400', light: 'bg-gray-50', text: 'text-gray-600' };
  };

  const formatCurrency = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get max value for scaling bars
  const maxValue = Math.max(...classesWithPercent.map(c => c.value));

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Asset Allocation</h3>
            {asAtDate && (
              <p className="text-xs text-gray-400 mt-0.5">As at {asAtDate}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Value</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Stacked Bar Overview */}
      <div className="px-6 pt-5">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
          {classesWithPercent.map((ac, i) => (
            <div
              key={i}
              className={`h-full ${getColor(ac.name).bg} transition-all duration-700`}
              style={{ width: `${ac.calculatedPercent}%` }}
              title={`${ac.name}: ${ac.calculatedPercent.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>

      {/* Asset Class List */}
      <div className="p-6 flex-1 overflow-auto">
        <div className="space-y-4">
          {classesWithPercent.map((ac, i) => {
            const color = getColor(ac.name);
            const barWidth = maxValue > 0 ? (ac.value / maxValue) * 100 : 0;
            
            return (
              <div key={i} className="group">
                {/* Row Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                    <span className="text-sm font-medium text-gray-900">{ac.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(ac.value)}
                    </span>
                    <span className={`text-xs font-semibold tabular-nums min-w-[50px] text-right ${color.text}`}>
                      {ac.calculatedPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${color.bg} transition-all duration-700 ease-out rounded-full`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}