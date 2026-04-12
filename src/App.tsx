import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import FlowEditor from './pages/FlowEditor';
import TemplateCenter from './pages/TemplateCenter';
import ReportAnalysis from './pages/ReportAnalysis';
import Settings from './pages/Settings';
import AIAssistant from './components/AIAssistant';
import NodeCalculator from './pages/NodeCalculator';

import AdminNodes from './pages/admin/AdminNodes';
import AdminNodeEdit from './pages/admin/AdminNodeEdit';
import AdminUsers from './pages/admin/AdminUsers';

const APP_MODE = import.meta.env.VITE_APP_MODE ?? 'frontend';
const IS_ADMIN = APP_MODE === 'admin';

export default function App() {
  const [currentPath, setCurrentPath] = useState(IS_ADMIN ? 'admin/nodes' : 'dashboard');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // ── 后台模式：只渲染 admin 页面 ───────────────────────────────────────────
  if (IS_ADMIN) {
    if (currentPath === 'admin/nodes') return <AdminNodes currentPath={currentPath} onNavigate={setCurrentPath} />;
    if (currentPath === 'admin/nodes/edit') return <AdminNodeEdit currentPath={currentPath} onNavigate={setCurrentPath} />;
    if (currentPath === 'admin/users') return <AdminUsers currentPath={currentPath} onNavigate={setCurrentPath} />;
    // 任何未知路径都回到 admin/nodes
    return <AdminNodes currentPath="admin/nodes" onNavigate={setCurrentPath} />;
  }

  // ── 前台模式：只渲染用户页面 ───────────────────────────────────────────────
  if (currentPath === 'calculator') return <NodeCalculator currentPath={currentPath} onNavigate={setCurrentPath} />;

  return (
    <>
      {currentPath === 'dashboard' && <Dashboard onNavigate={setCurrentPath} currentPath={currentPath} onOpenAIAssistant={() => setIsAIAssistantOpen(true)} />}
      {currentPath === 'flow' && <FlowEditor onNavigate={setCurrentPath} currentPath={currentPath} />}
      {currentPath === 'template' && <TemplateCenter onNavigate={setCurrentPath} currentPath={currentPath} />}
      {currentPath === 'report' && <ReportAnalysis onNavigate={setCurrentPath} currentPath={currentPath} />}
      {currentPath === 'settings' && <Settings onNavigate={setCurrentPath} currentPath={currentPath} />}
      <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} />
    </>
  );
}
