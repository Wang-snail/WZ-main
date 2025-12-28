#!/bin/bash

# 蜗牛数据实验室 Activepieces 停止脚本

set -e

echo "🛑 停止蜗牛数据实验室 Activepieces 环境..."

# 检查 Docker Compose 文件是否存在
if [ ! -f "docker-compose.activepieces.yml" ]; then
    echo "❌ docker-compose.activepieces.yml 文件不存在"
    exit 1
fi

# 停止服务
echo "🔄 停止 Activepieces 服务..."
docker-compose -f docker-compose.activepieces.yml down

# 可选：清理数据卷（谨慎使用）
read -p "是否要清理数据卷？这将删除所有数据 (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  清理数据卷..."
    docker-compose -f docker-compose.activepieces.yml down -v
    docker volume prune -f
fi

echo "✅ Activepieces 环境已停止"