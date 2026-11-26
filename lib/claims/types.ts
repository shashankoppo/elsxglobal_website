/**
 * Truth-in-Claims Type Definitions (ADR-006)
 */

export type ClaimStatus =
  | 'verified'
  | 'attested'
  | 'estimated'
  | 'target'
  | 'roadmap'
  | 'retired';

export interface Claim {
  id: string;
  value: string | number;
  unit?: string;
  label: string;
  description: string;
  status: ClaimStatus;
  owner: string;
  asOf: string; // ISO date
  reviewBy: string; // ISO date
  sourceUrl?: string;
  definition?: string;
  notes?: string;
}

export interface CompetitorClaim extends Claim {
  competitor: string;
  retrievedAt: string; // ISO date
  sourceUrl: string; // required for competitor claims
}
