import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HowItWorksPage from './pages/HowItWorksPage';
import FloatingNav from './components/navigation/FloatingNav';
import FeedbackOverlay from './components/feedback/FeedbackOverlay';
import { LanguageProvider } from './contexts/LanguageContext';
import { TextSizeProvider } from './contexts/TextSizeContext';
import { ServiceHealthProvider } from './contexts/ServiceHealthContext';
import ServiceNoticeToasts from './components/status/ServiceNoticeToasts';

function App() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleToggleFeedback = () => {
    setIsFeedbackOpen(prev => !prev);
  };

  const handleNavigate = () => {
    setIsFeedbackOpen(false);
  };

  return (
    <LanguageProvider>
    <ServiceHealthProvider>
    <TextSizeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
      <FloatingNav 
        onToggleFeedback={handleToggleFeedback}
        onNavigate={handleNavigate} 
      />
      <FeedbackOverlay isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <ServiceNoticeToasts />
    </BrowserRouter>
    </TextSizeProvider>
    </ServiceHealthProvider>
    </LanguageProvider>
  );
}

export default App;
