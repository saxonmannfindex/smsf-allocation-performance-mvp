/**
 * FundSummary Component
 * 
 * Presentation-grade fund summary card
 * Shows classification, fund ID, and growth/defensive allocation
 */
export default function FundSummary({ fund }) {
  if (!fund) return null;

  const classification = fund.classification?.classification ?? "Unknown";
  const growthPercent = fund.classification?.growthPercent;
  const defensivePercent = fund.classification?.defensivePercent;
  const otherPercent = fund.classification?.otherPercent;

  // Classification color mapping - muted, financial-grade
  const classificationStyles = {
    aggressive: {
      bg: "bg-gradient-to-br from-red-50 to-rose-50",
      border: "border-red-200/60",
      badge: "bg-red-100 text-red-800 ring-red-600/20",
      accent: "from-red-500 to-rose-500"
    },
    growth: {
      bg: "bg-gradient-to-br from-orange-50 to-amber-50",
      border: "border-orange-200/60",
      badge: "bg-orange-100 text-orange-800 ring-orange-600/20",
      accent: "from-orange-500 to-amber-500"
    },
    balanced: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200/60",
      badge: "bg-blue-100 text-blue-800 ring-blue-600/20",
      accent: "from-blue-500 to-indigo-500"
    },
    moderate: {
      bg: "bg-gradient-to-br from-teal-50 to-cyan-50",
      border: "border-teal-200/60",
      badge: "bg-teal-100 text-teal-800 ring-teal-600/20",
      accent: "from-teal-500 to-cyan-500"
    },
    conservative: {
      bg: "bg-gradient-to-br from-emerald-50 to-green-50",
      border: "border-emerald-200/60",
      badge: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
      accent: "from-emerald-500 to-green-500"
    },
    defensive: {
      bg: "bg-gradient-to-br from-slate-50 to-gray-50",
      border: "border-slate-200/60",
      badge: "bg-slate-100 text-slate-800 ring-slate-600/20",
      accent: "from-slate-500 to-gray-500"
    },
  };

  const style = classificationStyles[classification.toLowerCase()] || {
    bg: "bg-gradient-to-br from-gray-50 to-slate-50",
    border: "border-gray-200/60",
    badge: "bg-gray-100 text-gray-700 ring-gray-600/20",
    accent: "from-gray-500 to-slate-500"
  };

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${style.bg} ${style.border}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200/40 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${style.accent}`} />
            <div>
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                Fund Overview
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Classification & Allocation Summary</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ring-1 ring-inset capitalize ${style.badge}`}>
            {classification}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fund ID */}
          <div className="bg-white/70 rounded-xl p-4 border border-gray-200/40">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Fund Identifier
            </p>
            <p className="text-sm font-semibold text-gray-900 font-mono tracking-tight">
              {fund.fundId}
            </p>
          </div>

          {/* Asset Split Visual */}
          <div className="md:col-span-2 bg-white/70 rounded-xl p-4 border border-gray-200/40">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Growth / Defensive Allocation
            </p>

            {/* Progress Bar */}
            <div className="relative mb-4">
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                {growthPercent != null && (
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out relative"
                    style={{ width: `${growthPercent}%` }}
                  >
                    {growthPercent > 15 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {growthPercent.toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}
                {defensivePercent != null && (
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 ease-out relative"
                    style={{ width: `${defensivePercent}%` }}
                  >
                    {defensivePercent > 15 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {defensivePercent.toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}
                {otherPercent != null && otherPercent > 0 && (
                  <div
                    className="h-full bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-700 ease-out"
                    style={{ width: `${otherPercent}%` }}
                  />
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 shadow-sm" />
                  <span className="text-xs text-gray-500">Growth</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    {growthPercent?.toFixed(1) ?? "—"}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-sm" />
                  <span className="text-xs text-gray-500">Defensive</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    {defensivePercent?.toFixed(1) ?? "—"}%
                  </span>
                </div>
                {otherPercent != null && otherPercent > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 shadow-sm" />
                    <span className="text-xs text-gray-500">Other</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">
                      {otherPercent?.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}