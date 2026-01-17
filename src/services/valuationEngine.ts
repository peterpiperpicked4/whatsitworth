/**
 * COMPREHENSIVE WEBSITE VALUATION ENGINE v2.0
 *
 * This engine uses multiple data sources and a proprietary algorithm
 * to estimate website value based on:
 * - Domain intrinsic value
 * - Traffic estimation
 * - Technical quality
 * - SEO strength
 * - Content depth
 * - Monetization potential
 * - Brand/trust signals
 */

import type {
  WebsiteAnalysis,
  DomainAnalysis,
  PerformanceAnalysis,
  TechnicalAnalysis,
  DnsAnalysis,
  SecurityAnalysis,
  TechnologyAnalysis,
  SeoAnalysis,
  ContentAnalysis,
  SocialAnalysis,
  TrafficEstimate,
  MonetizationAnalysis,
  ScoreBreakdown,
  ValuationBreakdown,
  Recommendation,
  DomainRanking,
  SocialFollowersData,
  SSLAnalysis,
} from '../types/analysis';

import {
  getPageSpeedInsights,
  getWaybackHistory,
  analyzeDns,
  detectTechnologies,
  analyzeCrawlability,
  analyzeSecurityHeaders,
  getTrancoRank,
  scrapeSocialFollowers,
  getSSLLabsGrade,
  // New v2.1 APIs
  getRdapData,
  getIndexedPageCount,
  getCruxData,
  getBacklinkEstimate,
  getBrandMentions,
  analyzeMobileFriendliness,
  type TrancoRankResult,
  type RdapResult,
  type IndexedPagesResult,
  type CruxResult,
  type BacklinkResult,
  type BrandMentionsResult,
  type MobileFriendlyResult,
} from './realApis';

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// TLD Value Scores (based on market data)
const TLD_VALUES: Record<string, { score: number; baseValue: number }> = {
  '.com': { score: 100, baseValue: 2000 },
  '.org': { score: 85, baseValue: 1200 },
  '.net': { score: 80, baseValue: 1000 },
  '.io': { score: 78, baseValue: 1500 },
  '.co': { score: 72, baseValue: 800 },
  '.ai': { score: 82, baseValue: 2500 },
  '.app': { score: 70, baseValue: 600 },
  '.dev': { score: 70, baseValue: 600 },
  '.tech': { score: 60, baseValue: 400 },
  '.me': { score: 55, baseValue: 300 },
  '.info': { score: 40, baseValue: 150 },
  '.biz': { score: 35, baseValue: 100 },
  '.xyz': { score: 30, baseValue: 50 },
};

// High-value keyword categories
const KEYWORD_VALUES: Record<string, number> = {
  // Finance
  'finance': 5000, 'bank': 8000, 'loan': 6000, 'credit': 5000, 'invest': 7000,
  'money': 4000, 'pay': 3000, 'cash': 3000, 'wealth': 4000, 'crypto': 5000,
  // Tech
  'tech': 3000, 'software': 4000, 'app': 2500, 'cloud': 4000, 'ai': 5000,
  'data': 3500, 'code': 2000, 'dev': 2000, 'digital': 2500, 'cyber': 3000,
  // Commerce
  'shop': 3500, 'store': 3000, 'buy': 3000, 'sell': 2500, 'market': 3000,
  'deal': 2000, 'price': 2000, 'sale': 2000, 'trade': 3000, 'auction': 2500,
  // Health
  'health': 4000, 'medical': 5000, 'doctor': 4000, 'care': 3000, 'fitness': 2500,
  'diet': 2000, 'wellness': 2500, 'pharma': 5000, 'dental': 3000, 'therapy': 3000,
  // Travel
  'travel': 3500, 'hotel': 4000, 'flight': 3500, 'tour': 2500, 'vacation': 3000,
  'trip': 2000, 'booking': 3000, 'resort': 3500, 'cruise': 3000,
  // Real Estate
  'home': 3500, 'house': 3000, 'real': 2000, 'estate': 4000, 'property': 3500,
  'rent': 2500, 'apartment': 2500, 'condo': 2000, 'land': 2500,
  // Legal
  'law': 5000, 'legal': 4500, 'attorney': 5000, 'lawyer': 5000, 'court': 3000,
  // Insurance
  'insurance': 6000, 'insure': 4000, 'policy': 3000, 'coverage': 3000,
  // Education
  'learn': 2000, 'edu': 2500, 'course': 2000, 'school': 2500, 'university': 3000,
  'training': 2000, 'tutor': 2000, 'academy': 2000,
  // General High-Value
  'best': 2000, 'top': 1500, 'pro': 1500, 'expert': 2000, 'premium': 2000,
  'online': 1500, 'free': 1500, 'fast': 1000, 'easy': 1000, 'smart': 1500,
};

// Industry CPM rates for traffic valuation
const INDUSTRY_CPMS: Record<string, number> = {
  'finance': 15.0,
  'insurance': 18.0,
  'legal': 12.0,
  'health': 8.0,
  'technology': 5.0,
  'ecommerce': 4.0,
  'travel': 6.0,
  'education': 4.0,
  'entertainment': 2.0,
  'news': 2.5,
  'general': 3.0,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url;
  }
  url = url.replace(/^(https?:\/\/)www\./, '$1');
  return url;
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

function detectIndustry(html: string, domain: string): string {
  const text = (html + ' ' + domain).toLowerCase();

  if (/financ|bank|loan|credit|invest|stock|trading/i.test(text)) return 'finance';
  if (/insurance|insure|policy|coverage/i.test(text)) return 'insurance';
  if (/law|legal|attorney|lawyer/i.test(text)) return 'legal';
  if (/health|medical|doctor|hospital|clinic|pharma/i.test(text)) return 'health';
  if (/tech|software|saas|app|cloud|developer/i.test(text)) return 'technology';
  if (/shop|store|buy|cart|checkout|product/i.test(text)) return 'ecommerce';
  if (/travel|hotel|flight|vacation|booking/i.test(text)) return 'travel';
  if (/learn|course|education|school|university/i.test(text)) return 'education';
  if (/news|blog|article|magazine/i.test(text)) return 'news';
  if (/game|movie|music|entertainment/i.test(text)) return 'entertainment';

  return 'general';
}

// ============================================
// DOMAIN ANALYSIS
// ============================================

