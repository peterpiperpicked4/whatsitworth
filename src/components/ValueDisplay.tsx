import { useEffect, useState } from 'react';

interface ValueDisplayProps {
  value: number;
  min: number;
  max: number;
}

export function ValueDisplay({ value, min, max }: ValueDisplayProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
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
  }, [value]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="glass-card p-8 text-center fade-in">
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
