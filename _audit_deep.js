const fs = require('fs');
const path = require('path');

function walk(dir, ext) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        results = results.concat(walk(fullPath, ext));
      } else if (ext.some(e => file.endsWith(e))) {
        results.push({ path: fullPath, size: stat.size });
      }
    }
  } catch (e) {}
  return results;
}

// 1. ROUTE INVENTORY
console.log('=== ROUTE INVENTORY ===');
function findRoutes(dir, prefix) {
  let routes = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        const routeSegment = item.startsWith('(') ? '' : '/' + item;
        const newPrefix = prefix + routeSegment;
        const hasPage = fs.existsSync(path.join(full, 'page.tsx'));
        const hasLayout = fs.existsSync(path.join(full, 'layout.tsx'));
        const hasLoading = fs.existsSync(path.join(full, 'loading.tsx'));
        const hasError = fs.existsSync(path.join(full, 'error.tsx'));
        if (hasPage) {
          const pageContent = fs.readFileSync(path.join(full, 'page.tsx'), 'utf8');
          const isClient = pageContent.includes("'use client'") || pageContent.includes('"use client"');
          const hasGenerateStatic = pageContent.includes('generateStaticParams');
          const hasRevalidate = pageContent.includes('revalidate');
          const hasFramerMotion = pageContent.includes('framer-motion');
          const hasFetch = pageContent.includes('fetch(') || pageContent.includes('supabase');
          const pageSize = fs.statSync(path.join(full, 'page.tsx')).size;
          routes.push({
            route: newPrefix || '/',
            isClient,
            hasLayout,
            hasLoading,
            hasError,
            hasGenerateStatic,
            hasRevalidate,
            hasFramerMotion,
            hasFetch,
            pageSize: Math.round(pageSize / 1024 * 10) / 10
          });
        }
        routes = routes.concat(findRoutes(full, newPrefix));
      }
    }
  } catch (e) {}
  return routes;
}

const routes = findRoutes('./app', '');
const clientPages = routes.filter(r => r.isClient);
const serverPages = routes.filter(r => !r.isClient);
console.log('Total routes:', routes.length);
console.log('Client-rendered pages:', clientPages.length);
console.log('Server-rendered pages:', serverPages.length);
console.log('');
console.log('CLIENT PAGES (should minimize):');
clientPages.forEach(r => console.log('  [CLIENT] ' + r.route + ' (' + r.pageSize + 'KB)' + (r.hasFramerMotion ? ' [framer-motion]' : '')));
console.log('');
console.log('SERVER PAGES:');
serverPages.forEach(r => console.log('  [SERVER] ' + r.route + ' (' + r.pageSize + 'KB)' + (r.hasGenerateStatic ? ' [SSG]' : '') + (r.hasRevalidate ? ' [ISR]' : '')));

// 2. FRAMER MOTION DEEP ANALYSIS
console.log('');
console.log('=== FRAMER-MOTION ANALYSIS ===');
const allFiles = walk('./app', ['.tsx', '.ts']).concat(walk('./components', ['.tsx', '.ts']));
const fmFiles = [];
for (const f of allFiles) {
  try {
    const content = fs.readFileSync(f.path, 'utf8');
    if (content.includes('framer-motion')) {
      const imports = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]framer-motion['"]/);
      fmFiles.push({
        file: f.path,
        imports: imports ? imports[1].trim() : 'unknown',
        size: Math.round(f.size / 1024 * 10) / 10
      });
    }
  } catch (e) {}
}
fmFiles.forEach(f => console.log('  ' + f.size + 'KB ' + f.file));
console.log('  Total files:', fmFiles.length);

// 3. MIDDLEWARE ANALYSIS
console.log('');
console.log('=== MIDDLEWARE ===');
try {
  const mw = fs.readFileSync('./middleware.ts', 'utf8');
  console.log('  Size:', Math.round(mw.length / 1024 * 10) / 10 + 'KB');
  console.log('  Has Supabase:', mw.includes('supabase'));
  console.log('  Has auth check:', mw.includes('auth') || mw.includes('session') || mw.includes('token'));
  const matcherMatch = mw.match(/matcher\s*[=:]\s*(\[[\s\S]*?\])/);
  if (matcherMatch) console.log('  Matcher:', matcherMatch[1].slice(0, 200));
} catch (e) { console.log('  No middleware.ts found'); }

// 4. CONTEXT PROVIDERS
console.log('');
console.log('=== CONTEXT PROVIDERS ===');
for (const f of allFiles) {
  try {
    const content = fs.readFileSync(f.path, 'utf8');
    if (content.includes('createContext') || content.includes('Provider')) {
      if (content.includes('createContext')) {
        console.log('  [CONTEXT] ' + f.path);
      }
    }
  } catch (e) {}
}

// 5. API ROUTES
console.log('');
console.log('=== API ROUTES ===');
const apiRoutes = walk('./app/api', ['.ts', '.tsx']);
apiRoutes.forEach(f => {
  try {
    const content = fs.readFileSync(f.path, 'utf8');
    const methods = [];
    if (content.includes('GET')) methods.push('GET');
    if (content.includes('POST')) methods.push('POST');
    if (content.includes('PUT')) methods.push('PUT');
    if (content.includes('DELETE')) methods.push('DELETE');
    if (content.includes('PATCH')) methods.push('PATCH');
    const hasAuth = content.includes('auth') || content.includes('session') || content.includes('token');
    const hasRateLimit = content.includes('rate') || content.includes('throttle');
    console.log('  ' + f.path + ' [' + methods.join(',') + ']' + (hasAuth ? ' [AUTH]' : '') + (hasRateLimit ? ' [RATE-LIMITED]' : '') + ' (' + Math.round(f.size / 1024 * 10) / 10 + 'KB)');
  } catch (e) {}
});

// 6. SUPABASE CLIENT USAGE
console.log('');
console.log('=== SUPABASE CLIENT USAGE ===');
let clientSideSupabase = 0;
let serverSideSupabase = 0;
for (const f of allFiles) {
  try {
    const content = fs.readFileSync(f.path, 'utf8');
    if (content.includes('.from(') && (content.includes('supabase') || content.includes('createClient'))) {
      const isClient = content.includes("'use client'") || content.includes('"use client"');
      if (isClient) {
        clientSideSupabase++;
        console.log('  [CLIENT-SIDE] ' + f.path);
      } else {
        serverSideSupabase++;
        console.log('  [SERVER-SIDE] ' + f.path);
      }
    }
  } catch (e) {}
}
console.log('  Client-side Supabase queries:', clientSideSupabase);
console.log('  Server-side Supabase queries:', serverSideSupabase);

// 7. NEXT.CONFIG
console.log('');
console.log('=== NEXT.CONFIG ===');
for (const name of ['next.config.js', 'next.config.mjs', 'next.config.ts']) {
  try {
    const content = fs.readFileSync('./' + name, 'utf8');
    console.log('  File: ' + name);
    console.log(content.slice(0, 2000));
    break;
  } catch (e) {}
}