async function analyzeDomainComprehensive(url: string): Promise<DomainAnalysis> {
  const domain = extractDomain(url);
  const parts = domain.split('.');
  const tld = '.' + parts[parts.length - 1];
  const name = parts.slice(0, -1).join('.');

  // Get real age from Wayback Machine
  const wayback = await getWaybackHistory(domain);

  // Analyze domain characteristics
  const hasNumbers = /\d/.test(name);
  const hasHyphens = /-/.test(name);

  // Find valuable keywords
  const keywordsFound: string[] = [];
  for (const keyword of Object.keys(KEYWORD_VALUES)) {
    if (name.toLowerCase().includes(keyword)) {
      keywordsFound.push(keyword);
    }
  }

  const tldData = TLD_VALUES[tld] || { score: 30, baseValue: 50 };

  return {
    domain,
    tld,
    tldScore: tldData.score,
    length: name.length,
    hasNumbers,
    hasHyphens,
    isKeywordRich: keywordsFound.length > 0,
    keywordsFound,
    firstIndexed: wayback.firstSnapshot,
    ageYears: wayback.estimatedAgeYears,
    archiveSnapshots: wayback.totalSnapshots,
    hasSignificantHistory: wayback.totalSnapshots > 50 || wayback.estimatedAgeYears > 5,
  };
}

// ============================================
// TECHNICAL ANALYSIS
// ============================================

function analyzeTechnicalComprehensive(url: string, html: string, loadTime: number): TechnicalAnalysis {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  return {
    hasHttps: url.startsWith('https://'),
    loadTime: Math.round(loadTime),
    htmlSize: new Blob([html]).size,
    hasMetaDescription: !!doc.querySelector('meta[name="description"]')?.getAttribute('content'),
    hasMetaKeywords: !!doc.querySelector('meta[name="keywords"]')?.getAttribute('content'),
    hasOpenGraph: !!doc.querySelector('meta[property="og:title"]'),
    hasTwitterCard: !!doc.querySelector('meta[name="twitter:card"]'),
    hasFavicon: !!doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]'),
    hasCanonical: !!doc.querySelector('link[rel="canonical"]'),
    hasViewportMeta: !!doc.querySelector('meta[name="viewport"]'),
    hasCharsetMeta: !!doc.querySelector('meta[charset]') || html.includes('charset='),
    hasLanguageAttr: !!doc.documentElement.getAttribute('lang'),
  };
}

// ============================================
// SEO ANALYSIS
// ============================================

function analyzeSeoComprehensive(html: string, crawlability: { hasSitemap: boolean; hasRobotsTxt: boolean; estimatedPageCount: number }): SeoAnalysis {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  // Title scoring
  let titleScore = 0;
  if (title.length > 0) {
    titleScore = 40;
    if (title.length >= 30 && title.length <= 60) titleScore = 100;
    else if (title.length >= 20 && title.length <= 70) titleScore = 75;
    else if (title.length > 70) titleScore = 50;
  }

  // Description scoring
  let descriptionScore = 0;
  if (description.length > 0) {
    descriptionScore = 40;
    if (description.length >= 120 && description.length <= 160) descriptionScore = 100;
    else if (description.length >= 80 && description.length <= 200) descriptionScore = 75;
  }

  const h1s = doc.querySelectorAll('h1');
  const h2s = doc.querySelectorAll('h2');
  const h3s = doc.querySelectorAll('h3');

  // Heading structure score
  let headingStructureScore = 0;
  if (h1s.length === 1) headingStructureScore += 40;
  else if (h1s.length > 0) headingStructureScore += 20;
  if (h2s.length >= 2) headingStructureScore += 30;
  else if (h2s.length === 1) headingStructureScore += 15;
  if (h3s.length >= 2) headingStructureScore += 30;
  else if (h3s.length === 1) headingStructureScore += 15;

  const images = doc.querySelectorAll('img');
  const imagesWithAlt = doc.querySelectorAll('img[alt]:not([alt=""])');
  const imageOptimizationScore = images.length > 0
    ? Math.round((imagesWithAlt.length / images.length) * 100)
    : 100;

  const links = doc.querySelectorAll('a[href]');
  let internalLinks = 0;
  let externalLinks = 0;
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('http') && !href.includes(location.hostname)) {
      externalLinks++;
    } else {
      internalLinks++;
    }
  });

  // Structured data detection
  const structuredDataScripts = doc.querySelectorAll('script[type="application/ld+json"]');
  const structuredDataTypes: string[] = [];
  structuredDataScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data['@type']) structuredDataTypes.push(data['@type']);
    } catch { /* ignore parse errors */ }
  });

  return {
    title,
    titleLength: title.length,
    titleScore,
    description,
    descriptionLength: description.length,
    descriptionScore,
    h1Count: h1s.length,
    h2Count: h2s.length,
    h3Count: h3s.length,
    headingStructureScore,
    imageCount: images.length,
    imagesWithAlt: imagesWithAlt.length,
    imageOptimizationScore,
    internalLinks,
    externalLinks,
    hasStructuredData: structuredDataTypes.length > 0,
    structuredDataTypes,
    hasCanonical: !!doc.querySelector('link[rel="canonical"]'),
    hasSitemap: crawlability.hasSitemap,
    hasRobotsTxt: crawlability.hasRobotsTxt,
    estimatedPageCount: crawlability.estimatedPageCount,
  };
}

// ============================================
// CONTENT ANALYSIS
// ============================================

function analyzeContentComprehensive(html: string): ContentAnalysis {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove non-content elements
  doc.querySelectorAll('script, style, noscript, nav, header, footer').forEach(el => el.remove());

  const textContent = doc.body?.textContent || '';
  const words = textContent.split(/\s+/).filter(word => word.length > 2);
  const paragraphs = doc.querySelectorAll('p');

  // Readability calculation (Flesch-Kincaid simplified)
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

  let readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 3));

  // Readability grade
  let readabilityGrade = 'F';
  if (readabilityScore >= 90) readabilityGrade = 'A';
  else if (readabilityScore >= 80) readabilityGrade = 'B';
  else if (readabilityScore >= 70) readabilityGrade = 'C';
  else if (readabilityScore >= 60) readabilityGrade = 'D';

  const lowerText = textContent.toLowerCase();
  const lowerHtml = html.toLowerCase();

  // Content depth score
  let contentDepthScore = 0;
  if (words.length >= 2000) contentDepthScore = 100;
  else if (words.length >= 1000) contentDepthScore = 80;
  else if (words.length >= 500) contentDepthScore = 60;
  else if (words.length >= 300) contentDepthScore = 40;
  else if (words.length >= 100) contentDepthScore = 20;

  // Unique content indicators
  let uniqueContentIndicators = 0;
  if (doc.querySelectorAll('blockquote').length > 0) uniqueContentIndicators++;
  if (doc.querySelectorAll('table').length > 0) uniqueContentIndicators++;
  if (doc.querySelectorAll('ul, ol').length > 2) uniqueContentIndicators++;
  if (doc.querySelectorAll('figure, figcaption').length > 0) uniqueContentIndicators++;
  if (doc.querySelectorAll('code, pre').length > 0) uniqueContentIndicators++;
  if (doc.querySelectorAll('video, audio').length > 0) uniqueContentIndicators++;

  return {
    wordCount: words.length,
    paragraphCount: paragraphs.length,
    avgWordsPerParagraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
    readabilityScore: Math.round(readabilityScore),
    readabilityGrade,
    hasContactInfo: /contact|email|phone|call us|reach us|\+1|\(\d{3}\)/i.test(lowerText),
    hasPrivacyPolicy: /privacy policy|privacy notice/i.test(lowerText) || lowerHtml.includes('href') && lowerHtml.includes('privacy'),
    hasTerms: /terms of service|terms and conditions|terms of use/i.test(lowerText) || lowerHtml.includes('href') && lowerHtml.includes('terms'),
    hasAboutPage: lowerHtml.includes('href') && (lowerHtml.includes('about') || lowerHtml.includes('about-us')),
    contentDepthScore,
    uniqueContentIndicators,
  };
}

