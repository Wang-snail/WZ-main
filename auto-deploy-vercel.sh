#!/bin/bash

# 使用Vercel API自动化部署脚本
echo "🚀 自动化Vercel部署脚本启动..."

# 你的配置信息
VERCEL_TOKEN="MzeyH2VWRFHGVv45XiI31ior"
PROJECT_ID="prj_OXALain1SCUD0EJtGviaB4yHNZMz"
SILICONFLOW_API_KEY="sk-hwbvirmjuviwfyqbjqpmlebxetsdechtbyxmflziefipkbht"

echo "📝 步骤1: 配置环境变量..."

# 添加第一个环境变量
echo "添加 SILICONFLOW_API_KEY..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "SILICONFLOW_API_KEY",
    "value": "'$SILICONFLOW_API_KEY'",
    "type": "encrypted",
    "target": ["production"]
  }' | jq .

echo ""
echo "添加 SILICONFLOW_API_URL..."
curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "SILICONFLOW_API_URL",
    "value": "https://api.siliconflow.cn/v1",
    "type": "encrypted",
    "target": ["production"]
  }' | jq .

echo ""
echo "📤 步骤2: 触发新部署..."

# 触发部署
DEPLOY_RESPONSE=$(curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "wz-main",
    "projectSettings": {
      "framework": null
    },
    "gitSource": {
      "type": "github",
      "ref": "main",
      "repoId": "Wang-snail/WZ-main"
    }
  }')

echo $DEPLOY_RESPONSE | jq .

# 获取部署URL
DEPLOY_URL=$(echo $DEPLOY_RESPONSE | jq -r '.url // empty')

if [ ! -z "$DEPLOY_URL" ]; then
    echo ""
    echo "✅ 部署已启动!"
    echo "🌐 部署URL: https://$DEPLOY_URL"
    echo "🎯 市场调研系统: https://$DEPLOY_URL/market-research"
    echo ""
    echo "⏱️  请等待5-10分钟完成部署..."
    echo "📋 可以访问 https://vercel.com/dashboard 查看部署进度"
else
    echo "❌ 部署启动失败，请检查配置"
    echo $DEPLOY_RESPONSE | jq .
fi