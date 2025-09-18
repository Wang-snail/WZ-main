# 网站配置管理文档

## 配置管理概述

本文档描述了 WSNAIL.COM 网站的配置管理系统，包括配置结构、安全措施和使用方法。

## 配置文件结构

### 主配置文件
**位置**: `src/utils/websiteConfig.ts`

```typescript
export interface WebsiteConfig {
  siteName: string;        // 网站名称
  domain: string;          // 网站域名
  githubRepo: string;      // GitHub仓库地址
  githubAPI: string;       // GitHub API Token (生产环境为空)
  vercelProjectId: string; // Vercel项目ID (生产环境为空)
  vercelKey: string;       // Vercel API Key (生产环境为空)
  localPath: string;       // 本地项目路径
}
```

### 默认配置
```typescript
export const defaultConfig: WebsiteConfig = {
  siteName: 'wsnail.com 网站',
  domain: 'wsnail.com',
  githubRepo: 'https://github.com/Wang-snail/WZ-main',
  githubAPI: '',           // 敏感信息已移除，仅在本地开发环境使用
  vercelProjectId: '',     // 敏感信息已移除，仅在本地开发环境使用
  vercelKey: '',           // 敏感信息已移除，仅在本地开发环境使用
  localPath: '/Users/bingzi/dm/claude Code/个人网站/WZ-main'
};
```

### 本地敏感配置
**位置**: `src/utils/websiteConfig.local.ts` (已加入 .gitignore)

```typescript
export const localConfig: WebsiteConfig = {
  siteName: 'wsnail.com 网站',
  domain: 'wsnail.com',
  githubRepo: 'https://github.com/Wang-snail/WZ-main',
  githubAPI: 'ghp_[REDACTED]',               // 实际的GitHub API Token
  vercelProjectId: 'prj_[REDACTED]',         // 实际的Vercel项目ID
  vercelKey: '[REDACTED]',                   // 实际的Vercel API Key
  localPath: '/Users/bingzi/dm/claude Code/个人网站/WZ-main'
};
```

## 配置管理器

### WebsiteConfigManager 类
提供完整的配置管理功能：

```typescript
export class WebsiteConfigManager {
  // 保存配置到本地存储
  static saveConfig(config: WebsiteConfig): void

  // 从本地存储加载配置
  static loadConfig(): WebsiteConfig

  // 导出配置为JSON字符串
  static exportConfig(): string

  // 从JSON字符串导入配置
  static importConfig(configJson: string): WebsiteConfig

  // 重置为默认配置
  static resetToDefault(): WebsiteConfig
}
```

### 配置加载逻辑
1. **优先级顺序**:
   - localStorage中的用户配置
   - 开发环境下的本地配置文件
   - 默认配置

2. **环境检测**:
   ```typescript
   if (import.meta.env.DEV) {
     // 开发环境：尝试加载本地配置
     import('./websiteConfig.local').then(({ localConfig }) => {
       this.saveConfig(localConfig);
     }).catch(() => {
       console.log('本地配置文件不存在，使用默认配置');
     });
   }
   ```

## 配置管理界面

### 访问地址
- **开发环境**: http://localhost:3000/website-config
- **生产环境**: 自动阻止访问

### 界面功能
1. **基本信息管理**
   - 网站名称
   - 域名
   - 本地路径

2. **GitHub配置**
   - 仓库地址管理
   - 快速访问链接

3. **配置操作**
   - 保存配置到本地存储
   - 导出配置为JSON文件
   - 导入配置文件
   - 重置为默认配置

4. **快速信息**
   - 网站在线地址
   - 本地开发地址
   - GitHub仓库链接
   - 本地项目路径

## 安全措施

### 环境隔离
1. **开发环境**:
   - 完整配置管理功能
   - 可以编辑所有配置项
   - 支持本地配置文件加载

2. **生产环境**:
   - 自动阻止配置页面访问
   - 显示访问限制提示
   - 敏感信息完全隔离

### 访问控制代码
```typescript
const isDevelopment = import.meta.env.DEV;

if (!isDevelopment) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">访问受限</h1>
        <p className="text-gray-600 mb-6">
          此配置管理页面仅在本地开发环境中可用，以保护敏感信息安全。
        </p>
      </div>
    </div>
  );
}
```

### Git 安全配置
**.gitignore 规则**:
```gitignore
# Website configuration with sensitive data
src/utils/websiteConfig.local.ts
```

## 使用指南

### 本地开发配置
1. **启动开发服务器**:
   ```bash
   npm run dev
   ```

2. **访问配置页面**:
   访问 http://localhost:3000/website-config

3. **配置网站信息**:
   - 设置网站名称和域名
   - 配置GitHub仓库地址
   - 设置本地项目路径

4. **保存配置**:
   点击"保存配置"按钮将设置保存到本地存储

### 配置备份和恢复
1. **导出配置**:
   - 点击"导出配置"按钮
   - 下载 `website-config.json` 文件

2. **导入配置**:
   - 点击"导入配置"按钮
   - 选择之前导出的JSON配置文件

3. **重置配置**:
   - 点击"重置为默认配置"按钮
   - 恢复到系统默认设置

## 最佳实践

### 配置管理
1. **定期备份配置**:
   使用导出功能定期备份配置设置

2. **环境配置分离**:
   开发环境和生产环境配置严格分离

3. **敏感信息保护**:
   - 绝不在代码中硬编码API密钥
   - 使用环境变量管理敏感配置
   - 确保 `.gitignore` 包含敏感配置文件

### 安全注意事项
1. **访问控制**:
   配置管理功能仅在开发环境可用

2. **代码审查**:
   确保敏感信息不会意外提交到代码仓库

3. **权限管理**:
   严格控制对配置文件的访问权限

## 故障排除

### 常见问题
1. **配置丢失**:
   - 检查本地存储是否被清除
   - 使用备份配置文件恢复

2. **生产环境访问配置页面**:
   - 这是预期行为，配置页面仅在开发环境可用
   - 需要在本地环境进行配置管理

3. **本地配置文件加载失败**:
   - 确认 `websiteConfig.local.ts` 文件存在
   - 检查文件格式是否正确

## 更新记录

- **2024-01**: 创建配置管理系统
- **2024-01**: 添加环境隔离和安全措施
- **2024-01**: 移除敏感信息显示功能

---

*本文档描述了完整的网站配置管理流程，确保配置安全和开发效率。*