// עטיפה דקה סביב נקודות הקצה /api/mobile/* בשרת (ראו app/api/mobile ב-
// F:\studio-crm). baseUrl הוא כתובת השרת שמתי מגדיר במסך ההגדרות - לרוב
// כתובת ה-ngrok הקבועה שכבר מוגדרת למערכת, או כתובת רשת מקומית (LAN).
import { EntityName } from '../types/entities';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

export async function loginToServer(baseUrl: string, password: string): Promise<{ token: string; business_name: string }> {
  const res = await fetch(normalizeBaseUrl(baseUrl) + '/api/mobile/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || 'שגיאה בהתחברות לשרת', res.status);
  }
  return data;
}

export interface PullResponse {
  server_time: string;
  data: Record<EntityName, any[]>;
  deleted: { entity: EntityName; id: number; deleted_at: string }[];
  writable_entities: EntityName[];
}

export async function pullFromServer(baseUrl: string, token: string, since: string): Promise<PullResponse> {
  const url = normalizeBaseUrl(baseUrl) + '/api/mobile/sync/pull' + (since ? '?since=' + encodeURIComponent(since) : '');
  const res = await fetch(url, {
    headers: { Authorization: 'Bearer ' + token },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || 'שגיאה במשיכת נתונים מהשרת', res.status);
  }
  return data as PullResponse;
}

export interface PushResultItem {
  local_id?: string | null;
  server_id?: number;
  status: 'created' | 'updated' | 'deleted' | 'conflict' | 'not_found' | 'error';
  record?: any;
  error?: string;
}

export async function pushToServer(
  baseUrl: string,
  token: string,
  entity: EntityName,
  records: any[],
): Promise<PushResultItem[]> {
  const res = await fetch(normalizeBaseUrl(baseUrl) + '/api/mobile/sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ entity, records }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || 'שגיאה בשליחת שינויים לשרת', res.status);
  }
  return data.results as PushResultItem[];
}
