#!/usr/bin/env node

// 构建后生成站点地图和robots.txt的脚本
const fs = require('fs');
const path = require('path');

// 生成完整的站点地图
function generateSimpleSitemap() {
  const today = new Date().toISOString().split('T')[0];

  // 主要页面
  const mainPages = [
    { loc: 'https://wsnail.com/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://wsnail.com/tools', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://wsnail.com/tools/market-analysis', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://wsnail.com/tools/fba-calculator', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://wsnail.com/sales-target', priority: '0.9', changefreq: 'weekly' },
    { loc: 'https://wsnail.com/processes/amazon-new-product-import', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://wsnail.com/workflows', priority: '0.7', changefreq: 'weekly' },
    { loc: 'https://wsnail.com/forum', priority: '0.7', changefreq: 'daily' },
    { loc: 'https://wsnail.com/about', priority: '0.5', changefreq: 'monthly' },
  ];

  // 游戏页面
  const gamePages = [
    'ai-quiz',
    'ai-word-chain',
    'ai-math-challenge',
    'ai-rock-paper-scissors',
    'ai-storytelling',
    'ai-debate',
    'go-game',
    'chess-game'
  ].map(game => ({
    loc: `https://wsnail.com/games/${game}`,
    priority: '0.6',
    changefreq: 'weekly'
  }));

  // AI工具分类页面（长尾关键词优化）
  const categoryPages = [
    'chat', 'search', 'social', 'image', 'video', 'processing'
  ].map(cat => ({
    loc: `https://wsnail.com/ai-tools?category=${cat}`,
    priority: '0.8',
    changefreq: 'daily'
  }));

  // 占卜类型页面
  const divinationTypes = [
    'tarot', 'zodiac', 'bazi', 'palmistry', 'nametest', 'jiugong'
  ].map(type => ({
    loc: `https://wsnail.com/divination?type=${type}`,
    priority: '0.7',
    changefreq: 'weekly'
  }));

  // SEO 着陆页（长尾关键词优化）
  const landingPages = [
    'ai-chatbot',
    'ai-image-generator',
    'ai-video-maker',
    'free-ai-tools',
    'ai-writing-assistant',
    'ai-search-engine'
  ].map(type => ({
    loc: `https://wsnail.com/landing?type=${type}`,
    priority: '0.9',
    changefreq: 'weekly'
  }));

  // 合并所有页面
  const allPages = [...mainPages];

  // 生成XML
  const urls = allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
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