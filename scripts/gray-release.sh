#!/bin/bash

# 灰度发布脚本
# 用途：执行分阶段的用户迁移和系统监控

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
BRIDGE_API_URL="${BRIDGE_API_URL:-http://localhost:4000}"
API_KEY="${BRIDGE_API_KEY}"
RELEASE_CONFIG_ID="${RELEASE_CONFIG_ID:-standard_gray_release}"

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

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# API 调用函数
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    local curl_opts=(-s -X "$method" -H "Content-Type: application/json")
    
    if [ -n "$API_KEY" ]; then
        curl_opts+=(-H "Authorization: Bearer $API_KEY")
    fi
    
    if [ -n "$data" ]; then
        curl_opts+=(-d "$data")
    fi
    
    curl "${curl_opts[@]}" "$BRIDGE_API_URL$endpoint"
}

# 检查服务状态
check_service_health() {
    log_info "检查服务健康状态..."
    
    local health_response
    health_response=$(api_call "GET" "/health")
    
    if echo "$health_response" | jq -e '.success' > /dev/null 2>&1; then
        log_info "✓ 服务健康检查通过"
        return 0
    else
        log_error "✗ 服务健康检查失败"
        echo "$health_response"
        return 1
    fi
}

# 开始灰度发布
start_gray_release() {
    log_info "开始灰度发布..."
    
    local response
    response=$(api_call "POST" "/api/gray-release/start" "{\"configId\": \"$RELEASE_CONFIG_ID\"}")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        local release_id
        release_id=$(echo "$response" | jq -r '.data.releaseId')
        log_info "✓ 灰度发布已启动: $release_id"
        echo "$release_id"
        return 0
    else
        log_error "✗ 启动灰度发布失败"
        echo "$response" | jq -r '.error.message // "未知错误"'
        return 1
    fi
}

# 监控灰度发布
monitor_release() {
    local release_id="$1"
    local check_interval="${2:-30}"
    
    log_info "开始监控灰度发布: $release_id"
    log_info "检查间隔: ${check_interval}秒"
    
    while true; do
        local status_response
        status_response=$(api_call "GET" "/api/gray-release/status/$release_id")
        
        if ! echo "$status_response" | jq -e '.success' > /dev/null 2>&1; then
            log_error "获取发布状态失败"
            break
        fi
        
        local status
        local current_phase
        local phase_name
        status=$(echo "$status_response" | jq -r '.data.status')
        current_phase=$(echo "$status_response" | jq -r '.data.currentPhase')
        
        # 获取阶段信息
        local config_response
        config_response=$(api_call "GET" "/api/gray-release/config/$RELEASE_CONFIG_ID")
        if echo "$config_response" | jq -e '.success' > /dev/null 2>&1; then
            phase_name=$(echo "$config_response" | jq -r ".data.phases[$current_phase].name // \"未知阶段\"")
        else
            phase_name="未知阶段"
        fi
        
        # 显示状态
        case "$status" in
            "running")
                log_info "发布状态: 运行中 | 当前阶段: $phase_name ($current_phase)"
                ;;
            "completed")
                log_info "✓ 灰度发布已完成"
                break
                ;;
            "failed")
                log_error "✗ 灰度发布失败"
                break
                ;;
            "rolled_back")
                log_warn "⚠ 灰度发布已回滚"
                local rollback_reason
                rollback_reason=$(echo "$status_response" | jq -r '.data.rollbackReason // "未知原因"')
                log_warn "回滚原因: $rollback_reason"
                break
                ;;
            "paused")
                log_warn "⏸ 灰度发布已暂停"
                ;;
            *)
                log_debug "发布状态: $status"
                ;;
        esac
        
        # 显示最新指标
        show_latest_metrics "$status_response"
        
        # 检查问题
        check_issues "$status_response"
        
        sleep "$check_interval"
    done
}

# 显示最新指标
show_latest_metrics() {
    local status_response="$1"
    
    local latest_metrics
    latest_metrics=$(echo "$status_response" | jq -r '.data.metrics | last')
    
    if [ "$latest_metrics" != "null" ]; then
        local success_rate
        local error_rate
        local response_time
        local user_count
        
        success_rate=$(echo "$latest_metrics" | jq -r '.successRate')
        error_rate=$(echo "$latest_metrics" | jq -r '.errorRate')
        response_time=$(echo "$latest_metrics" | jq -r '.averageResponseTime')
        user_count=$(echo "$latest_metrics" | jq -r '.userCount')
        
        log_debug "指标 - 成功率: ${success_rate}% | 错误率: ${error_rate}% | 响应时间: ${response_time}ms | 用户数: $user_count"
    fi
}

# 检查问题
check_issues() {
    local status_response="$1"
    
    local issues_count
    issues_count=$(echo "$status_response" | jq -r '.data.issues | length')
    
    if [ "$issues_count" -gt 0 ]; then
        log_warn "发现 $issues_count 个问题:"
        echo "$status_response" | jq -r '.data.issues[] | "  - [\(.severity)] \(.description)"'
    fi
}

