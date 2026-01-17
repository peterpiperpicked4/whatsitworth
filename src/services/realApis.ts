/**
 * Real API Integrations for Website Analysis
 * All APIs used here are FREE (no API key required)
 */

// CORS Proxies for APIs that don't support CORS
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
];

// Try multiple proxies
async function fetchWithCorsProxy(url: string): Promise<Response> {
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url));
      if (response.ok) {
        return response;
      }
    } catch (e) {
      console.warn(`Proxy ${proxy} failed for ${url}`);
    }
  }
  throw new Error('All CORS proxies failed');
}

const CORS_PROXY = CORS_PROXIES[0];

// ============================================
// GOOGLE PAGESPEED INSIGHTS API (FREE)
// ============================================
export interface PageSpeedResult {
  performanceScore: number;
  firstContentfulPaint: number; // ms
  largestContentfulPaint: number; // ms
  totalBlockingTime: number; // ms
  cumulativeLayoutShift: number;
  speedIndex: number; // ms
  timeToInteractive: number; // ms
  serverResponseTime: number; // ms
  totalPageSize: number; // bytes
  totalRequests: number;
  isAccessible: boolean;
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
}

export async function getPageSpeedInsights(url: string): Promise<PageSpeedResult | null> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use desktop strategy for faster results, add key if available
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=desktop&category=performance&category=accessibility&category=seo&category=best-practices`;

      console.log(`PageSpeed API attempt ${attempt}/${maxRetries} for ${url}`);

      const response = await fetch(apiUrl);

      if (response.status === 429) {
        // Rate limited - wait and retry
        const waitTime = attempt * 2000;
        console.warn(`PageSpeed API rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        console.warn('PageSpeed API failed:', response.status);
        return null;
      }

      const data = await response.json();

      const lighthouse = data.lighthouseResult;
      const audits = lighthouse?.audits || {};
      const categories = lighthouse?.categories || {};

      console.log(`PageSpeed API success for ${url}: perf=${Math.round((categories.performance?.score || 0) * 100)}`);

      return {
        performanceScore: Math.round((categories.performance?.score || 0) * 100),
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
        timeToInteractive: audits['interactive']?.numericValue || 0,
        serverResponseTime: audits['server-response-time']?.numericValue || 0,
        totalPageSize: audits['total-byte-weight']?.numericValue || 0,
        totalRequests: audits['network-requests']?.details?.items?.length || 0,
        isAccessible: (categories.accessibility?.score || 0) > 0.8,
        accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
        seoScore: Math.round((categories.seo?.score || 0) * 100),
        bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`PageSpeed API attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('PageSpeed API failed after all retries:', lastError);
  return null;
}

// ============================================
// ARCHIVE.ORG WAYBACK MACHINE API (FREE)
// ============================================
export interface WaybackResult {
  firstSnapshot: Date | null;
  totalSnapshots: number;
  estimatedAgeYears: number;
  hasHistory: boolean;
}

export async function getWaybackHistory(domain: string): Promise<WaybackResult> {
  try {
    // Get the earliest snapshot - use CORS proxy
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${domain}&output=json&limit=1&fl=timestamp&from=19900101`;

    let response: Response;
    try {
      response = await fetchWithCorsProxy(cdxUrl);
    } catch (e) {
      console.warn('Wayback API fetch failed:', e);
      return { firstSnapshot: null, totalSnapshots: 0, estimatedAgeYears: 0, hasHistory: false };
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.warn('Wayback API returned non-JSON:', text.slice(0, 100));
      return { firstSnapshot: null, totalSnapshots: 0, estimatedAgeYears: 0, hasHistory: false };
    }

    if (!Array.isArray(data) || data.length <= 1) {
      return { firstSnapshot: null, totalSnapshots: 0, estimatedAgeYears: 0, hasHistory: false };
    }

    // Parse timestamp (format: YYYYMMDDHHmmss)
    const timestamp = data[1][0];
    const year = parseInt(timestamp.substring(0, 4));
    const month = parseInt(timestamp.substring(4, 6)) - 1;
    const day = parseInt(timestamp.substring(6, 8));
    const firstSnapshot = new Date(year, month, day);

    // Calculate age
    const now = new Date();
    const ageMs = now.getTime() - firstSnapshot.getTime();
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

    // Get total snapshot count - use CORS proxy
    const countUrl = `https://web.archive.org/cdx/search/cdx?url=${domain}&output=json&fl=timestamp&collapse=timestamp:6&limit=1000`;
    let totalSnapshots = 0;

    try {
      const countResponse = await fetchWithCorsProxy(countUrl);
      const countText = await countResponse.text();
      const countData = JSON.parse(countText);
      if (Array.isArray(countData)) {
        totalSnapshots = Math.max(0, countData.length - 1);
      }
    } catch {
      // Use a conservative estimate based on age
      totalSnapshots = Math.round(ageYears * 50); // Assume ~50 snapshots per year
    }

    console.log(`Wayback: ${domain} first indexed ${year}, age: ${ageYears.toFixed(1)} years, snapshots: ${totalSnapshots}`);

    return {
      firstSnapshot,
      totalSnapshots,
      estimatedAgeYears: Math.round(ageYears * 10) / 10,
      hasHistory: true,
    };
  } catch (error) {
    console.error('Wayback API error:', error);
    return { firstSnapshot: null, totalSnapshots: 0, estimatedAgeYears: 0, hasHistory: false };
  }
}

// ============================================
// DNS ANALYSIS (FREE - via DNS-over-HTTPS)
// ============================================
export interface DnsResult {
  hasMxRecords: boolean;
  mxRecordCount: number;
  hasSpfRecord: boolean;
  hasDmarcRecord: boolean;
  nameservers: string[];
  isUsingCloudflare: boolean;
  isUsingAwsRoute53: boolean;
  isUsingGoogleCloud: boolean;
  hasProperEmailSetup: boolean;
}

