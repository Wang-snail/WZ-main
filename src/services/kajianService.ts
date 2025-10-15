import { KajianLesson, KajianCategory } from '@/types';

const STORAGE_KEY = 'kajian_lessons_data';
const CUSTOM_LESSONS_KEY = 'kajian_custom_lessons';

interface KajianData {
  lessons: KajianLesson[];
  categories: KajianCategory[];
}

export class KajianService {
  /**
   * 加载所有经验数据（包括默认数据和用户添加的数据）
   */
  static async loadAllLessons(): Promise<KajianData> {
    try {
      // 加载默认数据
      const response = await fetch('/data/kajian_lessons.json');
      const defaultData: KajianData = await response.json();

      // 加载用户自定义数据
      const customLessons = this.getCustomLessons();

      // 合并数据
      const allLessons = [...defaultData.lessons, ...customLessons];

      // 更新分类计数
      const updatedCategories = this.updateCategoryCounts(defaultData.categories, allLessons);

      return {
        lessons: allLessons,
        categories: updatedCategories
      };
    } catch (error) {
      console.error('加载经验数据失败:', error);
      return { lessons: [], categories: [] };
    }
  }

  /**
   * 获取用户自定义的经验
   */
  static getCustomLessons(): KajianLesson[] {
    try {
      const stored = localStorage.getItem(CUSTOM_LESSONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('读取自定义经验失败:', error);
    }
    return [];
  }

  /**
   * 保存用户自定义经验
   */
  static saveCustomLessons(lessons: KajianLesson[]): void {
    try {
      localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(lessons));
    } catch (error) {
      console.error('保存自定义经验失败:', error);
      throw new Error('保存失败，请重试');
    }
  }

  /**
   * 添加新经验
   */
  static addLesson(lesson: Omit<KajianLesson, 'id' | 'createdAt' | 'updatedAt'>): KajianLesson {
    const customLessons = this.getCustomLessons();

    const newLesson: KajianLesson = {
      ...lesson,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customLessons.push(newLesson);
    this.saveCustomLessons(customLessons);

    return newLesson;
  }

  /**
   * 更新经验
   */
  static updateLesson(id: string, updates: Partial<KajianLesson>): KajianLesson | null {
    const customLessons = this.getCustomLessons();
    const index = customLessons.findIndex(l => l.id === id);

    if (index === -1) {
      return null;
    }

    customLessons[index] = {
      ...customLessons[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveCustomLessons(customLessons);
    return customLessons[index];
  }

  /**
   * 删除经验
   */
  static deleteLesson(id: string): boolean {
    const customLessons = this.getCustomLessons();
    const filtered = customLessons.filter(l => l.id !== id);

    if (filtered.length === customLessons.length) {
      return false; // 未找到要删除的项
    }

    this.saveCustomLessons(filtered);
    return true;
  }

  /**
   * 检查经验是否为自定义的（可编辑/删除）
   */
  static isCustomLesson(id: string): boolean {
    return id.startsWith('custom-');
  }

  /**
   * 更新分类计数
   */
  private static updateCategoryCounts(categories: KajianCategory[], lessons: KajianLesson[]): KajianCategory[] {
    return categories.map(cat => ({
      ...cat,
      count: lessons.filter(l => l.category === cat.id).length
    }));
  }

  /**
   * 生成示例数据（用于表单预填充）
   */
  static getExampleLesson(): Partial<KajianLesson> {
    return {
      title: '',
      category: 'other',
      tags: [],
      importance: 3,
      date: new Date().toISOString().split('T')[0],
      summary: '',
      background: '',
      process: '',
      result: '',
      lesson: '',
      keyPoints: [],
      financialData: {
        investment: 0,
        revenue: 0,
        profit: 0,
        roi: 0
      },
      relatedProducts: [],
      relatedLinks: []
    };
  }
}
