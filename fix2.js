const fs = require('fs');

const files = [
  'app/(marketing)/ai-solutions/page.tsx',
  'app/(marketing)/case-studies/page.tsx',
  'app/(marketing)/erp-crm/page.tsx',
  'app/(marketing)/software/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/type: "spring" as const/g, 'type: "spring" as any');
  fs.writeFileSync(file, content);
});