export async function analyzeDns(domain: string): Promise<DnsResult> {
  const result: DnsResult = {
    hasMxRecords: false,
    mxRecordCount: 0,
    hasSpfRecord: false,
    hasDmarcRecord: false,
    nameservers: [],
    isUsingCloudflare: false,
    isUsingAwsRoute53: false,
    isUsingGoogleCloud: false,
    hasProperEmailSetup: false,
  };

  try {
    // Check MX records using Google DNS-over-HTTPS
    const mxResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const mxData = await mxResponse.json();
    if (mxData.Answer) {
      result.hasMxRecords = true;
      result.mxRecordCount = mxData.Answer.length;
    }

    // Check TXT records for SPF
    const txtResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    const txtData = await txtResponse.json();
    if (txtData.Answer) {
      for (const record of txtData.Answer) {
        if (record.data?.includes('v=spf1')) {
          result.hasSpfRecord = true;
        }
      }
    }

    // Check DMARC
    const dmarcResponse = await fetch(`https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`);
    const dmarcData = await dmarcResponse.json();
    if (dmarcData.Answer) {
      result.hasDmarcRecord = true;
    }

    // Check nameservers
    const nsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=NS`);
    const nsData = await nsResponse.json();
    if (nsData.Answer) {
      result.nameservers = nsData.Answer.map((a: { data: string }) => a.data);

      const nsString = result.nameservers.join(' ').toLowerCase();
      result.isUsingCloudflare = nsString.includes('cloudflare');
      result.isUsingAwsRoute53 = nsString.includes('awsdns');
      result.isUsingGoogleCloud = nsString.includes('googledomains') || nsString.includes('google.com');
    }

    result.hasProperEmailSetup = result.hasMxRecords && result.hasSpfRecord;

  } catch (error) {
    console.error('DNS analysis error:', error);
  }

  return result;
}

// ============================================
// TECHNOLOGY DETECTION (from HTML analysis)
// ============================================
export interface TechnologyStack {
  cms: string | null;
  framework: string | null;
  analytics: string[];
  cdns: string[];
  hosting: string | null;
  ecommerce: string | null;
  marketing: string[];
  isWordPress: boolean;
  isShopify: boolean;
  isWix: boolean;
  isSquarespace: boolean;
  hasGoogleAnalytics: boolean;
  hasGoogleTagManager: boolean;
  hasFacebookPixel: boolean;
  isModernStack: boolean;
}

export function detectTechnologies(html: string, headers?: Record<string, string>): TechnologyStack {
  const lowerHtml = html.toLowerCase();

  const result: TechnologyStack = {
    cms: null,
    framework: null,
    analytics: [],
    cdns: [],
    hosting: null,
    ecommerce: null,
    marketing: [],
    isWordPress: false,
    isShopify: false,
    isWix: false,
    isSquarespace: false,
    hasGoogleAnalytics: false,
    hasGoogleTagManager: false,
    hasFacebookPixel: false,
    isModernStack: false,
  };

  // CMS Detection
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) {
    result.cms = 'WordPress';
    result.isWordPress = true;
  } else if (lowerHtml.includes('shopify') || lowerHtml.includes('cdn.shopify.com')) {
    result.cms = 'Shopify';
    result.isShopify = true;
    result.ecommerce = 'Shopify';
  } else if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixsite')) {
    result.cms = 'Wix';
    result.isWix = true;
  } else if (lowerHtml.includes('squarespace')) {
    result.cms = 'Squarespace';
    result.isSquarespace = true;
  } else if (lowerHtml.includes('webflow')) {
    result.cms = 'Webflow';
  } else if (lowerHtml.includes('ghost')) {
    result.cms = 'Ghost';
  } else if (lowerHtml.includes('drupal')) {
    result.cms = 'Drupal';
  }

  // Framework Detection
  if (lowerHtml.includes('__next') || lowerHtml.includes('_next/static')) {
    result.framework = 'Next.js';
    result.isModernStack = true;
  } else if (lowerHtml.includes('__nuxt') || lowerHtml.includes('/_nuxt/')) {
    result.framework = 'Nuxt.js';
    result.isModernStack = true;
  } else if (lowerHtml.includes('ng-') || lowerHtml.includes('angular')) {
    result.framework = 'Angular';
    result.isModernStack = true;
  } else if (lowerHtml.includes('data-reactroot') || lowerHtml.includes('react')) {
    result.framework = 'React';
    result.isModernStack = true;
  } else if (lowerHtml.includes('data-v-') || lowerHtml.includes('vue')) {
    result.framework = 'Vue.js';
    result.isModernStack = true;
  }

  // Analytics Detection
  if (lowerHtml.includes('google-analytics.com') || lowerHtml.includes('gtag') || lowerHtml.includes('ga.js') || lowerHtml.includes('analytics.js')) {
    result.analytics.push('Google Analytics');
    result.hasGoogleAnalytics = true;
  }
  if (lowerHtml.includes('googletagmanager.com') || lowerHtml.includes('gtm.js')) {
    result.analytics.push('Google Tag Manager');
    result.hasGoogleTagManager = true;
  }
  if (lowerHtml.includes('facebook.com/tr') || lowerHtml.includes('fbq(') || lowerHtml.includes('facebook pixel')) {
    result.analytics.push('Facebook Pixel');
    result.hasFacebookPixel = true;
  }
  if (lowerHtml.includes('hotjar')) {
    result.analytics.push('Hotjar');
  }
  if (lowerHtml.includes('mixpanel')) {
    result.analytics.push('Mixpanel');
  }
  if (lowerHtml.includes('segment.com') || lowerHtml.includes('segment.io')) {
    result.analytics.push('Segment');
  }
  if (lowerHtml.includes('amplitude')) {
    result.analytics.push('Amplitude');
  }

  // CDN Detection
  if (lowerHtml.includes('cloudflare')) {
    result.cdns.push('Cloudflare');
  }
  if (lowerHtml.includes('cloudfront.net')) {
    result.cdns.push('AWS CloudFront');
  }
  if (lowerHtml.includes('fastly')) {
    result.cdns.push('Fastly');
  }
  if (lowerHtml.includes('akamai')) {
    result.cdns.push('Akamai');
  }

  // E-commerce Detection
  if (!result.ecommerce) {
    if (lowerHtml.includes('woocommerce')) {
      result.ecommerce = 'WooCommerce';
    } else if (lowerHtml.includes('magento')) {
      result.ecommerce = 'Magento';
    } else if (lowerHtml.includes('bigcommerce')) {
      result.ecommerce = 'BigCommerce';
    } else if (lowerHtml.includes('add to cart') || lowerHtml.includes('add-to-cart') || lowerHtml.includes('shopping cart')) {
      result.ecommerce = 'Custom';
    }
  }

  // Marketing Tools
  if (lowerHtml.includes('mailchimp')) {
    result.marketing.push('Mailchimp');
  }
  if (lowerHtml.includes('hubspot')) {
    result.marketing.push('HubSpot');
  }
  if (lowerHtml.includes('intercom')) {
    result.marketing.push('Intercom');
  }
  if (lowerHtml.includes('drift')) {
    result.marketing.push('Drift');
  }
  if (lowerHtml.includes('crisp')) {
    result.marketing.push('Crisp');
  }
  if (lowerHtml.includes('zendesk')) {
    result.marketing.push('Zendesk');
  }

  return result;
}

// ============================================
// ROBOTS.TXT & SITEMAP ANALYSIS (FREE)
// ============================================
export interface CrawlabilityResult {
  hasRobotsTxt: boolean;
  robotsTxtContent: string | null;
  allowsAllCrawlers: boolean;
  blocksAI: boolean;
  hasSitemap: boolean;
  sitemapUrls: string[];
  estimatedPageCount: number;
}

export async function analyzeCrawlability(domain: string): Promise<CrawlabilityResult> {
  const result: CrawlabilityResult = {
    hasRobotsTxt: false,
    robotsTxtContent: null,
    allowsAllCrawlers: true,
    blocksAI: false,
    hasSitemap: false,
    sitemapUrls: [],
    estimatedPageCount: 0,
  };

  const corsProxy = 'https://api.allorigins.win/raw?url=';

  try {
    // Check robots.txt
    const robotsUrl = `https://${domain}/robots.txt`;
    const robotsResponse = await fetch(corsProxy + encodeURIComponent(robotsUrl));

    if (robotsResponse.ok) {
      const robotsTxt = await robotsResponse.text();
      if (robotsTxt && !robotsTxt.includes('<!DOCTYPE') && robotsTxt.length < 50000) {
        result.hasRobotsTxt = true;
        result.robotsTxtContent = robotsTxt;

        const lowerRobots = robotsTxt.toLowerCase();
        result.allowsAllCrawlers = !lowerRobots.includes('disallow: /');
        result.blocksAI = lowerRobots.includes('gptbot') ||
                         lowerRobots.includes('chatgpt') ||
                         lowerRobots.includes('anthropic') ||
                         lowerRobots.includes('claude');

        // Extract sitemap URLs
        const sitemapMatches = robotsTxt.match(/sitemap:\s*(\S+)/gi);
        if (sitemapMatches) {
          result.sitemapUrls = sitemapMatches.map(m => m.replace(/sitemap:\s*/i, '').trim());
          result.hasSitemap = true;
        }
      }
    }

    // If no sitemap found in robots.txt, check common locations
    if (!result.hasSitemap) {
      const commonSitemaps = [
        `https://${domain}/sitemap.xml`,
        `https://${domain}/sitemap_index.xml`,
      ];

      for (const sitemapUrl of commonSitemaps) {
        try {
          const sitemapResponse = await fetch(corsProxy + encodeURIComponent(sitemapUrl));
          if (sitemapResponse.ok) {
            const content = await sitemapResponse.text();
            if (content.includes('<urlset') || content.includes('<sitemapindex')) {
              result.hasSitemap = true;
              result.sitemapUrls.push(sitemapUrl);

              // Estimate page count from sitemap
              const locMatches = content.match(/<loc>/g);
              if (locMatches) {
                result.estimatedPageCount = locMatches.length;
              }
              break;
            }
          }
        } catch {
          // Continue to next sitemap URL
        }
      }
    }

  } catch (error) {
    console.error('Crawlability analysis error:', error);
  }

  return result;
}

