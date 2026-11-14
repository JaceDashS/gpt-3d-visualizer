import { API_BASE_URL, SITE_URL } from '../config/api';
import type { Language } from '../pages/HowItWorksPage';

// 로그인은 jace-s.com과 같은 사이트인 호스트에서만 동작한다 (세션 쿠키 SameSite strict).
// gpt-3d-visualizer.vercel.app 등에서는 쿠키가 실리지 않으므로 로그인 UI를 숨긴다.
const DEFAULT_LOGIN_HOSTS = ['gpt-3d-visualizer.jace-s.com'];

const getLoginHosts = (): string[] => {
  const raw = process.env.REACT_APP_LOGIN_HOSTS;
  if (!raw) return DEFAULT_LOGIN_HOSTS;
  return raw.split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
};

export const isLoginSupportedHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  return getLoginHosts().includes(window.location.hostname.toLowerCase());
};

// API 요청 주소
const platformUrl = (path: string): URL =>
  new URL(path, `${API_BASE_URL.replace(/\/+$/, '')}/`);

// 로그인, 계정 같은 jace-s.com 화면 주소
const siteUrl = (path: string): URL =>
  new URL(path, `${SITE_URL.replace(/\/+$/, '')}/`);

export const buildLoginUrl = (language: Language): string => {
  const url = siteUrl('/login');
  url.searchParams.set('lang', language);
  return url.toString();
};

export const buildAccountUrl = (): string => siteUrl('/account').toString();

export interface SessionUser {
  id: number | string;
  username: string;
  displayName: string;
}

export type SessionState =
  | { status: 'checking' }
  | { status: 'authenticated'; user: SessionUser; csrfToken: string | null }
  | { status: 'unauthenticated' }
  | { status: 'error' }; // 네트워크/응답 오류: 로그아웃으로 단정하지 않는다

// GET /auth/session (api.jace-s.com). 쿠키 값은 읽을 수 없고, 서버 판정만 사용한다
export const fetchSession = async (): Promise<SessionState> => {
  try {
    const response = await fetch(platformUrl('/auth/session').toString(), {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (response.status === 401) return { status: 'unauthenticated' };
    if (!response.ok) return { status: 'error' };

    const body = (await response.json()) as { user?: Record<string, unknown>; csrfToken?: unknown };
    const user = body?.user;
    if (!user || typeof user !== 'object') return { status: 'error' };

    const username = typeof user.username === 'string' ? user.username : '';
    const displayName =
      typeof user.displayName === 'string' && user.displayName ? user.displayName : username;
    const csrfToken =
      typeof body.csrfToken === 'string' && body.csrfToken ? body.csrfToken : null;

    return {
      status: 'authenticated',
      user: {
        id: user.id as number | string,
        username,
        displayName,
      },
      csrfToken,
    };
  } catch {
    return { status: 'error' };
  }
};
