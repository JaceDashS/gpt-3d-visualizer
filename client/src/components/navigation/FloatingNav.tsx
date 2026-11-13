import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface FloatingNavProps {
  onToggleFeedback: () => void;
  onNavigate: () => void;
}

// 우측 하단 텍스트 네비게이션: Home | How it works | Feedback
const FloatingNav: React.FC<FloatingNavProps> = ({ onToggleFeedback, onNavigate }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="floating-nav" aria-label="Quick navigation">
      <Link
        className={isActive('/') ? 'active' : ''}
        to="/"
        onClick={onNavigate}
      >
        Home
      </Link>
      <span className="separator">|</span>
      <Link
        className={isActive('/how-it-works') ? 'active' : ''}
        to="/how-it-works"
        onClick={onNavigate}
      >
        How it works
      </Link>
      <span className="separator">|</span>
      <button
        type="button"
        onClick={onToggleFeedback}
      >
        Feedback
      </button>
    </nav>
  );
};

export default FloatingNav;

