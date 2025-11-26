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
import PerformanceMonitor from './components/features/PerformanceMonitor';
import LoadingProgress from './components/common/LoadingProgress';
import './App.css';

// 路由组件懒加载
import HomePage from './pages/HomePageOptimized';
// const HomePage = React.lazy(() => import('./pages/HomePageOptimized'));
const HomePagePreview = React.lazy(() => import('./pages/HomePagePreview'));
const AIToolsPage = React.lazy(() => import('./pages/AIToolsPage'));
const WorkflowsPage = React.lazy(() => import('./pages/WorkflowsPage'));
const ToolReviewsPage = React.lazy(() => import('./pages/ToolReviewsPage'));
const DivinationPage = React.lazy(() => import('./pages/games/DivinationPage'));
const AnalyzerPage = React.lazy(() => import('./pages/AnalyzerPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const AIGamesPage = React.lazy(() => import('./pages/games/AIGamesPage'));
const AIWordGuessGame = React.lazy(() => import('./pages/games/AIWordGuessGame'));
const AITicTacToe = React.lazy(() => import('./pages/games/AITicTacToe'));
const AIMemoryGame = React.lazy(() => import('./pages/games/AIMemoryGame'));
const AINumberGuessGame = React.lazy(() => import('./pages/games/AINumberGuessGame'));
const AIRockPaperScissors = React.lazy(() => import('./pages/games/AIRockPaperScissors'));
const AIMathChallenge = React.lazy(() => import('./pages/games/AIMathChallenge'));
const WolfSheepGame = React.lazy(() => import('./pages/games/WolfSheepGame'));
const ReversiGame = React.lazy(() => import('./pages/games/ReversiGame'));
const MilitaryChessGame = React.lazy(() => import('./pages/games/MilitaryChessGame'));
const GoGame = React.lazy(() => import('./pages/games/GoGame'));
const ToolStatistics = React.lazy(() => import('./pages/tools/ToolStatistics'));
const SalesTrackingPage = React.lazy(() => import('./pages/features/SalesTrackingPage'));
const WebsiteConfigPage = React.lazy(() => import('./pages/WebsiteConfigPage'));
const TestPage = React.lazy(() => import('./pages/TestPage'));
const KajianLessonsPage = React.lazy(() => import('./pages/features/KajianLessonsPage'));
const KajianLessonDetailPage = React.lazy(() => import('./pages/features/KajianLessonDetailPage'));
const LandingPages = React.lazy(() => import('./pages/LandingPages'));
const PlatformNewsPage = React.lazy(() => import('./pages/features/PlatformNewsPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));
const ProcurementTablePage = React.lazy(() => import('./pages/features/ProcurementTablePage'));

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

            {/* 语言重定向组件 - 处理 /zh/* 到 /* 的重定向 */}
            <LanguageRedirect />

            {/* 语言同步组件 - 监听URL变化同步i18n语言 */}
            <LanguageSynchronizer />

            <Header />

            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* 默认语言路由 (中文) */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/preview" element={<HomePagePreview />} />
                  <Route path="/ai-tools" element={<AIToolsPage />} />
                  <Route path="/workflows" element={<WorkflowsPage />} />
                  <Route path="/tool-reviews" element={<ToolReviewsPage />} />
                  <Route path="/divination" element={<DivinationPage />} />
                  <Route path="/analyzer" element={<AnalyzerPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/landing" element={<LandingPages />} />
                  <Route path="/tools/statistics" element={<ToolStatistics />} />
                  <Route path="/sales-tracking" element={<SalesTrackingPage />} />
                  <Route path="/website-config" element={<WebsiteConfigPage />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/kajian-lessons" element={<KajianLessonsPage />} />
                  <Route path="/kajian-lessons/:id" element={<KajianLessonDetailPage />} />
                  <Route path="/platform-news" element={<PlatformNewsPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/procurement-quotation" element={<ProcurementTablePage />} />
                  <Route path="/games" element={<AIGamesPage />} />
                  <Route path="/games/ai-word-guess" element={<AIWordGuessGame />} />
                  <Route path="/games/ai-tic-tac-toe" element={<AITicTacToe />} />
                  <Route path="/games/ai-memory" element={<AIMemoryGame />} />
                  <Route path="/games/ai-number-guess" element={<AINumberGuessGame />} />
                  <Route path="/games/ai-rock-paper-scissors" element={<AIRockPaperScissors />} />
                  <Route path="/games/ai-math-challenge" element={<AIMathChallenge />} />
                  <Route path="/games/wolf-sheep" element={<WolfSheepGame />} />
                  <Route path="/games/reversi" element={<ReversiGame />} />
                  <Route path="/games/military-chess" element={<MilitaryChessGame />} />
                  <Route path="/games/go-game" element={<GoGame />} />

                  {/* 多语言路由 - 支持 /:lang/* 格式 */}
                  {/* 英文 /en/* */}
                  <Route path="/en" element={<HomePage />} />
                  <Route path="/en/ai-tools" element={<AIToolsPage />} />
                  <Route path="/en/platform-news" element={<PlatformNewsPage />} />
                  <Route path="/en/sales-tracking" element={<SalesTrackingPage />} />
                  <Route path="/en/kajian-lessons" element={<KajianLessonsPage />} />
                  <Route path="/en/community" element={<CommunityPage />} />
                  <Route path="/en/games" element={<AIGamesPage />} />

                  {/* 日语 /jp/* */}
                  <Route path="/jp" element={<HomePage />} />
                  <Route path="/jp/ai-tools" element={<AIToolsPage />} />
                  <Route path="/jp/platform-news" element={<PlatformNewsPage />} />
                  <Route path="/jp/sales-tracking" element={<SalesTrackingPage />} />
                  <Route path="/jp/kajian-lessons" element={<KajianLessonsPage />} />
                  <Route path="/jp/community" element={<CommunityPage />} />
                  <Route path="/jp/games" element={<AIGamesPage />} />

                  {/* 韩语 /kr/* */}
                  <Route path="/kr" element={<HomePage />} />
                  <Route path="/kr/ai-tools" element={<AIToolsPage />} />
                  <Route path="/kr/platform-news" element={<PlatformNewsPage />} />
                  <Route path="/kr/sales-tracking" element={<SalesTrackingPage />} />
                  <Route path="/kr/kajian-lessons" element={<KajianLessonsPage />} />
                  <Route path="/kr/community" element={<CommunityPage />} />
                  <Route path="/kr/games" element={<AIGamesPage />} />

                  {/* 西班牙语 /es/* */}
                  <Route path="/es" element={<HomePage />} />
                  <Route path="/es/ai-tools" element={<AIToolsPage />} />
                  <Route path="/es/platform-news" element={<PlatformNewsPage />} />
                  <Route path="/es/sales-tracking" element={<SalesTrackingPage />} />
                  <Route path="/es/kajian-lessons" element={<KajianLessonsPage />} />
                  <Route path="/es/community" element={<CommunityPage />} />
                  <Route path="/es/games" element={<AIGamesPage />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>
          <Analytics />

          {/* 性能监控组件 - 仅在开发环境显示 */}
          {import.meta.env.DEV && (
            <PerformanceMonitor
              isDevelopment={true}
              showRealTimeStats={true}
            />
          )}
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
