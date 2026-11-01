import { API_BASE_URL } from '../config/api';

// jace-s.com /health?app=<id> 응답 계약 (schemaVersion 1)
const HEALTH_PATH = '/health';
const HEALTH_TIMEOUT_MS = 10000;
const SUPPORTED_SCHEMA_VERSION = 1;

export type ServiceStatus = 'operational' | 'maintenance' | 'unavailable' | 'unknown';

const KNOWN_STATUSES: ReadonlySet<string> = new Set([
  'operational',
  'maintenance',
  'unavailable',
  'unknown',
]);

export interface MaintenanceWindow {
  startsAt: string | null;
  expectedEndsAt: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  startsAt: string | null;
  endsAt: string | null;
  maintenanceFrom: string | null;
  maintenanceUntil: string | null;
}

export interface ServiceHealth {
  // 'unknown'은 서버가 unknown을 보낸 경우와, 응답을 해석할 수 없는 경우 모두 포함
  serviceStatus: ServiceStatus;
  message: string | null;
  maintenance: MaintenanceWindow | null;
  announcements: Announcement[];
}

export const UNKNOWN_HEALTH: ServiceHealth = {
  serviceStatus: 'unknown',
  message: null,
  maintenance: null,
  announcements: [],
};

// 빌드 설정의 등록 앱 ID. 양의 정수가 아니면 null (모든 앱 대상 공지만 받게 됨)
export const getNoticeAppId = (): number | null => {
  const raw = (process.env.REACT_APP_NOTICE_APP_ID || '').trim();
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
};

const buildHealthUrl = (appId: number | null): string => {
  const url = new URL(HEALTH_PATH, `${API_BASE_URL.replace(/\/+$/, '')}/`);
  if (appId !== null) {
    url.searchParams.set('app', String(appId));
  }
  return url.toString();
};

const asString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const parseMaintenance = (value: unknown): MaintenanceWindow | null => {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  return {
    startsAt: asString(v.startsAt),
    expectedEndsAt: asString(v.expectedEndsAt),
  };
};

const parseAnnouncements = (value: unknown): Announcement[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item, index) => ({
      id: item.id !== undefined && item.id !== null ? String(item.id) : `announcement-${index}`,
      title: asString(item.title) ?? '',
      content: asString(item.content) ?? '',
      startsAt: asString(item.startsAt),
      endsAt: asString(item.endsAt),
      maintenanceFrom: asString(item.maintenanceFrom),
      maintenanceUntil: asString(item.maintenanceUntil),
    }))
    .filter(a => a.title || a.content);
};

// 응답 본문을 해석한다. 계약과 다르면 UNKNOWN_HEALTH
export const parseHealthResponse = (body: unknown): ServiceHealth => {
  if (!body || typeof body !== 'object') return UNKNOWN_HEALTH;
  const b = body as Record<string, unknown>;

  if (b.schemaVersion !== SUPPORTED_SCHEMA_VERSION) return UNKNOWN_HEALTH;
  if (typeof b.serviceStatus !== 'string' || !KNOWN_STATUSES.has(b.serviceStatus)) {
    return UNKNOWN_HEALTH;
  }

  return {
    serviceStatus: b.serviceStatus as ServiceStatus,
    message: asString(b.message),
    maintenance: parseMaintenance(b.maintenance),
    announcements: parseAnnouncements(b.announcements),
  };
};

// 앱 진입 시 1회 호출. credentials 없이 보내고, 503이어도 본문을 읽는다
export const fetchServiceHealth = async (): Promise<ServiceHealth> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

  try {
    const response = await fetch(buildHealthUrl(getNoticeAppId()), {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller.signal,
    });
    const body = await response.json();
    return parseHealthResponse(body);
  } catch {
    return UNKNOWN_HEALTH;
  } finally {
    window.clearTimeout(timeoutId);
  }
};
