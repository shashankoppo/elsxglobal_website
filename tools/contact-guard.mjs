#!/usr/bin/env node
/**
 * contact-guard.mjs
 *
 * Scans `.ts` and `.tsx` files for hardcoded phone numbers (`+91...`),
 * branded email addresses (`@elsxglobal`, `@evolucentsphere`, `@vaulthost`),
 * and `wa.me` URLs. Flags entries that do not match `lib/contact.ts` AND
 * do not import from `lib/contact`.
 *
 * Usage:
 *   node tools/contact-guard.mjs            # Scan all .ts/.tsx files
 *   node tools/contact-guard.mjs --working  # Scan only staged/modified/untracked files
 *   node tools/contact-guard.mjs --json     # Output JSON report
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const CONTACT_FILE = path.join(ROOT, 'lib', 'contact.ts');

const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  '.bolt',
  'node_modules',
  'dist',
  'scratch',
  'supabase-docker',
  'supabase-production',
]);

function parseArgs(argv) {
  return {
    working: argv.includes('--working'),
    json: argv.includes('--json'),
  };
}

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

/**
 * Extracts canonical phone, email, and WhatsApp string literals from `lib/contact.ts`.
 */
function loadCanonicalContacts() {
  const phones = new Set();
  const emails = new Set();
  const whatsappUrls = new Set();

  if (!fs.existsSync(CONTACT_FILE)) {
    return { phones, emails, whatsappUrls };
  }

  const content = fs.readFileSync(CONTACT_FILE, 'utf8');
  const stringRegex = /['"]([^'"]+)['"]/g;
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    const val = match[1].trim();
    if (/^\+91[\s-]?\d/.test(val)) {
      phones.add(val);
    } else if (/@(?:elsxglobal|evolucentsphere|vaulthost)\./i.test(val)) {
      emails.add(val.toLowerCase());
    } else if (/^https?:\/\/wa\.me\/\d+/i.test(val)) {
      whatsappUrls.add(val.toLowerCase());
    }
  }

  return { phones, emails, whatsappUrls };
}

function collectAllFiles(dirPath, out = []) {
  if (!fs.existsSync(dirPath)) return out;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      collectAllFiles(fullPath, out);
    } else if (
      entry.isFile() &&
      /\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts') &&
      path.resolve(fullPath) !== path.resolve(CONTACT_FILE)
    ) {
      out.push(fullPath);
    }
  }
  return out;
}

function collectWorkingFiles() {
  const commands = [
    'git diff --name-only --diff-filter=ACMR',
    'git diff --cached --name-only --diff-filter=ACMR',
    'git ls-files --others --exclude-standard',
  ];

  const fileSet = new Set();
  for (const cmd of commands) {
    try {
      const stdout = execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      for (const raw of stdout.split(/\r?\n/)) {
        const rel = raw.trim();
        if (!rel) continue;
        const abs = path.resolve(ROOT, rel);
        const posixRel = toPosix(rel);
        const topDir = posixRel.split('/')[0];
        if (IGNORED_DIRS.has(topDir)) continue;
        if (
          /\.(ts|tsx)$/.test(posixRel) &&
          !posixRel.endsWith('.d.ts') &&
          abs !== path.resolve(CONTACT_FILE) &&
          fs.existsSync(abs)
        ) {
          fileSet.add(abs);
        }
      }
    } catch {
      // Ignore individual git command errors if HEAD does not exist yet
    }
  }

  return Array.from(fileSet).sort();
}

