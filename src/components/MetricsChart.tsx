import { useEffect, useState } from 'react';
import type { ScoreBreakdown } from '../types/analysis';

interface MetricsChartProps {
  scores: ScoreBreakdown;
}

export function MetricsChart({ scores }: MetricsChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { key: 'domain', label: 'Domain', color: '#8b5cf6' },
    { key: 'performance', label: 'Perf', color: '#06b6d4' },
    { key: 'technical', label: 'Tech', color: '#f59e0b' },
    { key: 'security', label: 'Security', color: '#ef4444' },
    { key: 'seo', label: 'SEO', color: '#f472b6' },
    { key: 'content', label: 'Content', color: '#10b981' },
    { key: 'social', label: 'Social', color: '#3b82f6' },
    { key: 'monetization', label: 'Revenue', color: '#eab308' },
  ] as const;

  const centerX = 150;
  const centerY = 150;
  const maxRadius = 90;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const polygonPoints = categories
    .map((cat, i) => {
      const value = animated ? scores[cat.key] : 0;
      const point = getPoint(i, value);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="glass-card p-6 fade-in fade-in-delay-1">
      <h3 className="text-lg font-semibold text-white mb-4 text-center">
        Score Breakdown
      </h3>

      <div className="flex justify-center">
        <svg viewBox="0 0 300 300" className="w-full max-w-[280px]">
          {/* Grid polygons */}
          {gridLevels.map((level) => (
            <polygon
              key={level}
              points={categories
                .map((_, i) => {
                  const point = getPoint(i, level);
                  return `${point.x},${point.y}`;
                })
                .join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {categories.map((_, i) => {
            const point = getPoint(i, 100);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={polygonPoints}
            fill="url(#radarGradient)"
            fillOpacity="0.25"
            stroke="url(#radarGradient)"
            strokeWidth="2"
            className="transition-all duration-1000 ease-out"
          />

          {/* Data points */}
          {categories.map((cat, i) => {
            const value = animated ? scores[cat.key] : 0;
            const point = getPoint(i, value);
            return (
              <circle
                key={cat.key}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={cat.color}
                stroke="#0a0a0f"
                strokeWidth="2"
                className="transition-all duration-1000 ease-out"
              />
            );
          })}

          {/* Labels */}
          {categories.map((cat, i) => {
            const point = getPoint(i, 118);
            return (
              <text
                key={cat.key}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize="10"
                fontWeight="500"
              >
                {cat.label}
              </text>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="33%" stopColor="#06b6d4" />
              <stop offset="66%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Score legend - 2 columns */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {categories.map((cat) => (
          <div key={cat.key} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs text-gray-400 truncate">{cat.label}</span>
            <span className="text-xs font-semibold text-white ml-auto">
              {scores[cat.key]}
            </span>
          </div>
        ))}
      </div>

      {/* Overall score */}
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-gray-400">Overall Score</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full score-bar"
              style={{
                width: `${scores.overall}%`,
                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #f472b6)',
              }}
            />
          </div>
          <span className="text-2xl font-bold gradient-text">{scores.overall}</span>
        </div>
      </div>
    </div>
  );
}
