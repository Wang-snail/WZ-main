import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import FlowEditor from './pages/FlowEditor';
import TemplateCenter from './pages/TemplateCenter';
import ReportAnalysis from './pages/ReportAnalysis';
import Settings from './pages/Settings';
import AIAssistant from './components/AIAssistant';


import AdminNodes from './pages/admin/AdminNodes';
import AdminNodeEdit from './pages/admin/AdminNodeEdit';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
const [currentPath, setCurrentPath] = useState('dashboard');
const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

if (currentPath === 'admin/nodes') return <AdminNodes currentPath={currentPath} onNavigate={setCurrentPath} />;
if (currentPath === 'admin/nodes/edit') return <AdminNodeEdit currentPath={currentPath} onNavigate={setCurrentPath} />;
if (currentPath === 'admin/users') return <AdminUsers currentPath={currentPath} onNavigate={setCurrentPath} />;

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
