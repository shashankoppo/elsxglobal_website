const fs = require('fs');
const files = [
  'app/(marketing)/ai-solutions/page.tsx',
  'app/(marketing)/case-studies/page.tsx',
  'app/(marketing)/erp-crm/page.tsx',
  'app/(marketing)/software/page.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/type:\s*['"]spring['"]/g, 'type: "spring" as const');
  fs.writeFileSync(f, content);
});

let indFile = 'app/(marketing)/industries/page.tsx';
let indContent = fs.readFileSync(indFile, 'utf8');
// Fix the style prop on PanelCard by wrapping it in a div or changing it
indContent = indContent.replace(/<PanelCard([^>]*?)style=\{\{([^}]+)\}\}([^>]*?)>/g, '<PanelCard$1$3><div style={{$2}} className="absolute top-0 inset-x-0 h-1" />'); 
fs.writeFileSync(indFile, indContent);
console.log('Fixed TS files.');
