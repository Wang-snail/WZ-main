# 🔧 故障排查指南

## 如何查看浏览器错误信息

### Chrome / Edge

1. 按 `F12` 打开开发者工具
2. 点击 **Console**（控制台）标签
3. 刷新页面 (`Ctrl/Cmd + R`)
4. 查看红色错误信息

### Firefox

1. 按 `F12` 打开开发者工具
2. 点击 **控制台** 标签
3. 刷新页面
4. 查看错误信息

### Safari

1. 按 `Cmd + Option + C` 打开控制台
2. 刷新页面
3. 查看错误信息

---

## 常见错误及解决方案

### 错误 1：404 Not Found - /data/kajian_lessons.json

**原因**：数据文件未部署到生产环境

**解决方案**：
```bash
# 1. 确认文件存在
ls public/data/kajian_lessons.json

# 2. 检查是否在 git 中
git ls-files | grep kajian_lessons

# 3. 如果不在，添加并推送
git add public/data/kajian_lessons.json
git commit -m "添加数据文件"
git push origin main
```

### 错误 2：Failed to fetch / Network Error

**原因**：网络问题或 CORS 限制

**解决方案**：
1. 检查网络连接
2. 清除浏览器缓存（Ctrl + Shift + Delete）
3. 使用无痕模式测试
4. 检查防火墙/代理设置

### 错误 3：Unexpected token < in JSON

**原因**：返回的是 HTML 而不是 JSON（通常是 404 页面）

**解决方案**：
```bash
# 测试数据文件是否可访问
curl https://www.wsnail.com/data/kajian_lessons.json

# 如果返回 HTML，说明文件缺失
# 重新部署
npm run build
git push origin main
```

### 错误 4：TypeError: Cannot read property 'map' of undefined

**原因**：数据加载失败，组件尝试渲染未定义的数据

**解决方案**：
1. 检查数据文件格式是否正确
2. 确认网络请求成功
3. 查看 Network 标签中的请求详情

### 错误 5：页面空白

**可能原因**：
- JavaScript 加载失败
- 路由配置错误
- React 渲染错误

**解决方案**：
1. 打开控制台查看具体错误
2. 检查 Network 标签，确认所有资源加载成功
3. 清除缓存并强制刷新（Ctrl + Shift + R）

---

## 诊断工具

### 运行自动诊断

```bash
./scripts/diagnose-kajian.sh
```

这将检查：
- ✅ 本地文件
- ✅ 开发服务器
- ✅ 生产环境
- ✅ 数据文件格式

### 手动检查清单

- [ ] 本地开发服务器运行正常（`npm run dev`）
- [ ] 本地可以访问 `/kajian-lessons`
- [ ] 构建成功（`npm run build`）
- [ ] 数据文件存在于 `public/data/`
- [ ] 数据文件已提交到 Git
- [ ] 最新代码已推送到 GitHub
- [ ] Vercel 部署成功（绿色勾号）
- [ ] 域名指向最新部署
- [ ] 浏览器缓存已清除

---

## 网络请求调试

### 检查数据文件请求

1. 打开浏览器开发者工具（F12）
2. 切换到 **Network**（网络）标签
3. 刷新页面
4. 找到 `kajian_lessons.json` 请求
5. 查看：
   - Status：应该是 200
   - Response：应该是 JSON 格式的数据
   - Headers：检查 Content-Type

### 预期的正确响应

**Status**: `200 OK`

**Response Headers**:
```
Content-Type: application/json
Status: 200
```

**Response Body**:
```json
{
  "lessons": [...],
  "categories": [...]
}
```

---

## Vercel 部署问题

### 检查部署状态

```bash
# 查看最近的部署
vercel ls --prod

# 查看部署详情
vercel inspect https://www.wsnail.com

# 查看构建日志
vercel logs <deployment-url>
```

### 重新部署

```bash
# 方法 1：通过 Git
echo "# $(date)" >> .vercel-redeploy
git add .vercel-redeploy
git commit -m "触发重新部署"
git push origin main

# 方法 2：手动触发（需要权限）
vercel --prod --yes

# 方法 3：强制更新域名别名
LATEST=$(vercel ls --prod | grep -oP 'https://[^ ]+\.vercel\.app' | head -1)
vercel alias set $LATEST wsnail.com
vercel alias set $LATEST www.wsnail.com
```

---

## 本地测试

### 完整测试流程

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 在浏览器中访问
open http://localhost:3003/kajian-lessons

# 4. 测试功能
# - 列表页面是否显示
# - 数据是否加载
# - 添加按钮是否工作
# - 详情页面是否正常

# 5. 构建测试
npm run build
npm run preview

# 6. 访问构建产物
open http://localhost:4173/kajian-lessons
```

---

## 数据文件问题

### 验证 JSON 格式

```bash
# 方法 1：使用 Python
python3 -m json.tool public/data/kajian_lessons.json

# 方法 2：使用 Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync('public/data/kajian_lessons.json')))"

# 方法 3：在线工具
# 复制文件内容到 https://jsonlint.com/
```

### 检查文件权限

```bash
ls -l public/data/kajian_lessons.json

# 应该输出类似：
# -rw-r--r--  1 user  staff  8.9K Oct 15 12:42 public/data/kajian_lessons.json
```

---

## 浏览器缓存问题

### 清除缓存的方法

1. **强制刷新**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **清除所有缓存**
   - Chrome: `Ctrl + Shift + Delete`
   - 选择"缓存的图片和文件"
   - 点击"清除数据"

3. **使用无痕模式**
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`

4. **禁用缓存（开发时）**
   - 打开开发者工具（F12）
   - 在 Network 标签中
   - 勾选"Disable cache"

---

## 联系支持

如果以上方法都无法解决问题：

1. **收集信息**：
   - 浏览器版本
   - 操作系统
   - 完整的错误信息
   - Network 标签的截图
   - Console 的错误日志

2. **运行诊断**：
   ```bash
   ./scripts/diagnose-kajian.sh > diagnosis.txt
   ```

3. **提供信息**：
   - 诊断结果（diagnosis.txt）
   - 浏览器控制台截图
   - 具体的错误描述

---

## 快速参考

### 常用命令

```bash
# 本地开发
npm run dev

# 构建项目
npm run build

# 部署
git push origin main

# 诊断
./scripts/diagnose-kajian.sh

# 查看 Vercel 状态
vercel ls --prod
vercel inspect https://www.wsnail.com
```

### 关键文件路径

```
public/data/kajian_lessons.json     # 数据文件
src/pages/KajianLessonsPage.tsx     # 列表页面
src/pages/KajianLessonDetailPage.tsx # 详情页面
src/components/KajianLessonForm.tsx  # 表单组件
src/services/kajianService.ts        # 数据服务
```

### 关键 URL

```
本地开发：http://localhost:3003/kajian-lessons
生产环境：https://www.wsnail.com/kajian-lessons
数据文件：https://www.wsnail.com/data/kajian_lessons.json
```

---

**最后更新**：2025-10-15
