import { useState } from 'react';
import { UrlInput } from './components/UrlInput';
import { AnalysisLoader } from './components/AnalysisLoader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analyzeWebsite } from './services/valuationEngine';
import type { WebsiteAnalysis, AnalysisStatus } from './types/analysis';

function App() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setStatus('analyzing');
    setError(null);

    try {
      // Add a minimum delay for UX (shows the nice loading animation)
      const [result] = await Promise.all([
        analyzeWebsite(url),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      setAnalysis(result);
      setStatus('complete');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="gradient-bg" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-8 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
              What's It Worth?
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover the true value of any website with our advanced AI-powered analysis
            </p>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            {status === 'idle' && (
              <div className="pt-8">
                <UrlInput onAnalyze={handleAnalyze} isLoading={false} />

                {/* Features section */}
                <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="2" y1="12" x2="22" y2="12"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                      ),
                      title: 'Domain Analysis',
                      description: 'TLD quality, age, length, and brandability assessment',
                    },
                    {
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      ),
                      title: 'SEO Metrics',
                      description: 'Title, meta tags, headings, and structured data',
                    },
                    {
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 18 22 12 16 6"/>
                          <polyline points="8 6 2 12 8 18"/>
                        </svg>
                      ),
                      title: 'Technical Quality',
                      description: 'HTTPS, load time, and technical implementation',
                    },
                    {
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      ),
                      title: 'Value Estimate',
                      description: 'AI-powered monetary valuation with detailed breakdown',
                    },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="glass-card p-6 text-center hover:scale-105 transition-transform"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'analyzing' && <AnalysisLoader />}

            {status === 'complete' && analysis && (
              <ResultsDashboard analysis={analysis} onReset={handleReset} />
            )}

            {status === 'error' && (
              <div className="glass-card p-8 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Analysis Failed</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={handleReset} className="btn-primary">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
            <p>What's It Worth? - Instant website value estimation</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
