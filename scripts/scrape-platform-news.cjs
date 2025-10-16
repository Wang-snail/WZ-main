/**
 * 抓取CIFNews平台情报页面的2025年所有文章
 */

const https = require('https');
const http = require('http');

// 简单的HTTP请求函数
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 提取文章列表
function extractArticles(html) {
  const articles = [];

  // 尝试提取文章标题和链接的正则表达式
  const titlePattern = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g;
  const datePattern = /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/g;

  let match;
  while ((match = titlePattern.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();

    // 检查是否是文章链接
    if (url.includes('/article/') || url.includes('/news/')) {
      articles.push({
        url: url.startsWith('http') ? url : `https://www.cifnews.com${url}`,
        title: title
      });
    }
  }

  return articles;
}

// 提取文章内容
function extractArticleContent(html) {
  try {
    // 提取文章标题
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';

    // 提取发布时间
    const dateMatch = html.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2}[\s\d:]*)/);
    const date = dateMatch ? dateMatch[1] : '';

    // 提取文章正文（尝试多种可能的容器）
    const contentPatterns = [
      /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>(.*?)<\/div>/s,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/s,
      /<article[^>]*>(.*?)<\/article>/s,
    ];

    let content = '';
    for (const pattern of contentPatterns) {
      const match = html.match(pattern);
      if (match) {
        content = match[1];
        break;
      }
    }

    // 清理HTML标签
    content = content
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title,
      date,
      content: content.substring(0, 2000) // 限制长度
    };
  } catch (error) {
    console.error('提取文章内容失败:', error.message);
    return null;
  }
}

async function main() {
  try {
    console.log('开始抓取平台情报...');

    // 抓取主页
    const mainUrl = 'https://www.cifnews.com/intelligence/platform?cid=14&origin=yggw_pc_home_gsqb';
    console.log(`正在访问: ${mainUrl}`);

    const mainHtml = await fetchPage(mainUrl);
    console.log(`主页HTML长度: ${mainHtml.length}`);

    // 提取文章列表
    const articles = extractArticles(mainHtml);
    console.log(`找到 ${articles.length} 篇文章`);

    // 只显示前5篇作为示例
    const results = [];
    for (let i = 0; i < Math.min(5, articles.length); i++) {
      const article = articles[i];
      console.log(`\n正在抓取第 ${i + 1} 篇: ${article.title}`);

      try {
        const articleHtml = await fetchPage(article.url);
        const content = extractArticleContent(articleHtml);

        if (content && content.content.length > 50) {
          results.push({
            ...article,
            ...content
          });
          console.log(`✓ 成功提取: ${content.title}`);
        }

        // 延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`✗ 失败: ${error.message}`);
      }
    }

    // 输出结果
    console.log('\n\n=== 抓取结果 ===\n');
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('抓取失败:', error);
  }
}

main();
