import { useMemo, useCallback } from 'react';
import {
  generateDomainSuggestions,
  getRegistrarLinks,
  type DomainSuggestion,
} from '../services/realApis';
import { trackAffiliateClick } from '../services/analytics';

interface DomainRegistrationProps {
  domain: string;
  estimatedValue: number;
}

export function DomainRegistration({ domain, estimatedValue }: DomainRegistrationProps) {
  const domainData = useMemo(() => generateDomainSuggestions(domain, true), [domain]);
  const registrarLinks = useMemo(() => getRegistrarLinks(domain), [domain]);

  const handleRegistrarClick = useCallback((registrarName: string) => {
    trackAffiliateClick({
      type: 'registrar',
      registrar: registrarName,
      analyzedDomain: domain,
      clickedDomain: domain,
      estimatedValue,
    });
  }, [domain, estimatedValue]);

  const handleDomainClick = useCallback((
    suggestion: DomainSuggestion,
    type: 'domain_suggestion' | 'alternative_tld'
  ) => {
    trackAffiliateClick({
      type,
      registrar: suggestion.registrar,
      analyzedDomain: domain,
      clickedDomain: suggestion.domain,
      estimatedValue,
      isPremium: suggestion.isPremium,
    });
  }, [domain, estimatedValue]);

  return (
    <div className="glass-card p-6 fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Register a Domain</h3>
          <p className="text-sm text-gray-400">Build your own site like {domain}</p>
        </div>
      </div>

      {/* Main CTA - Register similar domain */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-medium">Want to build something similar?</p>
            <p className="text-sm text-gray-400">
              Sites like <span className="text-emerald-400">{domain}</span> are worth{' '}
              <span className="text-emerald-400">${estimatedValue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {registrarLinks.slice(0, 3).map((registrar) => (
            <a
              key={registrar.name}
              href={registrar.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleRegistrarClick(registrar.name)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-lg transition-all text-sm"
            >
              <span className="text-gray-300">{registrar.name}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Alternative TLDs */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Try Different Extensions
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {domainData.alternativeTlds.slice(0, 6).map((suggestion) => (
            <DomainCard
              key={suggestion.domain}
              suggestion={suggestion}
              onClick={() => handleDomainClick(suggestion, 'alternative_tld')}
            />
          ))}
        </div>
      </div>

      {/* Name Variations */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Name Ideas
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {domainData.suggestions.map((suggestion) => (
            <DomainCard
              key={suggestion.domain}
              suggestion={suggestion}
              compact
              onClick={() => handleDomainClick(suggestion, 'domain_suggestion')}
            />
          ))}
        </div>
      </div>

      {/* Affiliate disclosure */}
      <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-white/5">
        We may earn a commission when you register domains through our links.
      </p>
    </div>
  );
}

function DomainCard({
  suggestion,
  compact = false,
  onClick,
}: {
  suggestion: DomainSuggestion;
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <a
      href={suggestion.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`
        group flex items-center justify-between
        bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50
        rounded-lg transition-all
        ${compact ? 'px-3 py-2' : 'p-3'}
      `}
    >
      <div className="min-w-0">
        <p className={`text-white truncate ${compact ? 'text-sm' : ''}`}>
          {suggestion.domain}
        </p>
        {!compact && suggestion.price && (
          <p className="text-xs text-gray-500">{suggestion.price}</p>
        )}
      </div>
      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
        {suggestion.isPremium && (
          <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
            Premium
          </span>
        )}
        <svg
          className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}

export default DomainRegistration;
