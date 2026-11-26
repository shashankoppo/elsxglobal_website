#!/usr/bin/env node
/**
 * route-audit.mjs
 *
 * Audits the Next.js App Router tree under `app/` for:
 * - Duplicate routes (same URL mapped from multiple files)
 * - Pages missing metadata / generateMetadata exports
 * - `'use client'` pages without route-level server wrappers
 * - Dynamic routes missing `generateStaticParams`
 *
 * Usage:
 *   node tools/route-audit.mjs         # Prints formatted route table + summary
 *   node tools/route-audit.mjs --json  # Prints pure JSON for CI artifacts
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'app');

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
  };
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

/**
 * Converts a relative path inside `app/` to a Next.js URL path.
 * Strips route groups `(group)` and parallel slots `@slot`, preserves `[param]`.
 */
function mapFileToUrl(relFromApp) {
  const posix = toPosix(relFromApp);
  const parts = posix.split('/');
  parts.pop(); // Remove page.tsx or route.ts

  const urlSegments = parts.filter((segment) => {
    if (!segment) return false;
    if (/^\([^)]+\)$/.test(segment)) return false; // Route group
    if (segment.startsWith('@')) return false; // Parallel route slot
    return true;
  });

  return urlSegments.length === 0 ? '/' : `/${urlSegments.join('/')}`;
}

function isClientComponent(source) {
  const stripped = source.replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*/, '');
  return /^['"]use client['"]/.test(stripped);
}

function exportsMetadata(source) {
  return /export\s+(?:const\s+metadata\b|async\s+function\s+generateMetadata\b|function\s+generateMetadata\b|\{[^}]*\bmetadata\b[^}]*\})/.test(
    source
  );
}

function exportsGenerateStaticParams(source) {
  return /export\s+(?:(?:async\s+)?function\s+generateStaticParams\b|const\s+generateStaticParams\b)/.test(
    source
  );
}

function collectRouteFiles(dirPath, out = []) {
  if (!fs.existsSync(dirPath)) return out;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      collectRouteFiles(fullPath, out);
    } else if (entry.isFile() && (entry.name === 'page.tsx' || entry.name === 'route.ts')) {
      out.push(fullPath);
    }
  }
  return out;
}

