# WSNAIL.COM 网站信息文档

## 网站基本信息

### 网站标识
- **网站名称**: wsnail.com 网站
- **域名**: wsnail.com
- **在线地址**: https://wsnail.com
- **项目性质**: 个人网站 - AI工具集合平台

### 技术信息
- **GitHub仓库**: https://github.com/Wang-snail/WZ-main
- **部署平台**: Vercel
- **本地开发路径**: `/Users/bingzi/dm/claude Code/个人网站/WZ-main`
- **开发环境**: http://localhost:3000

## 项目配置

### 开发环境配置
```typescript
export const websiteConfig = {
  siteName: 'wsnail.com 网站',
  domain: 'wsnail.com',
  githubRepo: 'https://github.com/Wang-snail/WZ-main',
  localPath: '/Users/bingzi/dm/claude Code/个人网站/WZ-main'
}
```

### 技术栈
- **前端框架**: React 18.3.1 + TypeScript 5.6.2
- **构建工具**: Vite 6.0.1
- **样式框架**: Tailwind CSS v3.4.16
- **路由管理**: React Router Dom 6.30.1
- **动画效果**: Framer Motion
- **图标库**: Lucide React
- **分析工具**: Vercel Analytics + Speed Insights

## 功能模块

### 核心功能
1. **AI关系分析器** (`/analyzer`)
   - 智能情感分析
   - 关系建议生成
   - 核心用户留存功能

2. **AI工具库** (`/ai-tools`)
   - 多种实用AI工具
   - 工具分类管理
   - 使用统计分析

3. **工作流管理** (`/workflows`)
   - 自动化流程
   - 效率提升工具

4. **工具评测** (`/tool-reviews`)
   - AI工具评测
   - 使用体验分享

5. **AI占卜** (`/divination`)
   - 娱乐化AI占卜
   - 增加用户粘性

6. **销售追踪** (`/sales-tracking`)
   - 销售目标管理
   - 数据可视化

7. **AI游戏中心** (`/games`)
   - 互动AI游戏
   - 用户娱乐体验

### 管理功能
- **网站配置管理** (`/website-config`)
  - 仅本地开发环境可用
  - 基本信息配置
  - 安全信息隔离

## 安全配置

### 环境隔离
- **开发环境**: 完整功能访问
- **生产环境**: 敏感功能自动屏蔽
- **配置管理**: 仅在本地开发环境可用

### 敏感信息保护
- API密钥等敏感信息不在代码中硬编码
- 本地配置文件 (`websiteConfig.local.ts`) 已加入 `.gitignore`
- 生产环境通过环境变量管理敏感配置

## 部署配置

### Vercel 自动部署
- **触发条件**: 推送到 `main` 分支
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **Node.js版本**: 18.x

### 环境变量（生产环境）
```bash
# GitHub集成
VITE_GITHUB_API=your_github_token

# Vercel集成
VITE_VERCEL_PROJECT_ID=your_project_id
VITE_VERCEL_KEY=your_vercel_token
```

## 开发指南

### 本地开发启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问配置管理页面（仅开发环境）
# http://localhost:3000/website-config
```

### 构建和部署
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 运行测试
npm run test
```

## 性能监控

### 关键指标
- **页面加载时间**: 目标 < 3秒
- **Core Web Vitals**: 保持绿色指标
- **用户会话时长**: 目标 > 2分钟
- **跳出率**: 目标 < 60%

### 监控工具
- **Vercel Analytics**: 访问统计和用户行为
- **Speed Insights**: 性能监控和优化建议
- **Core Web Vitals**: 用户体验指标追踪

## 维护计划

### 日常维护任务
- [ ] 检查网站可用性和响应时间
- [ ] 监控错误日志和性能指标
- [ ] 更新内容和功能优化
- [ ] 用户反馈处理和功能迭代

### 定期更新
- [ ] 依赖包安全更新（月度）
- [ ] 功能特性更新（季度）
- [ ] 设计优化和用户体验改进（季度）
- [ ] SEO优化和内容更新（月度）

## 联系信息

- **项目维护者**: 王炳权
- **GitHub仓库**: https://github.com/Wang-snail/WZ-main
- **网站地址**: https://wsnail.com
- **本地配置**: `/Users/bingzi/dm/claude Code/个人网站/WZ-main`

## 文档更新记录

- **创建时间**: 2024年1月
- **最后更新**: 2024年1月
- **版本**: 1.0.0
- **维护频率**: 根据项目更新情况及时更新

---

*这个文档记录了WSNAIL.COM网站的核心信息和配置，用于项目维护和团队协作参考。*