// ============================================
// SOCIAL ANALYSIS
// ============================================

function analyzeSocialComprehensive(html: string): SocialAnalysis {
  const lowerHtml = html.toLowerCase();

  const hasFacebook = lowerHtml.includes('facebook.com');
  const hasTwitter = lowerHtml.includes('twitter.com') || lowerHtml.includes('x.com');
  const hasLinkedIn = lowerHtml.includes('linkedin.com');
  const hasInstagram = lowerHtml.includes('instagram.com');
  const hasYouTube = lowerHtml.includes('youtube.com');
  const hasTikTok = lowerHtml.includes('tiktok.com');
  const hasPinterest = lowerHtml.includes('pinterest.com');

  const platforms = [hasFacebook, hasTwitter, hasLinkedIn, hasInstagram, hasYouTube, hasTikTok, hasPinterest];
  const socialLinksCount = platforms.filter(Boolean).length;

  // Social proof indicators
  const hasSocialProof =
    /testimonial|review|rating|customer|client|case study/i.test(lowerHtml) ||
    lowerHtml.includes('trustpilot') ||
    lowerHtml.includes('yelp');

  // Social score
  let socialScore = socialLinksCount * 14; // Max 98 for all 7 platforms
  if (hasSocialProof) socialScore = Math.min(100, socialScore + 20);

  return {
    hasFacebook,
    hasTwitter,
    hasLinkedIn,
    hasInstagram,
    hasYouTube,
    hasTikTok,
    hasPinterest,
    socialLinksCount,
    hasSocialProof,
    socialScore,
  };
}

// ============================================
// MONETIZATION ANALYSIS
// ============================================

function analyzeMonetization(html: string, technology: { ecommerce: string | null }): MonetizationAnalysis {
  const lowerHtml = html.toLowerCase();

  // Ad network detection
  const adNetworks: string[] = [];
  if (lowerHtml.includes('googlesyndication') || lowerHtml.includes('adsense')) adNetworks.push('Google AdSense');
  if (lowerHtml.includes('doubleclick')) adNetworks.push('Google Ad Manager');
  if (lowerHtml.includes('amazon-adsystem')) adNetworks.push('Amazon Ads');
  if (lowerHtml.includes('media.net')) adNetworks.push('Media.net');
  if (lowerHtml.includes('taboola')) adNetworks.push('Taboola');
  if (lowerHtml.includes('outbrain')) adNetworks.push('Outbrain');
  if (lowerHtml.includes('criteo')) adNetworks.push('Criteo');

  const hasAds = adNetworks.length > 0;

  // Affiliate detection
  const hasAffiliate =
    lowerHtml.includes('affiliate') ||
    lowerHtml.includes('amzn.to') ||
    lowerHtml.includes('amazon.com/gp/product') ||
    lowerHtml.includes('shareasale') ||
    lowerHtml.includes('commission') ||
    lowerHtml.includes('partner');

  // E-commerce detection
  const hasEcommerce = !!technology.ecommerce ||
    lowerHtml.includes('add to cart') ||
    lowerHtml.includes('checkout') ||
    lowerHtml.includes('shopping cart') ||
    lowerHtml.includes('buy now');

  // Subscription/SaaS detection
  const hasSubscription =
    lowerHtml.includes('pricing') ||
    lowerHtml.includes('subscribe') ||
    lowerHtml.includes('membership') ||
    lowerHtml.includes('/month') ||
    lowerHtml.includes('free trial') ||
    lowerHtml.includes('sign up');

  // Donation detection
  const hasDonations =
    lowerHtml.includes('donate') ||
    lowerHtml.includes('patreon') ||
    lowerHtml.includes('ko-fi') ||
    lowerHtml.includes('buymeacoffee') ||
    lowerHtml.includes('paypal.me');

  // Lead generation detection
  const hasLeadGen =
    lowerHtml.includes('contact form') ||
    lowerHtml.includes('get a quote') ||
    lowerHtml.includes('request demo') ||
    lowerHtml.includes('free consultation') ||
    lowerHtml.includes('schedule a call');

  // Determine monetization methods and revenue model
  const monetizationMethods: string[] = [];
  if (hasAds) monetizationMethods.push('Advertising');
  if (hasAffiliate) monetizationMethods.push('Affiliate Marketing');
  if (hasEcommerce) monetizationMethods.push('E-commerce');
  if (hasSubscription) monetizationMethods.push('Subscription/SaaS');
  if (hasDonations) monetizationMethods.push('Donations');
  if (hasLeadGen) monetizationMethods.push('Lead Generation');

  let revenueModel: MonetizationAnalysis['revenueModel'] = 'unknown';
  if (hasEcommerce) revenueModel = 'ecommerce';
  else if (hasSubscription) revenueModel = 'saas';
  else if (hasAds) revenueModel = 'advertising';
  else if (hasLeadGen) revenueModel = 'lead-gen';
  else if (monetizationMethods.length > 1) revenueModel = 'mixed';
  else if (monetizationMethods.length === 0 && !hasAds) revenueModel = 'content';

  return {
    hasAds,
    adNetworks,
    hasAffiliate,
    hasEcommerce,
    hasSubscription,
    hasDonations,
    hasLeadGen,
    monetizationMethods,
    revenueModel,
    estimatedMonthlyRevenue: { low: 0, mid: 0, high: 0 }, // Will be calculated later
  };
}

// ============================================
// TRAFFIC ESTIMATION ALGORITHM
// ============================================

