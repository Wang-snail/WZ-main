#!/bin/bash

# AI市场调研系统 - 完整功能测试脚本
echo "🧪 AI市场调研系统 - 完整功能测试"
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试状态
TESTS_PASSED=0
TESTS_FAILED=0

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
echo "📋 测试清单："
echo "1. 开发环境检查"
echo "2. 文件结构验证" 
echo "3. SiliconFlow API测试"
echo "4. 前端页面访问测试"
echo "5. 配置文件检查"
echo ""

# 测试1: 开发环境检查
echo "🔍 测试1: 开发环境检查"
echo "--------------------------------------------------"

# 检查Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_info "Node.js版本: $NODE_VERSION"
    print_status 0 "Node.js已安装"
else
    print_status 1 "Node.js未安装"
fi

# 检查Vite开发服务器
if pgrep -f "vite" > /dev/null; then
    print_status 0 "Vite开发服务器正在运行"
    print_info "服务地址: http://localhost:3000"
else
    print_status 1 "Vite开发服务器未运行"
    print_warning "请先运行: npm run dev"
fi

echo ""

# 测试2: 文件结构验证
echo "🗂️  测试2: 文件结构验证"
echo "--------------------------------------------------"

# 检查关键文件
files=(
    "api/market-research.js"
    "public/market-research.html"
    "vercel.json"
    "package.json"
)

for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        print_status 0 "文件存在: $file"
    else
        print_status 1 "文件缺失: $file"
    fi
done

echo ""

# 测试3: SiliconFlow API测试
echo "🤖 测试3: SiliconFlow API连接测试"
echo "--------------------------------------------------"

if [[ -f "test-api.mjs" ]]; then
    print_info "执行SiliconFlow API测试..."
    if timeout 30s node test-api.mjs > /dev/null 2>&1; then
        print_status 0 "SiliconFlow API连接正常"
    else
        print_status 1 "SiliconFlow API连接失败"
        print_warning "请检查网络连接和API密钥"
    fi
else
    print_status 1 "API测试文件不存在"
fi

echo ""

# 测试4: 前端页面访问测试
echo "🌐 测试4: 前端页面访问测试"
echo "--------------------------------------------------"

# 检查localhost:3000是否可访问
if curl -s -f -o /dev/null "http://localhost:3000/public/market-research.html"; then
    print_status 0 "前端页面可访问"
    print_info "页面地址: http://localhost:3000/public/market-research.html"
else
    print_status 1 "前端页面无法访问"
    print_warning "请确保Vite服务器正在运行"
fi

echo ""

# 测试5: 配置文件检查
echo "⚙️  测试5: 配置文件检查"
echo "--------------------------------------------------"

# 检查Vercel配置
if grep -q "api/market-research.js" vercel.json 2>/dev/null; then
    print_status 0 "Vercel API路由配置正确"
else
    print_status 1 "Vercel API路由配置缺失"
fi

if grep -q "market-research.html" vercel.json 2>/dev/null; then
    print_status 0 "Vercel页面重写配置正确"
else
    print_status 1 "Vercel页面重写配置缺失"
fi

echo ""
echo "📊 测试汇总"
echo "=================================================="
echo -e "✅ 通过测试: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ 失败测试: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！系统准备就绪！${NC}"
    echo ""
    echo "🚀 下一步操作："
    echo "1. 访问前端页面: http://localhost:3000/public/market-research.html"
    echo "2. 输入测试数据进行功能验证"
    echo "3. 完成Vercel部署上线"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  发现 $TESTS_FAILED 个问题，请检查并修复${NC}"
    echo ""
    exit 1
fi