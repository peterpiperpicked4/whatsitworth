// ============================================
// DOMAIN ANALYSIS
// ============================================
export interface DomainAnalysis {
  domain: string;
  tld: string;
  tldScore: number;
  length: number;
  hasNumbers: boolean;
  hasHyphens: boolean;
  isKeywordRich: boolean;
  keywordsFound: string[];
  // Real data from Wayback Machine
  firstIndexed: Date | null;
  ageYears: number;
  archiveSnapshots: number;
  hasSignificantHistory: boolean;
}

// ============================================
// PERFORMANCE ANALYSIS (from Google PageSpeed)
// ============================================
export interface PerformanceAnalysis {
  // Core Web Vitals
  performanceScore: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  speedIndex: number;
  timeToInteractive: number;
  // Additional metrics
  serverResponseTime: number;
  totalPageSize: number;
  totalRequests: number;
  // Lighthouse scores
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
  // Calculated
  performanceGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

// ============================================
// TECHNICAL ANALYSIS
// ============================================
export interface TechnicalAnalysis {
  hasHttps: boolean;
  loadTime: number;
  htmlSize: number;
  hasMetaDescription: boolean;
  hasMetaKeywords: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasFavicon: boolean;
  hasCanonical: boolean;
  hasViewportMeta: boolean;
  hasCharsetMeta: boolean;
  hasLanguageAttr: boolean;
}

// ============================================
// DNS & EMAIL ANALYSIS
// ============================================
export interface DnsAnalysis {
  hasMxRecords: boolean;
  mxRecordCount: number;
  hasSpfRecord: boolean;
  hasDmarcRecord: boolean;
  nameservers: string[];
  isUsingCloudflare: boolean;
  isUsingAwsRoute53: boolean;
  isUsingGoogleCloud: boolean;
  hasProperEmailSetup: boolean;
  infrastructureScore: number;
}

// ============================================
// SECURITY ANALYSIS
// ============================================
export interface SecurityAnalysis {
  hasHttps: boolean;
  hasHsts: boolean;
  hasContentSecurityPolicy: boolean;
  hasXFrameOptions: boolean;
  securityScore: number;
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  hasSecureForms: boolean;
  noMixedContent: boolean;
}

// ============================================
// TECHNOLOGY STACK
// ============================================
export interface TechnologyAnalysis {
  cms: string | null;
  framework: string | null;
  analytics: string[];
  cdns: string[];
  cdn: string | null; // Primary CDN
  hosting: string | null;
  ecommerce: string | null;
  marketing: string[];
  isWordPress: boolean;
  isShopify: boolean;
  isModernStack: boolean;
  techStackScore: number;
  hasGoogleAnalytics: boolean;
  hasGoogleTagManager: boolean;
}

// ============================================
// SEO ANALYSIS
// ============================================
export interface SeoAnalysis {
  title: string;
  titleLength: number;
  titleScore: number;
  description: string;
  descriptionLength: number;
  descriptionScore: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  headingStructureScore: number;
  imageCount: number;
  imagesWithAlt: number;
  imageOptimizationScore: number;
  internalLinks: number;
  externalLinks: number;
  hasStructuredData: boolean;
  structuredDataTypes: string[];
  hasCanonical: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  estimatedPageCount: number;
}

// ============================================
// CONTENT ANALYSIS
// ============================================
export interface ContentAnalysis {
  wordCount: number;
  paragraphCount: number;
  avgWordsPerParagraph: number;
  readabilityScore: number;
  readabilityGrade: string;
  hasContactInfo: boolean;
  hasPrivacyPolicy: boolean;
  hasTerms: boolean;
  hasAboutPage: boolean;
  contentDepthScore: number;
  uniqueContentIndicators: number;
}

// ============================================
// SOCIAL ANALYSIS
// ============================================
export interface SocialAnalysis {
  hasFacebook: boolean;
  hasTwitter: boolean;
  hasLinkedIn: boolean;
  hasInstagram: boolean;
  hasYouTube: boolean;
  hasTikTok: boolean;
  hasPinterest: boolean;
  socialLinksCount: number;
  hasSocialProof: boolean;
  socialScore: number;
}

// ============================================
// TRAFFIC ESTIMATION
// ============================================
export interface TrafficEstimate {
  estimatedMonthlyVisitors: number;
  trafficTier: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  confidenceLevel: number; // 0-100
  trafficSignals: {
    signal: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  estimatedPageviews: number;
  estimatedBounceRate: number;
}

// ============================================
// MONETIZATION ANALYSIS
// ============================================
export interface MonetizationAnalysis {
  hasAds: boolean;
  adNetworks: string[];
  hasAffiliate: boolean;
  hasEcommerce: boolean;
  hasSubscription: boolean;
  hasDonations: boolean;
  hasLeadGen: boolean;
  monetizationMethods: string[];
  revenueModel: 'advertising' | 'ecommerce' | 'saas' | 'lead-gen' | 'content' | 'mixed' | 'unknown';
  estimatedMonthlyRevenue: {
    low: number;
    mid: number;
    high: number;
  };
}

// ============================================
// SCORE BREAKDOWN
// ============================================
export interface ScoreBreakdown {
  domain: number;
  performance: number;
  technical: number;
  security: number;
  seo: number;
  content: number;
  social: number;
  monetization: number;
  overall: number;
}

// ============================================
// RECOMMENDATIONS
// ============================================
export interface Recommendation {
  category: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  potentialValueIncrease: number;
}

// ============================================
// VALUATION DETAILS
// ============================================
export interface ValuationBreakdown {
  domainIntrinsicValue: number;
  trafficValue: number;
  contentValue: number;
  technicalValue: number;
  brandValue: number;
  revenueMultiple: number;
}

// ============================================
// DOMAIN RANKING (Tranco)
// ============================================
export interface DomainRanking {
  isRanked: boolean;
  rank: number | null;
  percentile: number | null;
  trafficTier: 'top-100' | 'top-1k' | 'top-10k' | 'top-100k' | 'top-1m' | 'unranked';
}

// ============================================
// SOCIAL FOLLOWERS
// ============================================
export interface SocialFollowersData {
  twitter: number | null;
  twitterHandle: string | null;
  linkedin: number | null;
  facebook: number | null;
  instagram: number | null;
  youtube: number | null;
  totalFollowers: number;
  platformsWithData: number;
}

// ============================================
// SSL/TLS ANALYSIS
// ============================================
export interface SSLAnalysis {
  grade: string | null;
  protocol: string | null;
  keyStrength: number | null;
  certExpiresIn: number | null;
  supportsHsts: boolean;
  vulnerabilities: string[];
  analysisComplete: boolean;
}

// ============================================
// MAIN ANALYSIS RESULT
// ============================================
export interface WebsiteAnalysis {
  url: string;
  analyzedAt: Date;
  analysisVersion: string;

  // All analysis sections
  domain: DomainAnalysis;
  performance: PerformanceAnalysis | null;
  technical: TechnicalAnalysis;
  dns: DnsAnalysis;
  security: SecurityAnalysis;
  technology: TechnologyAnalysis;
  seo: SeoAnalysis;
  content: ContentAnalysis;
  social: SocialAnalysis;
  traffic: TrafficEstimate;
  monetization: MonetizationAnalysis;

  // New data sources
  ranking: DomainRanking | null;
  socialFollowers: SocialFollowersData | null;
  ssl: SSLAnalysis | null;

  // Scores
  scores: ScoreBreakdown;

  // Valuation
  estimatedValue: number;
  valueRange: {
    min: number;
    max: number;
  };
  valuationBreakdown: ValuationBreakdown;
  confidenceScore: number;

  // Recommendations
  recommendations: Recommendation[];

  // Meta
  dataSourcesUsed: string[];
  analysisTime: number;
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'complete' | 'error';

export interface AnalysisProgress {
  stage: string;
  percent: number;
  currentTask: string;
}