function estimateTraffic(
  domain: DomainAnalysis,
  performance: PerformanceAnalysis | null,
  seo: SeoAnalysis,
  content: ContentAnalysis,
  social: SocialAnalysis,
  technology: TechnologyAnalysis,
  trancoRank?: TrancoRankResult,
  socialFollowers?: SocialFollowersData | null,
): TrafficEstimate {
  const signals: TrafficEstimate['trafficSignals'] = [];
  let trafficScore = 0;
  let megaSiteMultiplier = 1; // Multiplier for major established sites

  // ==============================================
  // TRANCO RANKING - MOST POWERFUL SIGNAL
  // If a site is in Tranco top 1M, we have real data
  // ==============================================
  if (trancoRank?.isRanked && trancoRank.rank) {
    const rank = trancoRank.rank;

    if (rank <= 100) {
      // Top 100 sites: 100M+ monthly visitors (Google, Facebook, YouTube, etc.)
      trafficScore += 150;
      megaSiteMultiplier *= 100;
      signals.push({ signal: `Tranco Top 100 (#${rank})`, impact: 'positive', weight: 150 });
    } else if (rank <= 1000) {
      // Top 1K: 10M-100M monthly visitors
      trafficScore += 120;
      megaSiteMultiplier *= 50;
      signals.push({ signal: `Tranco Top 1K (#${rank})`, impact: 'positive', weight: 120 });
    } else if (rank <= 10000) {
      // Top 10K: 1M-10M monthly visitors
      trafficScore += 100;
      megaSiteMultiplier *= 20;
      signals.push({ signal: `Tranco Top 10K (#${rank})`, impact: 'positive', weight: 100 });
    } else if (rank <= 100000) {
      // Top 100K: 100K-1M monthly visitors
      trafficScore += 80;
      megaSiteMultiplier *= 8;
      signals.push({ signal: `Tranco Top 100K (#${rank.toLocaleString()})`, impact: 'positive', weight: 80 });
    } else {
      // Top 1M: 10K-100K monthly visitors
      trafficScore += 50;
      megaSiteMultiplier *= 3;
      signals.push({ signal: `Tranco Top 1M (#${rank.toLocaleString()})`, impact: 'positive', weight: 50 });
    }
  }

  // ==============================================
  // SOCIAL FOLLOWERS - DIRECT AUDIENCE SIZE
  // ==============================================
  if (socialFollowers && socialFollowers.totalFollowers > 0) {
    const followers = socialFollowers.totalFollowers;

    if (followers >= 10000000) {
      // 10M+ followers
      trafficScore += 60;
      megaSiteMultiplier *= 5;
      signals.push({ signal: `${(followers / 1000000).toFixed(1)}M social followers`, impact: 'positive', weight: 60 });
    } else if (followers >= 1000000) {
      // 1M+ followers
      trafficScore += 45;
      megaSiteMultiplier *= 3;
      signals.push({ signal: `${(followers / 1000000).toFixed(1)}M social followers`, impact: 'positive', weight: 45 });
    } else if (followers >= 100000) {
      // 100K+ followers
      trafficScore += 30;
      megaSiteMultiplier *= 2;
      signals.push({ signal: `${Math.round(followers / 1000)}K social followers`, impact: 'positive', weight: 30 });
    } else if (followers >= 10000) {
      // 10K+ followers
      trafficScore += 20;
      megaSiteMultiplier *= 1.5;
      signals.push({ signal: `${Math.round(followers / 1000)}K social followers`, impact: 'positive', weight: 20 });
    } else if (followers >= 1000) {
      trafficScore += 10;
      signals.push({ signal: `${Math.round(followers / 1000)}K social followers`, impact: 'positive', weight: 10 });
    }
  }

  // Domain age factor - with higher tiers for legendary sites
  if (domain.ageYears >= 15) {
    trafficScore += 40;
    megaSiteMultiplier *= 2.5;
    signals.push({ signal: 'Legendary domain (15+ years)', impact: 'positive', weight: 40 });
  } else if (domain.ageYears >= 10) {
    trafficScore += 30;
    megaSiteMultiplier *= 1.5;
    signals.push({ signal: 'Established domain (10+ years)', impact: 'positive', weight: 30 });
  } else if (domain.ageYears >= 5) {
    trafficScore += 18;
    signals.push({ signal: 'Mature domain (5-10 years)', impact: 'positive', weight: 18 });
  } else if (domain.ageYears >= 2) {
    trafficScore += 10;
    signals.push({ signal: 'Growing domain (2-5 years)', impact: 'positive', weight: 10 });
  }

  // Archive snapshots - major indicator of site importance
  if (domain.archiveSnapshots > 800) {
    trafficScore += 35;
    megaSiteMultiplier *= 3;
    signals.push({ signal: 'Massive archive history (800+ snapshots)', impact: 'positive', weight: 35 });
  } else if (domain.archiveSnapshots > 500) {
    trafficScore += 25;
    megaSiteMultiplier *= 2;
    signals.push({ signal: 'Heavy archive history (500+ snapshots)', impact: 'positive', weight: 25 });
  } else if (domain.archiveSnapshots > 200) {
    trafficScore += 18;
    megaSiteMultiplier *= 1.3;
    signals.push({ signal: 'Strong archive history (200+ snapshots)', impact: 'positive', weight: 18 });
  } else if (domain.archiveSnapshots > 100) {
    trafficScore += 12;
    signals.push({ signal: 'Good archive history (100+ snapshots)', impact: 'positive', weight: 12 });
  } else if (domain.archiveSnapshots > 50) {
    trafficScore += 8;
    signals.push({ signal: 'Moderate archive history (50+ snapshots)', impact: 'positive', weight: 8 });
  }

  // SEO signals - larger sites typically have more traffic
  if (seo.estimatedPageCount > 1000) {
    trafficScore += 25;
    megaSiteMultiplier *= 1.5;
    signals.push({ signal: 'Massive site (1000+ indexed pages)', impact: 'positive', weight: 25 });
  } else if (seo.estimatedPageCount > 100) {
    trafficScore += 18;
    signals.push({ signal: 'Large site (100+ indexed pages)', impact: 'positive', weight: 18 });
  } else if (seo.estimatedPageCount > 20) {
    trafficScore += 10;
    signals.push({ signal: 'Medium site (20+ pages)', impact: 'positive', weight: 10 });
  }

  // Google PageSpeed SEO score
  if (performance?.seoScore && performance.seoScore >= 90) {
    trafficScore += 18;
    signals.push({ signal: 'Excellent SEO score (90+)', impact: 'positive', weight: 18 });
  } else if (performance?.seoScore && performance.seoScore >= 70) {
    trafficScore += 10;
    signals.push({ signal: 'Good SEO score (70+)', impact: 'positive', weight: 10 });
  }

  // Performance score bonus
  if (performance?.performanceScore && performance.performanceScore >= 80) {
    trafficScore += 12;
    signals.push({ signal: 'Excellent performance (80+)', impact: 'positive', weight: 12 });
  }

  // Content depth
  if (content.wordCount >= 5000) {
    trafficScore += 15;
    signals.push({ signal: 'Very rich content (5000+ words)', impact: 'positive', weight: 15 });
  } else if (content.wordCount >= 2000) {
    trafficScore += 10;
    signals.push({ signal: 'Rich content (2000+ words)', impact: 'positive', weight: 10 });
  } else if (content.wordCount >= 500) {
    trafficScore += 5;
    signals.push({ signal: 'Moderate content', impact: 'neutral', weight: 5 });
  }

  // Social presence
  if (social.socialLinksCount >= 5) {
    trafficScore += 12;
    signals.push({ signal: 'Strong social presence (5+ platforms)', impact: 'positive', weight: 12 });
  } else if (social.socialLinksCount >= 3) {
    trafficScore += 6;
    signals.push({ signal: 'Moderate social presence', impact: 'neutral', weight: 6 });
  }

  // Technology indicators
  if (technology.hasGoogleAnalytics || technology.hasGoogleTagManager) {
    trafficScore += 10;
    signals.push({ signal: 'Uses analytics tracking', impact: 'positive', weight: 10 });
  }

  if (technology.ecommerce) {
    trafficScore += 12;
    signals.push({ signal: 'E-commerce enabled', impact: 'positive', weight: 12 });
  }

  // CDN usage indicates high traffic infrastructure
  if (technology.cdn) {
    trafficScore += 15;
    megaSiteMultiplier *= 1.2;
    signals.push({ signal: 'Uses CDN infrastructure', impact: 'positive', weight: 15 });
  }

  // Negative signals
  if (domain.ageYears < 1) {
    trafficScore -= 15;
    signals.push({ signal: 'New domain (< 1 year)', impact: 'negative', weight: -15 });
  }

  if (!seo.hasStructuredData) {
    trafficScore -= 5;
    signals.push({ signal: 'No structured data', impact: 'negative', weight: -5 });
  }

  // Calculate estimated monthly visitors
  let estimatedMonthlyVisitors: number;

  // If we have Tranco ranking, use it as the primary traffic indicator
  // This is much more accurate than estimation alone
  if (trancoRank?.isRanked && trancoRank.rank) {
    // Formula: visitors = 10^(8.5 - log10(rank) * 0.9)
    // This gives approximately:
    // Rank 1: 316M, Rank 10: 125M, Rank 100: 50M, Rank 1000: 20M
    // Rank 10K: 8M, Rank 100K: 3.2M, Rank 1M: 1.3M
    const logRank = Math.log10(trancoRank.rank);
    const baseTraffic = Math.pow(10, 8.5 - logRank * 0.9);

    // Apply small multiplier for additional quality signals (max 2x)
    const qualityBoost = Math.min(2, 1 + (megaSiteMultiplier - 1) * 0.1);
    estimatedMonthlyVisitors = Math.round(baseTraffic * qualityBoost);
  } else {
    // No Tranco ranking - fall back to estimation algorithm
    const normalizedScore = Math.max(0, Math.min(150, trafficScore));

    // For unranked sites: Score 0 = ~100, Score 100 = ~50K, Score 150 = ~500K
    let baseVisitors = 100 * Math.pow(10, (normalizedScore / 100) * 3.7);

    // Apply modest multiplier (capped at 10x)
    const cappedMultiplier = Math.min(10, megaSiteMultiplier);
    estimatedMonthlyVisitors = Math.round(baseVisitors * cappedMultiplier);
  }

  // Determine traffic tier with updated thresholds
  let trafficTier: TrafficEstimate['trafficTier'] = 'very-low';
  if (estimatedMonthlyVisitors >= 10000000) trafficTier = 'very-high'; // 10M+
  else if (estimatedMonthlyVisitors >= 1000000) trafficTier = 'very-high'; // 1M+
  else if (estimatedMonthlyVisitors >= 100000) trafficTier = 'high'; // 100K+
  else if (estimatedMonthlyVisitors >= 10000) trafficTier = 'medium'; // 10K+
  else if (estimatedMonthlyVisitors >= 1000) trafficTier = 'low'; // 1K+

  // Confidence level based on data availability
  let confidence = 35; // Base confidence
  if (trancoRank?.isRanked) confidence += 30; // Tranco is highly reliable
  if (domain.hasSignificantHistory) confidence += 15;
  if (domain.archiveSnapshots > 100) confidence += 5;
  if (performance !== null) confidence += 10;
  if (seo.estimatedPageCount > 0) confidence += 5;
  if (socialFollowers && socialFollowers.totalFollowers > 1000) confidence += 5;
  confidence = Math.min(95, confidence); // Cap at 95% with Tranco data

  // Calculate bounce rate based on traffic tier
  let bounceRate = 55;
  if (trafficTier === 'very-high') bounceRate = 35;
  else if (trafficTier === 'high') bounceRate = 45;
  else if (trafficTier === 'medium') bounceRate = 50;
  else if (trafficTier === 'low') bounceRate = 60;

  return {
    estimatedMonthlyVisitors,
    trafficTier,
    confidenceLevel: confidence,
    trafficSignals: signals,
    estimatedPageviews: Math.round(estimatedMonthlyVisitors * 2.5), // Assume 2.5 pages per visit
    estimatedBounceRate: bounceRate,
  };
}

