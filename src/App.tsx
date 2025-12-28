import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
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
import HomePage from './pages/HomePageOptimized';
import ToolsPage from '@/pages/tools/ToolsPage';
import SyncPage from '@/pages/sync/SyncPage';

const CommunityPage = React.lazy(() => import('./pages/community/CommunityPage'));

const GuidePage = React.lazy(() => import('./pages/guide/GuidePage'));

const FbaCalculator = React.lazy(() => import('./pages/tools/fba-calculator/FbaCalculator'));
const MarketAnalysis = React.lazy(() => import('./pages/tools/MarketAnalysis'));
const KanoAnalysisToolPage = React.lazy(() => import('./pages/tools/kano-analysis/KanoAnalysisToolPage'));
const CompetitorAnalysisPage = React.lazy(() => import('./pages/tools/competitor-analysis/CompetitorAnalysisPage'));
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

            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* 主要路由 */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/wiki" element={<GuidePage />} />
                  <Route path="/tools" element={<ToolsPage />} />
                  <Route path="/sales-target" element={<SalesTargetTracking />} />
                  <Route path="/email-contact" element={<EmailContactPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/workflows" element={<CommunityPage />} />
                  <Route path="/forum" element={<CommunityPage />} />
                  <Route path="/discussion" element={<CommunityPage />} />
                  <Route path="/sync" element={<SyncPage />} />
                  <Route path="/tools/fba-calculator" element={<FbaCalculator />} />
                  <Route path="/tools/market-analysis" element={<MarketAnalysis />} />
                  <Route path="/tools/kano-analysis" element={<KanoAnalysisToolPage />} />
                  <Route path="/tools/competitor-analysis" element={<CompetitorAnalysisPage />} />
                  <Route path="/processes/amazon-new-product-import" element={<AmazonNewProductProcess />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* 多语言路由 */}
                  {/* 英文 */}
                  <Route path="/en" element={<HomePage />} />
                  <Route path="/en/tools" element={<ToolsPage />} />
                  <Route path="/en/community" element={<CommunityPage />} />
                  <Route path="/en/sync" element={<SyncPage />} />

                  <Route path="/en/tools/fba-calculator" element={<FbaCalculator />} />
                  <Route path="/en/tools/kano-analysis" element={<KanoAnalysisToolPage />} />
                  <Route path="/en/tools/competitor-analysis" element={<CompetitorAnalysisPage />} />


                  {/* 其他语言路由占位，暂定都指向 Home 或具体工具 */}
                  {['jp', 'kr', 'es', 'fr', 'ru', 'pt'].map(lang => (
                    <React.Fragment key={lang}>
                      <Route path={`/${lang}`} element={<HomePage />} />
                      <Route path={`/${lang}/tools`} element={<ToolsPage />} />
                      <Route path={`/${lang}/community`} element={<CommunityPage />} />
                      <Route path={`/${lang}/sync`} element={<SyncPage />} />

                      <Route path={`/${lang}/tools/fba-calculator`} element={<FbaCalculator />} />
                      <Route path={`/${lang}/tools/kano-analysis`} element={<KanoAnalysisToolPage />} />
                      <Route path={`/${lang}/tools/competitor-analysis`} element={<CompetitorAnalysisPage />} />
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