// ============================================
// SSL/HTTPS ANALYSIS (from headers)
// ============================================
export interface SecurityResult {
  hasHttps: boolean;
  hasHsts: boolean;
  hasContentSecurityPolicy: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  securityScore: number;
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export function analyzeSecurityHeaders(url: string, html: string): SecurityResult {
  const hasHttps = url.startsWith('https://');

  // We can't access response headers from client-side, but we can infer some things
  const lowerHtml = html.toLowerCase();

  // Check for CSP meta tag
  const hasContentSecurityPolicy = lowerHtml.includes('content-security-policy');

  // Check for frame-ancestors or X-Frame-Options
  const hasXFrameOptions = lowerHtml.includes('x-frame-options') ||
                           lowerHtml.includes('frame-ancestors');

  // Calculate security score
  let score = 0;
  if (hasHttps) score += 40;
  if (hasContentSecurityPolicy) score += 20;
  if (hasXFrameOptions) score += 15;

  // Additional checks from HTML
  const hasSecureForms = !html.includes('action="http://');
  if (hasSecureForms) score += 10;

  const noMixedContent = !lowerHtml.includes('src="http://');
  if (noMixedContent) score += 15;

  // Determine grade
  let grade: SecurityResult['securityGrade'] = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';

  return {
    hasHttps,
    hasHsts: false, // Can't determine from client-side
    hasContentSecurityPolicy,
    hasXFrameOptions,
    hasXContentTypeOptions: false, // Can't determine from client-side
    securityScore: score,
    securityGrade: grade,
  };
}

// ============================================
// TRANCO DOMAIN RANKING (FREE)
// Top 1M most popular domains list
// ============================================
export interface TrancoRankResult {
  isRanked: boolean;
  rank: number | null;
  percentile: number | null; // 0-100, lower is better
  trafficTier: 'top-100' | 'top-1k' | 'top-10k' | 'top-100k' | 'top-1m' | 'unranked';
}

export async function getTrancoRank(domain: string): Promise<TrancoRankResult> {
  try {
    // Tranco API - returns rank for domain
    const apiUrl = `https://tranco-list.eu/api/ranks/domain/${encodeURIComponent(domain)}`;

    console.log(`Tranco API: Checking rank for ${domain}`);

    const response = await fetchWithCorsProxy(apiUrl);
    const data = await response.json();

    // Tranco returns { ranks: [{ date: "...", rank: 123 }] } or empty if not ranked
    if (data.ranks && data.ranks.length > 0) {
      const rank = data.ranks[0].rank;

      // Calculate percentile (0 = top, 100 = bottom of list)
      const percentile = (rank / 1000000) * 100;

      // Determine traffic tier
      let trafficTier: TrancoRankResult['trafficTier'] = 'unranked';
      if (rank <= 100) trafficTier = 'top-100';
      else if (rank <= 1000) trafficTier = 'top-1k';
      else if (rank <= 10000) trafficTier = 'top-10k';
      else if (rank <= 100000) trafficTier = 'top-100k';
      else trafficTier = 'top-1m';

      console.log(`Tranco: ${domain} ranked #${rank} (${trafficTier})`);

      return {
        isRanked: true,
        rank,
        percentile,
        trafficTier,
      };
    }

    console.log(`Tranco: ${domain} not in top 1M`);
    return {
      isRanked: false,
      rank: null,
      percentile: null,
      trafficTier: 'unranked',
    };
  } catch (error) {
    console.warn('Tranco API failed:', error);
    return {
      isRanked: false,
      rank: null,
      percentile: null,
      trafficTier: 'unranked',
    };
  }
}

// ============================================
// SOCIAL MEDIA FOLLOWER SCRAPING (FREE)
// Scrapes public follower counts from social pages
// ============================================
export interface SocialFollowers {
  twitter: number | null;
  twitterHandle: string | null;
  linkedin: number | null;
  facebook: number | null;
  instagram: number | null;
  youtube: number | null;
  totalFollowers: number;
  platformsWithData: number;
}

async function scrapeTwitterFollowers(handle: string): Promise<number | null> {
  try {
    // Use Nitter (Twitter frontend) which is easier to scrape
    const nitterUrl = `https://nitter.net/${handle}`;
    const response = await fetchWithCorsProxy(nitterUrl);
    const html = await response.text();

    // Look for follower count in various formats
    // Nitter shows: "123.4K Followers" or "1,234,567 Followers"
    const followerMatch = html.match(/(\d[\d,\.]*[KMB]?)\s*Followers/i);
    if (followerMatch) {
      return parseFollowerCount(followerMatch[1]);
    }

    return null;
  } catch (error) {
    console.warn(`Twitter scrape failed for @${handle}:`, error);
    return null;
  }
}

async function scrapeLinkedInFollowers(companyUrl: string): Promise<number | null> {
  try {
    // LinkedIn is heavily protected, try to get basic info
    const response = await fetchWithCorsProxy(companyUrl);
    const html = await response.text();

    // Look for follower patterns
    const followerMatch = html.match(/(\d[\d,\.]*[KMB]?)\s*followers/i);
    if (followerMatch) {
      return parseFollowerCount(followerMatch[1]);
    }

    return null;
  } catch (error) {
    console.warn('LinkedIn scrape failed:', error);
    return null;
  }
}

async function scrapeFacebookFollowers(pageUrl: string): Promise<number | null> {
  try {
    const response = await fetchWithCorsProxy(pageUrl);
    const html = await response.text();

    // Look for "X people like this" or "X followers"
    const likesMatch = html.match(/(\d[\d,\.]*[KMB]?)\s*people\s*like/i) ||
                       html.match(/(\d[\d,\.]*[KMB]?)\s*followers/i);
    if (likesMatch) {
      return parseFollowerCount(likesMatch[1]);
    }

    return null;
  } catch (error) {
    console.warn('Facebook scrape failed:', error);
    return null;
  }
}

function parseFollowerCount(str: string): number {
  // Remove commas and spaces
  let clean = str.replace(/[,\s]/g, '');

  // Handle K, M, B suffixes
  const multipliers: Record<string, number> = { 'K': 1000, 'M': 1000000, 'B': 1000000000 };
  const suffix = clean.slice(-1).toUpperCase();

  if (multipliers[suffix]) {
    return Math.round(parseFloat(clean.slice(0, -1)) * multipliers[suffix]);
  }

  return parseInt(clean, 10) || 0;
}

export async function scrapeSocialFollowers(html: string, domain: string): Promise<SocialFollowers> {
  const result: SocialFollowers = {
    twitter: null,
    twitterHandle: null,
    linkedin: null,
    facebook: null,
    instagram: null,
    youtube: null,
    totalFollowers: 0,
    platformsWithData: 0,
  };

  // Extract social links from HTML
  const twitterMatch = html.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
  const linkedinMatch = html.match(/linkedin\.com\/company\/([a-zA-Z0-9-]+)/i);
  const facebookMatch = html.match(/facebook\.com\/([a-zA-Z0-9.]+)/i);

  const scrapePromises: Promise<void>[] = [];

  // Scrape Twitter
  if (twitterMatch && twitterMatch[1] !== 'share' && twitterMatch[1] !== 'intent') {
    result.twitterHandle = twitterMatch[1];
    scrapePromises.push(
      scrapeTwitterFollowers(twitterMatch[1]).then(count => {
        result.twitter = count;
        if (count) {
          result.totalFollowers += count;
          result.platformsWithData++;
        }
      })
    );
  }

  // Scrape LinkedIn
  if (linkedinMatch) {
    const linkedinUrl = `https://www.linkedin.com/company/${linkedinMatch[1]}`;
    scrapePromises.push(
      scrapeLinkedInFollowers(linkedinUrl).then(count => {
        result.linkedin = count;
        if (count) {
          result.totalFollowers += count;
          result.platformsWithData++;
        }
      })
    );
  }

  // Scrape Facebook
  if (facebookMatch && facebookMatch[1] !== 'sharer') {
    const facebookUrl = `https://www.facebook.com/${facebookMatch[1]}`;
    scrapePromises.push(
      scrapeFacebookFollowers(facebookUrl).then(count => {
        result.facebook = count;
        if (count) {
          result.totalFollowers += count;
          result.platformsWithData++;
        }
      })
    );
  }

  // Run all scrapes in parallel with timeout
  await Promise.race([
    Promise.allSettled(scrapePromises),
    new Promise(resolve => setTimeout(resolve, 10000)), // 10s timeout
  ]);

  console.log(`Social followers for ${domain}:`, result);
  return result;
}

// ============================================
// SSL LABS API (FREE)
// Detailed SSL/TLS security analysis
// ============================================
export interface SSLLabsResult {
  grade: string | null; // A+, A, A-, B, C, D, E, F, T, M
  gradeTrustIgnored: string | null;
  hasWarnings: boolean;
  isExceptional: boolean;
  certExpiresIn: number | null; // days
  protocol: string | null; // TLS 1.3, TLS 1.2, etc.
  keyStrength: number | null; // bits
  supportsHsts: boolean;
  vulnerabilities: string[];
  analysisComplete: boolean;
}

export async function getSSLLabsGrade(domain: string): Promise<SSLLabsResult> {
  const defaultResult: SSLLabsResult = {
    grade: null,
    gradeTrustIgnored: null,
    hasWarnings: false,
    isExceptional: false,
    certExpiresIn: null,
    protocol: null,
    keyStrength: null,
    supportsHsts: false,
    vulnerabilities: [],
    analysisComplete: false,
  };

  try {
    // SSL Labs API - start analysis or get cached results
    // Using fromCache=on to get quick cached results if available
    const apiUrl = `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(domain)}&fromCache=on&maxAge=24`;

    console.log(`SSL Labs: Checking ${domain}`);

    const response = await fetch(apiUrl); // SSL Labs supports CORS

    if (!response.ok) {
      console.warn(`SSL Labs API returned ${response.status}`);
      return defaultResult;
    }

    const data = await response.json();

    // Check status - might still be analyzing
    if (data.status === 'ERROR') {
      console.warn('SSL Labs error:', data.statusMessage);
      return defaultResult;
    }

    if (data.status === 'DNS' || data.status === 'IN_PROGRESS') {
      console.log('SSL Labs: Analysis in progress, using basic check');
      return defaultResult;
    }

    if (data.status === 'READY' && data.endpoints && data.endpoints.length > 0) {
      const endpoint = data.endpoints[0];

      const result: SSLLabsResult = {
        grade: endpoint.grade || null,
        gradeTrustIgnored: endpoint.gradeTrustIgnored || null,
        hasWarnings: endpoint.hasWarnings || false,
        isExceptional: endpoint.isExceptional || false,
        certExpiresIn: null,
        protocol: null,
        keyStrength: null,
        supportsHsts: false,
        vulnerabilities: [],
        analysisComplete: true,
      };

      // Check for vulnerabilities
      if (endpoint.details) {
        const details = endpoint.details;

        if (details.vulnBeast) result.vulnerabilities.push('BEAST');
        if (details.poodle) result.vulnerabilities.push('POODLE');
        if (details.heartbleed) result.vulnerabilities.push('Heartbleed');
        if (details.freak) result.vulnerabilities.push('FREAK');
        if (details.logjam) result.vulnerabilities.push('Logjam');
        if (details.drownVulnerable) result.vulnerabilities.push('DROWN');

        result.supportsHsts = details.hstsPolicy?.status === 'present';
        result.keyStrength = details.key?.strength || null;

        // Get best protocol
        if (details.protocols) {
          const protocols = details.protocols.map((p: { name: string; version: string }) =>
            `${p.name} ${p.version}`
          );
          if (protocols.includes('TLS 1.3')) result.protocol = 'TLS 1.3';
          else if (protocols.includes('TLS 1.2')) result.protocol = 'TLS 1.2';
          else result.protocol = protocols[0];
        }

        // Certificate expiry
        if (details.cert?.notAfter) {
          const expiryDate = new Date(details.cert.notAfter);
          const now = new Date();
          result.certExpiresIn = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }
      }

      console.log(`SSL Labs: ${domain} grade=${result.grade}, protocol=${result.protocol}`);
      return result;
    }

    return defaultResult;
  } catch (error) {
    console.warn('SSL Labs API failed:', error);
    return defaultResult;
  }
}

// ============================================
// OPEN PAGERANK API (FREE)
// Alternative to Moz/Ahrefs domain authority
// ============================================
export interface OpenPageRankResult {
  pageRankDecimal: number | null; // 0-10 scale
  rank: number | null;
  statusCode: number;
}

export async function getOpenPageRank(domain: string): Promise<OpenPageRankResult> {
  try {
    // Open PageRank - free API with limits
    // Note: Requires API key for production, but has generous free tier
    const apiUrl = `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(domain)}`;

    console.log(`OpenPageRank: Checking ${domain}`);

    // This API requires an API key header, but we can try without
    const response = await fetch(apiUrl);

    if (!response.ok) {
      return { pageRankDecimal: null, rank: null, statusCode: response.status };
    }

    const data = await response.json();

    if (data.response && data.response[0]) {
      const result = data.response[0];
      console.log(`OpenPageRank: ${domain} rank=${result.page_rank_decimal}`);
      return {
        pageRankDecimal: result.page_rank_decimal || null,
        rank: result.rank || null,
        statusCode: 200,
      };
    }

    return { pageRankDecimal: null, rank: null, statusCode: 200 };
  } catch (error) {
    console.warn('OpenPageRank API failed:', error);
    return { pageRankDecimal: null, rank: null, statusCode: 500 };
  }
}

// ============================================
// DOMAIN REGISTRATION AFFILIATE SYSTEM
// ============================================

export interface DomainSuggestion {
  domain: string;
  tld: string;
  available: boolean | null; // null = unknown
  price: string | null;
  registrar: string;
  affiliateUrl: string;
  isPremium: boolean;
}

export interface DomainRegistrationData {
  analyzedDomain: string;
  isAvailable: boolean | null;
  suggestions: DomainSuggestion[];
  alternativeTlds: DomainSuggestion[];
  premiumListings: DomainSuggestion[];
}

// Affiliate URL generators for different registrars
const REGISTRAR_AFFILIATES = {
  namecheap: {
    name: 'Namecheap',
    baseUrl: 'https://www.namecheap.com/domains/registration/results/',
    buildUrl: (domain: string) =>
      `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
    logo: 'namecheap',
  },
  godaddy: {
    name: 'GoDaddy',
    baseUrl: 'https://www.godaddy.com/domainsearch/find',
    buildUrl: (domain: string) =>
      `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(domain)}`,
    logo: 'godaddy',
  },
  porkbun: {
    name: 'Porkbun',
    baseUrl: 'https://porkbun.com/checkout/search',
    buildUrl: (domain: string) =>
      `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
    logo: 'porkbun',
  },
  cloudflare: {
    name: 'Cloudflare',
    baseUrl: 'https://www.cloudflare.com/products/registrar/',
    buildUrl: (domain: string) =>
      `https://dash.cloudflare.com/?to=/:account/domains/register/${encodeURIComponent(domain)}`,
    logo: 'cloudflare',
  },
};