// ============================================
// SCORE CALCULATION
// ============================================

function calculateScores(
  domain: DomainAnalysis,
  performance: PerformanceAnalysis | null,
  technical: TechnicalAnalysis,
  dns: DnsAnalysis,
  security: SecurityAnalysis,
  seo: SeoAnalysis,
  content: ContentAnalysis,
  social: SocialAnalysis,
  monetization: MonetizationAnalysis,
): ScoreBreakdown {
  // Domain score
  let domainScore = 0;
  domainScore += domain.tldScore * 0.3;
  if (domain.length <= 6) domainScore += 25;
  else if (domain.length <= 10) domainScore += 20;
  else if (domain.length <= 15) domainScore += 10;
  if (!domain.hasNumbers) domainScore += 10;
  if (!domain.hasHyphens) domainScore += 10;
  if (domain.isKeywordRich) domainScore += 15;
  if (domain.ageYears >= 5) domainScore += 10;
  else if (domain.ageYears >= 2) domainScore += 5;

  // Performance score
  let performanceScore = performance?.performanceScore || 50;
  if (performance) {
    performanceScore = Math.round(
      (performance.performanceScore * 0.4) +
      (performance.accessibilityScore * 0.2) +
      (performance.seoScore * 0.25) +
      (performance.bestPracticesScore * 0.15)
    );
  }

  // Technical score
  let technicalScore = 0;
  if (technical.hasHttps) technicalScore += 20;
  if (technical.hasMetaDescription) technicalScore += 10;
  if (technical.hasOpenGraph) technicalScore += 10;
  if (technical.hasTwitterCard) technicalScore += 5;
  if (technical.hasFavicon) technicalScore += 5;
  if (technical.hasCanonical) technicalScore += 10;
  if (technical.hasViewportMeta) technicalScore += 10;
  if (technical.hasCharsetMeta) technicalScore += 5;
  if (technical.hasLanguageAttr) technicalScore += 5;
  if (technical.loadTime < 2000) technicalScore += 20;
  else if (technical.loadTime < 4000) technicalScore += 10;

  // Security score (already calculated)
  const securityScore = security.securityScore;

  // SEO score
  let seoScore = 0;
  seoScore += seo.titleScore * 0.2;
  seoScore += seo.descriptionScore * 0.15;
  seoScore += seo.headingStructureScore * 0.15;
  seoScore += seo.imageOptimizationScore * 0.1;
  if (seo.hasStructuredData) seoScore += 15;
  if (seo.hasSitemap) seoScore += 10;
  if (seo.hasRobotsTxt) seoScore += 5;
  if (seo.hasCanonical) seoScore += 10;

  // Content score
  let contentScore = 0;
  contentScore += content.contentDepthScore * 0.4;
  contentScore += content.readabilityScore * 0.2;
  if (content.hasContactInfo) contentScore += 10;
  if (content.hasPrivacyPolicy) contentScore += 10;
  if (content.hasTerms) contentScore += 5;
  if (content.hasAboutPage) contentScore += 5;
  contentScore += content.uniqueContentIndicators * 5;

  // Social score (already calculated)
  const socialScore = social.socialScore;

  // Monetization score
  let monetizationScore = 0;
  monetizationScore += monetization.monetizationMethods.length * 15;
  if (monetization.hasEcommerce) monetizationScore += 20;
  if (monetization.hasSubscription) monetizationScore += 15;
  monetizationScore = Math.min(100, monetizationScore);

  // Overall score (weighted average)
  const overall = Math.round(
    domainScore * 0.15 +
    performanceScore * 0.15 +
    technicalScore * 0.10 +
    securityScore * 0.10 +
    seoScore * 0.20 +
    contentScore * 0.15 +
    socialScore * 0.05 +
    monetizationScore * 0.10
  );

  return {
    domain: Math.round(Math.min(100, domainScore)),
    performance: Math.round(Math.min(100, performanceScore)),
    technical: Math.round(Math.min(100, technicalScore)),
    security: Math.round(Math.min(100, securityScore)),
    seo: Math.round(Math.min(100, seoScore)),
    content: Math.round(Math.min(100, contentScore)),
    social: Math.round(Math.min(100, socialScore)),
    monetization: Math.round(Math.min(100, monetizationScore)),
    overall: Math.round(Math.min(100, overall)),
  };
}

