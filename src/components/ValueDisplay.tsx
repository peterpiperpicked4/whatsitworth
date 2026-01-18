import { useEffect, useState } from 'react';

interface ValueDisplayProps {
  value: number;
  min: number;
  max: number;
  trancoRank?: number | null;
  verdict?: 'STRONG BUY' | 'BUY' | 'HOLD' | 'PASS';
  overallScore?: number;
}

export function ValueDisplay({ value, min, max, trancoRank, verdict, overallScore }: ValueDisplayProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Check if this is an enterprise-scale site (top 100)
  const isEnterprise = trancoRank !== null && trancoRank !== undefined && trancoRank <= 100;
  const isMegaSite = trancoRank !== null && trancoRank !== undefined && trancoRank <= 1000;

  useEffect(() => {
    if (isEnterprise) {
      setDisplayValue(value);
      return;
    }

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = value / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        // Easing function for smooth animation
        const progress = currentStep / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        setDisplayValue(Math.round(value * eased));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isEnterprise]);

  const formatCurrency = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getVerdictStyle = (v: string) => {
    switch (v) {
      case 'STRONG BUY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'BUY':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'HOLD':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'PASS':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Enterprise-scale site (Top 100)
  if (isEnterprise) {
    return (
      <div className="glass-card p-8 text-center fade-in border border-amber-500/30">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/50">
            TOP {trancoRank} GLOBAL WEBSITE
          </span>
        </div>

        <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
          Enterprise-Scale Asset
        </p>

        <div className="relative">
          <h2 className="text-5xl md:text-6xl font-bold text-amber-400">
            Beyond Standard Metrics
          </h2>
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 pointer-events-none"></div>
        </div>

        <p className="text-gray-400 mt-4 text-sm max-w-lg mx-auto">
          This is a <strong className="text-amber-400">top-{trancoRank}</strong> global website.
          Standard valuation metrics don't apply to assets of this scale.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-300 text-sm">
            Market indicators suggest enterprise value in the <strong>billions of dollars</strong>.
            For accurate valuation, consult investment banking professionals.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Algorithmic valuation: {formatCurrency(value)} (for reference only)
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 text-center fade-in">
      {/* Verdict Badge */}
      {verdict && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getVerdictStyle(verdict)}`}>
            {verdict}
          </span>
          {isMegaSite && trancoRank && (
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/50">
              TOP {trancoRank.toLocaleString()} SITE
            </span>
          )}
        </div>
      )}

      <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">
        Estimated Website Value
      </p>

      <div className="relative">
        <h2 className="text-6xl md:text-7xl font-bold gradient-text animate-count">
          {formatCurrency(displayValue)}
        </h2>

        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-primary via-secondary to-accent pointer-events-none"></div>
      </div>

      <p className="text-gray-500 mt-4 text-sm">
        Value Range: {formatCurrency(min)} - {formatCurrency(max)}
      </p>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        Based on domain, SEO, content, and technical analysis
      </div>
    </div>
  );
}
