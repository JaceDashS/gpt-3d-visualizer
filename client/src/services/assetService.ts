import { AssetsManifest, ProfileOverviewData } from '../types/assets';

const MANIFEST_PATH = '/manifest.json';
const FETCH_TIMEOUT_MS = 8000;

function getAssetsUrl(): string {
  // REACT_APP_ASSETS_URL 환경 변수 사용, 없으면 현재 origin 사용
  const url = process.env.REACT_APP_ASSETS_URL || '';
  return url.replace(/\/$/, '') || window.location.origin;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getAssetUrl(basePath: string, fileName: string): string {
  const assetsUrl = getAssetsUrl();
  // basePath 정규화: 앞뒤 슬래시 제거
  const normalizedBasePath = basePath.replace(/^\/+|\/+$/g, '');
  // fileName 정규화: 앞 슬래시 제거
  const normalizedFileName = fileName.replace(/^\/+/, '');
  
  // 슬래시를 하나만 사용하여 조합
  let finalUrl: string;
  if (normalizedBasePath) {
    finalUrl = `${assetsUrl}/${normalizedBasePath}/${normalizedFileName}`;
  } else {
    finalUrl = `${assetsUrl}/${normalizedFileName}`;
  }
  return finalUrl;
}

export async function fetchAssetsManifest(): Promise<AssetsManifest | null> {
  try {
    const assetsUrl = getAssetsUrl();
    const manifestUrl = `${assetsUrl}${MANIFEST_PATH}`;
    
    const response = await fetchWithTimeout(
      manifestUrl,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
      FETCH_TIMEOUT_MS
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch manifest: ${response.status}`);
      return null;
    }
    
    const manifest: AssetsManifest = await response.json();
    return manifest;
  } catch (error) {
    console.error('Error fetching manifest:', error);
    return null;
  }
}

export async function fetchProfileOverview(manifest: AssetsManifest): Promise<ProfileOverviewData | null> {
  try {
    if (!manifest || !manifest.sets) {
      return null;
    }

    const profileOverviewData = manifest.sets.data?.profileOverview;
    if (!profileOverviewData) {
      return null;
    }

    const profileOverviewUrl = getAssetUrl(profileOverviewData.basePath, profileOverviewData.file);
    const response = await fetchWithTimeout(profileOverviewUrl, {}, FETCH_TIMEOUT_MS);
    
    if (!response.ok) {
        console.error(`Failed to fetch profile overview: ${response.status}`);
      return null;
    }

    const data: ProfileOverviewData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile overview:', error);
    return null;
  }
}

