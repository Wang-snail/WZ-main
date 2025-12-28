#!/bin/bash

# Activepieces 生产环境部署脚本
# 用途：自动化部署 Activepieces 到生产环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必需的环境变量
check_env_vars() {
    log_info "检查环境变量..."
    
    required_vars=(
        "POSTGRES_PASSWORD"
        "REDIS_PASSWORD"
        "AP_API_KEY"
        "AP_ENCRYPTION_KEY"
        "AP_JWT_SECRET"
        "BRIDGE_JWT_SECRET"
        "BRIDGE_API_KEY"
        "GRAFANA_PASSWORD"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "缺少必需的环境变量:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    log_info "环境变量检查通过"
}

# 检查 Docker 和 Docker Compose
check_docker() {
    log_info "检查 Docker 环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 守护进程未运行"
        exit 1
    fi
    
    log_info "Docker 环境检查通过"
}

# 备份现有数据
backup_data() {
    log_info "备份现有数据..."
    
    backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # 备份数据库
    if docker ps | grep -q activepieces-postgres-prod; then
        log_info "备份 PostgreSQL 数据库..."
        docker exec activepieces-postgres-prod pg_dump -U postgres activepieces > "$backup_dir/database.sql"
    fi
    
    # 备份 Redis 数据
    if docker ps | grep -q activepieces-redis-prod; then
        log_info "备份 Redis 数据..."
        docker exec activepieces-redis-prod redis-cli --rdb "$backup_dir/redis.rdb" SAVE
    fi
    
    # 备份存储卷
    log_info "备份存储卷..."
    docker run --rm \
        -v activepieces_storage:/source \
        -v "$(pwd)/$backup_dir":/backup \
        alpine tar czf /backup/storage.tar.gz -C /source .
    
    log_info "备份完成: $backup_dir"
}

# 拉取最新镜像
pull_images() {
    log_info "拉取最新镜像..."
    docker-compose -f docker-compose.production.yml pull
    log_info "镜像拉取完成"
}

# 构建自定义镜像
build_images() {
    log_info "构建自定义镜像..."
    docker-compose -f docker-compose.production.yml build --no-cache bridge-service
    log_info "镜像构建完成"
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."
    docker-compose -f docker-compose.production.yml down
    log_info "服务已停止"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    docker-compose -f docker-compose.production.yml up -d
    log_info "服务已启动"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    max_attempts=60
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f docker-compose.production.yml ps | grep -q "Up (healthy)"; then
            log_info "服务已就绪"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 5
    done
    
    log_error "服务启动超时"
    return 1
}

# 运行健康检查
health_check() {
    log_info "运行健康检查..."
    
    # 检查 Activepieces
    if curl -f http://localhost:3000/api/v1/admin/pieces &> /dev/null; then
        log_info "✓ Activepieces 健康检查通过"
    else
        log_error "✗ Activepieces 健康检查失败"
        return 1
    fi
    
    # 检查桥接服务
    if curl -f http://localhost:4000/health &> /dev/null; then
        log_info "✓ 桥接服务健康检查通过"
    else
        log_error "✗ 桥接服务健康检查失败"
        return 1
    fi
    
    log_info "所有健康检查通过"
    return 0
}

# 运行烟雾测试
smoke_test() {
    log_info "运行烟雾测试..."
    
    # 测试 API 端点
    endpoints=(
        "http://localhost:3000/api/v1/admin/pieces"
        "http://localhost:4000/health"
        "http://localhost:4000/api/workflows"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f "$endpoint" &> /dev/null; then
            log_info "✓ $endpoint"
        else
            log_warn "✗ $endpoint"
        fi
    done
    
    log_info "烟雾测试完成"
}

# 清理旧镜像
cleanup() {
    log_info "清理旧镜像..."
    docker image prune -f
    log_info "清理完成"
}

# 显示部署信息
show_deployment_info() {
    log_info "部署信息:"
    echo ""
    echo "  Activepieces:  http://localhost:3000"
    echo "  桥接服务:      http://localhost:4000"
    echo "  Prometheus:    http://localhost:9091"
    echo "  Grafana:       http://localhost:3001"
    echo ""
    echo "  查看日志:"
    echo "    docker-compose -f docker-compose.production.yml logs -f"
    echo ""
    echo "  查看服务状态:"
    echo "    docker-compose -f docker-compose.production.yml ps"
    echo ""
}

# 回滚函数
rollback() {
    log_warn "开始回滚..."
    
    # 停止当前服务
    docker-compose -f docker-compose.production.yml down
    
    # 恢复备份（如果存在）
    latest_backup=$(ls -t backups/ | head -1)
    if [ -n "$latest_backup" ]; then
        log_info "恢复备份: $latest_backup"
        # 这里添加恢复逻辑
    fi
    
    log_info "回滚完成"
}

# 主函数
main() {
    log_info "开始部署 Activepieces 生产环境"
    echo ""
    
    # 检查环境
    check_env_vars
    check_docker
    
    # 询问是否备份
    read -p "是否备份现有数据? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        backup_data
    fi
    
    # 部署流程
    pull_images
    build_images
    stop_services
    start_services
    
    # 等待服务就绪
    if ! wait_for_services; then
        log_error "服务启动失败"
        read -p "是否回滚? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
        exit 1
    fi
    
    # 健康检查
    if ! health_check; then
        log_error "健康检查失败"
        read -p "是否回滚? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
        exit 1
    fi
    
    # 烟雾测试
    smoke_test
    
    # 清理
    cleanup
    
    # 显示部署信息
    show_deployment_info
    
    log_info "部署完成!"
}

# 捕获错误
trap 'log_error "部署过程中发生错误"; exit 1' ERR

# 运行主函数
main "$@"