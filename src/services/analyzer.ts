import type {
  DomainAnalysis,
  TechnicalAnalysis,
  SeoAnalysis,
  ContentAnalysis,
  SocialAnalysis,
} from '../types/analysis';

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Premium TLDs and their scores
const TLD_SCORES: Record<string, number> = {
  '.com': 100,
  '.org': 85,
  '.net': 80,
  '.io': 75,
  '.co': 70,
  '.ai': 75,
  '.app': 70,
  '.dev': 70,
  '.tech': 65,
  '.me': 60,
  '.info': 50,
  '.biz': 45,
};

// Valuable keywords for domains
const VALUABLE_KEYWORDS = [
  'shop', 'buy', 'sell', 'store', 'market', 'trade', 'finance', 'money',
  'tech', 'digital', 'smart', 'cloud', 'data', 'ai', 'crypto', 'web',
  'app', 'software', 'code', 'dev', 'health', 'fit', 'life', 'learn',
  'travel', 'food', 'home', 'auto', 'car', 'game', 'play', 'media',
];

export function normalizeUrl(input: string): string {
  let url = input.trim().toLowerCase();

  // Remove protocol if present for analysis
  url = url.replace(/^(https?:\/\/)?(www\.)?/, '');

  // Add https for fetching
  return `https://${url}`;
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

export function analyzeDomain(url: string): DomainAnalysis {
  const domain = extractDomain(url);
  const parts = domain.split('.');
  const tld = '.' + parts[parts.length - 1];
  const name = parts.slice(0, -1).join('.');

  const hasNumbers = /\d/.test(name);
  const hasHyphens = /-/.test(name);
  const isKeywordRich = VALUABLE_KEYWORDS.some(keyword =>
    name.toLowerCase().includes(keyword)
  );

  const tldScore = TLD_SCORES[tld] || 40;

  // Estimate domain age based on common patterns (mock for demo)
  // In production, you'd use a WHOIS API
  const ageEstimate = Math.floor(Math.random() * 15) + 1;

  return {
    domain,
    tld,
    age: ageEstimate,
    length: name.length,
    hasNumbers,
    hasHyphens,
    isKeywordRich,
    tldScore,
  };
}

export async function fetchWebsite(url: string): Promise<{ html: string; loadTime: number }> {
  const startTime = performance.now();

  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    const html = await response.text();
    const loadTime = performance.now() - startTime;

    return { html, loadTime };
  } catch (error) {
    // If CORS proxy fails, generate mock data based on domain
    console.warn('Failed to fetch website, generating analysis based on domain');
    return {
      html: '',
      loadTime: Math.random() * 2000 + 500
    };
  }
}

export function analyzeTechnical(url: string, html: string, loadTime: number): TechnicalAnalysis {
  const hasHttps = url.startsWith('https://');
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const metaDescription = doc.querySelector('meta[name="description"]');
  const metaKeywords = doc.querySelector('meta[name="keywords"]');
  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const twitterCard = doc.querySelector('meta[name="twitter:card"]');
  const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  const canonical = doc.querySelector('link[rel="canonical"]');

  return {
    hasHttps,
    loadTime: Math.round(loadTime),
    htmlSize: new Blob([html]).size,
    hasMetaDescription: !!metaDescription?.getAttribute('content'),
    hasMetaKeywords: !!metaKeywords?.getAttribute('content'),
    hasOpenGraph: !!ogTitle,
    hasTwitterCard: !!twitterCard,
    hasFavicon: !!favicon,
    hasCanonical: !!canonical,
  };
}

export function analyzeSeo(html: string): SeoAnalysis {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const title = doc.querySelector('title')?.textContent || '';
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  const h1s = doc.querySelectorAll('h1');
  const h2s = doc.querySelectorAll('h2');
  const h3s = doc.querySelectorAll('h3');
  const images = doc.querySelectorAll('img');
  const imagesWithAlt = doc.querySelectorAll('img[alt]:not([alt=""])');

  const links = doc.querySelectorAll('a[href]');
  let internalLinks = 0;
  let externalLinks = 0;

  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('http')) {
      externalLinks++;
    } else if (href.startsWith('/') || href.startsWith('#')) {
      internalLinks++;
    }
  });

  const structuredData = doc.querySelector('script[type="application/ld+json"]');

  return {
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    h1Count: h1s.length,
    h2Count: h2s.length,
    h3Count: h3s.length,
    imageCount: images.length,
    imagesWithAlt: imagesWithAlt.length,
    internalLinks,
    externalLinks,
    hasStructuredData: !!structuredData,
  };
}

export function analyzeContent(html: string): ContentAnalysis {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove script and style elements
  doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());

  const textContent = doc.body?.textContent || '';
  const words = textContent.split(/\s+/).filter(word => word.length > 0);
  const paragraphs = doc.querySelectorAll('p');

  const avgWordsPerParagraph = paragraphs.length > 0
    ? Math.round(words.length / paragraphs.length)
    : 0;

  // Simple readability score based on average sentence length
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0
    ? words.length / sentences.length
    : 0;

  // Flesch-like readability (simplified)
  const readabilityScore = Math.max(0, Math.min(100,
    100 - (avgWordsPerSentence - 15) * 3
  ));

  const lowerText = textContent.toLowerCase();
  const hasContactInfo = /contact|email|phone|call us|reach us/i.test(lowerText);
  const hasPrivacyPolicy = /privacy policy|privacy notice/i.test(lowerText) ||
    !!doc.querySelector('a[href*="privacy"]');
  const hasTerms = /terms of service|terms and conditions|terms of use/i.test(lowerText) ||
    !!doc.querySelector('a[href*="terms"]');

  return {
    wordCount: words.length,
    paragraphCount: paragraphs.length,
    avgWordsPerParagraph,
    readabilityScore: Math.round(readabilityScore),
    hasContactInfo,
    hasPrivacyPolicy,
    hasTerms,
  };
}

export function analyzeSocial(html: string): SocialAnalysis {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const htmlLower = html.toLowerCase();

  const hasFacebook = htmlLower.includes('facebook.com') ||
    !!doc.querySelector('a[href*="facebook.com"]');
  const hasTwitter = htmlLower.includes('twitter.com') ||
    htmlLower.includes('x.com') ||
    !!doc.querySelector('a[href*="twitter.com"], a[href*="x.com"]');
  const hasLinkedIn = htmlLower.includes('linkedin.com') ||
    !!doc.querySelector('a[href*="linkedin.com"]');
  const hasInstagram = htmlLower.includes('instagram.com') ||
    !!doc.querySelector('a[href*="instagram.com"]');
  const hasYouTube = htmlLower.includes('youtube.com') ||
    !!doc.querySelector('a[href*="youtube.com"]');

  const socialLinksCount = [hasFacebook, hasTwitter, hasLinkedIn, hasInstagram, hasYouTube]
    .filter(Boolean).length;

  return {
    hasFacebook,
    hasTwitter,
    hasLinkedIn,
    hasInstagram,
    hasYouTube,
    socialLinksCount,
  };
}
