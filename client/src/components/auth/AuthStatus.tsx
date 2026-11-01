import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthSession } from '../../hooks/useAuthSession';
import { buildAccountUrl, buildLoginUrl, isLoginSupportedHost } from '../../services/auth';
import styles from './AuthStatus.module.css';

// 로그인 상태 표시. gpt-3d-visualizer.jace-s.com 에서만 렌더링한다
const AuthStatusInner: React.FC = () => {
  const { language } = useLanguage();
  const { session, openPlatformWindow } = useAuthSession(true);

  switch (session.status) {
    case 'checking':
      return <div className={styles.container} />;
    case 'authenticated':
      return (
        <div className={styles.container}>
          <span className={styles.name}>{session.user.displayName}</span>
          <button type="button" className={styles.link} onClick={() => openPlatformWindow(buildAccountUrl())}>
            Account
          </button>
        </div>
      );
    case 'unauthenticated':
      return (
        <div className={styles.container}>
          <button type="button" className={styles.link} onClick={() => openPlatformWindow(buildLoginUrl(language))}>
            Log in
          </button>
        </div>
      );
    case 'error':
    default:
      return (
        <div className={styles.container}>
          <span className={styles.error}>Failed to check login status</span>
        </div>
      );
  }
};

const AuthStatus: React.FC = () => {
  if (!isLoginSupportedHost()) return null;
  return <AuthStatusInner />;
};

export default AuthStatus;
