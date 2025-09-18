# Vercel 域名配置指南

## 目标
统一使用 `wsnail.com` 作为主域名，将 `www.wsnail.com` 重定向到 `wsnail.com`

## 当前状态
- 代码中所有地方都使用 `wsnail.com`
- Sitemap 和 robots.txt 都指向 `wsnail.com`
- 需要在 Vercel Dashboard 中配置域名重定向

## Vercel Dashboard 配置步骤

### 1. 登录 Vercel Dashboard
访问 https://vercel.com/dashboard

### 2. 进入项目设置
1. 选择 `WZ-main` 项目
2. 点击 **Settings** 标签页
3. 选择 **Domains** 选项

### 3. 配置主域名
1. 确保 `wsnail.com` 设置为主域名 (Primary Domain)
2. 如果 `www.wsnail.com` 存在，将其设置为重定向到 `wsnail.com`

### 4. 域名重定向设置
在域名列表中：
- ✅ `wsnail.com` → Primary Domain
- 🔄 `www.wsnail.com` → Redirect to `wsnail.com`

### 5. 验证配置
配置完成后，验证：
```bash
curl -I https://www.wsnail.com
# 应该返回 301/302 重定向到 https://wsnail.com

curl -I https://wsnail.com
# 应该返回 200 OK
```

## 预期效果

### 重定向行为
- `https://www.wsnail.com` → `https://wsnail.com` (301 永久重定向)
- `http://wsnail.com` → `https://wsnail.com` (301 永久重定向)
- `http://www.wsnail.com` → `https://wsnail.com` (301 永久重定向)

### SEO 好处
1. **统一权重**: 所有域名权重集中到 `wsnail.com`
2. **避免重复内容**: 防止搜索引擎将 www 和非 www 版本视为不同页面
3. **用户体验**: 统一的域名格式，减少混淆
4. **品牌一致性**: 所有地方都使用相同的域名格式

## 技术实现

### 代码中的域名引用
所有代码文件中的域名引用已统一为 `wsnail.com`：
- SEO meta 标签
- Canonical URLs
- Open Graph 数据
- 结构化数据
- Sitemap 生成
- Robots.txt 配置

### 自动化部署
当代码推送到 main 分支时，Vercel 自动：
1. 构建项目
2. 生成 sitemap.xml 和 robots.txt
3. 部署到 `wsnail.com`
4. 根据域名配置进行重定向

## 监控和验证

### 部署后检查
```bash
# 检查主域名状态
curl -I https://wsnail.com

# 检查重定向
curl -I https://www.wsnail.com

# 检查 sitemap
curl https://wsnail.com/sitemap.xml

# 检查 robots.txt
curl https://wsnail.com/robots.txt
```

### Google Search Console
1. 添加 `wsnail.com` 为主属性
2. 将 `www.wsnail.com` 设置为重定向验证
3. 提交新的 sitemap: `https://wsnail.com/sitemap.xml`

## 注意事项

1. **DNS 传播**: 域名配置更改可能需要几分钟到几小时生效
2. **缓存清理**: 可能需要清理 CDN 和浏览器缓存
3. **SSL 证书**: Vercel 自动为两个域名生成 SSL 证书
4. **Analytics**: 确保分析工具配置指向统一域名

---

**配置完成日期**: 2025-09-18
**负责人**: 王炳权
**项目**: wsnail.com 个人网站