interface FactorCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  items: { label: string; value: string | number | boolean; good?: boolean }[];
  delay?: number;
}

export function FactorCard({ title, score, icon, color, items, delay = 0 }: FactorCardProps) {
  const delayClass = delay === 1 ? 'fade-in-delay-1' : delay === 2 ? 'fade-in-delay-2' : delay === 3 ? 'fade-in-delay-3' : delay === 4 ? 'fade-in-delay-4' : '';

  return (
    <div className={`glass-card p-5 metric-card fade-in ${delayClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <h4 className="font-semibold text-white">{title}</h4>
        </div>
        <div
          className="text-2xl font-bold"
          style={{ color }}
        >
          {score}
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full rounded-full score-bar"
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Details */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-400">{item.label}</span>
            <span className={`font-medium ${
              typeof item.value === 'boolean'
                ? item.value
                  ? 'text-emerald-400'
                  : 'text-red-400'
                : item.good === true
                ? 'text-emerald-400'
                : item.good === false
                ? 'text-red-400'
                : 'text-white'
            }`}>
              {typeof item.value === 'boolean'
                ? item.value
                  ? 'Yes'
                  : 'No'
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
