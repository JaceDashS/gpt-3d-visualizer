import { API_BASE_URL } from '../config/api';

// jace-s.com 계약: /health는 서버 생존 확인, /notices?app=<id>는 공지 목록 (schemaVersion 1)
const HEALTH_PATH = '/health';
const NOTICES_PATH = '/notices';
const REQUEST_TIMEOUT_MS = 10000;
const SUPPORTED_SCHEMA_VERSION = 1;
// 모든 앱이 같은 고정 문구를 쓴다
const OUTAGE_MESSAGE = 'Unable to connect to the server.';

// 서버는 더 이상 maintenance를 보내지 않지만, 화면 코드가 아직 이 값을 확인하므로 타입에 남겨 둔다
export type ServiceStatus = 'operational' | 'maintenance' | 'unavailable' | 'unknown';

export interface MaintenanceWindow {
  startsAt: string | null;
  expectedEndsAt: string | null;
}

// 공지는 제목만 있다. 게시한 때부터 관리자가 종료할 때까지 내려온다
export interface Announcement {
  id: string;
  title: string;
}

export interface ServiceHealth {
  // /health에 응답이 없거나 200이 아니면 'unknown'
  serviceStatus: ServiceStatus;
  message: string | null;
  maintenance: MaintenanceWindow | null;
  announcements: Announcement[];
}

// 빌드 설정의 등록 앱 ID. 양의 정수가 아니면 null (모든 앱 대상 공지만 받게 됨)
export const getNoticeAppId = (): number | null => {
  const raw = (process.env.REACT_APP_NOTICE_APP_ID || '').trim();
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
};

const buildUrl = (path: string, appId: number | null = null): string => {
  const url = new URL(path, `${API_BASE_URL.replace(/\/+$/, '')}/`);
  if (appId !== null) {
    url.searchParams.set('app', String(appId));
  }
  return url.toString();
};

// /notices 응답 본문을 해석한다. 계약과 다르면 공지 없음
export const parseNoticesResponse = (body: unknown): Announcement[] => {
  if (!body || typeof body !== 'object') return [];
  const b = body as Record<string, unknown>;
  if (b.schemaVersion !== SUPPORTED_SCHEMA_VERSION || !Array.isArray(b.announcements)) return [];
  return b.announcements
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item, index) => ({
      id: item.id !== undefined && item.id !== null ? String(item.id) : `announcement-${index}`,
      title: typeof item.title === 'string' ? item.title : '',
    }))
    .filter(a => a.title);
};

// 앱 진입 시 /health와 /notices를 1회씩 호출한다. 둘 다 credentials 없이 보낸다
export const fetchServiceHealth = async (): Promise<ServiceHealth> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const request = (url: string) => fetch(url, { method: 'GET', credentials: 'omit', cache: 'no-store', signal: controller.signal });

  try {
    const [reachable, announcements] = await Promise.all([
      // 200이 아니거나 응답이 없으면 서버에 연결할 수 없는 것으로 본다
      request(buildUrl(HEALTH_PATH)).then(response => response.ok, () => false),
      // 공지는 서버가 꺼져 있어도 Cloudflare Worker가 답한다. 받지 못하면 공지 없이 상태만 보여준다
      request(buildUrl(NOTICES_PATH, getNoticeAppId()))
        .then(response => (response.ok ? response.json() : null))
        .then(parseNoticesResponse, () => [] as Announcement[]),
    ]);
    return {
      serviceStatus: reachable ? 'operational' : 'unknown',
      message: reachable ? null : OUTAGE_MESSAGE,
      maintenance: null,
      announcements,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
};
