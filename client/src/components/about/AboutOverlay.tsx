import React, { useEffect, useMemo, useState } from 'react';
import styles from './AboutOverlay.module.css';
import { API_CONFIG, ASSETS_CONFIG } from '../../config/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { fetchAssetsManifest, fetchProfileOverview, getAssetUrl } from '../../services/assetService';
import { ProfileOverviewData } from '../../types/assets';
import { OVERLAY_SLIDE_DOWN_DURATION, ABOUT_SCROLLBAR_FADE_OUT_DELAY } from '../../constants/animation';

interface AboutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutOverlay: React.FC<AboutOverlayProps> = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState<ProfileOverviewData | null>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedFetch, setHasTriedFetch] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = React.useRef<number | null>(null);
  const textContentRef = React.useRef<HTMLDivElement>(null);

  // 열리고 닫힐 때 애니메이션이 자연스럽게 보이도록 내부 마운트 상태 관리
  useEffect(() => {
    let timer: number | undefined;

    if (isOpen) {
      setIsMounted(true);
      setIsClosing(false);
    } else if (!isOpen && isMounted) {
      // 닫힐 때는 슬라이드 다운 애니메이션을 먼저 보여주고 언마운트
      setIsClosing(true);
      timer = window.setTimeout(() => {
        setIsMounted(false);
        setIsClosing(false);
      }, OVERLAY_SLIDE_DOWN_DURATION); // 닫힐때 닫히는 시간 후에 언마운트
    }

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [isOpen, isMounted]);

  // 컴포넌트 마운트 시 한 번만 호출 시도
  useEffect(() => {
    if (profileData || isLoading || hasTriedFetch) {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const manifest = await fetchAssetsManifest();
        if (manifest) {
          // Profile Overview 로드
          const data = await fetchProfileOverview(manifest);
          setProfileData(data);

          // home-large-2.png 로드 (표시하지 않음)
          if (manifest.sets.homePhotos) {
            const photo = manifest.sets.homePhotos.items.find(p => p.file === 'home-large-2.png');
            if (photo) {
              const url = getAssetUrl(manifest.sets.homePhotos.basePath, photo.file);
              setProfileImage(url);
              // console.log('Loaded profile image (hidden):', url);
            }
          }
        } else {
            setError('Failed to load manifest.');
        }
      } catch (err: unknown) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data.');
      } finally {
        setIsLoading(false);
        setHasTriedFetch(true);
      }
    };

    loadData();
  }, [profileData, isLoading, hasTriedFetch]);

  // profileImage 사용 (경고 방지 및 디버깅용)
  useEffect(() => {
    if (profileImage) {
       // console.log('Current profile image URL:', profileImage);
    }
  }, [profileImage]);

  const currentLangData = useMemo(() => {
    if (!profileData) return null;
    return profileData[language] || profileData['en'];
  }, [profileData, language]);

  const linkedDescription = useMemo(() => {
    if (!currentLangData?.description) return null;

    const description = currentLangData.description;
    const links = currentLangData.links;

    // 링크 매핑 (환경 변수 등에서 URL 가져오기)
    const linkEntries = [
      {
        key: 'composition',
        text: links?.composition,
        url: process.env.REACT_APP_COMPOSITION_URL || '',
      },
      {
        key: 'guitar',
        text: links?.guitar,
        url: process.env.REACT_APP_GUITAR_URL || '',
      },
    ].filter((entry) => entry.text && entry.url) as Array<{
      key: string;
      text: string;
      url: string;
    }>;

    if (linkEntries.length === 0) return description;

    const escapeRegex = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pattern = linkEntries.map((entry) => escapeRegex(entry.text)).join('|');
    if (!pattern) return description;

    const regex = new RegExp(`(${pattern})`, 'g');
    const parts = description.split(regex);

    return parts.map((part, index) => {
      const linkEntry = linkEntries.find((entry) => entry.text === part);
      if (!linkEntry) {
        return <span key={index}>{part}</span>;
      }
      return (
        <a
          key={`${linkEntry.key}-${index}`}
          href={linkEntry.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.descriptionLink}
        >
          {part}
        </a>
      );
    });
  }, [currentLangData]);

  const viewAppsText = useMemo(() => {
    switch (language) {
      case 'ko':
        return '내 모든 앱을 보기';
      case 'ja':
        return 'すべてのアプリを見る';
      case 'zh':
        return '查看我的所有应用';
      case 'en':
      default:
        return 'View all my apps';
    }
  }, [language]);

  // 스크롤 위치 감지 및 스크롤 중 상태 관리
  useEffect(() => {
    const textContent = textContentRef.current;
    if (!textContent) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = textContent;
      const threshold = 5; // 하단 5px 내에 있으면 끝으로 간주
      setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight <= threshold);
      
      // 스크롤 중 상태 설정
      setIsScrolling(true);
      
      // 스크롤이 멈춘 후 ABOUT_SCROLLBAR_FADE_OUT_DELAY초 뒤에 스크롤바 페이드아웃
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
      }, ABOUT_SCROLLBAR_FADE_OUT_DELAY);
    };

    // 초기 체크
    handleScroll();
    textContent.addEventListener('scroll', handleScroll);
    // 내용이 변경될 때도 체크
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(textContent);

    return () => {
      textContent.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [linkedDescription, isMounted]);

  if (!isMounted) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // backdrop을 직접 클릭한 경우에만 닫기 (sheet 내부 클릭은 무시)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // sheet 내부 클릭은 backdrop으로 전파되지 않도록
    e.stopPropagation();
  };

  return (
    <div 
      className={styles.backdrop} 
      aria-modal="true" 
      role="dialog"
      onClick={handleBackdropClick}
    >
      <div 
        className={`${styles.sheet} ${isClosing ? styles.closing : ''}`}
        onClick={handleSheetClick}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close about"
        >
          ×
        </button>

        <div className={styles.content}>
          <div className={styles.profileWrapper}>
            <img
              src={profileImage || ASSETS_CONFIG.profileImage}
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
          <div className={styles.textWrapper}>
            <div className={styles.headerRow}>
            <h2 className={styles.title}>About</h2>
              <div className={styles.langGroup} role="group" aria-label="Language">
                <button
                  type="button"
                  className={`${styles.langButton} ${language === 'en' ? styles.langButtonActive : ''}`}
                  onClick={() => setLanguage('en')}
                >
                  EN
                </button>
                <button
                  type="button"
                  className={`${styles.langButton} ${language === 'zh' ? styles.langButtonActive : ''}`}
                  onClick={() => setLanguage('zh')}
                >
                  中
                </button>
                <button
                  type="button"
                  className={`${styles.langButton} ${language === 'ja' ? styles.langButtonActive : ''}`}
                  onClick={() => setLanguage('ja')}
                >
                  日
                </button>
                <button
                  type="button"
                  className={`${styles.langButton} ${language === 'ko' ? styles.langButtonActive : ''}`}
                  onClick={() => setLanguage('ko')}
                >
                  한
                </button>
              </div>
            </div>
            <div 
              ref={textContentRef}
              className={styles.textContent}
              data-scrolled-to-bottom={isScrolledToBottom}
              data-scrolling={isScrolling}
            >
            {isLoading && <p className={styles.message}>Loading about information...</p>}
            {!isLoading && error && (
              <p className={styles.message}>{error}</p>
            )}
            {!isLoading && !error && linkedDescription && (
              <p className={styles.aboutText}>{linkedDescription}</p>
            )}
            </div>
            <a
              href={API_CONFIG.baseURL}
              className={styles.viewAppsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {viewAppsText} →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutOverlay;


