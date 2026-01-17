// History Service - Track website valuations over time

import type { WebsiteAnalysis } from '../types/analysis';

export interface HistoryEntry {
  id: string;
  domain: string;
  timestamp: number;
  estimatedValue: number;
  confidenceScore: number;
  scores: {
    domain: number;
    seo: number;
    content: number;
    technical: number;
    performance: number;
    security: number;
    social: number;
    monetization: number;
  };
  trafficTier: string;
  monthlyVisitors: number;
  // Store the full analysis for detailed view
  fullAnalysis: WebsiteAnalysis;
}

export interface DomainHistory {
  domain: string;
  entries: HistoryEntry[];
  valueChange: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  } | null;
}

const STORAGE_KEY = 'whatsitworth_history';
const MAX_ENTRIES = 100;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function saveToHistory(analysis: WebsiteAnalysis): HistoryEntry {
  const entry: HistoryEntry = {
    id: generateId(),
    domain: analysis.domain.domain,
    timestamp: Date.now(),
    estimatedValue: analysis.estimatedValue,
    confidenceScore: analysis.confidenceScore,
    scores: { ...analysis.scores },
    trafficTier: analysis.traffic.trafficTier,
    monthlyVisitors: analysis.traffic.estimatedMonthlyVisitors,
    fullAnalysis: analysis,
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
    history.unshift(entry);

    // Keep only the most recent entries
    const trimmed = history.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to save to history:', error);
  }

  return entry;
}

export function getHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getHistoryForDomain(domain: string): DomainHistory {
  const history = getHistory();
  const entries = history.filter((e) => e.domain.toLowerCase() === domain.toLowerCase());

  let valueChange: DomainHistory['valueChange'] = null;

  if (entries.length >= 2) {
    const latest = entries[0].estimatedValue;
    const previous = entries[1].estimatedValue;
    const absolute = latest - previous;
    const percentage = previous > 0 ? ((absolute / previous) * 100) : 0;

    valueChange = {
      absolute,
      percentage,
      trend: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'stable',
    };
  }

  return {
    domain,
    entries,
    valueChange,
  };
}

export function getRecentDomains(): string[] {
  const history = getHistory();
  const seen = new Set<string>();
  const domains: string[] = [];

  for (const entry of history) {
    const domain = entry.domain.toLowerCase();
    if (!seen.has(domain)) {
      seen.add(domain);
      domains.push(entry.domain);
    }
    if (domains.length >= 10) break;
  }

  return domains;
}

export function deleteHistoryEntry(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to delete history entry:', error);
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getHistoryStats(): {
  totalAnalyses: number;
  uniqueDomains: number;
  averageValue: number;
  highestValue: { domain: string; value: number } | null;
} {
  const history = getHistory();

  if (history.length === 0) {
    return {
      totalAnalyses: 0,
      uniqueDomains: 0,
      averageValue: 0,
      highestValue: null,
    };
  }

  const uniqueDomains = new Set(history.map((e) => e.domain.toLowerCase())).size;
  const totalValue = history.reduce((sum, e) => sum + e.estimatedValue, 0);
  const averageValue = totalValue / history.length;

  const highest = history.reduce((max, e) =>
    e.estimatedValue > (max?.value || 0) ? { domain: e.domain, value: e.estimatedValue } : max,
    null as { domain: string; value: number } | null
  );

  return {
    totalAnalyses: history.length,
    uniqueDomains,
    averageValue,
    highestValue: highest,
  };
}
