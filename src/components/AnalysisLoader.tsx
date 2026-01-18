import { useEffect, useState } from 'react';
import type { AnalysisProgress } from '../types/analysis';

interface AnalysisLoaderProps {
  progress?: AnalysisProgress | null;
}

const DATA_SOURCES = [
  { name: 'Website Content', icon: '🌐' },
  { name: 'Domain Registry', icon: '📋' },
  { name: 'Archive History', icon: '📚' },
  { name: 'Google PageSpeed', icon: '⚡' },
  { name: 'Tranco Ranking', icon: '📊' },
  { name: 'DNS Records', icon: '🔍' },
  { name: 'SSL Security', icon: '🔒' },
  { name: 'Social Signals', icon: '📱' },
  { name: 'AI SEO Analysis', icon: '🤖' },
  { name: 'Valuation Engine', icon: '💰' },
];

export function AnalysisLoader({ progress }: AnalysisLoaderProps) {
  const [animatedSources, setAnimatedSources] = useState<number>(0);
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    'We analyze 15+ real data sources for accuracy',
    'Domain age significantly impacts valuation',
    'Sites in Tranco Top 1M are worth 3-10x more',
    'Strong SEO can add $10,000+ in value',
    'HTTPS sites are valued 20% higher on average',
  ];

  useEffect(() => {
    // Animate sources appearing
    const sourceInterval = setInterval(() => {
      setAnimatedSources((prev) => {
        if (prev >= DATA_SOURCES.length) {
          clearInterval(sourceInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 350);

    // Cycle through tips
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => {
      clearInterval(sourceInterval);
      clearInterval(tipInterval);
    };
  }, [tips.length]);

  const completedCount = progress?.completedSources?.length || animatedSources;
  const percentComplete = Math.min(95, Math.round((completedCount / DATA_SOURCES.length) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="glass-card p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            Analyzing Website
          </h3>
          <p className="text-gray-400">
            Gathering data from multiple sources...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-primary font-medium">{percentComplete}%</span>
          </div>
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Data Sources Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {DATA_SOURCES.map((source, i) => {
            const isCompleted = i < animatedSources;
            const isActive = i === animatedSources;

            return (
              <div
                key={source.name}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300
                  ${isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isActive
                    ? 'bg-primary/10 border-primary/30 text-primary animate-pulse'
                    : 'bg-white/5 border-white/10 text-gray-500'
                  }
                `}
              >
                <span className="text-xl mb-1">{source.icon}</span>
                <span className="text-xs text-center leading-tight">{source.name}</span>
                {isCompleted && (
                  <svg className="w-4 h-4 mt-1 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Task Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-gray-400 text-sm">
            {progress?.currentTask || (animatedSources < DATA_SOURCES.length
              ? `Checking ${DATA_SOURCES[animatedSources]?.name}...`
              : 'Calculating valuation...'
            )}
          </span>
        </div>

        {/* Tip Section */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <span className="text-primary text-lg">💡</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Did you know?</p>
              <p className="text-sm text-gray-300 transition-opacity duration-300">
                {tips[currentTip]}
              </p>
            </div>
          </div>
        </div>

        {/* Animated dots at bottom */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
