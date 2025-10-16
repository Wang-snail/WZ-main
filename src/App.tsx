import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HomePagePreview from './pages/HomePagePreview';
import AIToolsPage from './pages/AIToolsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import ToolReviewsPage from './pages/ToolReviewsPage';
import DivinationPage from './pages/DivinationPage';
import AnalyzerPage from './pages/AnalyzerPage';
import AboutPage from './pages/AboutPage';
import AIGamesPage from './pages/games/AIGamesPage';
import AIWordGuessGame from './pages/games/AIWordGuessGame';
import AITicTacToe from './pages/games/AITicTacToe';
import AIMemoryGame from './pages/games/AIMemoryGame';
import AINumberGuessGame from './pages/games/AINumberGuessGame';
import AIRockPaperScissors from './pages/games/AIRockPaperScissors';
import AIMathChallenge from './pages/games/AIMathChallenge';
import WolfSheepGame from './pages/games/WolfSheepGame';
import ReversiGame from './pages/games/ReversiGame';
import MilitaryChessGame from './pages/games/MilitaryChessGame';
import GoGame from './pages/games/GoGame';
import ToolStatistics from './pages/tools/ToolStatistics';
import SalesTrackingPage from './pages/SalesTrackingPage';
import WebsiteConfigPage from './pages/WebsiteConfigPage';
import TestPage from './pages/TestPage';
import KajianLessonsPage from './pages/KajianLessonsPage';
import KajianLessonDetailPage from './pages/KajianLessonDetailPage';
import LandingPages from './pages/LandingPages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';
import PerformanceMonitor from './components/PerformanceMonitor';
import './App.css';

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
            
            <Header />
            
            <main className="flex-1">
              <Routes>
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
              </Routes>
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
