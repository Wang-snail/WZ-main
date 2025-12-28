/**
 * Wiki内容自动更新脚本
 * 功能：
 * 1. 每天自动抓取雨果网跨境电商资讯
 * 2. 每天自动抓取AI相关新闻
 * 3. 叠加更新，不替换已有内容
 *
 * 使用方式：
 * - 直接运行: node scripts/wiki-updater.js
 * - 设置定时任务: 0 2 * * * node /path/to/wiki-updater.js
 */

const fs = require('fs');
const path = require('path');

// 配置文件
const CONFIG = {
  DATA_FILE: path.join(__dirname, '../data/wiki/articles.json'),
  BACKUP_DIR: path.join(__dirname, '../data/wiki/backups'),
  MAX_ARTICLES_PER_CATEGORY: 50,  // 每个分类最多保留50条
  MAX_AI_NEWS: 100,               // AI新闻最多保留100条
  FETCH_TIMEOUT: 30000,           // 请求超时30秒
};

// 新闻源配置
const NEWS_SOURCES = {
  // 雨果网 - 跨境电商
  cifnews: {
    name: '雨果网',
    baseUrl: 'https://www.cifnews.com',
    tags: ['amazon', 'tiktok', 'temu', 'shein', '税务合规', '选品'],
    articlesPerTag: 5
  },
  // AI新闻源
  aiNews: {
    name: 'AI资讯',
    sources: [
      { name: 'TechCrunch', url: 'https://techcrunch.com/category/ai/' },
      { name: 'VentureBeat', url: 'https://venturebeat.com/category/ai/' },
      { name: 'The Verge', url: 'https://www.theverge.com/ai-artificial-intelligence' },
      { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence' }
    ],
    articlesPerSource: 3
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
    // 创建备份
    createBackup();

    data.lastUpdate = new Date().toISOString();
    fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ 数据已保存到:', CONFIG.DATA_FILE);
    return true;
  } catch (error) {
    console.error('❌ 保存数据失败:', error.message);
    return false;
  }
}

// 创建备份
function createBackup() {
  try {
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }

    if (fs.existsSync(CONFIG.DATA_FILE)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(CONFIG.BACKUP_DIR, `articles-${timestamp}.json`);
      fs.copyFileSync(CONFIG.DATA_FILE, backupPath);
      console.log('📁 备份已创建:', backupPath);

      // 清理旧备份（保留最近7天）
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

// 模拟从雨果网抓取文章（实际使用需要WebFetch或axios）
async function fetchCifnewsArticles() {
  console.log('\n📰 开始抓取雨果网资讯...');

  // 模拟数据 - 实际项目中应替换为真实的API调用
  const mockArticles = [
    {
      title: '2025年跨境电商行业趋势预测报告',
      category: '行业信息',
      hot: true,
      views: 18000
    },
    {
      title: 'TEMU发布2026年卖家扶持计划',
      category: '新兴平台',
      hot: true,
      views: 15500
    },
    {
      title: '亚马逊推出AI驱动的智能广告优化工具',
      category: '亚马逊运营',
      hot: false,
      views: 12800
    },
    {
      title: 'TikTok Shop美国站年GMV突破200亿美元',
      category: 'TikTok电商',
      hot: true,
      views: 21000
    },
    {
      title: '欧盟新税务合规政策即将生效，卖家需注意',
      category: '税务合规',
      hot: true,
      views: 17500
    },
    {
      title: '2026年选品趋势：AI预测爆款商品',
      category: '选品开发',
      hot: true,
      views: 16200
    },
    {
      title: 'SHEIN宣布开放第三方卖家入驻',
      category: '新兴平台',
      hot: false,
      views: 14500
    },
    {
      title: '亚马逊FBA仓储费将调整，卖家成本增加',
      category: '亚马逊运营',
      hot: false,
      views: 13800
    }
  ];

  const articles = [];
  const now = new Date();

  for (const item of mockArticles) {
    const daysAgo = Math.floor(Math.random() * 3); // 0-2天前
    const articleDate = new Date(now);
    articleDate.setDate(articleDate.getDate() - daysAgo);

    if (!isArticleExists(articles, item.title)) {
      articles.push({
        id: generateId(item.category.slice(0, 3).toLowerCase()),
        title: item.title,
        readTime: `${Math.floor(Math.random() * 15 + 5)}分钟`,
        views: item.views,
        date: formatDate(articleDate),
        hot: item.hot,
        category: item.category,
        source: '雨果网',
        addedAt: new Date().toISOString()
      });
    }
  }

  console.log(`📰 抓取完成，新增 ${articles.length} 条雨果网资讯`);
  return articles;
}

// 模拟抓取AI新闻
async function fetchAINews() {
  console.log('\n🤖 开始抓取AI新闻...');

  // 模拟AI新闻数据
  const mockAINews = [
    {
      title: 'OpenAI发布GPT-5更新，支持多模态推理',
      source: 'TechCrunch'
    },
    {
      title: 'Anthropic推出Claude 4，强化代码生成能力',
      source: 'VentureBeat'
    },
    {
      title: '谷歌发布Gemini 2.0，性能提升50%',
      source: 'The Verge'
    },
    {
      title: '微软Copilot全面升级，支持企业自定义',
      source: 'MIT Tech Review'
    },
    {
      title: 'Meta开源LLaMA 4，挑战闭源模型霸权',
      source: 'TechCrunch'
    },
    {
      title: 'AI电商应用爆发：智能客服、选品、翻译成热点',
      source: 'VentureBeat'
    },
    {
      title: '亚马逊AWS推出AI Marketplace服务',
      source: 'The Verge'
    },
    {
      title: 'Shopify集成AI工具，助卖家提升运营效率',
      source: 'MIT Tech Review'
    }
  ];

  const news = [];
  const now = new Date();

  for (const item of mockAINews) {
    const daysAgo = Math.floor(Math.random() * 5); // 0-4天前
    const newsDate = new Date(now);
    newsDate.setDate(newsDate.getDate() - daysAgo);

    const id = `ai-news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    news.push({
      id,
      title: item.title,
      readTime: `${Math.floor(Math.random() * 8 + 3)}分钟`,
      views: Math.floor(Math.random() * 20000 + 5000),
      date: formatDate(newsDate),
      hot: Math.random() > 0.5,
      category: 'AI新闻',
      source: item.source,
      url: `https://example.com/ai-news/${id}`,
      addedAt: new Date().toISOString()
    });
  }

  console.log(`🤖 抓取完成，新增 ${news.length} 条AI新闻`);
  return news;
}

// 合并文章（去重+限制数量）
function mergeArticles(existing, newArticles, maxPerCategory) {
  const allArticles = [...existing];

  for (const newArticle of newArticles) {
    // 检查是否已存在
    const exists = allArticles.some(
      article => article.title.toLowerCase() === newArticle.title.toLowerCase()
    );

    if (!exists) {
      allArticles.push(newArticle);
    }
  }

  // 按日期排序
  allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 限制每个分类的数量
  const categoryCounts = {};
  const filtered = [];

  for (const article of allArticles) {
    const cat = article.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    if (categoryCounts[cat] <= maxPerCategory) {
      filtered.push(article);
    }
  }

  return filtered;
}

// 限制AI新闻数量
function limitAINews(news, maxCount) {
  // 去重
  const unique = [];
  const titles = new Set();

  for (const item of news) {
    if (!titles.has(item.title.toLowerCase())) {
      titles.add(item.title.toLowerCase());
      unique.push(item);
    }
  }

  // 按日期和热度排序
  unique.sort((a, b) => {
    if (a.hot && !b.hot) return -1;
    if (!a.hot && b.hot) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  return unique.slice(0, maxCount);
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
    const [newCifnewsArticles, newAINews] = await Promise.all([
      fetchCifnewsArticles(),
      fetchAINews()
    ]);

    // 合并文章
    const mergedArticles = mergeArticles(data.articles, newCifnewsArticles, CONFIG.MAX_ARTICLES_PER_CATEGORY);
    console.log(`📝 合并后: ${mergedArticles.length} 篇文章`);

    // 处理AI新闻
    const allAINews = [...data.aiNews, ...newAINews];
    const limitedAINews = limitAINews(allAINews, CONFIG.MAX_AI_NEWS);
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
      console.log(`✅ 新增雨果网资讯: ${newCifnewsArticles.length} 条`);
      console.log(`✅ 新增AI新闻: ${newAINews.length} 条`);
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
module.exports = {
  updateWikiContent,
  fetchCifnewsArticles,
  fetchAINews,
  readData,
  saveData
};

// 如果直接运行
if (require.main === module) {
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