// ============================================
// VALUATION ALGORITHM
// ============================================

function calculateValuation(
  domain: DomainAnalysis,
  traffic: TrafficEstimate,
  monetization: MonetizationAnalysis,
  scores: ScoreBreakdown,
  industry: string,
): { value: number; range: { min: number; max: number }; breakdown: ValuationBreakdown; confidence: number } {
  // 1. DOMAIN INTRINSIC VALUE
  // Based on TLD, length, keywords, age
  const tldData = TLD_VALUES[domain.tld] || { score: 30, baseValue: 50 };
  let domainIntrinsicValue = tldData.baseValue;

  // Length premium (shorter = more valuable)
  if (domain.length <= 3) domainIntrinsicValue *= 10;
  else if (domain.length <= 5) domainIntrinsicValue *= 5;
  else if (domain.length <= 8) domainIntrinsicValue *= 2;
  else if (domain.length <= 12) domainIntrinsicValue *= 1.2;
  else if (domain.length > 15) domainIntrinsicValue *= 0.5;

  // Keyword value
  let keywordValue = 0;
  for (const keyword of domain.keywordsFound) {
    keywordValue += KEYWORD_VALUES[keyword] || 500;
  }
  domainIntrinsicValue += keywordValue;

  // Age premium
  domainIntrinsicValue *= (1 + (domain.ageYears * 0.05)); // 5% per year

  // Penalty for numbers/hyphens
  if (domain.hasNumbers) domainIntrinsicValue *= 0.7;
  if (domain.hasHyphens) domainIntrinsicValue *= 0.6;

  // 2. TRAFFIC VALUE
  // Monthly visitors × CPM rate × 12 months × multiplier
  const cpm = INDUSTRY_CPMS[industry] || INDUSTRY_CPMS['general'];
  const monthlyTrafficValue = (traffic.estimatedMonthlyVisitors / 1000) * cpm;
  const annualTrafficValue = monthlyTrafficValue * 12;
  const trafficValue = annualTrafficValue * 2; // 2x annual traffic value is common

  // 3. CONTENT VALUE
  // Based on content depth and uniqueness
  const contentValue = (scores.content / 100) * 5000;

  // 4. TECHNICAL VALUE
  // Based on infrastructure and optimization
  const technicalValue = ((scores.technical + scores.performance) / 200) * 3000;

  // 5. BRAND VALUE
  // Based on social presence and trust signals
  const brandValue = (scores.social / 100) * 2000 +
    (domain.hasSignificantHistory ? 2000 : 0);

  // 6. REVENUE MULTIPLIER
  // Standard is 24-36x monthly revenue for websites
  let revenueMultiple = 0;
  if (monetization.revenueModel !== 'unknown') {
    // Estimate monthly revenue
    let estimatedMonthlyRevenue = 0;

    if (monetization.hasAds) {
      estimatedMonthlyRevenue += (traffic.estimatedMonthlyVisitors / 1000) * cpm;
    }
    if (monetization.hasEcommerce) {
      // Assume 2% conversion, $50 avg order
      estimatedMonthlyRevenue += traffic.estimatedMonthlyVisitors * 0.02 * 50;
    }
    if (monetization.hasAffiliate) {
      // Assume 0.5% conversion, $5 commission
      estimatedMonthlyRevenue += traffic.estimatedMonthlyVisitors * 0.005 * 5;
    }
    if (monetization.hasSubscription) {
      // Assume 0.1% conversion, $20/month
      estimatedMonthlyRevenue += traffic.estimatedMonthlyVisitors * 0.001 * 20;
    }

    revenueMultiple = estimatedMonthlyRevenue * 30; // 30x monthly

    // Update monetization estimate
    monetization.estimatedMonthlyRevenue = {
      low: Math.round(estimatedMonthlyRevenue * 0.5),
      mid: Math.round(estimatedMonthlyRevenue),
      high: Math.round(estimatedMonthlyRevenue * 2),
    };
  }

  // TOTAL VALUATION
  const baseValue =
    domainIntrinsicValue +
    trafficValue +
    contentValue +
    technicalValue +
    brandValue +
    revenueMultiple;

  // Apply overall quality multiplier
  const qualityMultiplier = 0.5 + (scores.overall / 100);
  const estimatedValue = Math.round(baseValue * qualityMultiplier);

  // Calculate range based on confidence
  const confidenceFactor = traffic.confidenceLevel / 100;
  const rangeSpread = 0.5 - (confidenceFactor * 0.3); // Higher confidence = tighter range

  return {
    value: estimatedValue,
    range: {
      min: Math.round(estimatedValue * (1 - rangeSpread)),
      max: Math.round(estimatedValue * (1 + rangeSpread)),
    },
    breakdown: {
      domainIntrinsicValue: Math.round(domainIntrinsicValue),
      trafficValue: Math.round(trafficValue),
      contentValue: Math.round(contentValue),
      technicalValue: Math.round(technicalValue),
      brandValue: Math.round(brandValue),
      revenueMultiple: Math.round(revenueMultiple),
    },
    confidence: traffic.confidenceLevel,
  };
}

