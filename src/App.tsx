import React, { Suspense } from 'react';
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

            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* 主要路由 */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/sales-target" element={<SalesTargetTracking />} />
                  <Route path="/email-contact" element={<EmailContactPage />} />
                  <Route path="/discussion" element={<DiscussionBoard />} />
                  <Route path="/tools/fba-calculator" element={<FbaCalculator />} />
                  <Route path="/processes/amazon-new-product-import" element={<AmazonNewProductProcess />} />
                  <Route path="/about" element={<AboutPage />} />


                  {/* 多语言路由 - 只有 FBA 计算器 是保留工具 */}
                  {/* 英文 */}
                  <Route path="/en" element={<HomePage />} />
                  <Route path="/en/tools/fba-calculator" element={<FbaCalculator />} />


                  {/* 其他语言路由占位，暂定都指向 Home 或具体工具 */}
                  {['jp', 'kr', 'es', 'fr', 'ru', 'pt'].map(lang => (
                    <React.Fragment key={lang}>
                      <Route path={`/${lang}`} element={<HomePage />} />
                      <Route path={`/${lang}/tools/fba-calculator`} element={<FbaCalculator />} />
                    </React.Fragment>
                  ))}
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
          <Analytics />


        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
