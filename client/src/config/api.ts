export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000, // 10초
} as const;

export const API_BASE_URL = API_CONFIG.baseURL;

