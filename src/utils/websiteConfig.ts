export interface WebsiteConfig {
  siteName: string;
  domain: string;
  githubRepo: string;
  githubAPI: string;
  vercelProjectId: string;
  vercelKey: string;
  localPath: string;
}

export const defaultConfig: WebsiteConfig = {
  siteName: 'wsnail.com 网站',
  domain: 'wsnail.com',
  githubRepo: 'https://github.com/Wang-snail/WZ-main',
  githubAPI: '',  // 敏感信息已移除，仅在本地开发环境使用
  vercelProjectId: '',  // 敏感信息已移除，仅在本地开发环境使用
  vercelKey: '',  // 敏感信息已移除，仅在本地开发环境使用
  localPath: '/Users/bingzi/dm/claude Code/个人网站/WZ-main'
};

export class WebsiteConfigManager {
  private static readonly CONFIG_KEY = 'websiteConfig';

  static saveConfig(config: WebsiteConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('保存配置失败:', error);
      throw new Error('保存配置失败');
    }
  }

  static loadConfig(): WebsiteConfig {
    try {
      const saved = localStorage.getItem(this.CONFIG_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        return { ...defaultConfig, ...parsedConfig };
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }

    // 在开发环境中，尝试从环境变量加载配置
    if (import.meta.env.DEV) {
      try {
        const envConfig: Partial<WebsiteConfig> = {};
        if (import.meta.env.VITE_GITHUB_API) {
          envConfig.githubAPI = import.meta.env.VITE_GITHUB_API;
        }
        if (import.meta.env.VITE_VERCEL_PROJECT_ID) {
          envConfig.vercelProjectId = import.meta.env.VITE_VERCEL_PROJECT_ID;
        }
        if (import.meta.env.VITE_VERCEL_KEY) {
          envConfig.vercelKey = import.meta.env.VITE_VERCEL_KEY;
        }
        if (Object.keys(envConfig).length > 0) {
          const mergedConfig = { ...defaultConfig, ...envConfig };
          this.saveConfig(mergedConfig);
        }
      } catch (error) {
        console.log('无法加载环境变量配置，使用默认配置');
      }
    }

    return defaultConfig;
  }

  static exportConfig(): string {
    const config = this.loadConfig();
    return JSON.stringify(config, null, 2);
  }

  static importConfig(configJson: string): WebsiteConfig {
    try {
      const config = JSON.parse(configJson);
      this.saveConfig(config);
      return config;
    } catch (error) {
      throw new Error('导入配置失败: 无效的JSON格式');
    }
  }

  static resetToDefault(): WebsiteConfig {
    this.saveConfig(defaultConfig);
    return defaultConfig;
  }
}

export class GitHubAPI {
  private token: string;
  private repo: string;

  constructor(token: string, repo: string) {
    this.token = token;
    this.repo = repo.replace('https://github.com/', '');
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repo}`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('GitHub连接测试失败:', error);
      return false;
    }
  }

  async getRepoInfo() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repo}`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取仓库信息失败:', error);
      throw error;
    }
  }

  async getLatestCommit() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.repo}/commits/main`, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取最新提交失败:', error);
      throw error;
    }
  }
}

export class VercelAPI {
  private token: string;
  private projectId: string;

  constructor(token: string, projectId: string) {
    this.token = token;
    this.projectId = projectId;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`https://api.vercel.com/v9/projects/${this.projectId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Vercel连接测试失败:', error);
      return false;
    }
  }

  async getProjectInfo() {
    try {
      const response = await fetch(`https://api.vercel.com/v9/projects/${this.projectId}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Vercel API错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取项目信息失败:', error);
      throw error;
    }
  }

  async getDeployments() {
    try {
      const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${this.projectId}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Vercel API错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取部署列表失败:', error);
      throw error;
    }
  }

  async triggerDeploy() {
    try {
      const response = await fetch('https://api.vercel.com/v1/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: this.projectId,
          target: 'production'
        })
      });

      if (!response.ok) {
        throw new Error(`Vercel API错误: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('触发部署失败:', error);
      throw error;
    }
  }
}