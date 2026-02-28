import { API_BASE_URL } from '../config/api';

const HEALTH_PATH = '/external/health/gpt-3d-visualizer';
const HEALTH_TIMEOUT_MS = 5000;

const buildHealthUrl = (): string => {
  return new URL(HEALTH_PATH, `${API_BASE_URL.replace(/\/+$/, '')}/`).toString();
};

export const prewarmServer = (): void => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  fetch(buildHealthUrl(), {
    method: 'GET',
    signal: controller.signal,
    cache: 'no-store',
  })
    .catch(() => {
      // Best-effort prewarm: ignore failures.
    })
    .finally(() => {
      window.clearTimeout(timeoutId);
    });
};