// ============================================
// RECOMMENDATIONS ENGINE
// ============================================

function generateRecommendations(
  domain: DomainAnalysis,
  performance: PerformanceAnalysis | null,
  technical: TechnicalAnalysis,
  security: SecurityAnalysis,
  seo: SeoAnalysis,
  content: ContentAnalysis,
  social: SocialAnalysis,
  monetization: MonetizationAnalysis,
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Critical issues
  if (!technical.hasHttps) {
    recommendations.push({
      category: 'Security',
      title: 'Enable HTTPS',
      description: 'HTTPS is essential for security, SEO rankings, and user trust. This is critical.',
      impact: 'critical',
      effort: 'easy',
      potentialValueIncrease: 2000,
    });
  }

  // High impact
  if (performance && performance.performanceScore < 50) {
    recommendations.push({
      category: 'Performance',
      title: 'Improve page speed',
      description: `Your performance score is ${performance.performanceScore}. Aim for 80+. Optimize images, enable caching, minimize JavaScript.`,
      impact: 'high',
      effort: 'medium',
      potentialValueIncrease: 3000,
    });
  }

  if (!seo.hasStructuredData) {
    recommendations.push({
      category: 'SEO',
      title: 'Add structured data',
      description: 'Schema.org markup helps search engines understand your content and can enable rich snippets.',
      impact: 'high',
      effort: 'medium',
      potentialValueIncrease: 1500,
    });
  }

  if (seo.titleScore < 75) {
    recommendations.push({
      category: 'SEO',
      title: 'Optimize page title',
      description: 'Your title should be 30-60 characters and include your primary keyword.',
      impact: 'high',
      effort: 'easy',
      potentialValueIncrease: 1000,
    });
  }

  if (seo.descriptionScore < 75) {
    recommendations.push({
      category: 'SEO',
      title: 'Optimize meta description',
      description: 'Write a compelling 120-160 character description to improve click-through rates.',
      impact: 'high',
      effort: 'easy',
      potentialValueIncrease: 800,
    });
  }

  // Medium impact
  if (!seo.hasSitemap) {
    recommendations.push({
      category: 'SEO',
      title: 'Create XML sitemap',
      description: 'A sitemap helps search engines discover and index all your pages.',
      impact: 'medium',
      effort: 'easy',
      potentialValueIncrease: 500,
    });
  }

  if (content.wordCount < 500) {
    recommendations.push({
      category: 'Content',
      title: 'Add more content',
      description: 'Pages with more substantial content (1000+ words) tend to rank better.',
      impact: 'medium',
      effort: 'hard',
      potentialValueIncrease: 1500,
    });
  }

  if (!content.hasPrivacyPolicy) {
    recommendations.push({
      category: 'Trust',
      title: 'Add privacy policy',
      description: 'A privacy policy is legally required in many jurisdictions and builds trust.',
      impact: 'medium',
      effort: 'easy',
      potentialValueIncrease: 300,
    });
  }

  if (social.socialLinksCount < 3) {
    recommendations.push({
      category: 'Social',
      title: 'Expand social presence',
      description: 'Active social media profiles increase brand visibility and trust signals.',
      impact: 'medium',
      effort: 'medium',
      potentialValueIncrease: 500,
    });
  }

  if (monetization.monetizationMethods.length === 0) {
    recommendations.push({
      category: 'Monetization',
      title: 'Add monetization',
      description: 'Consider ads, affiliate links, or e-commerce to generate revenue.',
      impact: 'medium',
      effort: 'medium',
      potentialValueIncrease: 2000,
    });
  }

  // Low impact
  if (!technical.hasOpenGraph) {
    recommendations.push({
      category: 'Social',
      title: 'Add Open Graph tags',
      description: 'OG tags improve how your site appears when shared on social media.',
      impact: 'low',
      effort: 'easy',
      potentialValueIncrease: 200,
    });
  }

  if (!technical.hasFavicon) {
    recommendations.push({
      category: 'Branding',
      title: 'Add favicon',
      description: 'A favicon makes your site look more professional in browser tabs.',
      impact: 'low',
      effort: 'easy',
      potentialValueIncrease: 100,
    });
  }

  // Sort by impact and potential value
  const impactOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => {
    const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
    if (impactDiff !== 0) return impactDiff;
    return b.potentialValueIncrease - a.potentialValueIncrease;
  });

  return recommendations.slice(0, 10);
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

