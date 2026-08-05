// מנוע הסנכרון - הלב של יכולת העבודה בלי אינטרנט. סדר הפעולות בכל סנכרון:
// 1) דוחפים (push) קודם את כל השינויים המקומיים הממתינים, ישות אחר ישות.
// 2) רק אחר כך מושכים (pull) מה שהשתנה בשרת מאז הסנכרון האחרון, וממזגים
//    למראה המקומית.
// הסדר הזה חשוב: אם היינו מושכים קודם, יכולנו לדרוס בטעות עריכה מקומית
// שעדיין לא נשלחה עם גרסה ישנה יותר מהשרת.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { META_STORAGE_KEY } from '../config';
import { pullFromServer, pushToServer, PushResultItem } from '../api/mobileApi';
import {
  getEntityRecords,
  setEntityRecords,
  getPendingChanges,
  setPendingChanges,
  upsertEntityRecords,
  removeEntityRecordsByIds,
} from '../storage/localStore';
import { EntityName, WRITABLE_ENTITIES } from '../types/entities';

export interface SyncMeta {
  lastSyncAt: string;
}

export interface SyncConflict {
  entity: EntityName;
  id: number;
  serverRecord: any;
}

export interface SyncResult {
  ok: boolean;
  error?: string;
  pushedCount: number;
  pulledCount: number;
  conflicts: SyncConflict[];
}

async function getMeta(): Promise<SyncMeta> {
  const raw = await AsyncStorage.getItem(META_STORAGE_KEY);
  if (!raw) return { lastSyncAt: '' };
  try {
    return JSON.parse(raw);
  } catch {
    return { lastSyncAt: '' };
  }
}

async function setMeta(meta: SyncMeta): Promise<void> {
  await AsyncStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
}

// מיישם את תוצאות ה-push על המראה המקומית: רשומה שנוצרה מקבלת עכשיו את
// המזהה האמיתי מהשרת (במקום המזהה הזמני), רשומה שעודכנה מקבלת את הגרסה
// המלאה שהשרת שמר, ורשומה שנמחקה מוסרת. התנגשויות לא מוחלות אוטומטית -
// הן נאספות ומוחזרות לקריאה של המסך (המשתמש יחליט אם לדרוס או לוותר).
async function applyPushResults(entity: EntityName, results: PushResultItem[]): Promise<SyncConflict[]> {
  const conflicts: SyncConflict[] = [];
  const current = await getEntityRecords(entity);
  let changed = false;

  // מפה לפי local_id של רשומות זמניות שממתינות להחלפה במזהה אמיתי
  const byLocalId = new Map(current.filter((r) => r._local_id).map((r) => [r._local_id, r]));

  const nextRecords = [...current];
  for (const r of results) {
    if (r.status === 'created' && r.record && r.local_id) {
      const tempRecord = byLocalId.get(r.local_id);
      const idx = tempRecord ? nextRecords.findIndex((rec) => rec === tempRecord) : -1;
      if (idx !== -1) {
        nextRecords[idx] = r.record;
        changed = true;
      }
    } else if (r.status === 'updated' && r.record && r.server_id) {
      const idx = nextRecords.findIndex((rec) => rec.id === r.server_id);
      if (idx !== -1) {
        nextRecords[idx] = r.record;
        changed = true;
      }
    } else if (r.status === 'deleted' && r.server_id) {
      const idx = nextRecords.findIndex((rec) => rec.id === r.server_id);
      if (idx !== -1) {
        nextRecords.splice(idx, 1);
        changed = true;
      }
    } else if (r.status === 'conflict' && r.record && r.server_id) {
      conflicts.push({ entity, id: r.server_id, serverRecord: r.record });
    }
    // status "not_found"/"error" - נשארים ב-pending כדי שאפשר יהיה לנסות
    // שוב או שהמסך יציג שגיאה; לא נוגעים במראה המקומית.
  }

  if (changed) await setEntityRecords(entity, nextRecords);
  return conflicts;
}

// אחרי push - מסירים מתור ה-pending רק את מה שבאמת הצליח (created/updated/
// deleted). מה שנכשל (conflict/error/not_found) נשאר, כדי שניסיון הסנכרון
// הבא ינסה שוב (או עד שהמשתמש יפתור את ההתנגשות באופן מפורש).
async function clearAppliedPending(entity: EntityName, results: PushResultItem[]): Promise<void> {
  const pending = await getPendingChanges(entity);
  const succeededLocalIds = new Set(results.filter((r) => r.status === 'created').map((r) => r.local_id));
  const succeededIds = new Set(
    results.filter((r) => r.status === 'updated' || r.status === 'deleted').map((r) => r.server_id),
  );
  const remaining = pending.filter((p) => {
    if (p.local_id && succeededLocalIds.has(p.local_id)) return false;
    if (p.id && succeededIds.has(p.id)) return false;
    return true;
  });
  await setPendingChanges(entity, remaining);
}

async function pushEntity(baseUrl: string, token: string, entity: EntityName): Promise<{ pushed: number; conflicts: SyncConflict[] }> {
  const pending = await getPendingChanges(entity);
  if (pending.length === 0) return { pushed: 0, conflicts: [] };

  const records = pending.map((p) => {
    if (p.action === 'delete') return { id: p.id, _deleted: true };
    if (p.action === 'create') return { local_id: p.local_id, ...p.fields };
    return { id: p.id, base_updated_at: p.base_updated_at, ...p.fields };
  });

  const results = await pushToServer(baseUrl, token, entity, records);
  const conflicts = await applyPushResults(entity, results);
  await clearAppliedPending(entity, results);
  return { pushed: results.filter((r) => r.status === 'created' || r.status === 'updated' || r.status === 'deleted').length, conflicts };
}

async function pullEntities(baseUrl: string, token: string, since: string): Promise<number> {
  const resp = await pullFromServer(baseUrl, token, since);
  let pulledCount = 0;
  for (const [entity, records] of Object.entries(resp.data)) {
    if (Array.isArray(records) && records.length > 0) {
      await upsertEntityRecords(entity as EntityName, records);
      pulledCount += records.length;
    }
  }
  // מצבות מחיקה - מסירים מהמראה המקומית רשומות שנמחקו בשרת (למשל דרך
  // האתר) מאז הסנכרון האחרון, מקובצות לפי ישות.
  const deletedByEntity = new Map<EntityName, number[]>();
  for (const d of resp.deleted) {
    const list = deletedByEntity.get(d.entity) || [];
    list.push(d.id);
    deletedByEntity.set(d.entity, list);
  }
  for (const [entity, ids] of deletedByEntity) {
    await removeEntityRecordsByIds(entity, ids);
  }
  await setMeta({ lastSyncAt: resp.server_time });
  return pulledCount;
}

export async function runFullSync(baseUrl: string, token: string): Promise<SyncResult> {
  try {
    let pushedCount = 0;
    const allConflicts: SyncConflict[] = [];
    for (const entity of WRITABLE_ENTITIES) {
      const { pushed, conflicts } = await pushEntity(baseUrl, token, entity);
      pushedCount += pushed;
      allConflicts.push(...conflicts);
    }

    const meta = await getMeta();
    const pulledCount = await pullEntities(baseUrl, token, meta.lastSyncAt);

    return { ok: true, pushedCount, pulledCount, conflicts: allConflicts };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'שגיאת סנכרון לא ידועה', pushedCount: 0, pulledCount: 0, conflicts: [] };
  }
}

export async function getLastSyncAt(): Promise<string> {
  const meta = await getMeta();
  return meta.lastSyncAt;
}
