import { useEffect, useState } from 'react';

const ANALYSIS_STEPS = [
  'Fetching website content...',
  'Analyzing domain quality...',
  'Evaluating technical metrics...',
  'Scanning SEO optimization...',
  'Assessing content quality...',
  'Checking social presence...',
  'Calculating valuation...',
];

export function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-12 flex flex-col items-center">
        {/* Animated rings */}
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-2 rounded-full border-4 border-secondary/20 pulse-ring"></div>
          <div className="absolute inset-4 rounded-full border-4 border-accent/20 pulse-ring" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-6 rounded-full border-4 border-primary/40 pulse-ring" style={{ animationDelay: '1s' }}></div>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Progress text */}
        <h3 className="text-xl font-semibold text-white mb-2">
          Analyzing Website
        </h3>

        <p className="text-gray-400 text-center h-6 transition-all duration-300">
          {ANALYSIS_STEPS[currentStep]}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-6">
          {ANALYSIS_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'bg-primary w-4'
                  : i < currentStep
                  ? 'bg-primary/60'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
