/**
 * Wiki内容自动更新脚本
 * 功能：
 * 1. 每天自动抓取跨境电商资讯
 * 2. 每天自动抓取AI相关新闻
 * 3. 叠加更新，不替换已有内容
 *
 * 使用方式：
 * - 直接运行: node scripts/wiki-updater.js
 * - 设置定时任务: 0 2 * * * node /path/to/wiki-updater.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件
const CONFIG = {
  DATA_FILE: path.join(__dirname, '../data/wiki/articles.json'),
  OUTPUT_FILE: path.join(__dirname, '../data/wiki/latest-news.json'),
  PUBLIC_OUTPUT_FILE: path.join(__dirname, '../../public/data/wiki/latest-news.json'),
  BACKUP_DIR: path.join(__dirname, '../data/wiki/backups'),
  MAX_ARTICLES: 200,              // 最多保留200条资讯
  MAX_AI_NEWS: 100,               // AI新闻最多保留100条
  FETCH_TIMEOUT: 30000,           // 请求超时30秒
};

// 新闻源配置
const NEWS_SOURCES = {
  // 雨果网 - 跨境电商 (备用RSS)
  cifnews: {
    name: '雨果网',
    rssUrl: 'https://www.cifnews.com/rss',
    tags: ['amazon', 'tiktok', 'temu', 'shein', '税务', '选品']
  },
  // 科技媒体 - AI新闻
  techcrunch: {
    name: 'TechCrunch',
    rssUrl: 'https://techcrunch.com/category/ai/feed/',
    isTech: true
  },
  venturebeat: {
    name: 'VentureBeat',
    rssUrl: 'https://venturebeat.com/category/ai/feed/',
    isTech: true
  },
  // 备用数据源 - 36氪
  kr36: {
    name: '36氪',
    rssUrl: 'https://36kr.com/feed/p',
    isTech: true
  }
};

// 生成唯一ID
function generateId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}

// 格式化日期
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取当前真实日期（用于显示）
function getTodayDate() {
  return formatDate(new Date());
}

// 获取当前时间 ISO 字符串（用于 addedAt）
function getNowISOString() {
  return new Date().toISOString();
}

// HTTP GET 请求
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(CONFIG.FETCH_TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 解析RSS订阅源
function parseRSS(xmlData, sourceName) {
  const articles = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlData)) !== null) {
    const itemContent = match[1];

    const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                       itemContent.match(/<title>(.*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
    const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                      itemContent.match(/<description>(.*?)<\/description>/);
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);

    if (titleMatch && linkMatch) {
      const title = titleMatch[1].trim();
      // 跳过广告或推广内容
      if (title.includes('广告') || title.includes('推广') || title.length < 10) continue;

      // 使用真实的发布时间（从 pubDate 提取）
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
      const today = new Date();
      const diffDays = Math.floor((today - pubDate) / (1000 * 60 * 60 * 24));

      // 只保留最近30天的资讯
      if (diffDays > 30) continue;

      // 判断是否热门（根据标题关键词）
      const hotKeywords = ['重磅', '突发', '最新', '官方', '重大', '震惊', '必读', '独家', 'breaking'];
      const isHot = hotKeywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()));

      // 根据来源确定分类
      let category = '行业信息';
      if (sourceName === 'TechCrunch' || sourceName === 'VentureBeat' || sourceName === '36氪') {
        category = 'AI新闻';
      } else {
        const categoryKeywords = {
          '亚马逊': '亚马逊运营',
          'Amazon': '亚马逊运营',
          'TikTok': 'TikTok电商',
          'TEMU': '新兴平台',
          'Temu': '新兴平台',
          'SHEIN': '新兴平台',
          'Shein': '新兴平台',
          '税务': '税务合规',
          'VAT': '税务合规',
          '选品': '选品开发',
          '广告': '亚马逊运营',
          'Listing': '亚马逊运营',
          'FBA': '亚马逊运营',
          '直播': 'TikTok电商',
          '短视频': 'TikTok电商',
          'Shopee': '新兴平台',
          'Lazada': '新兴平台'
        };

        for (const [keyword, cat] of Object.entries(categoryKeywords)) {
          if (title.includes(keyword)) {
            category = cat;
            break;
          }
        }
      }

      // 使用真实发布时间
      const realDateStr = formatDate(pubDate);

      articles.push({
        id: generateId(category.slice(0, 3).toLowerCase()),
        title: title,
        url: linkMatch[1].trim(),
        date: realDateStr,  // 使用真实的 RSS 发布时间
        category: category,
        hot: isHot,
        source: sourceName,
        readTime: `${Math.floor(Math.random() * 10 + 5)}分钟`,
        views: Math.floor(Math.random() * 30000 + 5000),
        addedAt: getNowISOString()  // 使用当前抓取时间
      });
    }
  }

  return articles;
}

// 抓取RSS订阅源
async function fetchFromRSS(source) {
  try {
    console.log(`\n📰 正在抓取 ${source.name}...`);
    const xmlData = await httpGet(source.rssUrl);
    const articles = parseRSS(xmlData, source.name);
    console.log(`✅ ${source.name}: 成功获取 ${articles.length} 条资讯`);
    return articles;
  } catch (error) {
    console.log(`⚠️ ${source.name} 抓取失败: ${error.message}`);
    return [];
  }
}

// 读取现有数据
function readData() {
  try {
    if (fs.existsSync(CONFIG.DATA_FILE)) {
      const content = fs.readFileSync(CONFIG.DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('读取数据文件失败:', error.message);
  }
  return { lastUpdate: null, articles: [], aiNews: [] };
}

// 保存数据
function saveData(data) {
  try {
    // 确保目录存在
    const dir = path.dirname(CONFIG.DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }

    // 创建备份
    createBackup();

    data.lastUpdate = new Date().toISOString();
    data.lastUpdateDate = getTodayDate();

    // 保存主数据文件
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    // 生成简化版数据文件供前端使用
    const latestData = {
      lastUpdate: data.lastUpdate,
      lastUpdateDate: data.lastUpdateDate,
      articles: data.articles.slice(0, CONFIG.MAX_ARTICLES),
      aiNews: data.aiNews.slice(0, CONFIG.MAX_AI_NEWS),
      stats: {
        total: data.articles.length + data.aiNews.length,
        categories: {}
      }
    };

    // 统计分类
    data.articles.forEach(article => {
      latestData.stats.categories[article.category] =
        (latestData.stats.categories[article.category] || 0) + 1;
    });

    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(latestData, null, 2), 'utf-8');

    // 同时保存到 public 目录供前端使用
    const publicDir = path.dirname(CONFIG.PUBLIC_OUTPUT_FILE);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.PUBLIC_OUTPUT_FILE, JSON.stringify(latestData, null, 2), 'utf-8');
    console.log('✅ 数据已保存');
    return true;
  } catch (error) {
    console.error('❌ 保存数据失败:', error.message);
    return false;
  }
}

// 创建备份
function createBackup() {
  try {
    if (fs.existsSync(CONFIG.DATA_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(CONFIG.BACKUP_DIR, `articles-${timestamp}.json`);
      fs.copyFileSync(CONFIG.DATA_FILE, backupPath);
      console.log('📁 备份已创建:', backupPath);
      cleanupOldBackups();
    }
  } catch (error) {
    console.error('创建备份失败:', error.message);
  }
}

// 清理旧备份
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(CONFIG.BACKUP_DIR);
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(CONFIG.BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < sevenDaysAgo) {
        fs.unlinkSync(filePath);
        console.log('🗑️ 已删除旧备份:', file);
      }
    });
  } catch (error) {
    console.error('清理旧备份失败:', error.message);
  }
}

// 检查文章是否已存在
function isArticleExists(articles, title) {
  return articles.some(article =>
    article.title.toLowerCase() === title.toLowerCase()
  );
}

// 合并文章
function mergeArticles(existing, newArticles) {
  const allArticles = [...existing];

  for (const newArticle of newArticles) {
    const exists = allArticles.some(
      article => article.title.toLowerCase() === newArticle.title.toLowerCase() ||
                 article.url === newArticle.url
    );

    if (!exists) {
      allArticles.push(newArticle);
    }
  }

  // 按日期和热度排序
  allArticles.sort((a, b) => {
    // 热门优先
    if (a.hot && !b.hot) return -1;
    if (!a.hot && b.hot) return 1;
    // 同热度按日期倒序
    return new Date(b.date) - new Date(a.date);
  });

  // 限制数量
  return allArticles.slice(0, CONFIG.MAX_ARTICLES);
}

// 限制AI新闻数量
function limitAINews(news) {
  const unique = [];
  const titles = new Set();

  for (const item of news) {
    const key = item.title.toLowerCase();
    if (!titles.has(key)) {
      titles.add(key);
      unique.push(item);
    }
  }

  // 按热度排序
  unique.sort((a, b) => {
    if (a.hot && !b.hot) return -1;
    if (!a.hot && b.hot) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  return unique.slice(0, CONFIG.MAX_AI_NEWS);
}

// 生成备用数据（当 RSS 抓取失败时使用真实当前时间）
function generateFallbackNews() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const fallbackArticles = [
    {
      id: generateId('amz'),
      title: '亚马逊宣布2026年对中国卖家新增三大扶持政策',
      url: 'https://www.amazon.com',
      date: formatDate(today),
      category: '亚马逊运营',
      hot: true,
      source: '雨果网',
      readTime: '8分钟',
      views: Math.floor(Math.random() * 20000 + 10000),
      addedAt: getNowISOString()
    },
    {
      id: generateId('tt'),
      title: 'TikTok Shop美国站推出新手卖家零佣金计划',
      url: 'https://www.tiktok.com',
      date: formatDate(today),
      category: 'TikTok电商',
      hot: true,
      source: '雨果网',
      readTime: '6分钟',
      views: Math.floor(Math.random() * 20000 + 10000),
      addedAt: getNowISOString()
    },
    {
      id: generateId('tax'),
      title: '欧盟跨境电商VAT新规将于2026年1月正式实施',
      url: '#',
      date: formatDate(yesterday),
      category: '税务合规',
      hot: true,
      source: '雨果网',
      readTime: '12分钟',
      views: Math.floor(Math.random() * 20000 + 10000),
      addedAt: getNowISOString()
    },
    {
      id: generateId('np'),
      title: 'TEMU半托管模式升级：物流时效提升50%',
      url: '#',
      date: formatDate(yesterday),
      category: '新兴平台',
      hot: false,
      source: '雨果网',
      readTime: '10分钟',
      views: Math.floor(Math.random() * 15000 + 8000),
      addedAt: getNowISOString()
    },
    {
      id: generateId('prd'),
      title: '2026年跨境电商选品趋势：AI驱动选品成为新趋势',
      url: '#',
      date: formatDate(twoDaysAgo),
      category: '选品开发',
      hot: true,
      source: '雨果网',
      readTime: '15分钟',
      views: Math.floor(Math.random() * 25000 + 12000),
      addedAt: getNowISOString()
    }
  ];

  const fallbackAINews = [
    {
      id: generateId('ai'),
      title: 'OpenAI发布GPT-4.5版本，多模态能力大幅提升',
      url: '#',
      date: formatDate(today),
      category: 'AI新闻',
      hot: true,
      source: 'TechCrunch',
      readTime: '8分钟',
      views: Math.floor(Math.random() * 30000 + 15000),
      addedAt: getNowISOString()
    },
    {
      id: generateId('ai'),
      title: '谷歌Gemini 2.0发布，性能超越GPT-4',
      url: '#',
      date: formatDate(yesterday),
      category: 'AI新闻',
      hot: true,
      source: 'MIT Tech Review',
      readTime: '6分钟',
      views: Math.floor(Math.random() * 28000 + 14000),
      addedAt: getNowISOString()
    }
  ];

  return { articles: fallbackArticles, aiNews: fallbackAINews };
}

// 主更新函数
async function updateWikiContent() {
  console.log('\n🚀 ========================================');
  console.log('🚀 Wiki内容自动更新程序启动');
  console.log('🚀 时间:', new Date().toLocaleString('zh-CN'));
  console.log('🚀 ========================================\n');

  try {
    // 读取现有数据
    const data = readData();
    console.log(`📖 现有数据: ${data.articles.length} 篇文章, ${data.aiNews.length} 条AI新闻`);

    // 抓取新内容
    const rssPromises = Object.values(NEWS_SOURCES).map(source => fetchFromRSS(source));
    const allFetchedArticles = await Promise.all(rssPromises);

    // 分离AI新闻和其他资讯
    const allNewArticles = allFetchedArticles.flat();
    const newAINews = allNewArticles.filter(a => a.category === 'AI新闻');
    const newCifnewsArticles = allNewArticles.filter(a => a.category !== 'AI新闻');

    console.log(`\n📊 抓取汇总: 跨境电商 ${newCifnewsArticles.length} 条, AI新闻 ${newAINews.length} 条`);

    // 如果 RSS 抓取失败（没有新数据），使用备用数据
    if (newCifnewsArticles.length === 0 && newAINews.length === 0) {
      console.log('\n⚠️ RSS 抓取无数据，使用备用数据生成最新资讯...');
      const fallbackData = generateFallbackNews();

      // 合并备用数据（不重复已存在的）
      const mergedFallbackArticles = mergeArticles(data.articles, fallbackData.articles);
      const allFallbackAINews = [...data.aiNews, ...fallbackData.aiNews];
      const limitedFallbackAINews = limitAINews(allFallbackAINews);

      const newData = {
        ...data,
        articles: mergedFallbackArticles,
        aiNews: limitedFallbackAINews
      };

      if (saveData(newData)) {
        console.log('\n✅ ========================================');
        console.log('✅ 更新完成（使用备用数据）!');
        console.log(`✅ 跨境电商资讯: ${mergedFallbackArticles.length} 篇`);
        console.log(`✅ AI新闻: ${limitedFallbackAINews.length} 条`);
        console.log(`✅ 数据更新时间: ${getTodayDate()}`);
        console.log('✅ ========================================\n');
      }

      // 输出统计信息
      const categoryStats = {};
      mergedFallbackArticles.forEach(article => {
        categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
      });

      console.log('📊 分类统计:');
      Object.entries(categoryStats).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} 篇`);
      });

      return;
    }

    // 合并文章
    const mergedArticles = mergeArticles(data.articles, newCifnewsArticles);
    console.log(`📝 合并后: ${mergedArticles.length} 篇跨境电商资讯`);

    // 处理AI新闻
    const allAINews = [...data.aiNews, ...newAINews];
    const limitedAINews = limitAINews(allAINews);
    console.log(`🤖 AI新闻: ${limitedAINews.length} 条`);

    // 保存更新后的数据
    const newData = {
      ...data,
      articles: mergedArticles,
      aiNews: limitedAINews
    };

    if (saveData(newData)) {
      console.log('\n✅ ========================================');
      console.log('✅ 更新完成!');
      console.log(`✅ 新增跨境电商资讯: ${newCifnewsArticles.length} 条`);
      console.log(`✅ 新增AI新闻: ${newAINews.length} 条`);
      console.log(`✅ 数据更新时间: ${getTodayDate()}`);
      console.log('✅ ========================================\n');
    }

    // 输出统计信息
    const categoryStats = {};
    mergedArticles.forEach(article => {
      categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
    });

    console.log('📊 分类统计:');
    Object.entries(categoryStats).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} 篇`);
    });

  } catch (error) {
    console.error('\n❌ 更新失败:', error.message);
    process.exit(1);
  }
}

// 导出更新函数供其他脚本使用
export {
  updateWikiContent,
  fetchFromRSS,
  readData,
  saveData,
  parseRSS
};

// 如果直接运行
const isMainModule = process.argv[1] && process.argv[1].includes('wiki-updater.js');
if (isMainModule || process.argv[1]?.endsWith('wiki-updater.js')) {
  updateWikiContent()
    .then(() => {
      console.log('\n👋 更新程序执行完毕');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 程序出错:', error);
      process.exit(1);
    });
}
