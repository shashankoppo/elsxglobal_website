#!/usr/bin/env node
/**
 * claim-lint.mjs
 *
 * Scans `.ts` and `.tsx` files in `app/` and `components/` for hardcoded
 * numeric claims (+ counts, percentages, INR currency amounts) and
 * cross-references them against `lib/claims/registry.ts`.
 *
 * Usage:
 *   node tools/claim-lint.mjs            # Exit 1 if new violations found
 *   node tools/claim-lint.mjs --report   # Report only, always exit 0
 *   node tools/claim-lint.mjs --json     # Output pure JSON for CI
 *   node tools/claim-lint.mjs --baseline <path>
 *   node tools/claim-lint.mjs --write-baseline
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components'];
const CLAIMS_REGISTRY_PATH = path.join(ROOT, 'lib', 'claims', 'registry.ts');
const PRICING_REGISTRY_PATH = path.join(ROOT, 'lib', 'pricing', 'registry.ts');
const DEFAULT_BASELINE_PATH = path.join(ROOT, 'tools', '.claim-lint-baseline.json');

function parseArgs(argv) {
  const args = {
    report: false,
    json: false,
    writeBaseline: false,
    baselinePath: DEFAULT_BASELINE_PATH,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--report') {
      args.report = true;
    } else if (token === '--json') {
      args.json = true;
    } else if (token === '--write-baseline') {
      args.writeBaseline = true;
    } else if (token === '--baseline' && argv[i + 1]) {
      args.baselinePath = path.resolve(ROOT, argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function normalizeClaimToken(raw) {
  return String(raw)
    .trim()
    .replace(/\s+/g, '')
    .replace(/^~/, '')
    .replace(/,/g, '')
    .toLowerCase();
}

/**
 * Extracts claim entries (`id`, `value`, `status`, `label`) from `lib/claims/registry.ts`
 * without executing TypeScript.
 */
function loadClaimsFromRegistry() {
  if (!fs.existsSync(CLAIMS_REGISTRY_PATH)) {
    return [];
  }
  const source = fs.readFileSync(CLAIMS_REGISTRY_PATH, 'utf8');
  const registryMatch = source.match(
    /export\s+const\s+CLAIMS_REGISTRY\s*:\s*Record<string,\s*Claim>\s*=\s*\{([\s\S]*?)\n\};/
  );
  if (!registryMatch) {
    return [];
  }

  const body = registryMatch[1];
  const claims = [];
  const entryRegex = /([a-zA-Z0-9_]+)\s*:\s*\{([\s\S]*?)\n\s*\},/g;
  let match;
  while ((match = entryRegex.exec(body)) !== null) {
    const block = match[2];
    const idMatch = block.match(/\bid\s*:\s*['"]([^'"]+)['"]/);
    const valueMatch = block.match(/\bvalue\s*:\s*(?:['"]([^'"]+)['"]|(\d+(?:\.\d+)?))/);
    const statusMatch = block.match(/\bstatus\s*:\s*['"]([^'"]+)['"]/);
    const labelMatch = block.match(/\blabel\s*:\s*['"]([^'"]+)['"]/);
    if (idMatch && valueMatch) {
      claims.push({
        id: idMatch[1],
        value: valueMatch[1] ?? valueMatch[2],
        status: statusMatch ? statusMatch[1] : 'unknown',
        label: labelMatch ? labelMatch[1] : idMatch[1],
      });
    }
  }
  return claims;
}

/**
 * Extracts pricing plan IDs and rupee display prices from `lib/pricing/registry.ts`.
 */
