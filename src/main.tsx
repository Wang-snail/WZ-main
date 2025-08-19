import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'
import { injectSpeedInsights } from '@vercel/speed-insights';
// 导入浏览器扩展错误处理器
import './utils/browserExtensionErrorHandler';

injectSpeedInsights();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
// Force rebuild
// Force rebuild Tue Aug 19 18:00:00 CST 2025
