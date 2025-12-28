#!/bin/bash

# 蜗牛数据实验室 Activepieces 启动脚本

set -e

echo "🚀 启动蜗牛数据实验室 Activepieces 环境..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 Docker Compose 文件是否存在
if [ ! -f "docker-compose.activepieces.yml" ]; then
    echo "❌ docker-compose.activepieces.yml 文件不存在"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p activepieces-bridge/logs
mkdir -p activepieces-pieces

# 复制环境变量文件
if [ ! -f "activepieces-bridge/.env" ]; then
    echo "📋 复制环境变量配置文件..."
    cp activepieces-bridge/.env.example activepieces-bridge/.env
    echo "⚠️  请编辑 activepieces-bridge/.env 文件配置必要的环境变量"
fi

# 拉取最新镜像
echo "📦 拉取最新的 Docker 镜像..."
docker-compose -f docker-compose.activepieces.yml pull

# 构建桥接服务
echo "🔨 构建桥接服务..."
cd activepieces-bridge
npm install
npm run build
cd ..

# 启动服务
echo "🚀 启动 Activepieces 服务..."
docker-compose -f docker-compose.activepieces.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.activepieces.yml ps

# 显示访问信息
echo ""
echo "✅ Activepieces 环境启动成功！"
echo ""
echo "📡 服务访问地址:"
echo "   - Activepieces UI: http://localhost:3000"
echo "   - 桥接服务 API: http://localhost:4000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "🔧 管理命令:"
echo "   - 查看日志: docker-compose -f docker-compose.activepieces.yml logs -f"
echo "   - 停止服务: docker-compose -f docker-compose.activepieces.yml down"
echo "   - 重启服务: docker-compose -f docker-compose.activepieces.yml restart"
echo ""
echo "📚 更多信息请查看 README.md"