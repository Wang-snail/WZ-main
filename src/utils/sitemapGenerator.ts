// 站点地图生成器
import { dataService } from '../services/dataService';
import { URLStructureOptimizer } from './urlOptimizer';

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export class SitemapGenerator {
  // 生成站点地图
  static async generateSitemap(): Promise<SitemapEntry[]> {
    const entries: SitemapEntry[] = [];
    const now = new Date().toISOString();
    
    // 添加静态页面
    entries.push(
      {
        url: 'https://wsnail.com/',
        lastModified: now,
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: 'https://wsnail.com/ai-tools',
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: 'https://wsnail.com/divination',
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8
      },
      {
        url: 'https://wsnail.com/analyzer',
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8
      },
      {
        url: 'https://wsnail.com/games',
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7
      }
    );
    
    // 添加多语言页面
    const languages = ['en', 'ja', 'ko', 'es'];
    for (const lang of languages) {
      entries.push(
        {
          url: `https://wsnail.com/${lang}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.9
        },
        {
          url: `https://wsnail.com/${lang}/ai-tools`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8
        }
      );
    }
    
    try {
      // 添加工具页面
      const tools = await dataService.loadAITools();
      const categories = await dataService.loadCategories();
      
      // 添加分类页面
      Object.keys(categories).forEach(category => {
        entries.push({
          url: `https://wsnail.com/ai-tools?category=${encodeURIComponent(category)}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7
        });
        
        // 添加多语言分类页面
        languages.forEach(lang => {
          entries.push({
            url: `https://wsnail.com/${lang}/ai-tools?category=${encodeURIComponent(category)}`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.6
          });
        });
      });
      
      // 添加热门工具页面（前50个）
      const popularTools = await dataService.getPopularTools(50);
      popularTools.forEach(tool => {
        if (tool.name && tool.category) {
          const toolUrl = URLStructureOptimizer.generateToolPageURL(
            tool.name, 
            tool.category
          );
          
          entries.push({
            url: `https://wsnail.com${toolUrl}`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6
          });
          
          // 添加多语言工具页面
          languages.forEach(lang => {
            const localizedToolUrl = URLStructureOptimizer.generateToolPageURL(
              tool.name, 
              tool.category, 
              lang
            );
            
            entries.push({
              url: `https://wsnail.com${localizedToolUrl}`,
              lastModified: now,
              changeFrequency: 'monthly',
              priority: 0.5
            });
          });
        }
      });
    } catch (error) {
      console.error('Error generating sitemap entries:', error);
    }
    
    return entries;
  }
  
  // 生成XML格式的站点地图
  static async generateXMLSitemap(): Promise<string> {
    const entries = await this.generateSitemap();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    entries.forEach(entry => {
      xml += '  <url>\n';
      xml += `    <loc>${entry.url}</loc>\n`;
      xml += `    <lastmod>${entry.lastModified.split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>${entry.changeFrequency}</changefreq>\n`;
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    return xml;
  }
  
  // 生成站点地图索引
  static generateSitemapIndex(): string {
    const now = new Date().toISOString().split('T')[0];
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://wsnail.com/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
  }
}