function loadPricingFromRegistry() {
  if (!fs.existsSync(PRICING_REGISTRY_PATH)) {
    return [];
  }
  const source = fs.readFileSync(PRICING_REGISTRY_PATH, 'utf8');
  const plans = [];
  const entryRegex = /['"]([a-zA-Z0-9_-]+)['"]\s*:\s*\{([\s\S]*?)\n\s*\},/g;
  let match;
  while ((match = entryRegex.exec(source)) !== null) {
    const block = match[2];
    const idMatch = block.match(/\bid\s*:\s*['"]([^'"]+)['"]/);
    const priceMatch = block.match(/\bpricePaise\s*:\s*(\d+)/);
    if (idMatch && priceMatch) {
      const paise = Number(priceMatch[1]);
      plans.push({
        id: idMatch[1],
        rupees: Math.round(paise / 100),
      });
    }
  }
  return plans;
}

function buildSuggester(claims, pricingPlans) {
  const claimValueMap = new Map();
  for (const claim of claims) {
    const key = normalizeClaimToken(claim.value);
    if (!claimValueMap.has(key)) {
      claimValueMap.set(key, []);
    }
    claimValueMap.get(key).push(claim.id);
  }

  const priceValueMap = new Map();
  for (const plan of pricingPlans) {
    if (!priceValueMap.has(plan.rupees)) {
      priceValueMap.set(plan.rupees, []);
    }
    priceValueMap.get(plan.rupees).push(plan.id);
  }

  return function suggestClaimId(foundValue, category, lineText) {
    const normalized = normalizeClaimToken(foundValue);

    if (claimValueMap.has(normalized)) {
      return claimValueMap.get(normalized).join(' | ');
    }

    if (category === 'currency') {
      if (/cr/i.test(foundValue) && /2,?400/i.test(foundValue)) {
        return 'daily_transactions_value';
      }
      const digits = Number(foundValue.replace(/[^\d.]/g, ''));
      if (Number.isFinite(digits) && priceValueMap.has(digits)) {
        const ids = priceValueMap.get(digits).slice(0, 3).join(', ');
        return `lib/pricing/registry.ts (${ids})`;
      }
      if (/cr|lakh|valuation/i.test(foundValue) || /valuation|revenue/i.test(lineText)) {
        return 'Register in lib/claims/registry.ts (or remove per Decision D-04)';
      }
      return 'lib/pricing/registry.ts (getPlan / formatPrice)';
    }

    if (category === 'percentage') {
      if (
        normalized === '99.9%' ||
        ((/^99\.\d+%$/.test(normalized) || normalized === '100%') &&
          /sla|uptime|availability/i.test(lineText))
      ) {
        return 'uptime_sla';
      }
      return 'Register in lib/claims/registry.ts';
    }

    if (category === 'plus_count') {
      if (normalized === '300+') return 'edge_locations';
      if (normalized === '340+') return 'enterprise_clients';
      if (normalized === '150+') return 'clients';
      if (normalized === '100+') return 'deployments';
      if (normalized === '40+') return 'countries';
      if (normalized === '30+') return 'products_count';
    }

    return 'Register in lib/claims/registry.ts';
  };
}

function collectTargetFiles(dirPath, out = []) {
  if (!fs.existsSync(dirPath)) return out;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      collectTargetFiles(fullPath, out);
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      out.push(fullPath);
    }
  }
  return out;
}

/**
 * Strips CSS/Tailwind/gradient expressions so CSS layout percentages like
 * `w-[50%]` or `radial-gradient(... 60% ...)` are not flagged as claims.
 */
function stripCssPercentNoise(line) {
  return line
    .replace(/\[[^\]]*\d+%[^\]]*\]/g, '[]')
    .replace(/(?:radial|linear|conic)-gradient\([^)]*\)/gi, '')
    .replace(/(?:hsl|hsla|rgb|rgba)\([^)]*\)/gi, '')
    .replace(/@keyframes[^}]*\}/gi, '')
    .replace(
      /\b(?:width|minWidth|maxWidth|height|minHeight|maxHeight|top|left|right|bottom|opacity|scale|strokeDashoffset|backgroundSize|backgroundPosition)\s*:\s*['"`]?[^,'"`}]+['"`]?/gi,
      ''
    );
}

const CURRENCY_REGEX = /(?:₹\s?|Rs\.?\s+)\d[\d,.]*(?:\s?(?:Crore|Cr|Lakh|Lac|K|M|B))?\+?/gi;
const PLUS_COUNT_REGEX = /(?<![a-zA-Z0-9_.+/\-])(?:~(?=\d))?\d+(?:[.,]\d+)*(?:[KMBkmb]|Cr)?\+(?![+=0-9])/g;
const PERCENT_REGEX = /(?<![a-zA-Z0-9_.])\d+(?:\.\d+)?%/g;

async function scanFile(filePath, suggestClaimId) {
  const relPath = toPosix(path.relative(ROOT, filePath));
  const violations = [];
  let inBlockComment = false;
  let lineNumber = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity,
  });

  for await (const rawLine of rl) {
    lineNumber += 1;
    let line = rawLine;

    if (inBlockComment) {
      const endIdx = line.indexOf('*/');
      if (endIdx === -1) continue;
      line = line.slice(endIdx + 2);
      inBlockComment = false;
    }

    // Strip inline block comments /* ... */
    line = line.replace(/\/\*[\s\S]*?\*\//g, '');
    const openBlockIdx = line.indexOf('/*');
    if (openBlockIdx !== -1) {
      line = line.slice(0, openBlockIdx);
      inBlockComment = true;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('import ')) {
      continue;
    }

    // Skip lines already resolving via claims or pricing registries
    if (/\b(?:renderClaimValue|getClaim|formatPrice|getPlan)\s*\(/.test(trimmed)) {
      continue;
    }

    // Skip pure URL strings when scanning numeric expressions
    const lineWithoutUrls = line.replace(/https?:\/\/[^\s'"`<>)]+/g, '');
    let remainingForPlus = lineWithoutUrls;

    // 1. Currency amounts (₹XXX / Rs XXX)
    CURRENCY_REGEX.lastIndex = 0;
    let m;
    while ((m = CURRENCY_REGEX.exec(lineWithoutUrls)) !== null) {
      const foundValue = m[0].trim();
      remainingForPlus = remainingForPlus.replace(m[0], ' '.repeat(m[0].length));
      violations.push({
        file: relPath,
        line: lineNumber,
        value: foundValue,
        category: 'currency',
        suggestedClaimId: suggestClaimId(foundValue, 'currency', trimmed),
        snippet: trimmed.slice(0, 140),
      });
    }

    // 2. Numbers followed by '+' (e.g., 150+, ~150+, 300+, 40+, 10M+)
    PLUS_COUNT_REGEX.lastIndex = 0;
    while ((m = PLUS_COUNT_REGEX.exec(remainingForPlus)) !== null) {
      const foundValue = m[0].trim();
      violations.push({
        file: relPath,
        line: lineNumber,
        value: foundValue,
        category: 'plus_count',
        suggestedClaimId: suggestClaimId(foundValue, 'plus_count', trimmed),
        snippet: trimmed.slice(0, 140),
      });
    }

    // 3. Percentages (e.g., 99.9%, 99.999%, 68%)
    const percentTarget = stripCssPercentNoise(lineWithoutUrls);
    PERCENT_REGEX.lastIndex = 0;
    while ((m = PERCENT_REGEX.exec(percentTarget)) !== null) {
      const foundValue = m[0].trim();
      // Ignore standalone 0% or CSS-only transform strings when not mentioning SLA/uptime/rate/etc.
      if (foundValue === '0%') continue;
      if (
        foundValue === '100%' &&
        !/sla|uptime|free|egress|auto|audit|sovereignty|match|guarantee|coverage|renewable/i.test(trimmed) &&
        /className=|style=|transition|opacity|scale|width|height/i.test(trimmed)
      ) {
        continue;
      }
      violations.push({
        file: relPath,
        line: lineNumber,
        value: foundValue,
        category: 'percentage',
        suggestedClaimId: suggestClaimId(foundValue, 'percentage', trimmed),
        snippet: trimmed.slice(0, 140),
      });
    }
  }

  return violations;
}

