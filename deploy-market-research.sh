#!/bin/bash

# AI市场调研系统 - Vercel自动部署脚本
# 使用你的Vercel配置信息自动化部署

echo "🚀 开始部署AI市场调研系统到Vercel..."

# 你的配置信息
GITHUB_REPO="Wang-snail/WZ-main"
GITHUB_TOKEN="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"
VERCEL_PROJECT_ID="prj_OXALain1SCUD0EJtGviaB4yHNZMz"
VERCEL_TOKEN="MzeyH2VWRFHGVv45XiI31ior"
SILICONFLOW_API_KEY="sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht"

# 检查是否安装了vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装Vercel CLI..."
    npm install -g vercel@latest
fi

echo "🔑 设置Vercel认证..."
export VERCEL_TOKEN=$VERCEL_TOKEN

echo "📝 配置环境变量..."
vercel env add SILICONFLOW_API_KEY "$SILICONFLOW_API_KEY" --scope production --token $VERCEL_TOKEN
vercel env add SILICONFLOW_API_URL "https://api.siliconflow.cn/v1" --scope production --token $VERCEL_TOKEN

echo "📤 部署到Vercel..."
vercel --prod --token $VERCEL_TOKEN --yes

echo "✅ 部署完成！"
echo ""
echo "🎯 你的AI市场调研系统已上线："
echo "   主页: https://wz-main-wang-snails-projects.vercel.app/"
echo "   市场调研: https://wz-main-wang-snails-projects.vercel.app/market-research"
echo ""
echo "📋 功能测试："
echo "   1. 访问市场调研页面"
echo "   2. 输入产品名称（如：智能宠物喂食器）"
echo "   3. 输入邮箱地址"
echo "   4. 点击开始分析"
echo "   5. 等待3-5分钟完成AI分析"
echo ""
echo "🛠️ 技术架构："
echo "   - 前端: Vercel Static Hosting"
echo "   - 后端: Vercel Serverless Functions"
echo "   - AI: SiliconFlow DeepSeek-V3"
echo "   - 部署: 完全自动化"
echo ""
echo "🎉 恭喜！系统部署成功！"