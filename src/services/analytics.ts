// Affiliate Click Tracking Service

export interface ClickEvent {
  id: string;
  timestamp: number;
  type: 'registrar' | 'domain_suggestion' | 'alternative_tld';
  registrar: string;
  analyzedDomain: string;
  clickedDomain: string;
  estimatedValue: number;
  isPremium?: boolean;
}

export interface AnalyticsSummary {
  totalClicks: number;
  clicksByType: Record<string, number>;
  clicksByRegistrar: Record<string, number>;
  topClickedDomains: Array<{ domain: string; clicks: number }>;
  recentClicks: ClickEvent[];
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

const STORAGE_KEY = 'whatsitworth_affiliate_clicks';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function trackAffiliateClick(event: Omit<ClickEvent, 'id' | 'timestamp'>): void {
  const clickEvent: ClickEvent = {
    ...event,
    id: generateId(),
    timestamp: Date.now(),
  };

  // Log to console for debugging
  console.log('[Affiliate Click]', {
    type: clickEvent.type,
    registrar: clickEvent.registrar,
    clickedDomain: clickEvent.clickedDomain,
    analyzedDomain: clickEvent.analyzedDomain,
  });

  // Store in localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const clicks: ClickEvent[] = stored ? JSON.parse(stored) : [];
    clicks.push(clickEvent);

    // Keep only last 1000 clicks to prevent storage bloat
    const trimmedClicks = clicks.slice(-1000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedClicks));
  } catch (error) {
    console.warn('Failed to store click event:', error);
  }

  // Send to analytics endpoint if configured
  sendToAnalytics(clickEvent);
}

async function sendToAnalytics(event: ClickEvent): Promise<void> {
  // Check for custom analytics endpoint in environment or config
  const analyticsEndpoint = (window as unknown as Record<string, unknown>).__ANALYTICS_ENDPOINT__ as string | undefined;

  if (!analyticsEndpoint) {
    return; // No endpoint configured, skip remote tracking
  }

  try {
    await fetch(analyticsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'affiliate_click',
        ...event,
      }),
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.warn('Failed to send analytics:', error);
  }
}

export function getClickHistory(dateRange?: DateRange): ClickEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const clicks: ClickEvent[] = stored ? JSON.parse(stored) : [];

    if (!dateRange || (!dateRange.start && !dateRange.end)) {
      return clicks;
    }

    return clicks.filter((click) => {
      const clickDate = new Date(click.timestamp);
      if (dateRange.start && clickDate < dateRange.start) return false;
      if (dateRange.end) {
        // Include the entire end date by setting time to end of day
        const endOfDay = new Date(dateRange.end);
        endOfDay.setHours(23, 59, 59, 999);
        if (clickDate > endOfDay) return false;
      }
      return true;
    });
  } catch {
    return [];
  }
}

export function getAnalyticsSummary(dateRange?: DateRange): AnalyticsSummary {
  const clicks = getClickHistory(dateRange);

  const clicksByType: Record<string, number> = {};
  const clicksByRegistrar: Record<string, number> = {};
  const domainCounts: Record<string, number> = {};

  for (const click of clicks) {
    clicksByType[click.type] = (clicksByType[click.type] || 0) + 1;
    clicksByRegistrar[click.registrar] = (clicksByRegistrar[click.registrar] || 0) + 1;
    domainCounts[click.clickedDomain] = (domainCounts[click.clickedDomain] || 0) + 1;
  }

  const topClickedDomains = Object.entries(domainCounts)
    .map(([domain, clicks]) => ({ domain, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  return {
    totalClicks: clicks.length,
    clicksByType,
    clicksByRegistrar,
    topClickedDomains,
    recentClicks: clicks.slice(-20).reverse(),
  };
}

export function clearClickHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportClicksToCSV(dateRange?: DateRange): string {
  const clicks = getClickHistory(dateRange);

  if (clicks.length === 0) {
    return '';
  }

  const headers = [
    'ID',
    'Timestamp',
    'Date',
    'Type',
    'Registrar',
    'Analyzed Domain',
    'Clicked Domain',
    'Estimated Value',
    'Is Premium',
  ];

  const rows = clicks.map((click) => [
    click.id,
    click.timestamp,
    new Date(click.timestamp).toISOString(),
    click.type,
    click.registrar,
    click.analyzedDomain,
    click.clickedDomain,
    click.estimatedValue,
    click.isPremium ? 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadClicksCSV(dateRange?: DateRange): void {
  const csv = exportClicksToCSV(dateRange);

  if (!csv) {
    alert('No click data to export');
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Create filename with date range if specified
  let filename = 'whatsitworth-affiliate-clicks';
  if (dateRange?.start || dateRange?.end) {
    if (dateRange.start) filename += `-from-${dateRange.start.toISOString().split('T')[0]}`;
    if (dateRange.end) filename += `-to-${dateRange.end.toISOString().split('T')[0]}`;
  } else {
    filename += `-${new Date().toISOString().split('T')[0]}`;
  }
  link.download = `${filename}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Expose analytics to window for easy console access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__affiliateAnalytics__ = {
    getHistory: getClickHistory,
    getSummary: getAnalyticsSummary,
    clear: clearClickHistory,
    exportCSV: exportClicksToCSV,
    downloadCSV: downloadClicksCSV,
  };
}
