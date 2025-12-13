import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LanguageRedirect from './components/common/LanguageRedirect';
import LanguageSynchronizer from './components/common/LanguageSynchronizer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

import LoadingProgress from './components/common/LoadingProgress';
import './App.css';

// 路由组件
import SalesTargetTracking from '@/pages/SalesTargetTracking';
import EmailContactPage from '@/pages/EmailContactPage';
import DiscussionBoard from '@/pages/DiscussionBoard';
import HomePage from './pages/HomePageOptimized';
import ToolsPage from '@/pages/tools/ToolsPage';
import WorkflowsPage from '@/pages/workflows/WorkflowsPage';
import ForumPage from '@/pages/forum/ForumPage';
import SyncPage from '@/pages/sync/SyncPage';
import EfficientToolsPage from '@/pages/efficient-tools/EfficientToolsPage';
import ExperimentPage from '@/pages/experiment/ExperimentPage';
import TestUIPage from '@/pages/test-ui/TestUIPage';
const FbaCalculator = React.lazy(() => import('./pages/tools/fba-calculator/FbaCalculator'));
const AmazonNewProductProcess = React.lazy(() => import('./pages/processes/AmazonNewProductProcess'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));

// 页面加载时的Loading组件
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingProgress />
  </div>
);

function App() {
  const [location, setLocation] = useState(window.location.pathname);

  // Update location when URL changes
  useEffect(() => {
    const handlePopState = () => {
      setLocation(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine if we're on the sync page to conditionally show footer
  const isSyncPage = location.includes('/sync');

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  borderRadius: '12px',
                  border: '1px solid #3b82f6',
                },
              }}
            />

            {/* 语言重定向组件 */}
            <LanguageRedirect />

            {/* 语言同步组件 */}
            <LanguageSynchronizer />

            <Header />

            <main className="flex-1 pt-16">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* 主要路由 */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/sales-target" element={<SalesTargetTracking />} />
                  <Route path="/email-contact" element={<EmailContactPage />} />
                  <Route path="/discussion" element={<DiscussionBoard />} />
                  <Route path="/workflows" element={<WorkflowsPage />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/sync" element={<SyncPage />} />
                  <Route path="/experiment" element={<ExperimentPage />} />
                  <Route path="/tools/fba-calculator" element={<FbaCalculator />} />
                  <Route path="/processes/amazon-new-product-import" element={<AmazonNewProductProcess />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/test-ui" element={<TestUIPage />} />


                  {/* 多语言路由 - 只有 FBA 计算器 是保留工具 */}
                  {/* 英文 */}
                  <Route path="/en" element={<HomePage />} />
                  <Route path="/en/tools" element={<ToolsPage />} />
                  <Route path="/en/workflows" element={<WorkflowsPage />} />
                  <Route path="/en/forum" element={<ForumPage />} />
                  <Route path="/en/sync" element={<SyncPage />} />
                  <Route path="/en/experiment" element={<ExperimentPage />} />
                  <Route path="/en/tools/fba-calculator" element={<FbaCalculator />} />


                  {/* 其他语言路由占位，暂定都指向 Home 或具体工具 */}
                  {['jp', 'kr', 'es', 'fr', 'ru', 'pt'].map(lang => (
                    <React.Fragment key={lang}>
                      <Route path={`/${lang}`} element={<HomePage />} />
                      <Route path={`/${lang}/tools`} element={<ToolsPage />} />
                      <Route path={`/${lang}/workflows`} element={<WorkflowsPage />} />
                      <Route path={`/${lang}/forum`} element={<ForumPage />} />
                      <Route path={`/${lang}/sync`} element={<SyncPage />} />
                      <Route path={`/${lang}/experiment`} element={<ExperimentPage />} />
                      <Route path={`/${lang}/tools/fba-calculator`} element={<FbaCalculator />} />
                    </React.Fragment>
                  ))}
                </Routes>
              </Suspense>
            </main>

            {/* Footer only on sync page */}
            {isSyncPage && <Footer />}
          </div>
          <Analytics />


        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
