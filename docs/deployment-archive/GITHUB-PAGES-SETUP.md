# GitHub Pages 部署指南

## 📋 准备工作

已完成的配置：

1. ✅ **GitHub Actions 工作流** (`.github/workflows/deploy.yml`)
   - 自动构建和部署
   - 推送到 main 分支时触发
   - 也可手动触发

2. ✅ **Vite 配置** (`vite.config.ts`)
   - 设置了正确的 base 路径
   - 适配 GitHub Pages 环境

3. ✅ **自定义域名** (`public/CNAME`)
   - 配置域名: www.wsnail.com

4. ✅ **SPA 路由支持** (`public/404.html` + `index.html`)
   - 确保前端路由正常工作

## 🚀 部署步骤

### 步骤 1: 启用 GitHub Pages

1. 访问 GitHub 仓库设置:
   ```
   https://github.com/Wang-snail/WZ-main/settings/pages
   ```

2. 在 "Build and deployment" 部分:
   - **Source**: 选择 "GitHub Actions"
   - 不要选择 "Deploy from a branch"

3. 点击 Save 保存设置

### 步骤 2: 推送代码触发部署

```bash
# 查看当前更改
git status

# 添加所有文件
git add .

# 提交更改
git commit -m "🚀 配置 GitHub Pages 部署"

# 推送到 GitHub
git push origin main
```

### 步骤 3: 监控部署进度

1. 访问 Actions 页面:
   ```
   https://github.com/Wang-snail/WZ-main/actions
   ```

2. 查看 "Deploy to GitHub Pages" 工作流:
   - 🟡 黄色圆圈: 正在运行
   - ✅ 绿色勾号: 部署成功
   - ❌ 红色叉号: 部署失败（点击查看日志）

3. 部署通常需要 2-5 分钟

### 步骤 4: 配置自定义域名的 DNS

如果您使用自定义域名 (www.wsnail.com)，需要配置 DNS 记录:

#### 方法 1: CNAME 记录（推荐用于 www 子域名）

在您的域名提供商（如阿里云、腾讯云等）添加 CNAME 记录:

```
类型: CNAME
主机记录: www
记录值: wang-snail.github.io
TTL: 600（或默认值）
```

#### 方法 2: A 记录（用于顶级域名 wsnail.com）

如果要使用顶级域名，添加以下 A 记录:

```
类型: A
主机记录: @
记录值: 
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
```

同时添加 www 的 CNAME 记录指向顶级域名:

```
类型: CNAME
主机记录: www
记录值: wsnail.com
```

### 步骤 5: 在 GitHub 中验证域名

1. 返回 GitHub Pages 设置:
   ```
   https://github.com/Wang-snail/WZ-main/settings/pages
   ```

2. 在 "Custom domain" 部分:
   - 输入: `www.wsnail.com`
   - 点击 Save

3. 等待 DNS 检查:
   - ✅ 绿色勾号: DNS 配置正确
   - ⚠️ 警告: DNS 检查中或配置有问题

4. 启用 HTTPS:
   - 勾选 "Enforce HTTPS"
   - 等待证书颁发（可能需要几分钟）

## ✅ 验证部署

### 检查网站访问

1. **GitHub Pages 默认域名**:
   ```
   https://wang-snail.github.io/WZ-main/
   ```

2. **自定义域名**（DNS 配置后）:
   ```
   https://www.wsnail.com
   ```

### 测试功能

- [ ] 首页正常加载
- [ ] 浏览器控制台无错误
- [ ] 导航到 `/kajian-lessons` 页面正常
- [ ] 刷新页面路由不丢失（404.html 重定向生效）
- [ ] 所有静态资源（图片、CSS、JS）正常加载

### 检查构建日志

如果部署失败，检查 Actions 日志:

1. 访问 Actions 页面
2. 点击失败的工作流
3. 查看红色的步骤
4. 展开日志查看具体错误

常见错误:
- **依赖安装失败**: 检查 package.json
- **构建失败**: 检查 TypeScript 类型错误
- **权限问题**: 确认 GitHub Pages 已启用

## 🔄 后续部署

配置完成后，每次推送到 main 分支都会自动部署:

```bash
# 正常的开发流程
git add .
git commit -m "更新功能"
git push origin main

# GitHub Actions 会自动:
# 1. 检测到推送
# 2. 运行构建
# 3. 部署到 GitHub Pages
# 4. 2-5分钟后网站更新
```

### 手动触发部署

如果需要手动重新部署:

1. 访问 Actions 页面
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 "Run workflow"
4. 选择 "main" 分支
5. 点击 "Run workflow" 按钮

## 🆚 GitHub Pages vs Vercel 对比

| 特性 | GitHub Pages | Vercel |
|------|-------------|---------|
| 免费额度 | 无限制（公开仓库） | 100GB 带宽/月 |
| 部署速度 | 2-5 分钟 | 1-2 分钟 |
| 自定义域名 | ✅ 支持 | ✅ 支持 |
| HTTPS | ✅ 免费证书 | ✅ 免费证书 |
| 环境变量 | ❌ 不支持 | ✅ 支持 |
| 边缘网络 | ❌ GitHub CDN | ✅ 全球 CDN |
| 部署权限 | 仓库权限控制 | 团队权限控制 |
| 适用场景 | 静态网站、开源项目 | 商业项目、需要环境变量 |

## 📊 监控和分析

### GitHub Insights

查看部署历史和流量:
```
https://github.com/Wang-snail/WZ-main/graphs/traffic
```

### 添加 Google Analytics（可选）

在 `index.html` 中添加 GA 代码:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

## 🐛 故障排查

### 问题 1: 404 错误

**症状**: 访问任何路由都返回 404

**解决方案**:
1. 确认 `public/404.html` 和 `index.html` 中的重定向脚本已添加
2. 清除浏览器缓存
3. 检查 GitHub Pages 设置中的 Source 是否为 "GitHub Actions"

### 问题 2: 静态资源加载失败

**症状**: CSS/JS 文件 404

**解决方案**:
1. 检查 `vite.config.ts` 中的 `base` 设置
2. 如果使用默认域名，设置为 `/WZ-main/`
3. 如果使用自定义域名，设置为 `/`

### 问题 3: DNS 配置不生效

**症状**: 自定义域名无法访问

**解决方案**:
1. 使用 DNS 查询工具检查配置:
   ```bash
   nslookup www.wsnail.com
   ```
2. DNS 生效可能需要 10 分钟到 48 小时
3. 确认 CNAME 记录值为 `wang-snail.github.io`

### 问题 4: HTTPS 证书错误

**症状**: 浏览器显示不安全连接

**解决方案**:
1. 等待 GitHub 颁发证书（最多 24 小时）
2. 确保 DNS 配置正确
3. 在 GitHub Pages 设置中勾选 "Enforce HTTPS"

## 📞 获取帮助

如果遇到问题:

1. 查看 GitHub Actions 日志
2. 检查 GitHub Pages 文档: https://docs.github.com/en/pages
3. 查看 Vite 文档: https://vitejs.dev/guide/static-deploy.html#github-pages

---

**最后更新**: 2025-10-15
**状态**: 准备就绪，可以推送部署
