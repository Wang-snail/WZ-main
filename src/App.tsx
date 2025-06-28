import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AIToolsPage from './pages/AIToolsPage';
import DivinationPage from './pages/DivinationPage';
import AnalyzerPage from './pages/AnalyzerPage';
import { ErrorBoundary } from './components/ErrorBoundary';
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
                <Route path="/ai-tools" element={<AIToolsPage />} />
                <Route path="/divination" element={<DivinationPage />} />
                <Route path="/analyzer" element={<AnalyzerPage />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
