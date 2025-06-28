import { AITool, Category } from '../types';

export class DataService {
  private aiToolsCache: AITool[] | null = null;
  private categoriesCache: Record<string, string[]> | null = null;

  // 加载AI工具数据
  async loadAITools(): Promise<AITool[]> {
    if (this.aiToolsCache) {
      return this.aiToolsCache;
    }

    try {
      const response = await fetch('/data/ai_tools_database.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.aiToolsCache = data.ai_tools || [];
      return this.aiToolsCache;
    } catch (error) {
      console.error('加载AI工具数据失败:', error);
      return [];
    }
  }

  // 加载工具分类数据
  async loadCategories(): Promise<Record<string, string[]>> {
    if (this.categoriesCache) {
      return this.categoriesCache;
    }

    try {
      const response = await fetch('/data/tool_categories.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.categoriesCache = data.categories || {};
      return this.categoriesCache;
    } catch (error) {
      console.error('加载分类数据失败:', error);
      return {};
    }
  }

  // 获取分类统计信息
  async getCategoryStats(): Promise<Category[]> {
    const [tools, categories] = await Promise.all([
      this.loadAITools(),
      this.loadCategories()
    ]);

    const categoryIcons: Record<string, string> = {
      'AI聊天机器人': '/images/categories/ai-chatbot.jpg',
      'AI搜索引擎': '/images/categories/search-engine.jpg',
      'AI虚拟社交': '/images/categories/ai-chatbot.jpg',
      'AI图像设计': '/images/categories/image-design.jpg',
      'AI视频制作': '/images/categories/video-editing.jpg',
      'AI智能抠图': '/images/categories/image-design.jpg',
    };

    const categoryDescriptions: Record<string, string> = {
      'AI聊天机器人': '智能对话助手，提供各种AI聊天和问答服务',
      'AI搜索引擎': '基于AI技术的新一代搜索工具',
      'AI虚拟社交': '虚拟角色聊天和社交互动应用',
      'AI图像设计': '图像生成、编辑和设计工具',
      'AI视频制作': '视频生成、编辑和特效处理工具',
      'AI智能抠图': '智能背景移除和图像处理工具',
    };

    return Object.entries(categories).map(([name, toolNames]) => ({
      id: name,
      name,
      description: categoryDescriptions[name] || '优质AI工具集合',
      icon: categoryIcons[name],
      count: toolNames.length,
      tools: toolNames,
    }));
  }

  // 根据分类获取工具
  async getToolsByCategory(categoryName: string): Promise<AITool[]> {
    const [tools, categories] = await Promise.all([
      this.loadAITools(),
      this.loadCategories()
    ]);

    const toolNames = categories[categoryName] || [];
    return tools.filter(tool => toolNames.includes(tool.name));
  }

  // 搜索工具
  async searchTools(query: string): Promise<AITool[]> {
    const tools = await this.loadAITools();
    const lowerQuery = query.toLowerCase();
    
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.category.toLowerCase().includes(lowerQuery)
    );
  }

  // 获取热门工具
  async getPopularTools(limit: number = 12): Promise<AITool[]> {
    const tools = await this.loadAITools();
    return tools
      .sort((a, b) => b.hot_score - a.hot_score)
      .slice(0, limit);
  }

  // 获取推荐工具
  async getFeaturedTools(limit: number = 8): Promise<AITool[]> {
    const tools = await this.loadAITools();
    // 根据热度和收藏数综合排序
    return tools
      .sort((a, b) => {
        const scoreA = a.hot_score + a.popularity.favorites * 10;
        const scoreB = b.hot_score + b.popularity.favorites * 10;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // 获取最新工具
  async getLatestTools(limit: number = 6): Promise<AITool[]> {
    const tools = await this.loadAITools();
    // 由于没有发布时间字段，我们按照数据中的顺序取前几个作为最新
    return tools.slice(0, limit);
  }
}

export const dataService = new DataService();
