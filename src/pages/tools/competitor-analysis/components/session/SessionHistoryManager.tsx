/**
 * 会话历史管理组件
 * 提供会话列表、恢复、删除和数据清理功能
 */

import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Download,
  Upload,
  Filter,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useCompetitorAnalysisStore, useShallow } from '../../store/competitorAnalysisStore';
import { DataStorageService } from '../../services/data/DataStorageService';
import type { AnalysisSession } from '../../types';

/**
 * 会话过滤选项
 */
interface SessionFilter {
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'updated' | 'created' | 'name';
  sortOrder: 'asc' | 'desc';
}

/**
 * 批量操作类型
 */
type BatchAction = 'delete' | 'export';

/**
 * 会话历史管理器组件
 */
export const SessionHistoryManager: React.FC = () => {
  const { sessions, currentSessionId } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      sessions: state.sessions,
      currentSessionId: state.currentSessionId
    }))
  );
  const deleteSession = useCompetitorAnalysisStore(state => state.deleteSession);
  const loadSession = useCompetitorAnalysisStore(state => state.loadSession);

  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<SessionFilter>({
    dateRange: 'all',
    sortBy: 'updated',
    sortOrder: 'desc'
  });
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 过滤和排序会话列表
   */
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...sessions];

    // 按日期范围过滤
    if (filter.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filter.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(session => session.updatedAt >= cutoffDate);
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filter.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updated':
        default:
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }

      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [sessions, filter]);

  /**
   * 处理会话选择
   */
  const handleSessionSelect = (sessionId: string, selected: boolean) => {
    const newSelected = new Set(selectedSessions);
    if (selected) {
      newSelected.add(sessionId);
    } else {
      newSelected.delete(sessionId);
    }
    setSelectedSessions(newSelected);
    setShowBatchActions(newSelected.size > 0);
  };

  /**
   * 全选/取消全选
   */
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedSessions(new Set(filteredAndSortedSessions.map(s => s.id)));
      setShowBatchActions(true);
    } else {
      setSelectedSessions(new Set());
      setShowBatchActions(false);
    }
  };

  /**
   * 批量删除会话
   */
  const handleBatchDelete = async () => {
    if (selectedSessions.size === 0) return;

    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedSessions.size} 个会话吗？此操作无法撤销。`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      // 批量删除
      for (const sessionId of selectedSessions) {
        deleteSession(sessionId);
      }

      setSelectedSessions(new Set());
      setShowBatchActions(false);
    } catch (error) {
      console.error('Batch delete failed:', error);
      alert('批量删除失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 批量导出会话
   */
  const handleBatchExport = async () => {
    if (selectedSessions.size === 0) return;

    setIsProcessing(true);
    try {
      const selectedSessionData = sessions.filter(s => selectedSessions.has(s.id));

      const exportData = {
        sessions: selectedSessionData,
        exportedAt: new Date(),
        count: selectedSessionData.length
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `competitor-analysis-sessions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSelectedSessions(new Set());
      setShowBatchActions(false);
    } catch (error) {
      console.error('Batch export failed:', error);
      alert('批量导出失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 清理过期数据
   */
  const handleCleanupExpiredData = async () => {
    const confirmed = window.confirm(
      '确定要清理90天前的过期会话数据吗？此操作无法撤销。'
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const deletedCount = await DataStorageService.cleanupExpiredData(90);
      alert(`已清理 ${deletedCount} 个过期会话`);
    } catch (error) {
      console.error('Cleanup failed:', error);
      alert('清理失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 导出所有数据
   */
  const handleExportAllData = async () => {
    setIsProcessing(true);
    try {
      const allData = await DataStorageService.exportAllData();

      const blob = new Blob([JSON.stringify(allData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `competitor-analysis-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export all data failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 格式化日期显示
   */
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 过滤和排序控制 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as any }))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部时间</option>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={`${filter.sortBy}-${filter.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilter(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated-desc">最近更新</option>
              <option value="updated-asc">最早更新</option>
              <option value="created-desc">最近创建</option>
              <option value="created-asc">最早创建</option>
              <option value="name-asc">名称 A-Z</option>
              <option value="name-desc">名称 Z-A</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            共 {filteredAndSortedSessions.length} 个会话
          </span>
        </div>
      </div>

      {/* 批量操作栏 */}
      {showBatchActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              已选择 {selectedSessions.size} 个会话
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBatchExport}
                disabled={isProcessing}
                className="flex items-center px-3 py-1 text-sm text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1" />
                导出
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={isProcessing}
                className="flex items-center px-3 py-1 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 会话列表 */}
      <div className="space-y-2">
        {/* 全选控制 */}
        {filteredAndSortedSessions.length > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selectedSessions.size === filteredAndSortedSessions.length && filteredAndSortedSessions.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>全选</span>
            </label>
          </div>
        )}

        {/* 会话项列表 */}
        {filteredAndSortedSessions.map((session) => (
          <div
            key={session.id}
            className={`flex items-center space-x-3 p-3 border rounded-lg hover:shadow-sm transition-shadow ${session.id === currentSessionId
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
              }`}
          >
            {/* 选择框 */}
            <input
              type="checkbox"
              checked={selectedSessions.has(session.id)}
              onChange={(e) => handleSessionSelect(session.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />

            {/* 会话信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {session.name}
                </h4>
                {session.id === currentSessionId && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    当前
                  </span>
                )}
              </div>

              {session.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {session.description}
                </p>
              )}

              <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(session.updatedAt)}
                </span>
                <span className="flex items-center">
                  <FileText className="w-3 h-3 mr-1" />
                  {session.baseProduct.name}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => loadSession(session.id)}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                title="加载会话"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('确定要删除这个会话吗？')) {
                    deleteSession(session.id);
                  }
                }}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                title="删除会话"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* 空状态 */}
        {filteredAndSortedSessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>没有找到匹配的会话</p>
          </div>
        )}
      </div>

      {/* 数据管理操作 */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">数据管理</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportAllData}
            disabled={isProcessing}
            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            导出所有数据
          </button>

          <button
            onClick={handleCleanupExpiredData}
            disabled={isProcessing}
            className="flex items-center px-3 py-2 text-sm text-orange-700 bg-orange-100 hover:bg-orange-200 rounded transition-colors disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            清理过期数据
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionHistoryManager;