import type { Claim, ClaimStatus, CompetitorClaim } from './types';

/**
 * Truth-in-Claims Registry (ADR-006)
 *
 * Single source of truth for public metrics, scale assertions, and SLA figures.
 * Every entry records provenance (`status`, `owner`, `asOf`, `reviewBy`) and
 * avoids fabricated metrics or unverified certificates.
 */
export const CLAIMS_REGISTRY: Record<string, Claim> = {
  clients: {
    id: 'clients',
    value: '~150+',
    label: 'Active Clients',
    description: 'Active client accounts across ELSxGlobal and VaultHost.',
    status: 'attested',
    owner: 'Founder (Shashank Patel)',
    asOf: '2026-11-26',
    reviewBy: '2027-02-26',
    definition: 'Total active client accounts',
  },
  countries: {
    id: 'countries',
    value: '40+',
    label: 'Countries Served',
    description: 'Countries across which EvolucentSphere and ELSxGlobal serve enterprise clients.',
    status: 'attested',
    owner: 'Founder (Shashank Patel)',
    asOf: '2026-11-26',
    reviewBy: '2027-02-26',
    definition: 'Countries with active client engagements or operations',
  },
  deployments: {
    id: 'deployments',
    value: '100+',
    label: 'Infrastructure Deployments',
    description: 'Production infrastructure deployments managed by ELSxGlobal and VaultHost.',
    status: 'attested',
    owner: 'Founder (Shashank Patel)',
    asOf: '2026-11-26',
    reviewBy: '2027-02-26',
    definition: 'Total infrastructure deployments managed',
  },
  enterprise_clients: {
    id: 'enterprise_clients',
    value: '340+',
    label: 'Enterprise Clients',
    description: 'Attested enterprise client/project metric pending precise category mapping.',
    status: 'attested',
    owner: 'Founder (Shashank Patel)',
    asOf: '2026-11-26',
    reviewBy: '2026-12-26',
    definition: 'Attested — definition pending mapping',
    notes: 'Needs founder clarification: clients vs deployments vs enterprise-tier',
  },
  uptime_sla: {
    id: 'uptime_sla',
    value: '99.9%',
    label: 'Platform Uptime SLA',
    description: 'Conservative baseline uptime availability target across core VaultHost services.',
    status: 'target',
    owner: 'Platform Engineering',
    asOf: '2026-11-26',
    reviewBy: '2026-12-26',
    definition: 'Target monthly availability percentage for core platform services',
  },
  edge_locations: {
    id: 'edge_locations',
    value: '300+',
    label: 'Edge Locations',
    description: 'Estimated Anycast edge Points of Presence (PoPs) across global network.',
    status: 'estimated',
    owner: 'Infrastructure Engineering',
    asOf: '2026-11-26',
    reviewBy: '2026-12-26',
    definition: 'Estimated Anycast edge PoP count',
    notes: 'Needs founder verification: real PoP count',
  },
  products_count: {
    id: 'products_count',
    value: '30+',
    label: 'Platform Products',
    description: 'Estimated count of VaultHost cloud, hosting, and developer products.',
    status: 'estimated',
    owner: 'Product Engineering',
    asOf: '2026-11-26',
    reviewBy: '2026-12-26',
    definition: 'Estimated VaultHost product inventory count',
    notes: 'Needs founder verification: exact product inventory',
  },
  daily_transactions_value: {
    id: 'daily_transactions_value',
    value: '₹2,400Cr+',
    label: 'Daily Transaction Volume',
    description: 'Attested daily settlement and transaction volume across supported client systems.',
    status: 'attested',
    owner: 'Founder (Shashank Patel)',
    asOf: '2026-11-26',
    reviewBy: '2026-12-26',
    definition: 'Aggregate daily transaction value across attested client workloads',
    notes: 'Needs founder verification of methodology',
  },
};

/**
 * Competitor comparison claims require `sourceUrl`, `retrievedAt`, and `reviewBy` <= 30 days.
 * Intentionally empty until public, dated competitor sources are verified (Decision D-02 / F-07).
 */
export const COMPETITOR_CLAIMS: CompetitorClaim[] = [];

const CLAIM_ID_ALIASES: Record<string, string> = {
  clients_count: 'clients',
  countries_served: 'countries',
};

/** Retrieves a claim record by canonical ID (or supported alias). */
export function getClaim(id: string): Claim | undefined {
  if (Object.prototype.hasOwnProperty.call(CLAIMS_REGISTRY, id)) {
    return CLAIMS_REGISTRY[id];
  }
  const aliased = CLAIM_ID_ALIASES[id];
  if (aliased && Object.prototype.hasOwnProperty.call(CLAIMS_REGISTRY, aliased)) {
    return CLAIMS_REGISTRY[aliased];
  }
  return undefined;
}

/** Returns the formatted display string for a registered claim or '[claim not found]'. */
export function renderClaimValue(id: string): string {
  const claim = getClaim(id);
  if (!claim) {
    return '[claim not found]';
  }
  return claim.unit ? `${claim.value} ${claim.unit}` : String(claim.value);
}

/** Returns true if a claim's `reviewBy` date is in the past relative to `referenceDate`. */
export function isClaimStale(
  claim: Pick<Claim, 'reviewBy'>,
  referenceDate: Date = new Date()
): boolean {
  const reviewTimestamp = Date.parse(claim.reviewBy);
  if (Number.isNaN(reviewTimestamp)) {
    return true;
  }
  return referenceDate.getTime() > reviewTimestamp;
}

/** Returns non-stale competitor claims suitable for rendering. */
export function getActiveCompetitorClaims(
  referenceDate: Date = new Date()
): CompetitorClaim[] {
  return COMPETITOR_CLAIMS.filter(
    (claim) => claim.status !== 'retired' && !isClaimStale(claim, referenceDate)
  );
}

/** Returns all registered claims matching the specified status. */
export function getClaimsByStatus(status: ClaimStatus): Claim[] {
  return Object.values(CLAIMS_REGISTRY).filter((claim) => claim.status === status);
}
