import { useState } from 'react';
import { analyzeWebsite } from '../services/valuationEngine';
import type { WebsiteAnalysis } from '../types/analysis';

interface ComparisonModeProps {
  onClose: () => void;
  onSwitchToSingle: (url: string) => void;
}

interface ComparisonResult {
  url: string;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  analysis: WebsiteAnalysis | null;
  error: string | null;
}

export function ComparisonMode({ onClose, onSwitchToSingle }: ComparisonModeProps) {
  const [urls, setUrls] = useState<string[]>(['', '', '']);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleCompare = async () => {
    const validUrls = urls.filter((url) => url.trim() !== '');
    if (validUrls.length < 2) {
      alert('Please enter at least 2 URLs to compare');
      return;
    }

    setIsAnalyzing(true);
    const initialResults: ComparisonResult[] = validUrls.map((url) => ({
      url,
      status: 'analyzing',
      analysis: null,
      error: null,
    }));
    setResults(initialResults);

    // Analyze all sites in parallel
    const analysisPromises = validUrls.map(async (url, index) => {
      try {
        const analysis = await analyzeWebsite(url);
        setResults((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], status: 'complete', analysis };
          return updated;
        });
      } catch (err) {
        setResults((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            status: 'error',
            error: err instanceof Error ? err.message : 'Analysis failed',
          };
          return updated;
        });
      }
    });

    await Promise.all(analysisPromises);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setResults([]);
    setUrls(['', '', '']);
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);

  const formatNumber = (num: number) => num.toLocaleString();

  const completedResults = results.filter((r) => r.status === 'complete' && r.analysis);
  const highestValue = completedResults.length > 0
    ? Math.max(...completedResults.map((r) => r.analysis!.estimatedValue))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Compare Websites</h1>
                <p className="text-gray-400">Analyze up to 3 sites side-by-side</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Input Section */}
          {results.length === 0 && (
            <div className="glass-card p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {urls.map((url, index) => (
                  <div key={index}>
                    <label className="block text-sm text-gray-400 mb-2">
                      Website {index + 1} {index < 2 && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      placeholder="example.com"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleCompare}
                  disabled={urls.filter((u) => u.trim()).length < 2}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare Sites
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-white">Analyzing {results.filter(r => r.status === 'analyzing').length} sites...</span>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {results.length > 0 && (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`glass-card p-6 relative ${
                      result.analysis && result.analysis.estimatedValue === highestValue
                        ? 'ring-2 ring-emerald-500'
                        : ''
                    }`}
                  >
                    {result.analysis && result.analysis.estimatedValue === highestValue && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                        Highest Value
                      </div>
                    )}

                    {result.status === 'analyzing' && (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-gray-400">Analyzing...</p>
                      </div>
                    )}

                    {result.status === 'error' && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-white font-medium mb-1">{result.url}</p>
                        <p className="text-red-400 text-sm">{result.error}</p>
                      </div>
                    )}

                    {result.status === 'complete' && result.analysis && (
                      <>
                        <div className="text-center mb-4">
                          <p className="text-gray-400 text-sm mb-1 truncate">{result.analysis.domain.domain}</p>
                          <p className="text-3xl font-bold text-white">
                            {formatCurrency(result.analysis.estimatedValue)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(result.analysis.valueRange.min)} - {formatCurrency(result.analysis.valueRange.max)}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <ScoreBar label="Domain" score={result.analysis.scores.domain} />
                          <ScoreBar label="SEO" score={result.analysis.scores.seo} />
                          <ScoreBar label="Content" score={result.analysis.scores.content} />
                          <ScoreBar label="Technical" score={result.analysis.scores.technical} />
                          <ScoreBar label="Performance" score={result.analysis.scores.performance} />
                          <ScoreBar label="Security" score={result.analysis.scores.security} />
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Monthly Visitors</span>
                            <span className="text-white">{formatNumber(result.analysis.traffic.estimatedMonthlyVisitors)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Traffic Tier</span>
                            <span className="text-white capitalize">{result.analysis.traffic.trafficTier.replace('-', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Domain Age</span>
                            <span className="text-white">
                              {result.analysis.domain.ageYears > 0 ? `${result.analysis.domain.ageYears} years` : 'Unknown'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onSwitchToSingle(result.url)}
                          className="w-full mt-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-sm transition-all"
                        >
                          View Full Analysis
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                >
                  Compare New Sites
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 70) return 'bg-emerald-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{score}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default ComparisonMode;
