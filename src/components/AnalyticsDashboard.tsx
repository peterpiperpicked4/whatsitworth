import { useState, useEffect } from 'react';
import {
  getAnalyticsSummary,
  clearClickHistory,
  downloadClicksCSV,
  type AnalyticsSummary,
  type ClickEvent,
  type DateRange,
} from '../services/analytics';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

export function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  useEffect(() => {
    setSummary(getAnalyticsSummary(dateRange));
  }, [refreshKey, dateRange]);

  const handleStartDateChange = (value: string) => {
    setStartDateStr(value);
    setDateRange((prev) => ({
      ...prev,
      start: value ? new Date(value) : null,
    }));
  };

  const handleEndDateChange = (value: string) => {
    setEndDateStr(value);
    setDateRange((prev) => ({
      ...prev,
      end: value ? new Date(value) : null,
    }));
  };

  const handleClearDateRange = () => {
    setStartDateStr('');
    setEndDateStr('');
    setDateRange({ start: null, end: null });
  };

  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDateStr(start.toISOString().split('T')[0]);
    setEndDateStr(end.toISOString().split('T')[0]);
    setDateRange({ start, end });
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all click history?')) {
      clearClickHistory();
      setRefreshKey((k) => k + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'registrar':
        return 'bg-purple-500/20 text-purple-400';
      case 'alternative_tld':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'domain_suggestion':
        return 'bg-emerald-500/20 text-emerald-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'registrar':
        return 'Registrar';
      case 'alternative_tld':
        return 'Alt TLD';
      case 'domain_suggestion':
        return 'Suggestion';
      default:
        return type;
    }
  };

  if (!summary) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Affiliate Analytics</h2>
              <p className="text-sm text-gray-400">Track your affiliate link performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
              title="Refresh"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => downloadClicksCSV(dateRange)}
              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all"
              title="Export to CSV"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
              title="Clear history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
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

        {/* Date Range Filter */}
        <div className="px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-400">Filter by date:</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                placeholder="Start date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                placeholder="End date"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPresetRange(7)}
                className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 hover:text-white transition-all"
              >
                7d
              </button>
              <button
                onClick={() => setPresetRange(30)}
                className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 hover:text-white transition-all"
              >
                30d
              </button>
              <button
                onClick={() => setPresetRange(90)}
                className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 hover:text-white transition-all"
              >
                90d
              </button>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={handleClearDateRange}
                  className="px-2 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400 hover:text-red-300 transition-all ml-1"
                >
                  Clear
                </button>
              )}
            </div>

            {(dateRange.start || dateRange.end) && (
              <span className="text-xs text-violet-400 ml-auto">
                Showing filtered results
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {summary.totalClicks === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {dateRange.start || dateRange.end ? 'No clicks in this date range' : 'No clicks yet'}
              </h3>
              <p className="text-gray-400">
                {dateRange.start || dateRange.end
                  ? 'Try adjusting the date range or clear the filter to see all clicks.'
                  : 'Affiliate link clicks will appear here once users start clicking.'}
              </p>
              {(dateRange.start || dateRange.end) && (
                <button
                  onClick={handleClearDateRange}
                  className="mt-4 px-4 py-2 text-sm bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-400 hover:text-violet-300 transition-all"
                >
                  Clear date filter
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Clicks"
                  value={summary.totalClicks}
                  color="violet"
                />
                <StatCard
                  label="Registrar Clicks"
                  value={summary.clicksByType['registrar'] || 0}
                  color="purple"
                />
                <StatCard
                  label="TLD Clicks"
                  value={summary.clicksByType['alternative_tld'] || 0}
                  color="cyan"
                />
                <StatCard
                  label="Suggestion Clicks"
                  value={summary.clicksByType['domain_suggestion'] || 0}
                  color="emerald"
                />
              </div>

              {/* Registrar Breakdown */}
              {Object.keys(summary.clicksByRegistrar).length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Clicks by Registrar</h3>
                  <div className="space-y-2">
                    {Object.entries(summary.clicksByRegistrar)
                      .sort(([, a], [, b]) => b - a)
                      .map(([registrar, clicks]) => (
                        <div key={registrar} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-white">{registrar}</span>
                              <span className="text-sm text-gray-400">{clicks} clicks</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                                style={{ width: `${(clicks / summary.totalClicks) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Top Clicked Domains */}
              {summary.topClickedDomains.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Top Clicked Domains</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {summary.topClickedDomains.map((item, i) => (
                      <div
                        key={item.domain}
                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-gray-500 w-5">#{i + 1}</span>
                          <span className="text-sm text-white truncate">{item.domain}</span>
                        </div>
                        <span className="text-xs text-emerald-400 ml-2">{item.clicks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Clicks */}
              {summary.recentClicks.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Clicks</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {summary.recentClicks.map((click: ClickEvent) => (
                      <div
                        key={click.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(click.type)}`}>
                            {getTypeLabel(click.type)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-white truncate">{click.clickedDomain}</p>
                            <p className="text-xs text-gray-500">via {click.registrar}</p>
                          </div>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className="text-xs text-gray-400">{formatDate(click.timestamp)}</p>
                          {click.isPremium && (
                            <span className="text-xs text-amber-400">Premium</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Data stored locally in your browser. Export or connect to a backend for permanent storage.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'violet' | 'purple' | 'cyan' | 'emerald';
}) {
  const colorClasses = {
    violet: 'from-violet-500/20 to-violet-600/20 border-violet-500/30 text-violet-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 text-center`}>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default AnalyticsDashboard;
