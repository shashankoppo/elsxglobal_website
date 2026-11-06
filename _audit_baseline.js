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

const files = walk('./app', ['.tsx', '.ts', '.jsx', '.js'])
  .concat(walk('./components', ['.tsx', '.ts', '.jsx', '.js']))
  .concat(walk('./lib', ['.tsx', '.ts', '.jsx', '.js']));

const useClientFiles = files.filter(f => {
  try {
    const content = fs.readFileSync(f.path, 'utf8').slice(0, 300);
    return content.includes("'use client'") || content.includes('"use client"');
  } catch (e) { return false; }
});

const serverFiles = files.filter(f => !useClientFiles.includes(f));

console.log('=== ELSXGLOBAL PERFORMANCE BASELINE ===');
console.log('');
console.log('SOURCE FILES:');
console.log('  Total files:', files.length);
console.log('  Client components:', useClientFiles.length);
console.log('  Server components:', serverFiles.length);
console.log('  Client/Server ratio:', (useClientFiles.length / files.length * 100).toFixed(1) + '%');
console.log('');
console.log('SOURCE SIZE:');
console.log('  Total source KB:', Math.round(files.reduce((a, f) => a + f.size, 0) / 1024));
console.log('  Client component KB:', Math.round(useClientFiles.reduce((a, f) => a + f.size, 0) / 1024));
console.log('  Server component KB:', Math.round(serverFiles.reduce((a, f) => a + f.size, 0) / 1024));
console.log('');

console.log('TOP 25 LARGEST CLIENT COMPONENTS:');
useClientFiles.sort((a, b) => b.size - a.size).slice(0, 25).forEach(f => {
  console.log('  ' + (f.size / 1024).toFixed(1) + 'KB  ' + f.path);
});

console.log('');
console.log('FRAMER-MOTION USAGE:');
let fmCount = 0;
for (const f of files) {
  try {
    const c = fs.readFileSync(f.path, 'utf8');
    if (c.includes('framer-motion')) fmCount++;
  } catch (e) {}
}
console.log('  Files importing framer-motion:', fmCount);

console.log('');
console.log('GLOBALS.CSS SIZE:', (fs.statSync('./app/globals.css').size / 1024).toFixed(1) + 'KB');

// Check package.json deps
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const deps = Object.keys(pkg.dependencies || {});
const devDeps = Object.keys(pkg.devDependencies || {});
console.log('');
console.log('DEPENDENCIES:', deps.length, 'prod +', devDeps.length, 'dev');

const heavyDeps = ['framer-motion', 'three', '@react-three/fiber', '@react-three/drei', 'gsap', '@splinetool/runtime', 'lottie-web', 'recharts', 'chart.js', 'd3', 'moment', 'lodash', '@sentry/nextjs', 'react-quill', 'draft-js'];
const foundHeavy = deps.filter(d => heavyDeps.some(h => d.includes(h)));
console.log('HEAVY DEPENDENCIES FOUND:', foundHeavy.length > 0 ? foundHeavy.join(', ') : 'None');

// Fonts
try {
  const layout = fs.readFileSync('./app/layout.tsx', 'utf8');
  const fontMatches = layout.match(/from 'next\/font\/google'/g);
  const fontFamilies = layout.match(/(\w+)\s*=\s*(Inter|Sora|Space_Grotesk|IBM_Plex_Mono|Roboto|Outfit|Poppins)\(/g);
  console.log('');
  console.log('FONTS LOADED:', layout.match(/const \w+ = \w+\(/g)?.length || 0);
} catch (e) {}

// Count useEffect usage
let effectCount = 0;
for (const f of useClientFiles) {
  try {
    const c = fs.readFileSync(f.path, 'utf8');
    const matches = c.match(/useEffect\(/g);
    if (matches) effectCount += matches.length;
  } catch (e) {}
}
console.log('');
console.log('TOTAL useEffect() calls across client components:', effectCount);

// Count lucide icon imports
let iconImports = 0;
for (const f of files) {
  try {
    const c = fs.readFileSync(f.path, 'utf8');
    const matches = c.match(/from 'lucide-react'/g);
    if (matches) iconImports += matches.length;
  } catch (e) {}
}
console.log('FILES importing from lucide-react:', iconImports);