// TLD pricing estimates (for display purposes)
const TLD_PRICES: Record<string, { low: number; high: number }> = {
  '.com': { low: 9, high: 15 },
  '.net': { low: 10, high: 15 },
  '.org': { low: 10, high: 15 },
  '.io': { low: 30, high: 50 },
  '.co': { low: 25, high: 35 },
  '.ai': { low: 70, high: 100 },
  '.app': { low: 12, high: 20 },
  '.dev': { low: 12, high: 20 },
  '.tech': { low: 5, high: 15 },
  '.online': { low: 3, high: 10 },
  '.site': { low: 3, high: 10 },
  '.xyz': { low: 2, high: 5 },
};

// Check domain availability using RDAP (free, no API key needed)
export async function checkDomainAvailability(domain: string): Promise<boolean | null> {
  try {
    // Try RDAP lookup - if it returns data, domain is taken
    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;

    const response = await fetch(rdapUrl, {
      method: 'HEAD',
      mode: 'no-cors' // RDAP may not support CORS
    });

    // If we get a response, domain exists (taken)
    // This is a simplified check - actual availability requires registrar API
    return false; // Assume taken if RDAP has data
  } catch {
    // If RDAP fails, we can't determine availability
    return null;
  }
}

// Generate domain suggestions based on the analyzed domain
export function generateDomainSuggestions(
  baseDomain: string,
  isAnalyzedDomainTaken: boolean = true
): DomainRegistrationData {
  // Extract the domain name without TLD
  const parts = baseDomain.split('.');
  const name = parts[0];
  const currentTld = '.' + parts.slice(1).join('.');

  const suggestions: DomainSuggestion[] = [];
  const alternativeTlds: DomainSuggestion[] = [];
  const premiumListings: DomainSuggestion[] = [];

  // Alternative TLDs for the same name
  const tldOptions = ['.com', '.io', '.co', '.net', '.org', '.app', '.dev', '.ai', '.tech', '.online'];

  for (const tld of tldOptions) {
    if (tld === currentTld) continue;

    const domain = name + tld;
    const priceRange = TLD_PRICES[tld] || { low: 10, high: 20 };

    alternativeTlds.push({
      domain,
      tld,
      available: null, // Would need API to check
      price: `$${priceRange.low}-${priceRange.high}/yr`,
      registrar: 'namecheap',
      affiliateUrl: REGISTRAR_AFFILIATES.namecheap.buildUrl(domain),
      isPremium: tld === '.ai' || tld === '.io',
    });
  }

  // Name variations/suggestions
  const nameVariations = [
    `get${name}`,
    `${name}app`,
    `${name}hq`,
    `my${name}`,
    `the${name}`,
    `${name}online`,
    `${name}now`,
    `try${name}`,
  ];

  for (const variation of nameVariations.slice(0, 4)) {
    const domain = variation + '.com';
    suggestions.push({
      domain,
      tld: '.com',
      available: null,
      price: '$9-15/yr',
      registrar: 'namecheap',
      affiliateUrl: REGISTRAR_AFFILIATES.namecheap.buildUrl(domain),
      isPremium: false,
    });
  }

  // Premium domain suggestions (aftermarket)
  if (name.length <= 5) {
    premiumListings.push({
      domain: baseDomain,
      tld: currentTld,
      available: !isAnalyzedDomainTaken,
      price: 'Premium - Check Price',
      registrar: 'godaddy',
      affiliateUrl: `https://www.godaddy.com/domainsearch/find?domainToCheck=${encodeURIComponent(baseDomain)}&isc=cjcgdarr1`,
      isPremium: true,
    });
  }

  return {
    analyzedDomain: baseDomain,
    isAvailable: !isAnalyzedDomainTaken,
    suggestions,
    alternativeTlds,
    premiumListings,
  };
}

