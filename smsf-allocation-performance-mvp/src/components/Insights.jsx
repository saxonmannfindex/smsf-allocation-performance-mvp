/**
 * PerformanceScoreCard Component
 * 
 * Large, prominent performance score display
 * Designed for executive presentations
 */
export function PerformanceScoreCard({ score }) {
  const hasScore = score != null;
  
  // Score color and label mapping
  const getScoreConfig = (s) => {
    if (s == null) return { 
      bg: 'bg-gray-50', 
      text: 'text-gray-400', 
      ring: 'ring-gray-200',
      fill: 'stroke-gray-200',
      label: 'Pending',
      labelBg: 'bg-gray-100 text-gray-600'
    };
    if (s >= 80) return { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      ring: 'ring-emerald-200',
      fill: 'stroke-emerald-500',
      label: 'Excellent',
      labelBg: 'bg-emerald-100 text-emerald-700'
    };
    if (s >= 60) return { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600', 
      ring: 'ring-blue-200',
      fill: 'stroke-blue-500',
      label: 'Good',
      labelBg: 'bg-blue-100 text-blue-700'
    };
    if (s >= 40) return { 
      bg: 'bg-amber-50', 
      text: 'text-amber-600', 
      ring: 'ring-amber-200',
      fill: 'stroke-amber-500',
      label: 'Fair',
      labelBg: 'bg-amber-100 text-amber-700'
    };
    return { 
      bg: 'bg-red-50', 
      text: 'text-red-600', 
      ring: 'ring-red-200',
      fill: 'stroke-red-500',
      label: 'Needs Review',
      labelBg: 'bg-red-100 text-red-700'
    };
  };

  const config = getScoreConfig(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = hasScore ? circumference - (score / 100) * circumference : circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">
          Performance Score
        </h3>
      </div>

      {/* Score Display */}
      <div className="p-6 flex-1 flex flex-col items-center justify-center">
        {/* Circular Progress */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              className="stroke-gray-100"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              className={`${config.fill} transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className={`text-3xl font-bold tabular-nums ${config.text}`}>
                {hasScore ? score : "—"}
              </span>
              {hasScore && (
                <span className="block text-xs font-medium text-gray-400 mt-0.5">
                  / 100
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Score Label Badge */}
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${config.labelBg}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

/**
 * Insights Component
 * 
 * Clean, concise insight cards with subtle visual hierarchy
 */
export default function Insights({ insights = [] }) {
  // Icon mapping for insight types
  const getInsightIcon = (type) => {
    switch (type) {
      case 'classification':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        );
      case 'performance':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'return':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  // Color mapping for insight types
  const getInsightStyle = (type, importance) => {
    const baseStyles = {
      classification: {
        border: 'border-l-blue-500',
        iconBg: 'bg-blue-50',
        iconText: 'text-blue-600'
      },
      performance: {
        border: 'border-l-emerald-500',
        iconBg: 'bg-emerald-50',
        iconText: 'text-emerald-600'
      },
      return: {
        border: 'border-l-amber-500',
        iconBg: 'bg-amber-50',
        iconText: 'text-amber-600'
      }
    };
    
    return baseStyles[type] || {
      border: 'border-l-slate-400',
      iconBg: 'bg-slate-50',
      iconText: 'text-slate-600'
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Key Insights
          </h3>
          {insights.length > 0 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md tabular-nums">
              {insights.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-auto">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center">
              No insights available yet
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight, i) => {
              const style = getInsightStyle(insight.type, insight.importance);
              return (
                <li 
                  key={i} 
                  className={`border-l-4 ${style.border} bg-gray-50/50 rounded-r-xl p-4 transition-colors hover:bg-gray-50`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <span className={style.iconText}>
                        {getInsightIcon(insight.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">
                        {insight.title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}