export async function analyzeWebsite(inputUrl: string): Promise<WebsiteAnalysis> {
  const startTime = performance.now();
  const url = normalizeUrl(inputUrl);
  const domainName = extractDomain(url);

  const dataSourcesUsed: string[] = ['HTML Analysis'];

  // Fetch website content
  const fetchStart = performance.now();
  let html = '';
  let loadTime = 0;

  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    html = await response.text();
    loadTime = performance.now() - fetchStart;
    dataSourcesUsed.push('Direct Fetch');
  } catch {
    console.warn('Failed to fetch website');
    loadTime = 3000;
  }

  // Run all analyses in parallel where possible
  const [
    domainAnalysis,
    dnsAnalysis,
    crawlability,
    pageSpeedResult,
    trancoRank,
    sslResult,
    // New v2.1 data sources
    rdapData,
    indexedPages,
    cruxData,
    backlinks,
    brandMentions,
  ] = await Promise.all([
    analyzeDomainComprehensive(url),
    analyzeDns(domainName).then(dns => {
      dataSourcesUsed.push('Google DNS-over-HTTPS');
      return dns;
    }),
    analyzeCrawlability(domainName).then(c => {
      if (c.hasRobotsTxt) dataSourcesUsed.push('robots.txt');
      if (c.hasSitemap) dataSourcesUsed.push('XML Sitemap');
      return c;
    }),
    getPageSpeedInsights(url).then(result => {
      if (result) dataSourcesUsed.push('Google PageSpeed Insights API');
      return result;
    }),
    getTrancoRank(domainName).then(result => {
      if (result.isRanked) dataSourcesUsed.push('Tranco Domain Ranking');
      return result;
    }),
    getSSLLabsGrade(domainName).then(result => {
      if (result.analysisComplete) dataSourcesUsed.push('SSL Labs Security Analysis');
      return result;
    }),
    // New v2.1 API calls
    getRdapData(domainName).then(result => {
      if (result.registrar) dataSourcesUsed.push('RDAP/WHOIS Domain Registry');
      return result;
    }),
    getIndexedPageCount(domainName).then(result => {
      if (result.estimatedCount !== null) dataSourcesUsed.push('Google Search Index');
      return result;
    }),
    getCruxData(url).then(result => {
      if (result.hasData) dataSourcesUsed.push('Chrome UX Report (Real User Data)');
      return result;
    }),
    getBacklinkEstimate(domainName).then(result => {
      if (result.hasBacklinkData) dataSourcesUsed.push('CommonCrawl Backlink Index');
      return result;
    }),
    getBrandMentions(domainName).then(result => {
      if (result.hasBrandPresence) dataSourcesUsed.push('Reddit & Hacker News Mentions');
      return result;
    }),
  ]);

  if (domainAnalysis.firstIndexed) {
    dataSourcesUsed.push('Archive.org Wayback Machine');
  }

  // Scrape social followers (runs after HTML is fetched)
  let socialFollowersData: SocialFollowersData | null = null;
  if (html) {
    socialFollowersData = await scrapeSocialFollowers(html, domainName);
    if (socialFollowersData.platformsWithData > 0) {
      dataSourcesUsed.push('Social Media Follower Data');
    }
  }

  // Synchronous analyses
  const technicalAnalysis = analyzeTechnicalComprehensive(url, html, loadTime);
  const technologyAnalysis = detectTechnologies(html);
  const securityResult = analyzeSecurityHeaders(url, html);
  const seoAnalysis = analyzeSeoComprehensive(html, crawlability);
  const contentAnalysis = analyzeContentComprehensive(html);
  const socialAnalysis = analyzeSocialComprehensive(html);
  const monetizationAnalysis = analyzeMonetization(html, technologyAnalysis);

  // New v2.1: Mobile-friendliness analysis
  const mobileAnalysis = analyzeMobileFriendliness(html);
  if (mobileAnalysis.isMobileFriendly) {
    dataSourcesUsed.push('Mobile-Friendly Analysis');
  }

  // Build complete security analysis
  const securityAnalysis: SecurityAnalysis = {
    ...securityResult,
    hasSecureForms: !html.includes('action="http://'),
    noMixedContent: !html.toLowerCase().includes('src="http://'),
  };

  // Build performance analysis from PageSpeed
  let performanceAnalysis: PerformanceAnalysis | null = null;
  if (pageSpeedResult) {
    let grade: PerformanceAnalysis['performanceGrade'] = 'F';
    if (pageSpeedResult.performanceScore >= 90) grade = 'A+';
    else if (pageSpeedResult.performanceScore >= 80) grade = 'A';
    else if (pageSpeedResult.performanceScore >= 65) grade = 'B';
    else if (pageSpeedResult.performanceScore >= 50) grade = 'C';
    else if (pageSpeedResult.performanceScore >= 35) grade = 'D';

    performanceAnalysis = {
      ...pageSpeedResult,
      performanceGrade: grade,
    };
  }

  // Build DNS analysis with infrastructure score
  const dns: DnsAnalysis = {
    ...dnsAnalysis,
    infrastructureScore: calculateInfrastructureScore(dnsAnalysis),
  };

  // Build technology analysis with score
  const technology: TechnologyAnalysis = {
    ...technologyAnalysis,
    cdn: technologyAnalysis.cdns[0] || null,
    techStackScore: calculateTechStackScore(technologyAnalysis),
    hasGoogleAnalytics: technologyAnalysis.analytics.some(a => a.toLowerCase().includes('google')),
    hasGoogleTagManager: technologyAnalysis.analytics.some(a => a.toLowerCase().includes('tag manager')),
  };

  // Detect industry
  const industry = detectIndustry(html, domainName);

  // Estimate traffic (now with Tranco ranking and social data)
  const trafficEstimate = estimateTraffic(
    domainAnalysis,
    performanceAnalysis,
    seoAnalysis,
    contentAnalysis,
    socialAnalysis,
    technology,
    trancoRank,
    socialFollowersData,
  );

  // Calculate scores
  const scores = calculateScores(
    domainAnalysis,
    performanceAnalysis,
    technicalAnalysis,
    dns,
    securityAnalysis,
    seoAnalysis,
    contentAnalysis,
    socialAnalysis,
    monetizationAnalysis,
  );

  // Calculate valuation
  const valuation = calculateValuation(
    domainAnalysis,
    trafficEstimate,
    monetizationAnalysis,
    scores,
    industry,
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    domainAnalysis,
    performanceAnalysis,
    technicalAnalysis,
    securityAnalysis,
    seoAnalysis,
    contentAnalysis,
    socialAnalysis,
    monetizationAnalysis,
  );

  const analysisTime = Math.round(performance.now() - startTime);

  return {
    url,
    analyzedAt: new Date(),
    analysisVersion: '2.1.0',
    domain: domainAnalysis,
    performance: performanceAnalysis,
    technical: technicalAnalysis,
    dns,
    security: securityAnalysis,
    technology,
    seo: seoAnalysis,
    content: contentAnalysis,
    social: socialAnalysis,
    traffic: trafficEstimate,
    monetization: monetizationAnalysis,
    // New data sources
    ranking: trancoRank.isRanked ? trancoRank : null,
    socialFollowers: socialFollowersData,
    ssl: sslResult.analysisComplete ? {
      grade: sslResult.grade,
      protocol: sslResult.protocol,
      keyStrength: sslResult.keyStrength,
      certExpiresIn: sslResult.certExpiresIn,
      supportsHsts: sslResult.supportsHsts,
      vulnerabilities: sslResult.vulnerabilities,
      analysisComplete: sslResult.analysisComplete,
    } : null,
    // v2.1 New data sources
    rdap: rdapData.registrar ? rdapData : null,
    indexedPages: indexedPages.estimatedCount !== null ? indexedPages : null,
    crux: cruxData.hasData ? cruxData : null,
    backlinks: backlinks.hasBacklinkData ? backlinks : null,
    brandMentions: brandMentions.hasBrandPresence ? brandMentions : null,
    mobile: mobileAnalysis,
    scores,
    estimatedValue: valuation.value,
    valueRange: valuation.range,
    valuationBreakdown: valuation.breakdown,
    confidenceScore: valuation.confidence,
    recommendations,
    dataSourcesUsed,
    analysisTime,
  };
}

// Helper functions
function calculateInfrastructureScore(dns: Omit<DnsAnalysis, 'infrastructureScore'>): number {
  let score = 0;
  if (dns.hasMxRecords) score += 20;
  if (dns.hasSpfRecord) score += 20;
  if (dns.hasDmarcRecord) score += 20;
  if (dns.isUsingCloudflare || dns.isUsingAwsRoute53 || dns.isUsingGoogleCloud) score += 20;
  if (dns.hasProperEmailSetup) score += 20;
  return score;
}

function calculateTechStackScore(tech: {
  isModernStack: boolean;
  analytics: string[];
  marketing: string[];
  cdns: string[];
  cms: string | null;
}): number {
  let score = 40; // Base score
  if (tech.isModernStack) score += 20;
  if (tech.analytics.length > 0) score += 15;
  if (tech.marketing.length > 0) score += 10;
  if (tech.cdns.length > 0) score += 10;
  if (tech.cms) score += 5;
  return Math.min(100, score);
}