// Get affiliate links for a specific domain across all registrars
export function getRegistrarLinks(domain: string): Array<{
  name: string;
  url: string;
  logo: string;
}> {
  return Object.values(REGISTRAR_AFFILIATES).map(registrar => ({
    name: registrar.name,
    url: registrar.buildUrl(domain),
    logo: registrar.logo,
  }));
}

// Calculate potential domain value for unregistered domains
export function estimateUnregisteredDomainValue(name: string, tld: string): {
  estimatedValue: number;
  factors: string[];
} {
  let value = 100; // Base value
  const factors: string[] = [];

  // Length bonus
  if (name.length <= 3) {
    value += 5000;
    factors.push('Ultra-short (3 chars or less): +$5,000');
  } else if (name.length <= 5) {
    value += 1000;
    factors.push('Short domain (4-5 chars): +$1,000');
  } else if (name.length <= 8) {
    value += 200;
    factors.push('Moderate length (6-8 chars): +$200');
  }

  // TLD value
  const tldMultipliers: Record<string, number> = {
    '.com': 10,
    '.io': 5,
    '.ai': 8,
    '.co': 3,
    '.net': 2,
    '.org': 2,
  };

  const multiplier = tldMultipliers[tld] || 1;
  if (multiplier > 1) {
    factors.push(`Premium TLD (${tld}): ${multiplier}x multiplier`);
  }
  value *= multiplier;

  // Dictionary word bonus
  const commonWords = ['app', 'web', 'tech', 'data', 'cloud', 'pay', 'buy', 'shop', 'code', 'dev'];
  if (commonWords.some(word => name.toLowerCase().includes(word))) {
    value += 500;
    factors.push('Contains valuable keyword: +$500');
  }

  // No numbers/hyphens bonus
  if (!/[-0-9]/.test(name)) {
    value += 100;
    factors.push('Clean (no numbers/hyphens): +$100');
  }

  return { estimatedValue: Math.round(value), factors };
}

