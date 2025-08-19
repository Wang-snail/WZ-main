import axios from 'axios';
import * as cheerio from 'cheerio';

// 工具类别接口
export interface ToolCategory {
  id: string;
  name: string;
  count: number;
  tools: Tool[];
}

// 工具接口
export interface Tool {
  id: string;
  name: string;
  url: string;
  description: string;
  favicon: string;
  category: string;
}

// 爬取工具猫网站数据
export class ToolCrawler {
  private baseUrl = 'https://www.toolmao.com';
  
  // 获取所有分类
  async getCategories(): Promise<ToolCategory[]> {
    try {
      const response = await axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);
      
      const categories: ToolCategory[] = [];
      
      // 查找所有分类链接
      $('a[href*="#term-"]').each((index, element) => {
        const href = $(element).attr('href');
        const name = $(element).find('span').text().trim();
        
        if (href && name) {
          const categoryId = href.replace('#', '');
          categories.push({
            id: categoryId,
            name: name,
            count: 0, // 初始计数为0
            tools: []
          });
        }
      });
      
      // 为每个分类获取工具数据
      for (const category of categories) {
        const tools = await this.getToolsByCategory(category.id);
        category.tools = tools;
        category.count = tools.length;
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
  
  // 根据分类ID获取工具
  async getToolsByCategory(categoryId: string): Promise<Tool[]> {
    try {
      const response = await axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);
      
      const tools: Tool[] = [];
      
      // 查找属于该分类的工具
      $(`#${categoryId}`).find('.url-card').each((index, element) => {
        const $card = $(element);
        const $link = $card.find('a.card');
        const $title = $card.find('strong');
        const $desc = $card.find('p');
        const $img = $card.find('img');
        
        const tool: Tool = {
          id: $link.attr('data-id') || `tool-${Date.now()}-${index}`,
          name: $title.text().trim(),
          url: $link.attr('href') || '',
          description: $desc.text().trim(),
          favicon: $img.attr('src') || '',
          category: categoryId
        };
        
        // 安全检查，确保工具名称和URL存在
        if (tool.name && tool.url) {
          tools.push(tool);
        }
      });
      
      return tools;
    } catch (error) {
      console.error(`Error fetching tools for category ${categoryId}:`, error);
      return [];
    }
  }
  
  // 获取所有工具数据
  async getAllTools(): Promise<ToolCategory[]> {
    console.log('开始抓取工具猫网站数据...');
    
    const categories = await this.getCategories();
    
    console.log(`共获取到 ${categories.length} 个分类`);
    
    // 统计总工具数
    const totalTools = categories.reduce((sum, category) => sum + category.count, 0);
    console.log(`共获取到 ${totalTools} 个工具`);
    
    return categories;
  }
  
  // 按分类统计工具数量
  async getCategoryStats(): Promise<{ name: string; count: number }[]> {
    const categories = await this.getAllTools();
    
    return categories.map(category => ({
      name: category.name,
      count: category.count
    }));
  }
  
  // 获取热门工具（按分类工具数量排序）
  async getPopularTools(limit: number = 10): Promise<ToolCategory[]> {
    const categories = await this.getAllTools();
    
    // 按工具数量排序
    categories.sort((a, b) => b.count - a.count);
    
    return categories.slice(0, limit);
  }
}

// 创建爬虫实例
export const toolCrawler = new ToolCrawler();

// 安全检查环境再执行示例代码
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.argv) {
  // 只在 Node.js 环境中运行示例代码
  if (process.argv && process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
    // 如果直接运行此文件
    toolCrawler.getAllTools().then(categories => {
      console.log('工具分类统计:');
      categories.forEach(category => {
        console.log(`- ${category.name}: ${category.count} 个工具`);
      });
      
      // 输出总统计
      const totalCategories = categories.length;
      const totalTools = categories.reduce((sum, category) => sum + category.count, 0);
      console.log(`\n总计: ${totalCategories} 个分类, ${totalTools} 个工具`);
    });
  }
}