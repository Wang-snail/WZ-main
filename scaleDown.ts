import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/pages/Dashboard.tsx',
  'src/pages/TemplateCenter.tsx',
  'src/pages/ReportAnalysis.tsx',
  'src/pages/Settings.tsx',
  'src/pages/admin/AdminNodes.tsx',
  'src/pages/admin/AdminUsers.tsx',
  'src/pages/admin/AdminNodeEdit.tsx',
  'src/components/TopNavBar.tsx',
  'src/components/AdminSidebar.tsx'
];

for (const file of filesToUpdate) {
  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(/text-3xl/g, '__TEXT_2XL__');
  content = content.replace(/text-2xl/g, '__TEXT_XL__');
  content = content.replace(/text-xl/g, '__TEXT_BASE__');
  content = content.replace(/text-base/g, '__TEXT_SM__');
  content = content.replace(/text-sm/g, '__TEXT_XS__');
  content = content.replace(/text-xs/g, '__TEXT_10PX__');
  
  content = content.replace(/__TEXT_2XL__/g, 'text-2xl');
  content = content.replace(/__TEXT_XL__/g, 'text-xl');
  content = content.replace(/__TEXT_BASE__/g, 'text-base');
  content = content.replace(/__TEXT_SM__/g, 'text-sm');
  content = content.replace(/__TEXT_XS__/g, 'text-xs');
  content = content.replace(/__TEXT_10PX__/g, 'text-[10px]');
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file}`);
}