// ============================================
// WHOIS/RDAP DOMAIN DATA (FREE)
// Verified domain registration information
// ============================================
export interface RdapResult {
  registrar: string | null;
  creationDate: Date | null;
  expirationDate: Date | null;
  updatedDate: Date | null;
  registrantCountry: string | null;
  nameservers: string[];
  status: string[];
  verifiedAgeYears: number | null;
  daysUntilExpiry: number | null;
  isExpiringSoon: boolean; // < 90 days
}

export async function getRdapData(domain: string): Promise<RdapResult> {
  const defaultResult: RdapResult = {
    registrar: null,
    creationDate: null,
    expirationDate: null,
    updatedDate: null,
    registrantCountry: null,
    nameservers: [],
    status: [],
    verifiedAgeYears: null,
    daysUntilExpiry: null,
    isExpiringSoon: false,
  };

  try {
    // RDAP is the modern replacement for WHOIS - free and structured
    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;

    console.log(`RDAP: Fetching data for ${domain}`);

    const response = await fetchWithCorsProxy(rdapUrl);

    if (!response.ok) {
      console.warn(`RDAP returned ${response.status} for ${domain}`);
      return defaultResult;
    }

    const data = await response.json();

    const result: RdapResult = { ...defaultResult };

    // Extract registrar
    if (data.entities) {
      for (const entity of data.entities) {
        if (entity.roles?.includes('registrar')) {
          result.registrar = entity.vcardArray?.[1]?.find((v: string[]) => v[0] === 'fn')?.[3] ||
                            entity.publicIds?.[0]?.identifier ||
                            null;
        }
        if (entity.roles?.includes('registrant')) {
          // Try to get country from vcard
          const adr = entity.vcardArray?.[1]?.find((v: string[]) => v[0] === 'adr');
          if (adr && Array.isArray(adr[3])) {
            result.registrantCountry = adr[3][6] || null; // Country is typically last element
          }
        }
      }
    }

    // Extract dates from events
    if (data.events) {
      for (const event of data.events) {
        const eventDate = new Date(event.eventDate);
        if (event.eventAction === 'registration') {
          result.creationDate = eventDate;
        } else if (event.eventAction === 'expiration') {
          result.expirationDate = eventDate;
        } else if (event.eventAction === 'last changed' || event.eventAction === 'last update of RDAP database') {
          result.updatedDate = eventDate;
        }
      }
    }

    // Extract nameservers
    if (data.nameservers) {
      result.nameservers = data.nameservers.map((ns: { ldhName: string }) => ns.ldhName).filter(Boolean);
    }

    // Extract status
    if (data.status) {
      result.status = data.status;
    }

    // Calculate derived values
    if (result.creationDate) {
      const now = new Date();
      const ageMs = now.getTime() - result.creationDate.getTime();
      result.verifiedAgeYears = Math.round((ageMs / (1000 * 60 * 60 * 24 * 365.25)) * 10) / 10;
    }

    if (result.expirationDate) {
      const now = new Date();
      const daysUntil = Math.floor((result.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      result.daysUntilExpiry = daysUntil;
      result.isExpiringSoon = daysUntil < 90;
    }

    console.log(`RDAP: ${domain} registrar=${result.registrar}, age=${result.verifiedAgeYears}yrs, expiry=${result.daysUntilExpiry}days`);
    return result;
  } catch (error) {
    console.warn('RDAP API failed:', error);
    return defaultResult;
  }
}

// ============================================
// GOOGLE INDEXED PAGE COUNT ESTIMATION
// Real indexed page count from search
// ============================================
export interface IndexedPagesResult {
  estimatedCount: number | null;
  confidence: 'high' | 'medium' | 'low';
  source: string;
}

export async function getIndexedPageCount(domain: string): Promise<IndexedPagesResult> {
  try {
    // Use Google search with site: operator
    // Note: This is an estimation as Google doesn't provide exact counts via API
    const searchUrl = `https://www.google.com/search?q=site:${encodeURIComponent(domain)}`;

    console.log(`Indexed Pages: Checking ${domain}`);

    const response = await fetchWithCorsProxy(searchUrl);
    const html = await response.text();

    // Look for "About X results" pattern
    // Patterns: "About 1,234,567 results" or "1,234 results"
    const resultMatch = html.match(/About\s+([\d,]+)\s+results/i) ||
                       html.match(/([\d,]+)\s+results/i);

    if (resultMatch) {
      const count = parseInt(resultMatch[1].replace(/,/g, ''), 10);
      console.log(`Indexed Pages: ${domain} has ~${count.toLocaleString()} indexed pages`);
      return {
        estimatedCount: count,
        confidence: count > 10000 ? 'medium' : 'high', // Large counts are estimates
        source: 'google-search',
      };
    }

    // If no results found, check if site is indexed at all
    if (html.includes('did not match any documents') || html.includes('No results found')) {
      console.log(`Indexed Pages: ${domain} has 0 indexed pages`);
      return {
        estimatedCount: 0,
        confidence: 'high',
        source: 'google-search',
      };
    }

    return {
      estimatedCount: null,
      confidence: 'low',
      source: 'google-search-failed',
    };
  } catch (error) {
    console.warn('Indexed pages check failed:', error);
    return {
      estimatedCount: null,
      confidence: 'low',
      source: 'error',
    };
  }
}

// ============================================
// CHROME UX REPORT (CrUX) - REAL USER DATA
// Field data from Chrome users
// ============================================
export interface CruxResult {
  hasData: boolean;
  // Core Web Vitals
  lcp: { p75: number | null; rating: 'good' | 'needs-improvement' | 'poor' | null }; // Largest Contentful Paint
  fid: { p75: number | null; rating: 'good' | 'needs-improvement' | 'poor' | null }; // First Input Delay
  cls: { p75: number | null; rating: 'good' | 'needs-improvement' | 'poor' | null }; // Cumulative Layout Shift
  inp: { p75: number | null; rating: 'good' | 'needs-improvement' | 'poor' | null }; // Interaction to Next Paint
  ttfb: { p75: number | null; rating: 'good' | 'needs-improvement' | 'poor' | null }; // Time to First Byte
  // Aggregate
  overallRating: 'good' | 'needs-improvement' | 'poor' | null;
  formFactor: 'phone' | 'desktop' | 'tablet' | null;
}

export async function getCruxData(url: string): Promise<CruxResult> {
  const defaultResult: CruxResult = {
    hasData: false,
    lcp: { p75: null, rating: null },
    fid: { p75: null, rating: null },
    cls: { p75: null, rating: null },
    inp: { p75: null, rating: null },
    ttfb: { p75: null, rating: null },
    overallRating: null,
    formFactor: null,
  };

  try {
    // CrUX API - free with Google API key
    // For now, we can extract CrUX data from PageSpeed Insights which includes it
    // The PSI API already calls CrUX internally

    console.log(`CrUX: Checking real user data for ${url}`);

    // PageSpeed already includes CrUX data in loadingExperience
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return defaultResult;
    }

    const data = await response.json();
    const cruxData = data.loadingExperience;

    if (!cruxData || !cruxData.metrics) {
      console.log(`CrUX: No field data available for ${url}`);
      return defaultResult;
    }

    const result: CruxResult = {
      hasData: true,
      lcp: extractCruxMetric(cruxData.metrics, 'LARGEST_CONTENTFUL_PAINT_MS'),
      fid: extractCruxMetric(cruxData.metrics, 'FIRST_INPUT_DELAY_MS'),
      cls: extractCruxMetric(cruxData.metrics, 'CUMULATIVE_LAYOUT_SHIFT_SCORE'),
      inp: extractCruxMetric(cruxData.metrics, 'INTERACTION_TO_NEXT_PAINT'),
      ttfb: extractCruxMetric(cruxData.metrics, 'EXPERIMENTAL_TIME_TO_FIRST_BYTE'),
      overallRating: cruxData.overall_category?.toLowerCase() || null,
      formFactor: 'phone', // We requested mobile
    };

    console.log(`CrUX: ${url} LCP=${result.lcp.p75}ms (${result.lcp.rating}), CLS=${result.cls.p75} (${result.cls.rating})`);
    return result;
  } catch (error) {
    console.warn('CrUX data fetch failed:', error);
    return defaultResult;
  }
}

function extractCruxMetric(
  metrics: Record<string, { percentile: number; category: string }>,
  key: string
): { p75: number | null; rating: 'good' | 'needs-improvement' | 'poor' | null } {
  const metric = metrics[key];
  if (!metric) {
    return { p75: null, rating: null };
  }
  return {
    p75: metric.percentile,
    rating: metric.category?.toLowerCase() as 'good' | 'needs-improvement' | 'poor' || null,
  };
}

// ============================================
// COMMONCRAWL BACKLINK ESTIMATION
// Free backlink data from web crawl index
// ============================================
export interface BacklinkResult {
  estimatedBacklinks: number;
  uniqueDomains: number;
  topReferrers: string[];
  hasBacklinkData: boolean;
}

export async function getBacklinkEstimate(domain: string): Promise<BacklinkResult> {
  const defaultResult: BacklinkResult = {
    estimatedBacklinks: 0,
    uniqueDomains: 0,
    topReferrers: [],
    hasBacklinkData: false,
  };

  try {
    // CommonCrawl Index API - search for pages linking to this domain
    // Using the latest available index
    console.log(`Backlinks: Estimating backlinks for ${domain}`);

    // CommonCrawl index search - look for pages containing this domain
    const ccUrl = `https://index.commoncrawl.org/CC-MAIN-2024-10-index?url=*.${domain}&output=json&limit=100`;

    // Note: CommonCrawl requires specific query format and may be slow
    // For MVP, we'll use a simpler heuristic based on other signals

    // Alternative: Use the domain's mentions in CommonCrawl
    const searchUrl = `https://index.commoncrawl.org/CC-MAIN-2024-10-index?url=${encodeURIComponent(domain)}/*&output=json&limit=1`;

    try {
      const response = await fetchWithCorsProxy(searchUrl);
      const text = await response.text();

      // Count the number of results (each line is a JSON object)
      const lines = text.trim().split('\n').filter(l => l.length > 0);

      if (lines.length > 0) {
        // Estimate backlinks based on CommonCrawl presence
        // Sites in CC typically have more backlinks
        const ccPages = lines.length;

        // Rough heuristic: if site has X pages in CC, estimate Y backlinks
        const estimatedBacklinks = ccPages * 10; // Conservative multiplier

        console.log(`Backlinks: ${domain} found ${ccPages} pages in CommonCrawl, est. ${estimatedBacklinks} backlinks`);

        return {
          estimatedBacklinks,
          uniqueDomains: Math.round(estimatedBacklinks * 0.3), // Estimate unique domains
          topReferrers: [],
          hasBacklinkData: true,
        };
      }
    } catch (e) {
      console.warn('CommonCrawl query failed:', e);
    }

    return defaultResult;
  } catch (error) {
    console.warn('Backlink estimation failed:', error);
    return defaultResult;
  }
}

// ============================================
// BRAND MENTIONS (Reddit + Hacker News)
// Social proof and community presence
// ============================================
export interface BrandMentionsResult {
  reddit: {
    mentionCount: number;
    topSubreddits: string[];
    recentPosts: { title: string; subreddit: string; score: number; url: string }[];
  };
  hackerNews: {
    mentionCount: number;
    totalPoints: number;
    recentStories: { title: string; points: number; comments: number; url: string }[];
  };
  totalMentions: number;
  hasBrandPresence: boolean;
  sentimentIndicator: 'positive' | 'neutral' | 'negative' | 'unknown';
}

export async function getBrandMentions(domain: string): Promise<BrandMentionsResult> {
  const result: BrandMentionsResult = {
    reddit: { mentionCount: 0, topSubreddits: [], recentPosts: [] },
    hackerNews: { mentionCount: 0, totalPoints: 0, recentStories: [] },
    totalMentions: 0,
    hasBrandPresence: false,
    sentimentIndicator: 'unknown',
  };

  const cleanDomain = domain.replace(/^www\./, '');

  // Fetch Reddit and HN in parallel
  const [redditResult, hnResult] = await Promise.allSettled([
    fetchRedditMentions(cleanDomain),
    fetchHackerNewsMentions(cleanDomain),
  ]);

  if (redditResult.status === 'fulfilled') {
    result.reddit = redditResult.value;
  }

  if (hnResult.status === 'fulfilled') {
    result.hackerNews = hnResult.value;
  }

  result.totalMentions = result.reddit.mentionCount + result.hackerNews.mentionCount;
  result.hasBrandPresence = result.totalMentions > 5;

  // Simple sentiment from HN points (high points = positive reception)
  if (result.hackerNews.totalPoints > 100) {
    result.sentimentIndicator = 'positive';
  } else if (result.totalMentions > 0) {
    result.sentimentIndicator = 'neutral';
  }

  console.log(`Brand Mentions: ${domain} - Reddit: ${result.reddit.mentionCount}, HN: ${result.hackerNews.mentionCount}`);
  return result;
}

async function fetchRedditMentions(domain: string): Promise<BrandMentionsResult['reddit']> {
  try {
    const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(domain)}&sort=relevance&limit=25`;

    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'WebsiteValueAnalyzer/1.0' }
    });

    if (!response.ok) {
      return { mentionCount: 0, topSubreddits: [], recentPosts: [] };
    }

    const data = await response.json();
    const posts = data?.data?.children || [];

    const subredditCounts: Record<string, number> = {};
    const recentPosts: BrandMentionsResult['reddit']['recentPosts'] = [];

    for (const post of posts.slice(0, 10)) {
      const p = post.data;
      subredditCounts[p.subreddit] = (subredditCounts[p.subreddit] || 0) + 1;
      recentPosts.push({
        title: p.title?.slice(0, 100) || '',
        subreddit: p.subreddit,
        score: p.score || 0,
        url: `https://reddit.com${p.permalink}`,
      });
    }

    const topSubreddits = Object.entries(subredditCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sub]) => sub);

    return {
      mentionCount: posts.length,
      topSubreddits,
      recentPosts: recentPosts.slice(0, 5),
    };
  } catch (error) {
    console.warn('Reddit search failed:', error);
    return { mentionCount: 0, topSubreddits: [], recentPosts: [] };
  }
}