function auditRoutes() {
  const files = collectRouteFiles(APP_DIR);
  const routes = [];

  for (const filePath of files) {
    const relFromRoot = toPosix(path.relative(ROOT, filePath));
    const relFromApp = toPosix(path.relative(APP_DIR, filePath));
    const fileName = path.basename(filePath);
    const type = fileName === 'page.tsx' ? 'page' : 'route';
    const url = mapFileToUrl(relFromApp);
    const dynamic = /\[[^\]]+\]/.test(url);
    const content = fs.readFileSync(filePath, 'utf8');

    const clientOnly = isClientComponent(content);

    let hasMetadata = false;
    let hasServerWrapper = !clientOnly;
    let hasStaticParams = exportsGenerateStaticParams(content);

    if (type === 'page') {
      const pageHasMeta = !clientOnly && exportsMetadata(content);
      const siblingLayoutPath = path.join(path.dirname(filePath), 'layout.tsx');
      let layoutHasMeta = false;
      let layoutIsServer = false;

      if (fs.existsSync(siblingLayoutPath)) {
        const layoutContent = fs.readFileSync(siblingLayoutPath, 'utf8');
        layoutIsServer = !isClientComponent(layoutContent);
        layoutHasMeta = layoutIsServer && exportsMetadata(layoutContent);
        if (!hasStaticParams) {
          hasStaticParams = exportsGenerateStaticParams(layoutContent);
        }
      }

      hasMetadata = pageHasMeta || layoutHasMeta;
      if (clientOnly) {
        hasServerWrapper = layoutIsServer;
      }
    }

    routes.push({
      url,
      file: relFromRoot,
      type,
      dynamic,
      clientOnly,
      hasMetadata: type === 'route' ? null : hasMetadata,
      hasServerWrapper: type === 'route' ? null : hasServerWrapper,
      hasGenerateStaticParams: type === 'page' && dynamic ? hasStaticParams : null,
    });
  }

  // Sort by URL then file path
  routes.sort((a, b) => a.url.localeCompare(b.url) || a.file.localeCompare(b.file));

  // Detect duplicate routes (same URL mapped by multiple files)
  const byUrl = new Map();
  for (const route of routes) {
    if (!byUrl.has(route.url)) {
      byUrl.set(route.url, []);
    }
    byUrl.get(route.url).push(route.file);
  }

  const duplicates = [];
  for (const [url, mappedFiles] of byUrl.entries()) {
    if (mappedFiles.length > 1) {
      duplicates.push({ url, files: mappedFiles });
    }
  }

  const pages = routes.filter((r) => r.type === 'page');
  const apiRoutes = routes.filter((r) => r.type === 'route');
  const missingMetadata = pages.filter((r) => !r.hasMetadata);
  const clientOnlyWithoutWrapper = pages.filter((r) => r.clientOnly && !r.hasServerWrapper);
  const dynamicWithoutStaticParams = pages.filter(
    (r) => r.dynamic && !r.hasGenerateStaticParams
  );

  return {
    tool: 'route-audit',
    summary: {
      totalRoutes: routes.length,
      pages: pages.length,
      apiRoutes: apiRoutes.length,
      dynamicRoutes: routes.filter((r) => r.dynamic).length,
      dynamicPages: pages.filter((r) => r.dynamic).length,
      clientOnlyPages: pages.filter((r) => r.clientOnly).length,
      duplicateUrls: duplicates.length,
      missingMetadataCount: missingMetadata.length,
      clientOnlyWithoutWrapperCount: clientOnlyWithoutWrapper.length,
      dynamicWithoutStaticParamsCount: dynamicWithoutStaticParams.length,
    },
    issues: {
      duplicates,
      missingMetadata: missingMetadata.map((r) => ({ url: r.url, file: r.file })),
      clientOnlyWithoutWrapper: clientOnlyWithoutWrapper.map((r) => ({
        url: r.url,
        file: r.file,
      })),
      dynamicWithoutStaticParams: dynamicWithoutStaticParams.map((r) => ({
        url: r.url,
        file: r.file,
      })),
    },
    routes,
  };
}

function formatTable(routes) {
  const rows = routes.map((r) => [
    r.url,
    r.file,
    r.type,
    r.dynamic ? 'Yes' : 'No',
    r.clientOnly ? 'Yes' : 'No',
    r.hasMetadata === null ? 'N/A' : r.hasMetadata ? 'Yes' : 'No',
  ]);

  const headers = ['URL', 'File', 'Type (page/route)', 'Dynamic', 'Client-only', 'Has Metadata'];
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((row) => row[i].length))
  );

  const formatRow = (cols) => cols.map((c, i) => c.padEnd(widths[i])).join(' | ');
  const sep = widths.map((w) => '-'.repeat(w)).join('-|-');

  return [formatRow(headers), sep, ...rows.map(formatRow)].join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = auditRoutes();

  if (args.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  console.log(formatTable(report.routes));
  console.log('');
  console.log('=== Route Audit Summary ===');
  console.log(`Total routes:                   ${report.summary.totalRoutes} (${report.summary.pages} pages, ${report.summary.apiRoutes} routes)`);
  console.log(`Duplicate URLs:                 ${report.summary.duplicateUrls}`);
  console.log(`Pages missing metadata:         ${report.summary.missingMetadataCount}`);
  console.log(`Client-only w/o server wrapper: ${report.summary.clientOnlyWithoutWrapperCount}`);
  console.log(`Dynamic pages w/o staticParams: ${report.summary.dynamicWithoutStaticParamsCount}`);

  if (report.issues.duplicates.length > 0) {
    console.log('\nDuplicate Routes:');
    for (const dup of report.issues.duplicates) {
      console.log(`  - ${dup.url}: ${dup.files.join(', ')}`);
    }
  }

  if (report.issues.dynamicWithoutStaticParams.length > 0) {
    console.log('\nDynamic Pages Without generateStaticParams:');
    for (const item of report.issues.dynamicWithoutStaticParams) {
      console.log(`  - ${item.url} (${item.file})`);
    }
  }
}

main();
