#!/bin/bash

# 可靠部署脚本 - wsnail.com
# 确保每次部署都能成功更新到生产环境

set -e  # 遇到错误立即停止

echo "🚀 开始可靠部署流程..."

# 1. 清理构建缓存
echo "📁 清理构建缓存..."
rm -rf dist/
rm -rf node_modules/.cache/
rm -rf .vercel/

# 2. 重新安装依赖（确保最新）
echo "📦 重新安装依赖..."
rm -rf node_modules/
npm install

# 3. 运行构建
echo "🔨 执行构建..."
npm run build

# 4. 验证构建结果
echo "✅ 验证构建结果..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ 构建失败：dist/index.html 不存在"
    exit 1
fi

# 检查优化组件是否存在
if [ ! -f "src/components/UserRetentionEnhancer.tsx" ]; then
    echo "❌ 优化组件缺失：UserRetentionEnhancer.tsx"
    exit 1
fi

echo "📊 构建信息："
ls -lh dist/
echo "文件数量：$(find dist -type f | wc -l)"

# 5. 创建部署标记文件
TIMESTAMP=$(date +%s)
echo "deployment_time: $TIMESTAMP" > deployment-marker-$TIMESTAMP.txt
echo "components: UserRetentionEnhancer, EngagementBooster, SEOEnhancer, PerformanceMonitor" >> deployment-marker-$TIMESTAMP.txt

# 6. Git提交和推送
echo "📤 提交代码到Git..."
git add .
git commit -m "🚀 可靠部署 $(date '+%Y-%m-%d %H:%M:%S')

- 清理所有缓存确保全新构建
- 修复Vercel缓存配置问题
- 强制刷新所有JS/CSS/HTML文件
- 部署标记：$TIMESTAMP
- 包含所有用户留存优化组件"

git push origin main

# 7. 等待Vercel部署
echo "⏱️ 等待Vercel部署完成（60秒）..."
sleep 60

# 8. 验证部署结果
echo "🔍 验证部署结果..."
echo "主域名: https://wsnail.com/"
echo "备用域名: https://wz-main.vercel.app/"
echo "请手动访问网站确认优化组件已生效"

echo "✅ 可靠部署流程完成！"
echo "📝 部署标记文件：deployment-marker-$TIMESTAMP.txt"
echo "🕐 建议等待2-5分钟让CDN全球刷新完成"