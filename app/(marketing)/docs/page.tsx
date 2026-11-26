import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import DocsHubPageClient from './docs-client';

export const metadata: Metadata = buildMetadata({
  title: 'VaultHost System Documentation & Architecture Hub',
  description:
    'Role-segmented technical documentation for AI agents, developers, security administrators, enterprise customers, and SaaS partners — covering MCP schemas, ADR-001, SLAs, and OpenAPI 3.1 specs.',
  path: '/docs',
  keywords: [
    'VaultHost documentation',
    'ActionIntent JSON schema',
    'MCP server documentation',
    'OpenAPI 3.1 cloud reference',
    'architecture decision records',
    'SOC 2 ISO 27001 SLA',
  ],
});

export default function DocsHubPage() {
  return <DocsHubPageClient />;
}
