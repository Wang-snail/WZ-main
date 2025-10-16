/**
 * 合并现有新闻数据和CSV提取的新闻数据
 */

const fs = require('fs');
const path = require('path');

const existingNewsPath = path.join(__dirname, '../public/data/platform_news_2025.json');
const csvNewsPath = path.join(__dirname, '../public/data/platform_news_2025_full.json');
const outputPath = path.join(__dirname, '../public/data/platform_news_2025.json');

async function main() {
  try {
    console.log('开始合并新闻数据...\n');

    // 读取现有数据(19条手动整理的精品新闻)
    const existingData = JSON.parse(fs.readFileSync(existingNewsPath, 'utf-8'));
    console.log(`现有新闻: ${existingData.totalCount}条`);

    // 读取CSV提取的数据(294条)
    const csvData = JSON.parse(fs.readFileSync(csvNewsPath, 'utf-8'));
    console.log(`CSV提取: ${csvData.totalCount}条`);

    // 创建标题去重集合(避免重复)
    const existingTitles = new Set(
      existingData.news.map(n => n.title.toLowerCase().replace(/\s+/g, ''))
    );

    // 过滤CSV中的重复新闻
    const newNews = csvData.news.filter(news => {
      const normalizedTitle = news.title.toLowerCase().replace(/\s+/g, '');
      return !existingTitles.has(normalizedTitle);
    });

    console.log(`去重后新增: ${newNews.length}条\n`);

    // 合并新闻列表
    const allNews = [...existingData.news, ...newNews];

    // 按日期降序排序
    allNews.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    // 重新分类统计
    const categories = {
      platform_policy: {
        name: "平台政策",
        description: "平台规则、政策更新、费用调整等",
        items: []
      },
      market_trends: {
        name: "市场趋势",
        description: "市场数据、行业趋势、消费者洞察等",
        items: []
      },
      promotion_activities: {
        name: "促销活动",
        description: "平台大促、营销活动、补贴政策等",
        items: []
      },
      operation_tips: {
        name: "运营技巧",
        description: "选品建议、运营策略、优化方法等",
        items: []
      },
      logistics_payment: {
        name: "物流支付",
        description: "物流政策、支付方式、清关规则等",
        items: []
      },
      case_study: {
        name: "案例分析",
        description: "成功案例、失败教训、经验分享等",
        items: []
      },
      industry_news: {
        name: "行业资讯",
        description: "行业动态、竞争分析、新兴机会等",
        items: []
      }
    };

    // 填充分类
    allNews.forEach(news => {
      if (categories[news.category]) {
        categories[news.category].items.push(news.id);
      }
    });

    // 统计信息
    console.log('分类统计:');
    Object.entries(categories).forEach(([key, cat]) => {
      console.log(`  ${cat.name}: ${cat.items.length}条`);
    });

    // 平台统计
    const platformStats = {};
    allNews.forEach(news => {
      platformStats[news.platform] = (platformStats[news.platform] || 0) + 1;
    });

    console.log('\n平台统计(Top 10):');
    Object.entries(platformStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([platform, count]) => {
        console.log(`  ${platform}: ${count}条`);
      });

    // 构建最终数据
    const finalData = {
      news: allNews,
      categories: categories,
      lastUpdate: "2025-10-16",
      totalCount: allNews.length,
      year: 2025,
      metadata: {
        manuallyReviewed: existingData.totalCount,
        autoExtracted: newNews.length,
        totalNews: allNews.length,
        dateRange: {
          earliest: allNews[allNews.length - 1]?.date || '',
          latest: allNews[0]?.date || ''
        }
      }
    };

    // 保存合并后的数据
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
    console.log(`\n✅ 合并完成! 总共 ${finalData.totalCount} 条新闻`);
    console.log(`已保存到: ${outputPath}`);

  } catch (error) {
    console.error('合并失败:', error);
  }
}

main();
