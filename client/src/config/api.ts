export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  apiPrefix: process.env.REACT_APP_API_PREFIX || '/api',
  timeout: 10000, // 10초
} as const;

export const API_BASE_URL = API_CONFIG.baseURL;
export const API_PREFIX = API_CONFIG.apiPrefix;

// jace-s.com 화면 주소 (로그인, 계정, 댓글 페이지). API 주소(api.jace-s.com)와 다르다. 없으면 API 주소를 쓴다
export const SITE_URL = process.env.REACT_APP_SITE_URL || API_BASE_URL;

// GitHub Assets 설정
const ASSETS_BASE_URL = process.env.REACT_APP_ASSETS_BASE_URL || '';
export const ASSETS_CONFIG = {
  baseURL: ASSETS_BASE_URL,
  profileImage: `${ASSETS_BASE_URL}/img/profile.jpg`,
  profileOverview: `${ASSETS_BASE_URL}/json/profile-overview.json`,
} as const;