# 暂停灰度发布
pause_release() {
    local release_id="$1"
    
    log_info "暂停灰度发布: $release_id"
    
    local response
    response=$(api_call "POST" "/api/gray-release/pause" "{\"releaseId\": \"$release_id\"}")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        log_info "✓ 灰度发布已暂停"
        return 0
    else
        log_error "✗ 暂停灰度发布失败"
        echo "$response" | jq -r '.error.message // "未知错误"'
        return 1
    fi
}

# 恢复灰度发布
resume_release() {
    local release_id="$1"
    
    log_info "恢复灰度发布: $release_id"
    
    local response
    response=$(api_call "POST" "/api/gray-release/resume" "{\"releaseId\": \"$release_id\"}")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        log_info "✓ 灰度发布已恢复"
        return 0
    else
        log_error "✗ 恢复灰度发布失败"
        echo "$response" | jq -r '.error.message // "未知错误"'
        return 1
    fi
}

# 回滚灰度发布
rollback_release() {
    local release_id="$1"
    local reason="${2:-手动回滚}"
    
    log_warn "回滚灰度发布: $release_id"
    log_warn "回滚原因: $reason"
    
    local response
    response=$(api_call "POST" "/api/gray-release/rollback" "{\"releaseId\": \"$release_id\", \"reason\": \"$reason\"}")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        log_info "✓ 灰度发布回滚完成"
        return 0
    else
        log_error "✗ 回滚灰度发布失败"
        echo "$response" | jq -r '.error.message // "未知错误"'
        return 1
    fi
}

# 获取发布历史
show_release_history() {
    log_info "获取发布历史..."
    
    local response
    response=$(api_call "GET" "/api/gray-release/history")
    
    if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
        echo "$response" | jq -r '.data[] | "\(.id) | \(.status) | \(.startTime) | \(.configId)"' | \
        while IFS='|' read -r id status start_time config_id; do
            printf "%-20s %-12s %-20s %s\n" "$id" "$status" "$start_time" "$config_id"
        done
    else
        log_error "获取发布历史失败"
        echo "$response" | jq -r '.error.message // "未知错误"'
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
灰度发布脚本

用法: $0 <命令> [参数]

命令:
  start                     开始灰度发布
  monitor <release_id>      监控灰度发布 [检查间隔秒数]
  pause <release_id>        暂停灰度发布
  resume <release_id>       恢复灰度发布
  rollback <release_id>     回滚灰度发布 [原因]
  status <release_id>       获取发布状态
  history                   显示发布历史
  health                    检查服务健康状态

环境变量:
  BRIDGE_API_URL           桥接服务 API 地址 (默认: http://localhost:4000)
  BRIDGE_API_KEY           API 密钥
  RELEASE_CONFIG_ID        发布配置 ID (默认: standard_gray_release)

示例:
  $0 start                 # 开始灰度发布
  $0 monitor release_123   # 监控发布
  $0 rollback release_123 "性能问题"  # 回滚发布

EOF
}

# 主函数
main() {
    local command="$1"
    
    case "$command" in
        "start")
            check_service_health || exit 1
            release_id=$(start_gray_release)
            if [ $? -eq 0 ]; then
                echo ""
                log_info "使用以下命令监控发布进度:"
                echo "  $0 monitor $release_id"
            fi
            ;;
        "monitor")
            local release_id="$2"
            local interval="${3:-30}"
            if [ -z "$release_id" ]; then
                log_error "请提供发布 ID"
                exit 1
            fi
            monitor_release "$release_id" "$interval"
            ;;
        "pause")
            local release_id="$2"
            if [ -z "$release_id" ]; then
                log_error "请提供发布 ID"
                exit 1
            fi
            pause_release "$release_id"
            ;;
        "resume")
            local release_id="$2"
            if [ -z "$release_id" ]; then
                log_error "请提供发布 ID"
                exit 1
            fi
            resume_release "$release_id"
            ;;
        "rollback")
            local release_id="$2"
            local reason="$3"
            if [ -z "$release_id" ]; then
                log_error "请提供发布 ID"
                exit 1
            fi
            rollback_release "$release_id" "$reason"
            ;;
        "status")
            local release_id="$2"
            if [ -z "$release_id" ]; then
                log_error "请提供发布 ID"
                exit 1
            fi
            api_call "GET" "/api/gray-release/status/$release_id" | jq '.'
            ;;
        "history")
            show_release_history
            ;;
        "health")
            check_service_health
            ;;
        "help"|"-h"|"--help"|"")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 检查依赖
if ! command -v jq &> /dev/null; then
    log_error "需要安装 jq 工具"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    log_error "需要安装 curl 工具"
    exit 1
fi

# 运行主函数
main "$@"