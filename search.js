const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const dirsToScan = ['app', 'lib', 'components'];
const patterns = [/TODO/i, /FIXME/i, /mock/i, /dummy/i, /coming soon/i, /not implemented/i, /Math\.random/, /onClick=\{\(\)\s*=>\s*\{\}\}/];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file.startsWith('.git') || file.startsWith('.next')) continue;
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            console.log(`${fullPath}:${index + 1}: ${line.trim().substring(0, 100)}`);
            break; // only report line once
          }
        }
      });
    }
  }
}

dirsToScan.forEach(dir => scanDir(path.join(rootDir, dir)));
