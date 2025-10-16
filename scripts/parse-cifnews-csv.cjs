/**
 * 解析CIFNews CSV文件并提取2025年的新闻数据
 */

const fs = require('fs');
const path = require('path');

// CSV文件路径
const csvFilePath = '/Users/bingzi/Downloads/cifnews.csv';
const outputPath = path.join(__dirname, '../public/data/platform_news_2025_full.json');

// 简单的CSV解析函数(处理带引号的字段)
function parseCSVLine(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 转义的引号
        currentField += '"';
        i++; // 跳过下一个引号
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // 添加最后一个字段
  fields.push(currentField);

  return fields;
}

// 判断是否是2025年的新闻
function is2025News(timeStr) {
  if (!timeStr) return false;

  // 匹配 "2025-" 开头的日期
  if (timeStr.startsWith('2025-')) return true;

  // 匹配相对时间(如"2天前", "3天前"等) - 假设当前是2025-10-16
  if (timeStr.includes('天前') || timeStr.includes('小时前')) return true;

  return false;
}

// 分类新闻
function categorizeNews(title, content) {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  const combined = titleLower + ' ' + contentLower;

  // 平台政策关键词
  const policyKeywords = ['政策', '规则', '费用', '佣金', '服务费', '入驻', '注册', '税务', 'VAT', '合规', '要求', '调整', '更新'];
  if (policyKeywords.some(kw => combined.includes(kw))) {
    return 'platform_policy';
  }

  // 促销活动关键词
  const promotionKeywords = ['大促', '黑五', '双11', '促销', '活动', '补贴', '折扣', 'prime', 'sale'];
  if (promotionKeywords.some(kw => combined.includes(kw))) {
    return 'promotion_activities';
  }

  // 市场趋势关键词
  const trendKeywords = ['增长', '营收', '数据', '销售额', '市场', '需求', '消费者'];
  if (trendKeywords.some(kw => combined.includes(kw))) {
    return 'market_trends';
  }

  // 运营技巧关键词
  const tipsKeywords = ['攻略', '指南', '策略', '建议', '选品', '运营', '优化'];
  if (tipsKeywords.some(kw => combined.includes(kw))) {
    return 'operation_tips';
  }

  // 物流支付关键词
  const logisticsKeywords = ['物流', '仓储', 'FBA', '配送', '支付', '清关', '入库'];
  if (logisticsKeywords.some(kw => combined.includes(kw))) {
    return 'logistics_payment';
  }

  // 默认归类为行业资讯
  return 'industry_news';
}

// 提取平台名称
function extractPlatform(title, content) {
  const platforms = [
    'Shopee', 'Temu', 'TikTok', 'Amazon', '亚马逊', 'AliExpress', '速卖通',
    'eBay', 'Lazada', 'Mercado Libre', '美客多', 'Wildberries', 'Ozon',
    'Gmarket', 'Walmart', '沃尔玛'
  ];

  const combined = title + ' ' + content;

  for (const platform of platforms) {
    if (combined.includes(platform)) {
      // 标准化平台名称
      if (platform === '亚马逊') return 'Amazon';
      if (platform === '速卖通') return 'AliExpress';
      if (platform === '美客多') return 'Mercado Libre';
      if (platform === '沃尔玛') return 'Walmart';
      return platform;
    }
  }

  return '跨平台';
}

// 转换日期格式
function convertDate(timeStr) {
  if (!timeStr) return '2025-10-16';

  // 已经是标准格式
  if (/^\d{4}-\d{2}-\d{2}$/.test(timeStr.split(' ')[0])) {
    return timeStr.split(' ')[0];
  }

  // 相对时间转换(假设今天是2025-10-16)
  const baseDate = new Date('2025-10-16');

  if (timeStr.includes('天前')) {
    const days = parseInt(timeStr);
    baseDate.setDate(baseDate.getDate() - days);
  } else if (timeStr.includes('小时前')) {
    // 当天
    return '2025-10-16';
  }

  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// 生成简短摘要
function generateSummary(content, maxLength = 100) {
  const cleaned = content.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '...';
}

async function main() {
  try {
    console.log('开始读取CSV文件...');

    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    console.log(`总共 ${lines.length} 行数据`);

    // 跳过表头
    const headers = parseCSVLine(lines[0]);
    console.log('CSV字段:', headers);

    const news2025 = [];
    let newsIdCounter = 20; // 从20开始,因为已有19条

    // 处理每一行
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);

      if (fields.length < 4) continue;

      const [title, href, content, time] = fields;

      // 只处理2025年的新闻
      if (!is2025News(time)) continue;

      // 提取平台和分类
      const platform = extractPlatform(title, content);
      const category = categorizeNews(title, content);
      const date = convertDate(time);
      const summary = generateSummary(content);

      news2025.push({
        id: `news_2025_${String(newsIdCounter).padStart(3, '0')}`,
        title: title.replace(/【.*?】/g, '').trim(), // 移除【】标签
        date: date,
        platform: platform,
        category: category,
        summary: summary,
        content: content.trim(),
        impact: '', // 需要后续补充
        relevantPlatforms: [platform]
      });

      newsIdCounter++;
    }

    console.log(`\n找到 ${news2025.length} 条2025年新闻`);

    // 按类别统计
    const categoryStats = {};
    news2025.forEach(news => {
      categoryStats[news.category] = (categoryStats[news.category] || 0) + 1;
    });

    console.log('\n按类别统计:');
    Object.entries(categoryStats).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}条`);
    });

    // 按平台统计
    const platformStats = {};
    news2025.forEach(news => {
      platformStats[news.platform] = (platformStats[news.platform] || 0) + 1;
    });

    console.log('\n按平台统计:');
    Object.entries(platformStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([platform, count]) => {
        console.log(`  ${platform}: ${count}条`);
      });

    // 保存到文件
    const output = {
      news: news2025,
      totalCount: news2025.length,
      lastUpdate: '2025-10-16',
      year: 2025,
      categoryStats,
      platformStats
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n数据已保存到: ${outputPath}`);

  } catch (error) {
    console.error('处理失败:', error);
  }
}

main();