function loadBaselineCounts(baselinePath) {
  if (!fs.existsSync(baselinePath)) {
    return null;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const counts = new Map();
    const entries = Array.isArray(parsed.violations) ? parsed.violations : [];
    for (const item of entries) {
      const key = `${item.file}::${item.value}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  } catch {
    return null;
  }
}

function applyBaseline(violations, baselineCounts) {
  if (!baselineCounts) {
    return violations.map((v) => ({ ...v, isNew: true }));
  }
  const remaining = new Map(baselineCounts);
  return violations.map((v) => {
    const key = `${v.file}::${v.value}`;
    const left = remaining.get(key) || 0;
    if (left > 0) {
      remaining.set(key, left - 1);
      return { ...v, isNew: false };
    }
    return { ...v, isNew: true };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const claims = loadClaimsFromRegistry();
  const pricingPlans = loadPricingFromRegistry();
  const suggestClaimId = buildSuggester(claims, pricingPlans);

  const files = [];
  for (const dir of SCAN_DIRS) {
    collectTargetFiles(path.join(ROOT, dir), files);
  }

  const rawViolations = [];
  for (const file of files) {
    const fileViolations = await scanFile(file, suggestClaimId);
    rawViolations.push(...fileViolations);
  }

  if (args.writeBaseline) {
    const baselinePayload = {
      generatedAt: new Date().toISOString(),
      total: rawViolations.length,
      violations: rawViolations.map(({ file, line, value, category }) => ({
        file,
        line,
        value,
        category,
      })),
    };
    fs.writeFileSync(args.baselinePath, `${JSON.stringify(baselinePayload, null, 2)}\n`, 'utf8');
  }

  const baselineCounts = loadBaselineCounts(args.baselinePath);
  const violations = applyBaseline(rawViolations, baselineCounts);
  const newViolations = violations.filter((v) => v.isNew);
  const legacyViolations = violations.filter((v) => !v.isNew);

  const output = {
    tool: 'claim-lint',
    mode: args.report ? 'report' : 'enforce',
    baselineUsed: Boolean(baselineCounts),
    scannedFiles: files.length,
    claimsRegistered: claims.map((c) => ({ id: c.id, value: c.value, status: c.status })),
    summary: {
      total: violations.length,
      new: newViolations.length,
      legacy: legacyViolations.length,
    },
    violations,
  };

  if (args.json) {
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  } else {
    console.log(
      `[claim-lint] Scanned ${files.length} files | Registered claims: ${claims.length} | Total findings: ${violations.length} (new: ${newViolations.length}, legacy: ${legacyViolations.length})`
    );
    if (violations.length > 0) {
      console.log('');
      console.log('File | Line | Found Value | Suggested Claim ID | Status');
      console.log('---|---|---|---|---');
      for (const v of violations) {
        console.log(
          `${v.file} | ${v.line} | ${v.value} | ${v.suggestedClaimId} | ${v.isNew ? 'NEW' : 'LEGACY'}`
        );
      }
    }
  }

  if (!args.report && newViolations.length > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
}

main().catch((err) => {
  console.error('[claim-lint] Fatal error:', err);
  process.exit(2);
});
