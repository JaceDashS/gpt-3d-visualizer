import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './FloatingNav.module.css';

// 우측 하단 텍스트 네비게이션: Home | How it works | About (soon) | Feedback (soon)
const FloatingNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={styles.container} aria-label="Quick navigation">
      <Link className={`${styles.link} ${isActive('/') ? styles.active : ''}`} to="/">
        Home
      </Link>
      <span className={styles.separator}>|</span>
      <Link className={`${styles.link} ${isActive('/how-it-works') ? styles.active : ''}`} to="/how-it-works">
        How it works
      </Link>
    </nav>
  );
};

export default FloatingNav;


