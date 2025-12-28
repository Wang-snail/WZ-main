/**
 * 会话管理组件
 * 提供会话保存、命名、历史记录等功能
 */

import React, { useState } from 'react';
import {
  Bookmark,
  Clock,
  X
} from 'lucide-react';
import {
  useCompetitorAnalysisStore,
  useShallow
} from '../../store/competitorAnalysisStore';
import SessionHistoryManager from './SessionHistoryManager';
import type { AnalysisSession } from '../../types';

/**
 * 会话保存对话框组件
 */
interface SaveSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => void;
  currentSessionName?: string;
  currentSessionDescription?: string;
}

const SaveSessionDialog: React.FC<SaveSessionDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSessionName = '',
  currentSessionDescription = ''
}) => {
  const [name, setName] = useState(currentSessionName);
  const [description, setDescription] = useState(currentSessionDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave(name.trim(), description.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName(currentSessionName);
    setDescription(currentSessionDescription);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" role="dialog" aria-labelledby="save-session-title">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 id="save-session-title" className="text-lg font-semibold text-gray-900">
            {currentSessionName ? '更新会话' : '保存会话'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="session-name" className="block text-sm font-medium text-gray-700 mb-2">
              会话名称 *
            </label>
            <input
              id="session-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入会话名称..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={100}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="session-description" className="block text-sm font-medium text-gray-700 mb-2">
              会话描述
            </label>
            <textarea
              id="session-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加会话描述或备注..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 字符
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * 会话历史列表组件
 */
interface SessionHistoryListProps {
  sessions: AnalysisSession[];
  currentSessionId: string | null;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onEditSession: (session: AnalysisSession) => void;
  searchQuery: string;
}

const SessionHistoryList: React.FC<SessionHistoryListProps> = ({
  sessions,
  currentSessionId,
  onLoadSession,
  onDeleteSession,
  onEditSession,
  searchQuery
}) => {
  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.description && session.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (filteredSessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {searchQuery ? '未找到匹配的会话' : '暂无历史会话'}
      </div>
    );
  }

  return <SessionHistoryManager />;
};

/**
 * 主会话管理组件
 */
export const SessionManagement: React.FC = () => {
  // 使用 useShallow 修复无限循环问题
  const { currentSessionId, sessions, hasActiveSessions } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      currentSessionId: state.currentSessionId,
      sessions: state.sessions,
      hasActiveSessions: state.sessions.length > 0
    }))
  );
  const { hasCompleteData } = useCompetitorAnalysisStore(
    useShallow((state: any) => ({
      hasCompleteData: !!(state.baseProduct && state.competitorData && state.analysisResult)
    }))
  );
  const {
    saveCurrentSession,
    loadSession,
    deleteSession,
    updateSession,
    toggleHistory
  } = useCompetitorAnalysisStore(useShallow((state: any) => ({
    saveCurrentSession: state.saveCurrentSession,
    loadSession: state.loadSession,
    deleteSession: state.deleteSession,
    updateSession: state.updateSession,
    toggleHistory: state.toggleHistory
  })));

  const showHistory = useCompetitorAnalysisStore(state => state.ui.showHistory);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<AnalysisSession | null>(null);

  const handleSaveSession = async (name: string, description?: string) => {
    try {
      await saveCurrentSession(name, description);
    } catch (error) {
      console.error('Failed to save session:', error);
      // 这里可以添加错误提示
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      await loadSession(sessionId);
      toggleHistory(); // 加载后关闭历史面板
    } catch (error) {
      console.error('Failed to load session:', error);
      // 这里可以添加错误提示
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('确定要删除这个会话吗？此操作无法撤销。')) {
      deleteSession(sessionId);
    }
  };

  const handleEditSession = (session: AnalysisSession) => {
    setEditingSession(session);
    setShowSaveDialog(true);
  };

  const handleUpdateSession = async (name: string, description?: string) => {
    if (!editingSession) return;

    updateSession(editingSession.id, {
      name,
      description
    });
    setEditingSession(null);
  };

  const handleCloseSaveDialog = () => {
    setShowSaveDialog(false);
    setEditingSession(null);
  };

  const currentSession = currentSessionId ? sessions.find(s => s.id === currentSessionId) : null;

  return (
    <>
      {/* 会话操作按钮 */}
      <div className="flex items-center space-x-2">
        {hasCompleteData && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            {currentSession ? '更新会话' : '保存会话'}
          </button>
        )}

        <button
          onClick={toggleHistory}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${showHistory
              ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          历史记录 ({sessions.length})
        </button>
      </div>

      {/* 历史记录面板 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                历史会话 ({sessions.length})
              </h3>
              <button
                onClick={toggleHistory}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 会话列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              <SessionHistoryManager />
            </div>
          </div>
        </div>
      )}

      {/* 保存/编辑会话对话框 */}
      <SaveSessionDialog
        isOpen={showSaveDialog}
        onClose={handleCloseSaveDialog}
        onSave={editingSession ? handleUpdateSession : handleSaveSession}
        currentSessionName={editingSession?.name}
        currentSessionDescription={editingSession?.description}
      />
    </>
  );
};

export default SessionManagement;