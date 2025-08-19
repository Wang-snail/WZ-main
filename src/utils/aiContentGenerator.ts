// AI内容生成工具
import { AITool } from '../types';

interface AIContentConfig {
  tools: AITool[];
  language: string;
}

interface GeneratedContent {
  title: string;
  description: string;
  keywords: string;
  content: string;
  tags: string[];
}

export class AIContentGenerator {
  // 生成工具页面内容
  static async generateToolPageContent(config: AIContentConfig): Promise<GeneratedContent> {
    const { tools, language } = config;
    
    // 生成标题
    const title = this.generateTitle(tools, language);
    
    // 生成描述
    const description = this.generateDescription(tools, language);
    
    // 生成关键词
    const keywords = this.generateKeywords(tools, language);
    
    // 生成内容
    const content = this.generateContent(tools, language);
    
    // 生成标签
    const tags = this.generateTags(tools, language);
    
    return {
      title,
      description,
      keywords,
      content,
      tags
    };
  }
  
  // 生成标题
  private static generateTitle(tools: AITool[], language: string): string {
    const toolNames = tools.slice(0, 3).map(tool => tool.name).join(', ');
    const count = tools.length;
    
    if (language === 'en') {
      return `${count}+ AI Tools Including ${toolNames} | WSNAIL.COM`;
    } else {
      return `${count}+精选AI工具包含${toolNames} | WSNAIL.COM`;
    }
  }
  
  // 生成描述
  private static generateDescription(tools: AITool[], language: string): string {
    const categories = [...new Set(tools.map(tool => tool.category))].slice(0, 5);
    const categoryText = categories.join(language === 'en' ? ', ' : '、');
    
    if (language === 'en') {
      return `Discover ${tools.length}+ premium AI tools in categories including ${categoryText}. Free AI tool recommendations and services from WSNAIL.COM.`;
    } else {
      return `精选${tools.length}+优质AI工具，包含${categoryText}等分类。免费AI工具推荐和服务，来自WSNAIL.COM。`;
    }
  }
  
  // 生成关键词
  private static generateKeywords(tools: AITool[], language: string): string {
    const allKeywords = [
      ...tools.map(tool => tool.name),
      ...tools.map(tool => tool.category),
      ...tools.flatMap(tool => tool.tags || [])
    ];
    
    // 去重并取前20个关键词
    const uniqueKeywords = [...new Set(allKeywords)].slice(0, 20);
    
    if (language === 'en') {
      return `AI tools, ${uniqueKeywords.join(', ')}, WSNAIL`;
    } else {
      return `AI工具, ${uniqueKeywords.join(', ')}, WSNAIL`;
    }
  }
  
  // 生成内容
  private static generateContent(tools: AITool[], language: string): string {
    const featuredTools = tools.filter(tool => tool.hot_score > 80).slice(0, 5);
    const popularTools = [...tools].sort((a, b) => 
      (b.popularity?.views || 0) - (a.popularity?.views || 0)
    ).slice(0, 5);
    
    if (language === 'en') {
      return `
        <p>Discover the best AI tools curated by WSNAIL.COM. Our collection includes ${tools.length}+ premium AI tools across various categories.</p>
        
        <h2>Featured Tools</h2>
        <p>Our featured tools include: ${featuredTools.map(tool => tool.name).join(', ')}.</p>
        
        <h2>Most Popular Tools</h2>
        <p>The most popular tools in our collection are: ${popularTools.map(tool => tool.name).join(', ')}.</p>
        
        <h2>Tool Categories</h2>
        <p>We organize our tools into clear categories to help you find exactly what you need.</p>
      `;
    } else {
      return `
        <p>发现WSNAIL.COM精心策划的最佳AI工具。我们的收藏包含${tools.length}+个优质AI工具，涵盖各个分类。</p>
        
        <h2>精选工具</h2>
        <p>我们的精选工具包括：${featuredTools.map(tool => tool.name).join('、')}。</p>
        
        <h2>热门工具</h2>
        <p>收藏中最热门的工具是：${popularTools.map(tool => tool.name).join('、')}。</p>
        
        <h2>工具分类</h2>
        <p>我们将工具按清晰的分类组织，帮助您找到所需的确切工具。</p>
      `;
    }
  }
  
  // 生成标签
  private static generateTags(tools: AITool[], language: string): string[] {
    const categories = [...new Set(tools.map(tool => tool.category))];
    const tags = [...new Set(tools.flatMap(tool => tool.tags || []))];
    
    if (language === 'en') {
      return [...categories, ...tags].slice(0, 20);
    } else {
      return [...categories, ...tags].slice(0, 20);
    }
  }
  
  // 生成分类页面内容
  static async generateCategoryPageContent(category: string, tools: AITool[], language: string): Promise<GeneratedContent> {
    const count = tools.length;
    
    if (language === 'en') {
      return {
        title: `${count}+ ${category} AI Tools | WSNAIL.COM`,
        description: `Explore ${count}+ premium ${category} AI tools curated by WSNAIL.COM. Find the best tools for your needs.`,
        keywords: `${category} AI tools, ${category}, AI, WSNAIL`,
        content: `<p>Discover ${count}+ premium ${category} AI tools in our curated collection.</p>`,
        tags: [category, 'AI tools']
      };
    } else {
      return {
        title: `${count}+ ${category} AI工具 | WSNAIL.COM`,
        description: `探索WSNAIL.COM精心策划的${count}+个优质${category} AI工具。找到满足您需求的最佳工具。`,
        keywords: `${category} AI工具, ${category}, AI, WSNAIL`,
        content: `<p>在我们精心策划的收藏中发现${count}+个优质${category} AI工具。</p>`,
        tags: [category, 'AI工具']
      };
    }
  }
}