import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSession, SessionState } from '../services/auth';

const POPUP_POLL_MS = 500;

interface UseAuthSessionReturn {
  session: SessionState;
  refresh: () => void;
  openPlatformWindow: (url: string) => void;
}

// 세션 조회: 진입 시 1회, 열린 창이 닫히거나 앱 창에 포커스가 돌아올 때 재조회
export const useAuthSession = (enabled: boolean): UseAuthSessionReturn => {
  const [session, setSession] = useState<SessionState>({ status: 'checking' });
  const requestIdRef = useRef(0);
  const popupTimerRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    if (!enabled) return;
    const requestId = ++requestIdRef.current;
    fetchSession().then(result => {
      // 늦게 도착한 이전 응답은 무시
      if (requestId === requestIdRef.current) setSession(result);
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    refresh();
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
    };
  }, [enabled, refresh]);

  useEffect(() => () => {
    if (popupTimerRef.current !== null) window.clearInterval(popupTimerRef.current);
  }, []);

  // 새 창으로 jace-s.com 페이지를 연다. 창 내용은 읽지 않고 닫힘 여부만 확인한다
  const openPlatformWindow = useCallback((url: string) => {
    const popup = window.open(url, 'jace-s-auth', 'width=480,height=720');
    if (!popup) return;

    if (popupTimerRef.current !== null) window.clearInterval(popupTimerRef.current);
    popupTimerRef.current = window.setInterval(() => {
      if (popup.closed) {
        if (popupTimerRef.current !== null) window.clearInterval(popupTimerRef.current);
        popupTimerRef.current = null;
        refresh();
      }
    }, POPUP_POLL_MS);
  }, [refresh]);

  return { session, refresh, openPlatformWindow };
};

export default useAuthSession;
