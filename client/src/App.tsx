import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VisualizationContainer from './components/VisualizationContainer';
import HowItWorksPage from './pages/HowItWorksPage';
import FloatingNav from './components/layout/FloatingNav';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualizationContainer />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
      <FloatingNav />
    </BrowserRouter>
  );
}

export default App;