const CONTACT_IMPORT_REGEX =
  /(?:from\s+['"]|require\(\s*['"]|import\(\s*['"])(?:@\/|(?:\.\.?\/)+)lib\/contact(?:\.ts)?['"]/;
const PHONE_REGEX = /\+91[\s-]?\d[\dXx\s-]{4,18}/g;
const EMAIL_REGEX =
  /\b[a-zA-Z0-9._%+-]+@(?:elsxglobal|evolucentsphere|vaulthost)\.[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+\b|\b[a-zA-Z0-9._%+-]+@(?:elsxglobal|evolucentsphere|vaulthost)\.[a-zA-Z]{2,}\b/gi;
const WHATSAPP_REGEX = /https?:\/\/wa\.me\/\d+/gi;

function suggestImport(kind, found) {
  if (kind === 'email') {
    const lower = found.toLowerCase();
    if (lower.startsWith('support@')) return "import { CONTACT, getEmail } from '@/lib/contact' (getEmail('support'))";
    if (lower.startsWith('sales@')) return "import { CONTACT, getEmail } from '@/lib/contact' (getEmail('sales'))";
    if (lower.startsWith('privacy@')) return "import { CONTACT, getEmail } from '@/lib/contact' (getEmail('privacy'))";
    return "import { CONTACT, getEmail } from '@/lib/contact' (getEmail('general'))";
  }
  if (kind === 'whatsapp') {
    return "import { getWhatsAppUrl } from '@/lib/contact' (getWhatsAppUrl())";
  }
  return "import { CONTACT, getPhone } from '@/lib/contact' (getPhone('primary' | 'secondary'))";
}

const SYSTEM_SENDER_PREFIXES = ['noreply@'];
const ADMIN_IDENTITY_ALLOWLIST = new Set([
  'middleware.ts',
  'app/api/admin/route.ts',
  'lib/billing/adminAuth.ts',
  'app/admin/reset/page.tsx',
]);

async function scanFile(filePath, canonical) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const importsContact = CONTACT_IMPORT_REGEX.test(rawContent);
  const relPath = toPosix(path.relative(ROOT, filePath));
  const violations = [];

  let lineNumber = 0;
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    lineNumber += 1;

    // 1. Phone numbers (+91...)
    PHONE_REGEX.lastIndex = 0;
    let match;
    while ((match = PHONE_REGEX.exec(line)) !== null) {
      const found = match[0].replace(/[\s-]+$/, '');
      if (!canonical.phones.has(found) && !importsContact) {
        violations.push({
          file: relPath,
          line: lineNumber,
          kind: 'phone',
          found,
          expectedImport: suggestImport('phone', found),
        });
      }
    }

    // 2. Branded emails (@elsxglobal, @evolucentsphere, @vaulthost)
    EMAIL_REGEX.lastIndex = 0;
    while ((match = EMAIL_REGEX.exec(line)) !== null) {
      const found = match[0];
      const lower = found.toLowerCase();
      const isSystemSender = SYSTEM_SENDER_PREFIXES.some((prefix) => lower.startsWith(prefix));
      const isAllowedAdminIdentity =
        lower === 'admin@elsxglobal.com' && ADMIN_IDENTITY_ALLOWLIST.has(relPath);
      if (!canonical.emails.has(lower) && !importsContact && !isSystemSender && !isAllowedAdminIdentity) {
        violations.push({
          file: relPath,
          line: lineNumber,
          kind: 'email',
          found,
          expectedImport: suggestImport('email', found),
        });
      }
    }

    // 3. WhatsApp URLs (wa.me)
    WHATSAPP_REGEX.lastIndex = 0;
    while ((match = WHATSAPP_REGEX.exec(line)) !== null) {
      const found = match[0];
      if (!canonical.whatsappUrls.has(found.toLowerCase()) && !importsContact) {
        violations.push({
          file: relPath,
          line: lineNumber,
          kind: 'whatsapp',
          found,
          expectedImport: suggestImport('whatsapp', found),
        });
      }
    }
  }

  return violations;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const canonical = loadCanonicalContacts();
  const files = args.working ? collectWorkingFiles() : collectAllFiles(ROOT);

  const violations = [];
  for (const file of files) {
    const fileViolations = await scanFile(file, canonical);
    violations.push(...fileViolations);
  }

  if (args.json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          tool: 'contact-guard',
          mode: args.working ? 'working' : 'full',
          scannedFiles: files.length,
          violationCount: violations.length,
          violations,
        },
        null,
        2
      )}\n`
    );
  } else {
    console.log(
      `[contact-guard] Mode: ${args.working ? 'working' : 'full'} | Scanned ${files.length} files | Violations: ${violations.length}`
    );
    if (violations.length > 0) {
      console.log('');
      console.log('File | Line | Found Value | Expected Import');
      console.log('---|---|---|---');
      for (const v of violations) {
        console.log(`${v.file} | ${v.line} | ${v.found} | ${v.expectedImport}`);
      }
    }
  }

  process.exitCode = violations.length > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error('[contact-guard] Fatal error:', err);
  process.exit(2);
});
