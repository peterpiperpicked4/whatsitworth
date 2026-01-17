import { useState, useEffect } from 'react';
import {
  getHistory,
  deleteHistoryEntry,
  clearHistory,
  getHistoryStats,
  type HistoryEntry,
} from '../services/historyService';
import type { WebsiteAnalysis } from '../types/analysis';

interface HistoryPanelProps {
  onClose: () => void;
  onLoadAnalysis: (analysis: WebsiteAnalysis) => void;
}

export function HistoryPanel({ onClose, onLoadAnalysis }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [stats, setStats] = useState(getHistoryStats());
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setHistory(getHistory());
    setStats(getHistoryStats());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id);
    setHistory(getHistory());
    setStats(getHistoryStats());
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      clearHistory();
      setHistory([]);
      setStats(getHistoryStats());
    }
  };

  const handleLoad = (entry: HistoryEntry) => {
    onLoadAnalysis(entry.fullAnalysis);
    onClose();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);

  const filteredHistory = filter
    ? history.filter((e) => e.domain.toLowerCase().includes(filter.toLowerCase()))
    : history;

  // Group by domain for display
  const groupedByDomain: Record<string, HistoryEntry[]> = {};
  filteredHistory.forEach((entry) => {
    const domain = entry.domain.toLowerCase();
    if (!groupedByDomain[domain]) {
      groupedByDomain[domain] = [];
    }
    groupedByDomain[domain].push(entry);
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Analysis History</h2>
              <p className="text-sm text-gray-400">Track your valuations over time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
                title="Clear all history"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats.totalAnalyses > 0 && (
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.totalAnalyses}</p>
                <p className="text-xs text-gray-400">Total Analyses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{stats.uniqueDomains}</p>
                <p className="text-xs text-gray-400">Unique Domains</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.averageValue)}</p>
                <p className="text-xs text-gray-400">Avg. Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-400">
                  {stats.highestValue ? formatCurrency(stats.highestValue.value) : '-'}
                </p>
                <p className="text-xs text-gray-400">Highest Value</p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        {history.length > 0 && (
          <div className="px-6 py-3 border-b border-white/10">
            <input
              type="text"
              placeholder="Search domains..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No history yet</h3>
              <p className="text-gray-400">Your website valuations will appear here after you analyze sites.</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No domains matching "{filter}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByDomain).map(([domain, entries]) => (
                <div key={domain} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="px-4 py-3 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">{entries[0].domain}</p>
                        <p className="text-xs text-gray-400">{entries.length} {entries.length === 1 ? 'analysis' : 'analyses'}</p>
                      </div>
                    </div>
                    {entries.length >= 2 && (
                      <div className="text-right">
                        {(() => {
                          const change = entries[0].estimatedValue - entries[1].estimatedValue;
                          const pct = entries[1].estimatedValue > 0 ? (change / entries[1].estimatedValue) * 100 : 0;
                          const isUp = change > 0;
                          return (
                            <div className={`text-sm ${isUp ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              {isUp ? '+' : ''}{formatCurrency(change)}
                              <span className="text-xs ml-1">({isUp ? '+' : ''}{pct.toFixed(1)}%)</span>
                            </div>
                          );
                        })()}
                        <p className="text-xs text-gray-500">vs. previous</p>
                      </div>
                    )}
                  </div>
                  <div className="divide-y divide-white/5">
                    {entries.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-white font-medium">{formatCurrency(entry.estimatedValue)}</p>
                            <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                          </div>
                          <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                              {entry.confidenceScore}% conf.
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-400">
                              {entry.trafficTier.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoad(entry)}
                            className="px-3 py-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {entries.length > 5 && (
                      <div className="px-4 py-2 text-center text-xs text-gray-500">
                        + {entries.length - 5} more analyses
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            History is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;
