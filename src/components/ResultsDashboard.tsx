import type { WebsiteAnalysis } from '../types/analysis';
import { ValueDisplay } from './ValueDisplay';
import { MetricsChart } from './MetricsChart';
import { FactorCard } from './FactorCard';
import { DomainRegistration } from './DomainRegistration';

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
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            New Analysis
          </button>
        </div>
      </div>

      {/* Main Value Display */}
      <ValueDisplay value={analysis.estimatedValue} min={analysis.valueRange.min} max={analysis.valueRange.max} />

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
