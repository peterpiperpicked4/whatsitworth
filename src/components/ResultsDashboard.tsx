import type { WebsiteAnalysis } from '../types/analysis';
import { ValueDisplay } from './ValueDisplay';
import { MetricsChart } from './MetricsChart';
import { FactorCard } from './FactorCard';
import { DomainRegistration } from './DomainRegistration';
import { generatePDFReport } from '../services/pdfReport';

interface ResultsDashboardProps {
  analysis: WebsiteAnalysis;
  onReset: () => void;
}

// Icons
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const SpeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/><circle cx="12" cy="12" r="4"/>
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const ServerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
  </svg>
);

const TrendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

export function ResultsDashboard({ analysis, onReset }: ResultsDashboardProps) {
  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
  const formatMs = (ms: number) => ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Calculate verdict based on overall score and value
  const calculateVerdict = (): 'STRONG BUY' | 'BUY' | 'HOLD' | 'PASS' => {
    const score = analysis.scores.overall;
    const value = analysis.estimatedValue;

    // Enterprise sites don't get a verdict
    if (analysis.ranking?.rank && analysis.ranking.rank <= 100) {
      return 'HOLD'; // Won't be shown anyway
    }

    if (score >= 70 && value >= 100000) return 'STRONG BUY';
    if (score >= 60 && value >= 50000) return 'BUY';
    if (score >= 50) return 'HOLD';
    return 'PASS';
  };

  const verdict = calculateVerdict();
  const trancoRank = analysis.ranking?.rank || null;

  // Calculate value opportunity signal (undervalued/overvalued)
  const calculateValueOpportunity = (): { signal: 'undervalued' | 'fair' | 'overvalued'; magnitude: number; reason: string } => {
    const score = analysis.scores.overall;
    const value = analysis.estimatedValue;

    // Calculate expected value based on score
    // Score 50 = ~$5K, Score 70 = ~$50K, Score 90 = ~$500K
    const expectedValueForScore = Math.pow(10, 2 + (score / 25));

    // Calculate ratio
    const ratio = value / expectedValueForScore;

    if (ratio < 0.5) {
      // Value is less than half of expected - undervalued
      const magnitude = Math.min(100, Math.round((1 - ratio) * 100));
      return {
        signal: 'undervalued',
        magnitude,
        reason: score >= 60 ? 'High quality metrics but lower market valuation' : 'Room for value growth with improvements'
      };
    } else if (ratio > 2) {
      // Value is more than double expected - overvalued
      const magnitude = Math.min(100, Math.round((ratio - 1) * 50));
      return {
        signal: 'overvalued',
        magnitude,
        reason: 'Premium valuation may reflect brand value or traffic not captured in metrics'
      };
    } else {
      // Fair value range
      return {
        signal: 'fair',
        magnitude: 0,
        reason: 'Valuation aligns with quality metrics'
      };
    }
  };

  const valueOpportunity = calculateValueOpportunity();

  // Generate auto-narrative summary
  const generateNarrative = (): string => {
    const parts: string[] = [];
    const score = analysis.scores.overall;
    const value = analysis.estimatedValue;
    const domain = analysis.domain.domain;

    // Opening statement based on verdict
    if (verdict === 'STRONG BUY') {
      parts.push(`${domain} presents a compelling acquisition opportunity.`);
    } else if (verdict === 'BUY') {
      parts.push(`${domain} shows solid fundamentals worth considering.`);
    } else if (verdict === 'HOLD') {
      parts.push(`${domain} has mixed signals that warrant careful evaluation.`);
    } else {
      parts.push(`${domain} may need significant improvements to justify its current state.`);
    }

    // Key strengths
    const strengths: string[] = [];
    if (analysis.scores.domain >= 70) strengths.push('premium domain quality');
    if (analysis.scores.seo >= 70) strengths.push('strong SEO foundation');
    if (analysis.scores.performance >= 70) strengths.push('excellent performance');
    if (analysis.scores.security >= 70) strengths.push('robust security');
    if (analysis.traffic.trafficTier === 'high' || analysis.traffic.trafficTier === 'very-high') {
      strengths.push('significant traffic');
    }
    if (analysis.domain.ageYears >= 5) strengths.push(`${analysis.domain.ageYears}-year track record`);

    if (strengths.length > 0) {
      parts.push(`Key strengths include ${strengths.slice(0, 3).join(', ')}.`);
    }

    // Key weaknesses
    const weaknesses: string[] = [];
    if (analysis.scores.seo < 50) weaknesses.push('SEO optimization');
    if (analysis.scores.performance < 50) weaknesses.push('site performance');
    if (analysis.scores.security < 50) weaknesses.push('security measures');
    if (analysis.scores.content < 50) weaknesses.push('content depth');
    if (!analysis.technical.hasHttps) weaknesses.push('HTTPS implementation');

    if (weaknesses.length > 0) {
      parts.push(`Areas for improvement: ${weaknesses.slice(0, 2).join(' and ')}.`);
    }

    // Valuation context
    if (value >= 1000000) {
      parts.push(`The ${formatCurrency(value)} valuation reflects its established market presence.`);
    } else if (value >= 100000) {
      parts.push(`Valued at ${formatCurrency(value)}, there's room for growth with the right strategy.`);
    } else if (value >= 10000) {
      parts.push(`At ${formatCurrency(value)}, this represents a modest investment opportunity.`);
    } else {
      parts.push(`The ${formatCurrency(value)} valuation suggests early-stage or undeveloped potential.`);
    }

    // Recommendation count
    const criticalRecs = analysis.recommendations.filter(r => r.impact === 'critical' || r.impact === 'high').length;
    if (criticalRecs > 0) {
      parts.push(`${criticalRecs} high-impact improvements could significantly boost value.`);
    }

    return parts.join(' ');
  };

  const narrative = generateNarrative();

  // CSV Export function
  const exportToCSV = () => {
    const rows = [
      ['Website Valuation Report'],
      ['Generated', new Date().toISOString()],
      [''],
      ['Domain', analysis.domain.domain],
      ['Estimated Value', `$${analysis.estimatedValue.toLocaleString()}`],
      ['Value Range', `$${analysis.valueRange.min.toLocaleString()} - $${analysis.valueRange.max.toLocaleString()}`],
      ['Confidence', `${analysis.confidenceScore}%`],
      ['Verdict', verdict],
      [''],
      ['SCORES'],
      ['Overall Score', analysis.scores.overall],
      ['Domain Score', analysis.scores.domain],
      ['Performance Score', analysis.scores.performance],
      ['Technical Score', analysis.scores.technical],
      ['Security Score', analysis.scores.security],
      ['SEO Score', analysis.scores.seo],
      ['Content Score', analysis.scores.content],
      ['Social Score', analysis.scores.social],
      ['Monetization Score', analysis.scores.monetization],
      [''],
      ['VALUATION BREAKDOWN'],
      ['Domain Intrinsic Value', `$${analysis.valuationBreakdown.domainIntrinsicValue.toLocaleString()}`],
      ['Traffic Value', `$${analysis.valuationBreakdown.trafficValue.toLocaleString()}`],
      ['Content Value', `$${analysis.valuationBreakdown.contentValue.toLocaleString()}`],
      ['Technical Value', `$${analysis.valuationBreakdown.technicalValue.toLocaleString()}`],
      ['Brand Value', `$${analysis.valuationBreakdown.brandValue.toLocaleString()}`],
      ['Revenue Multiple', `$${analysis.valuationBreakdown.revenueMultiple.toLocaleString()}`],
      [''],
      ['DOMAIN DETAILS'],
      ['TLD', analysis.domain.tld],
      ['Age (Years)', analysis.domain.ageYears || 'Unknown'],
      ['Archive Snapshots', analysis.domain.archiveSnapshots],
      ['Keywords Found', analysis.domain.keywordsFound.join('; ') || 'None'],
      [''],
      ['TRAFFIC METRICS'],
      ['Monthly Visitors', analysis.traffic.estimatedMonthlyVisitors.toLocaleString()],
      ['Traffic Tier', analysis.traffic.trafficTier],
      ['Pageviews', analysis.traffic.estimatedPageviews.toLocaleString()],
      ['Bounce Rate', `${analysis.traffic.estimatedBounceRate}%`],
      [''],
      ['TECHNICAL'],
      ['HTTPS', analysis.technical.hasHttps ? 'Yes' : 'No'],
      ['Load Time (ms)', analysis.technical.loadTime],
      ['Has Sitemap', analysis.seo.hasSitemap ? 'Yes' : 'No'],
      ['Has Robots.txt', analysis.seo.hasRobotsTxt ? 'Yes' : 'No'],
      ['Structured Data', analysis.seo.hasStructuredData ? 'Yes' : 'No'],
      [''],
      ['SEO'],
      ['Title', `"${analysis.seo.title}"`],
      ['Description', `"${analysis.seo.description}"`],
      ['H1 Count', analysis.seo.h1Count],
      ['H2 Count', analysis.seo.h2Count],
      ['Image Count', analysis.seo.imageCount],
      [''],
      ['CONTENT'],
      ['Word Count', analysis.content.wordCount],
      ['Readability Grade', analysis.content.readabilityGrade],
      ['Has Privacy Policy', analysis.content.hasPrivacyPolicy ? 'Yes' : 'No'],
      ['Has Contact Info', analysis.content.hasContactInfo ? 'Yes' : 'No'],
      [''],
      ['MONETIZATION'],
      ['Revenue Model', analysis.monetization.revenueModel],
      ['Has Ads', analysis.monetization.hasAds ? 'Yes' : 'No'],
      ['Has E-commerce', analysis.monetization.hasEcommerce ? 'Yes' : 'No'],
      ['Est. Monthly Revenue', analysis.monetization.estimatedMonthlyRevenue.mid > 0 ? `$${analysis.monetization.estimatedMonthlyRevenue.mid.toLocaleString()}` : 'N/A'],
      [''],
      ['RECOMMENDATIONS'],
      ...analysis.recommendations.map((rec, i) => [
        `${i + 1}. ${rec.title}`,
        rec.description,
        `Impact: ${rec.impact}`,
        `Potential: +$${rec.potentialValueIncrease.toLocaleString()}`
      ]),
      [''],
      ['DATA SOURCES USED'],
      ...analysis.dataSourcesUsed.map(source => [source]),
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `${analysis.domain.domain.replace(/\./g, '-')}-valuation-${new Date().toISOString().split('T')[0]}.csv`;
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 fade-in">
        <div>
          <p className="text-gray-400 text-sm">Analysis Results for</p>
          <h2 className="text-xl font-semibold text-white break-all">{analysis.domain.domain}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {analysis.dataSourcesUsed.map((source, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                {source}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Confidence</p>
            <p className="text-lg font-bold text-white">{analysis.confidenceScore}%</p>
          </div>
          <button
            onClick={() => generatePDFReport(analysis)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium transition-all shadow-lg shadow-violet-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            PDF
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all shadow-lg shadow-emerald-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            CSV
          </button>
          <ShareButtons domain={analysis.domain.domain} value={analysis.estimatedValue} />
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            New Analysis
          </button>
        </div>
      </div>

      {/* Main Value Display */}
      <ValueDisplay
        value={analysis.estimatedValue}
        min={analysis.valueRange.min}
        max={analysis.valueRange.max}
        trancoRank={trancoRank}
        verdict={verdict}
        overallScore={analysis.scores.overall}
      />

      {/* Value Opportunity Signal */}
      {valueOpportunity.signal !== 'fair' && (
        <div className={`glass-card p-4 fade-in flex items-center gap-4 ${
          valueOpportunity.signal === 'undervalued'
            ? 'border border-emerald-500/30 bg-emerald-500/5'
            : 'border border-amber-500/30 bg-amber-500/5'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            valueOpportunity.signal === 'undervalued'
              ? 'bg-emerald-500/20'
              : 'bg-amber-500/20'
          }`}>
            {valueOpportunity.signal === 'undervalued' ? (
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold uppercase ${
                valueOpportunity.signal === 'undervalued' ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {valueOpportunity.signal === 'undervalued' ? 'Potential Opportunity' : 'Premium Pricing'}
              </span>
              {valueOpportunity.magnitude > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  valueOpportunity.signal === 'undervalued'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {valueOpportunity.magnitude}% {valueOpportunity.signal}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1">{valueOpportunity.reason}</p>
          </div>
        </div>
      )}

      {/* Auto-Generated Narrative Summary */}
      <div className="glass-card p-6 fade-in border-l-4 border-l-primary">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              Executive Summary
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-normal">AI Generated</span>
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{narrative}</p>
          </div>
        </div>
      </div>

      {/* Valuation Breakdown */}
      <div className="glass-card p-6 fade-in fade-in-delay-1">
        <h3 className="text-lg font-semibold text-white mb-4">Valuation Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Domain Value', value: analysis.valuationBreakdown.domainIntrinsicValue, color: '#8b5cf6' },
            { label: 'Traffic Value', value: analysis.valuationBreakdown.trafficValue, color: '#06b6d4' },
            { label: 'Content Value', value: analysis.valuationBreakdown.contentValue, color: '#10b981' },
            { label: 'Technical Value', value: analysis.valuationBreakdown.technicalValue, color: '#f59e0b' },
            { label: 'Brand Value', value: analysis.valuationBreakdown.brandValue, color: '#f472b6' },
            { label: 'Revenue Multiple', value: analysis.valuationBreakdown.revenueMultiple, color: '#ef4444' },
          ].map((item, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-white/5">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-lg font-bold" style={{ color: item.color }}>{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Estimation */}
      <div className="glass-card p-6 fade-in fade-in-delay-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingIcon />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Traffic Estimation</h3>
            <p className="text-xs text-gray-400">Based on {analysis.traffic.trafficSignals.length} signals</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-cyan-400">{formatNumber(analysis.traffic.estimatedMonthlyVisitors)}</p>
            <p className="text-xs text-gray-400">monthly visitors</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-xs text-gray-400">Traffic Tier</p>
            <p className="text-sm font-semibold text-white capitalize">{analysis.traffic.trafficTier.replace('-', ' ')}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-xs text-gray-400">Est. Pageviews</p>
            <p className="text-sm font-semibold text-white">{formatNumber(analysis.traffic.estimatedPageviews)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-xs text-gray-400">Est. Bounce Rate</p>
            <p className="text-sm font-semibold text-white">{analysis.traffic.estimatedBounceRate}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Traffic Signals</p>
          <div className="flex flex-wrap gap-2">
            {analysis.traffic.trafficSignals.map((signal, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-full ${
                  signal.impact === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                  signal.impact === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}
              >
                {signal.signal} ({signal.weight > 0 ? '+' : ''}{signal.weight})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI SEO Readiness - New Feature */}
      {analysis.aiSeo && (
        <div className="glass-card p-6 fade-in fade-in-delay-1 border border-violet-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                AI SEO Readiness
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-normal">NEW</span>
              </h3>
              <p className="text-xs text-gray-400">How well this site is optimized for AI assistants & search</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {analysis.aiSeo.overallAiSeoScore}
              </p>
              <p className="text-xs text-gray-400">AI SEO Score</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
              analysis.aiSeo.futureReadinessGrade === 'A+' ? 'bg-emerald-500/20 text-emerald-400' :
              analysis.aiSeo.futureReadinessGrade === 'A' ? 'bg-green-500/20 text-green-400' :
              analysis.aiSeo.futureReadinessGrade === 'B' ? 'bg-yellow-500/20 text-yellow-400' :
              analysis.aiSeo.futureReadinessGrade === 'C' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {analysis.aiSeo.futureReadinessGrade}
            </div>
          </div>

          {/* AI Crawlability Status */}
          <div className="mb-4 p-4 rounded-xl bg-white/5">
            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              AI Bot Access
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { name: 'GPT', allowed: analysis.aiSeo.aiCrawlability.allowsGptBot },
                { name: 'Claude', allowed: analysis.aiSeo.aiCrawlability.allowsClaudeBot },
                { name: 'Perplexity', allowed: analysis.aiSeo.aiCrawlability.allowsPerplexityBot },
                { name: 'Google AI', allowed: analysis.aiSeo.aiCrawlability.allowsGoogleAI },
                { name: 'CommonCrawl', allowed: analysis.aiSeo.aiCrawlability.allowsCcBot },
              ].map((bot, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  bot.allowed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {bot.allowed ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {bot.name}
                </div>
              ))}
            </div>
            {analysis.aiSeo.aiCrawlability.blocksAllAi && (
              <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                This site blocks all AI crawlers - significantly reducing AI visibility
              </p>
            )}
          </div>

          {/* AI-Optimized Content Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[
              { label: 'Crawlability', value: analysis.aiSeo.aiCrawlability.crawlabilityScore, color: 'violet' },
              { label: 'Structure', value: analysis.aiSeo.contentStructure.structureScore, color: 'purple' },
              { label: 'Answer Quality', value: analysis.aiSeo.answerQuality.answerDensityScore, color: 'fuchsia' },
              { label: 'Citation Ready', value: analysis.aiSeo.citationPotential.citationScore, color: 'pink' },
              { label: 'AI Patterns', value: analysis.aiSeo.aiContentPatterns.contentPatternsScore, color: 'rose' },
            ].map((metric, i) => (
              <div key={i} className="text-center p-3 rounded-xl bg-white/5">
                <div className="relative w-12 h-12 mx-auto mb-2">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={`${(metric.value / 100) * 125.6} 125.6`}
                      className={`text-${metric.color}-400`}
                      style={{ color: metric.color === 'violet' ? '#8b5cf6' : metric.color === 'purple' ? '#a855f7' : metric.color === 'fuchsia' ? '#d946ef' : metric.color === 'pink' ? '#ec4899' : '#f43f5e' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {metric.value}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{metric.label}</p>
              </div>
            ))}
          </div>

          {/* Schema Types Detected */}
          {analysis.aiSeo.contentStructure.schemaTypes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Schema Types Detected</p>
              <div className="flex flex-wrap gap-2">
                {analysis.aiSeo.contentStructure.schemaTypes.map((schema, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                    {schema}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content Features */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {[
              { label: 'Direct Answers', has: analysis.aiSeo.answerQuality.hasDirectAnswers },
              { label: 'Numbered Steps', has: analysis.aiSeo.aiContentPatterns.hasNumberedSteps },
              { label: 'Bullet Lists', has: analysis.aiSeo.aiContentPatterns.hasBulletedLists },
              { label: 'Comparisons', has: analysis.aiSeo.aiContentPatterns.hasComparisons },
              { label: 'Pros & Cons', has: analysis.aiSeo.aiContentPatterns.hasProsAndCons },
            ].map((feature, i) => (
              <div key={i} className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${
                feature.has ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-500'
              }`}>
                {feature.has ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                )}
                {feature.label}
              </div>
            ))}
          </div>

          {/* AI SEO Recommendations */}
          {analysis.aiSeo.aiSeoRecommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <h4 className="text-sm font-medium text-violet-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI SEO Recommendations
              </h4>
              <ul className="space-y-1">
                {analysis.aiSeo.aiSeoRecommendations.slice(0, 4).map((rec, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comparison with Traditional SEO */}
          <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div>
              <p className="text-xs text-gray-400">Traditional SEO Score</p>
              <p className="text-lg font-bold text-white">{analysis.scores.seo}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-gray-400">vs</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">AI SEO Score</p>
              <p className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                {analysis.aiSeo.overallAiSeoScore}
              </p>
            </div>
            <div className={`ml-4 px-3 py-1 rounded-lg text-xs font-medium ${
              analysis.aiSeo.overallAiSeoScore > analysis.scores.seo
                ? 'bg-emerald-500/20 text-emerald-400'
                : analysis.aiSeo.overallAiSeoScore < analysis.scores.seo
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {analysis.aiSeo.overallAiSeoScore > analysis.scores.seo
                ? `+${analysis.aiSeo.overallAiSeoScore - analysis.scores.seo} AI Ready`
                : analysis.aiSeo.overallAiSeoScore < analysis.scores.seo
                ? `${analysis.aiSeo.overallAiSeoScore - analysis.scores.seo} Gap`
                : 'Balanced'}
            </div>
          </div>
        </div>
      )}

      {/* Score Chart + Domain Card */}
      <div className="grid md:grid-cols-2 gap-6">
        <MetricsChart scores={analysis.scores} />

        <FactorCard
          title="Domain Quality"
          score={analysis.scores.domain}
          icon={<GlobeIcon />}
          color="#8b5cf6"
          delay={1}
          items={[
            { label: 'Domain', value: analysis.domain.domain },
            { label: 'TLD', value: analysis.domain.tld, good: analysis.domain.tldScore >= 70 },
            { label: 'Age', value: analysis.domain.ageYears > 0 ? `${analysis.domain.ageYears} years` : 'Unknown', good: analysis.domain.ageYears >= 2 },
            { label: 'Archive Snapshots', value: formatNumber(analysis.domain.archiveSnapshots), good: analysis.domain.archiveSnapshots > 50 },
            { label: 'Keywords Found', value: analysis.domain.keywordsFound.length > 0 ? analysis.domain.keywordsFound.join(', ') : 'None' },
          ]}
        />
      </div>

      {/* Performance + Technical Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analysis.performance ? (
          <FactorCard
            title="Performance"
            score={analysis.scores.performance}
            icon={<SpeedIcon />}
            color="#06b6d4"
            delay={2}
            items={[
              { label: 'Performance', value: `${analysis.performance.performanceScore}/100`, good: analysis.performance.performanceScore >= 80 },
              { label: 'Accessibility', value: `${analysis.performance.accessibilityScore}/100`, good: analysis.performance.accessibilityScore >= 80 },
              { label: 'SEO Score', value: `${analysis.performance.seoScore}/100`, good: analysis.performance.seoScore >= 80 },
              { label: 'LCP', value: formatMs(analysis.performance.largestContentfulPaint), good: analysis.performance.largestContentfulPaint < 2500 },
              { label: 'Page Size', value: formatBytes(analysis.performance.totalPageSize) },
            ]}
          />
        ) : (
          <FactorCard
            title="Performance"
            score={50}
            icon={<SpeedIcon />}
            color="#06b6d4"
            delay={2}
            items={[
              { label: 'Status', value: 'PageSpeed unavailable' },
              { label: 'Load Time', value: formatMs(analysis.technical.loadTime), good: analysis.technical.loadTime < 2000 },
              { label: 'HTML Size', value: formatBytes(analysis.technical.htmlSize) },
            ]}
          />
        )}

        <FactorCard
          title="Technical"
          score={analysis.scores.technical}
          icon={<CodeIcon />}
          color="#f59e0b"
          delay={2}
          items={[
            { label: 'HTTPS', value: analysis.technical.hasHttps },
            { label: 'Meta Description', value: analysis.technical.hasMetaDescription },
            { label: 'Open Graph', value: analysis.technical.hasOpenGraph },
            { label: 'Canonical', value: analysis.technical.hasCanonical },
            { label: 'Viewport Meta', value: analysis.technical.hasViewportMeta },
          ]}
        />

        <FactorCard
          title="Security"
          score={analysis.scores.security}
          icon={<ShieldIcon />}
          color="#ef4444"
          delay={3}
          items={[
            { label: 'Grade', value: analysis.security.securityGrade, good: ['A+', 'A', 'B'].includes(analysis.security.securityGrade) },
            { label: 'HTTPS', value: analysis.security.hasHttps },
            { label: 'Secure Forms', value: analysis.security.hasSecureForms },
            { label: 'No Mixed Content', value: analysis.security.noMixedContent },
            { label: 'CSP', value: analysis.security.hasContentSecurityPolicy },
          ]}
        />

        <FactorCard
          title="Infrastructure"
          score={analysis.dns.infrastructureScore}
          icon={<ServerIcon />}
          color="#a855f7"
          delay={3}
          items={[
            { label: 'MX Records', value: analysis.dns.hasMxRecords },
            { label: 'SPF Record', value: analysis.dns.hasSpfRecord },
            { label: 'DMARC', value: analysis.dns.hasDmarcRecord },
            { label: 'CDN', value: analysis.dns.isUsingCloudflare ? 'Cloudflare' : analysis.dns.isUsingAwsRoute53 ? 'AWS' : 'None' },
            { label: 'Email Setup', value: analysis.dns.hasProperEmailSetup },
          ]}
        />
      </div>

      {/* SEO + Content + Social + Monetization */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FactorCard
          title="SEO"
          score={analysis.scores.seo}
          icon={<SearchIcon />}
          color="#f472b6"
          delay={3}
          items={[
            { label: 'Title Score', value: `${analysis.seo.titleScore}/100`, good: analysis.seo.titleScore >= 75 },
            { label: 'Description', value: `${analysis.seo.descriptionScore}/100`, good: analysis.seo.descriptionScore >= 75 },
            { label: 'H1 Tags', value: analysis.seo.h1Count, good: analysis.seo.h1Count === 1 },
            { label: 'Sitemap', value: analysis.seo.hasSitemap },
            { label: 'Structured Data', value: analysis.seo.hasStructuredData },
          ]}
        />

        <FactorCard
          title="Content"
          score={analysis.scores.content}
          icon={<FileIcon />}
          color="#10b981"
          delay={4}
          items={[
            { label: 'Word Count', value: formatNumber(analysis.content.wordCount), good: analysis.content.wordCount >= 500 },
            { label: 'Readability', value: analysis.content.readabilityGrade, good: ['A', 'B'].includes(analysis.content.readabilityGrade) },
            { label: 'Privacy Policy', value: analysis.content.hasPrivacyPolicy },
            { label: 'Contact Info', value: analysis.content.hasContactInfo },
            { label: 'About Page', value: analysis.content.hasAboutPage },
          ]}
        />

        <FactorCard
          title="Social"
          score={analysis.scores.social}
          icon={<UsersIcon />}
          color="#3b82f6"
          delay={4}
          items={[
            { label: 'Platforms', value: `${analysis.social.socialLinksCount}/7`, good: analysis.social.socialLinksCount >= 3 },
            { label: 'Facebook', value: analysis.social.hasFacebook },
            { label: 'Twitter/X', value: analysis.social.hasTwitter },
            { label: 'LinkedIn', value: analysis.social.hasLinkedIn },
            { label: 'Social Proof', value: analysis.social.hasSocialProof },
          ]}
        />

        <FactorCard
          title="Monetization"
          score={analysis.scores.monetization}
          icon={<DollarIcon />}
          color="#eab308"
          delay={4}
          items={[
            { label: 'Revenue Model', value: analysis.monetization.revenueModel === 'unknown' ? 'None detected' : analysis.monetization.revenueModel.replace('-', ' ') },
            { label: 'Has Ads', value: analysis.monetization.hasAds },
            { label: 'E-commerce', value: analysis.monetization.hasEcommerce },
            { label: 'Subscription', value: analysis.monetization.hasSubscription },
            { label: 'Est. Monthly Rev', value: analysis.monetization.estimatedMonthlyRevenue.mid > 0 ? formatCurrency(analysis.monetization.estimatedMonthlyRevenue.mid) : 'N/A' },
          ]}
        />
      </div>

      {/* Technology Stack */}
      {(analysis.technology.cms || analysis.technology.framework || analysis.technology.analytics.length > 0) && (
        <div className="glass-card p-6 fade-in fade-in-delay-4">
          <h3 className="text-lg font-semibold text-white mb-4">Technology Stack Detected</h3>
          <div className="flex flex-wrap gap-3">
            {analysis.technology.cms && (
              <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-sm">
                CMS: {analysis.technology.cms}
              </span>
            )}
            {analysis.technology.framework && (
              <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm">
                Framework: {analysis.technology.framework}
              </span>
            )}
            {analysis.technology.ecommerce && (
              <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-sm">
                E-commerce: {analysis.technology.ecommerce}
              </span>
            )}
            {analysis.technology.analytics.map((a, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm">
                {a}
              </span>
            ))}
            {analysis.technology.cdns.map((c, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 text-sm">
                CDN: {c}
              </span>
            ))}
            {analysis.technology.marketing.map((m, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-400 text-sm">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="glass-card p-6 fade-in fade-in-delay-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Recommendations to Increase Value
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  rec.impact === 'critical' ? 'bg-red-500' :
                  rec.impact === 'high' ? 'bg-orange-400' :
                  rec.impact === 'medium' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-gray-500 uppercase">{rec.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                        rec.impact === 'high' ? 'bg-orange-400/20 text-orange-400' :
                        rec.impact === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-blue-400/20 text-blue-400'
                      }`}>
                        {rec.impact}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.effort === 'easy' ? 'bg-green-500/20 text-green-400' :
                        rec.effort === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {rec.effort}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                  <p className="text-gray-400 text-xs mt-1">{rec.description}</p>
                  <p className="text-emerald-400 text-xs mt-2 font-medium">
                    +{formatCurrency(rec.potentialValueIncrease)} potential
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domain Registration Affiliate */}
      <DomainRegistration
        domain={analysis.domain.domain}
        estimatedValue={analysis.estimatedValue}
      />

      {/* Analysis Meta */}
      <div className="text-center text-gray-500 text-xs py-4">
        Analysis completed in {(analysis.analysisTime / 1000).toFixed(2)}s | Version {analysis.analysisVersion}
      </div>
    </div>
  );
}

// Share Buttons Component
function ShareButtons({ domain, value }: { domain: string; value: number }) {
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);

  const shareText = `I just discovered that ${domain} is worth ${formatCurrency(value)}! Check your website's value:`;
  const shareUrl = 'https://whatsitworth.netlify.app';

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const copyToClipboard = () => {
    const text = `${shareText} ${shareUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={shareToTwitter}
        className="p-2 rounded-lg bg-white/5 hover:bg-[#1DA1F2]/20 border border-white/10 hover:border-[#1DA1F2]/50 text-gray-400 hover:text-[#1DA1F2] transition-all"
        title="Share on X/Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </button>
      <button
        onClick={shareToLinkedIn}
        className="p-2 rounded-lg bg-white/5 hover:bg-[#0A66C2]/20 border border-white/10 hover:border-[#0A66C2]/50 text-gray-400 hover:text-[#0A66C2] transition-all"
        title="Share on LinkedIn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </button>
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 transition-all"
        title="Copy to clipboard"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      </button>
    </div>
  );
}
