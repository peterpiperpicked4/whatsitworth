import { useState } from 'react';
import { UrlInput } from './components/UrlInput';
import { AnalysisLoader } from './components/AnalysisLoader';
import { ResultsDashboard } from './components/ResultsDashboard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { HistoryPanel } from './components/HistoryPanel';
import { ComparisonMode } from './components/ComparisonMode';
import { analyzeWebsite } from './services/valuationEngine';
import { saveToHistory } from './services/historyService';
import type { WebsiteAnalysis, AnalysisStatus } from './types/analysis';

function App() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Check if error indicates a dead/unregistered domain
  const isDomainError = error && (
    error.toLowerCase().includes('domain') ||
    error.toLowerCase().includes('dns') ||
    error.toLowerCase().includes('not found') ||
    error.toLowerCase().includes('unreachable') ||
    error.toLowerCase().includes('failed to fetch') ||
    error.toLowerCase().includes('network')
  );

  // Extract just the domain name from the last URL
  const getDomainFromUrl = (url: string): string => {
    try {
      const cleanUrl = url.replace(/^(https?:\/\/)?/, '').split('/')[0];
      return cleanUrl;
    } catch {
      return url;
    }
  };

  const handleAnalyze = async (url: string) => {
    setStatus('analyzing');
    setError(null);
    setLastUrl(url);

    try {
      // Add a minimum delay for UX (shows the nice loading animation)
      const [result] = await Promise.all([
        analyzeWebsite(url),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      setAnalysis(result);
      setStatus('complete');
      // Save to history
      saveToHistory(result);
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

  const handleLoadFromHistory = (loadedAnalysis: WebsiteAnalysis) => {
    setAnalysis(loadedAnalysis);
    setStatus('complete');
    setError(null);
  };

  const handleSwitchToSingle = (url: string) => {
    setShowComparison(false);
    handleAnalyze(url);
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

                {/* Compare Sites Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowComparison(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 text-gray-400 hover:text-orange-400 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Compare Multiple Sites
                  </button>
                </div>

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
                {isDomainError ? (
                  <>
                    {/* Domain Not Found / Unregistered */}
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Domain Appears Unavailable</h3>
                    <p className="text-gray-400 mb-4">
                      <span className="text-amber-400 font-mono">{getDomainFromUrl(lastUrl)}</span> couldn't be reached.
                      It may be unregistered or temporarily unavailable.
                    </p>

                    {/* Opportunity CTA */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                      <p className="text-emerald-400 text-sm font-medium mb-2">
                        This could be an opportunity!
                      </p>
                      <p className="text-gray-400 text-xs">
                        If this domain is available, you could register it.
                      </p>
                    </div>

                    {/* Registration Links */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      <a
                        href={`https://www.namecheap.com/domains/registration/results/?domain=${getDomainFromUrl(lastUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 text-sm transition-all"
                      >
                        Check on Namecheap
                      </a>
                      <a
                        href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${getDomainFromUrl(lastUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm transition-all"
                      >
                        Check on GoDaddy
                      </a>
                      <a
                        href={`https://porkbun.com/checkout/search?q=${getDomainFromUrl(lastUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-400 text-sm transition-all"
                      >
                        Check on Porkbun
                      </a>
                    </div>

                    <button onClick={handleReset} className="btn-primary">
                      Try Another Domain
                    </button>
                  </>
                ) : (
                  <>
                    {/* Generic Error */}
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
                  </>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 text-gray-500 text-sm">
            <p>What's It Worth? - Instant website value estimation</p>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-400 transition-all text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/50 text-gray-400 hover:text-violet-400 transition-all text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>
        </footer>

        {/* History Panel Modal */}
        {showHistory && (
          <HistoryPanel
            onClose={() => setShowHistory(false)}
            onLoadAnalysis={handleLoadFromHistory}
          />
        )}

        {/* Analytics Dashboard Modal */}
        {showAnalytics && (
          <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
        )}

        {/* Comparison Mode Modal */}
        {showComparison && (
          <ComparisonMode
            onClose={() => setShowComparison(false)}
            onSwitchToSingle={handleSwitchToSingle}
          />
        )}
      </div>
    </div>
  );
}

export default App;