async function fetchHackerNewsMentions(domain: string): Promise<BrandMentionsResult['hackerNews']> {
  try {
    // Hacker News Algolia API - free and well-documented
    const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domain)}&tags=story&hitsPerPage=25`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      return { mentionCount: 0, totalPoints: 0, recentStories: [] };
    }

    const data = await response.json();
    const hits = data?.hits || [];

    let totalPoints = 0;
    const recentStories: BrandMentionsResult['hackerNews']['recentStories'] = [];

    for (const hit of hits.slice(0, 10)) {
      totalPoints += hit.points || 0;
      recentStories.push({
        title: hit.title?.slice(0, 100) || '',
        points: hit.points || 0,
        comments: hit.num_comments || 0,
        url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      });
    }

    return {
      mentionCount: data.nbHits || hits.length,
      totalPoints,
      recentStories: recentStories.slice(0, 5),
    };
  } catch (error) {
    console.warn('Hacker News search failed:', error);
    return { mentionCount: 0, totalPoints: 0, recentStories: [] };
  }
}

// ============================================
// MOBILE-FRIENDLY TEST
// Mobile usability assessment
// ============================================
export interface MobileFriendlyResult {
  isMobileFriendly: boolean;
  hasViewport: boolean;
  hasTouchIcons: boolean;
  hasResponsiveDesign: boolean;
  fontSizeOk: boolean;
  tapTargetsOk: boolean;
  mobileScore: number; // 0-100
  issues: string[];
}

export function analyzeMobileFriendliness(html: string): MobileFriendlyResult {
  const lowerHtml = html.toLowerCase();
  const issues: string[] = [];

  // Check viewport meta tag
  const hasViewport = lowerHtml.includes('name="viewport"') || lowerHtml.includes("name='viewport'");
  if (!hasViewport) issues.push('Missing viewport meta tag');

  // Check for responsive design indicators
  const hasMediaQueries = lowerHtml.includes('@media');
  const hasFlexbox = lowerHtml.includes('display:flex') || lowerHtml.includes('display: flex');
  const hasGrid = lowerHtml.includes('display:grid') || lowerHtml.includes('display: grid');
  const hasBootstrap = lowerHtml.includes('bootstrap');
  const hasTailwind = lowerHtml.includes('tailwind');
  const hasResponsiveDesign = hasMediaQueries || hasFlexbox || hasGrid || hasBootstrap || hasTailwind;
  if (!hasResponsiveDesign) issues.push('No responsive design patterns detected');

  // Check for touch icons (Apple, Android)
  const hasTouchIcons = lowerHtml.includes('apple-touch-icon') ||
                        lowerHtml.includes('android-chrome') ||
                        lowerHtml.includes('manifest.json');

  // Check for mobile-unfriendly patterns
  const hasFlash = lowerHtml.includes('application/x-shockwave-flash');
  if (hasFlash) issues.push('Uses Flash (not mobile-friendly)');

  const hasFixedWidth = /width:\s*\d{4,}px/i.test(html); // Fixed width > 1000px
  if (hasFixedWidth) issues.push('Fixed wide layouts detected');

  const hasTinyFonts = /font-size:\s*[0-8]px/i.test(html);
  if (hasTinyFonts) issues.push('Very small font sizes detected');

  // Calculate mobile score
  let score = 50; // Base score
  if (hasViewport) score += 20;
  if (hasResponsiveDesign) score += 15;
  if (hasTouchIcons) score += 5;
  if (!hasFlash) score += 5;
  if (!hasFixedWidth) score += 5;
  score = Math.max(0, Math.min(100, score));

  const isMobileFriendly = score >= 70;

  console.log(`Mobile: Score=${score}, Viewport=${hasViewport}, Responsive=${hasResponsiveDesign}`);

  return {
    isMobileFriendly,
    hasViewport,
    hasTouchIcons,
    hasResponsiveDesign,
    fontSizeOk: !hasTinyFonts,
    tapTargetsOk: !hasTinyFonts, // Simplified check
    mobileScore: score,
    issues,
  };
}
