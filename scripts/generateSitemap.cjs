#!/usr/bin/env node

// 构建后生成站点地图和robots.txt的脚本
const fs = require('fs');
const path = require('path');

// 生成简单的站点地图
function generateSimpleSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://wsnail.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://wsnail.com/ai-tools</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://wsnail.com/divination</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wsnail.com/analyzer</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wsnail.com/games</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  const sitemapPath = path.join(__dirname, '../dist/sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log('Sitemap generated at:', sitemapPath);
}

// 生成robots.txt
function generateRobotsTxt() {
  const robots = `# Robotstxt for WSNAIL.COM
# Generated on ${new Date().toISOString().split('T')[0]}

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# Sitemap files
Sitemap: https://wsnail.com/sitemap.xml

# Host
Host: https://wsnail.com

# Crawl-delay
Crawl-delay: 10
`;

  const robotsPath = path.join(__dirname, '../dist/robots.txt');
  fs.writeFileSync(robotsPath, robots);
  console.log('Robots.txt generated at:', robotsPath);
}

// 执行生成
try {
  console.log('Generating sitemap and robots.txt...');
  generateSimpleSitemap();
  generateRobotsTxt();
  console.log('All files generated successfully!');
} catch (error) {
  console.error('Error generating files:', error);
  process.exit(1);
}