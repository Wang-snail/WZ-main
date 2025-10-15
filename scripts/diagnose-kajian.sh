#!/bin/bash

echo "========================================="
echo "卡吉安经验库诊断工具"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查本地文件
echo "📁 1. 检查本地文件..."
if [ -f "public/data/kajian_lessons.json" ]; then
    echo -e "${GREEN}✓${NC} public/data/kajian_lessons.json 存在"
    FILE_SIZE=$(ls -lh public/data/kajian_lessons.json | awk '{print $5}')
    echo "   文件大小: $FILE_SIZE"
else
    echo -e "${RED}✗${NC} public/data/kajian_lessons.json 不存在"
fi

if [ -f "dist/data/kajian_lessons.json" ]; then
    echo -e "${GREEN}✓${NC} dist/data/kajian_lessons.json 存在（构建产物）"
else
    echo -e "${YELLOW}⚠${NC} dist/data/kajian_lessons.json 不存在（需要运行 npm run build）"
fi

echo ""

# 2. 检查本地开发服务器
echo "🔌 2. 检查本地开发服务器..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/kajian-lessons 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 本地页面可访问 (http://localhost:3003/kajian-lessons)"
else
    echo -e "${RED}✗${NC} 本地页面无法访问 (状态码: $RESPONSE)"
    echo "   请确保开发服务器正在运行: npm run dev"
fi

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/data/kajian_lessons.json 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 本地数据文件可访问"
else
    echo -e "${RED}✗${NC} 本地数据文件无法访问 (状态码: $RESPONSE)"
fi

echo ""

# 3. 检查生产环境
echo "🌐 3. 检查生产环境..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://www.wsnail.com/kajian-lessons 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 生产页面可访问 (https://www.wsnail.com/kajian-lessons)"
else
    echo -e "${RED}✗${NC} 生产页面无法访问 (状态码: $RESPONSE)"
fi

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://www.wsnail.com/data/kajian_lessons.json 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 生产数据文件可访问"
else
    echo -e "${RED}✗${NC} 生产数据文件无法访问 (状态码: $RESPONSE)"
fi

echo ""

# 4. 检查 Vercel 部署状态
echo "☁️  4. 检查 Vercel 部署状态..."
if command -v vercel &> /dev/null; then
    echo "最近的生产部署："
    vercel ls --prod 2>/dev/null | head -5
else
    echo -e "${YELLOW}⚠${NC} Vercel CLI 未安装"
fi

echo ""

# 5. 检查源代码文件
echo "📝 5. 检查关键源代码文件..."
FILES=(
    "src/pages/KajianLessonsPage.tsx"
    "src/pages/KajianLessonDetailPage.tsx"
    "src/components/KajianLessonForm.tsx"
    "src/services/kajianService.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file"
    fi
done

echo ""

# 6. 测试数据文件内容
echo "📊 6. 测试数据文件内容..."
if [ -f "public/data/kajian_lessons.json" ]; then
    LESSON_COUNT=$(cat public/data/kajian_lessons.json | grep -o '"id"' | wc -l)
    echo "   找到 $LESSON_COUNT 条经验记录"

    # 验证 JSON 格式
    if python3 -m json.tool public/data/kajian_lessons.json > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} JSON 格式有效"
    else
        echo -e "${RED}✗${NC} JSON 格式无效"
    fi
fi

echo ""
echo "========================================="
echo "诊断完成"
echo "========================================="
echo ""
echo "💡 常见问题解决方案："
echo ""
echo "1. 如果本地可以访问但生产环境不行："
echo "   - 运行: npm run build"
echo "   - 运行: git add . && git commit -m '更新' && git push"
echo "   - 等待 Vercel 自动部署（2-3分钟）"
echo ""
echo "2. 如果数据文件无法访问："
echo "   - 确保 public/data/kajian_lessons.json 已提交到 Git"
echo "   - 检查 .gitignore 是否误排除了该文件"
echo ""
echo "3. 如果页面显示但数据加载失败："
echo "   - 打开浏览器控制台（F12）查看具体错误"
echo "   - 检查网络标签页看数据请求是否成功"
echo ""
