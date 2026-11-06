const fs = require('fs');
const filesToFix = [
  'app/(marketing)/ai-solutions/page.tsx',
  'app/(marketing)/case-studies/page.tsx',
  'app/(marketing)/erp-crm/page.tsx',
  'app/(marketing)/software/page.tsx'
];
for (const file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/type:\s*["']spring["'](?:\s*as\s*(?:const|any))*/g, 'type: "spring" as any');
  fs.writeFileSync(file, content);
}
console.log('Fixed types cleanly');
