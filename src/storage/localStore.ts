// שכבת האחסון המקומי - "מסד הנתונים" של האפליקציה על המכשיר. נבחר במכוון
// לא להשתמש בספריית SQLite נייטיבית (כמו react-native-sqlite-storage) אלא
// ב-AsyncStorage עם בלוק JSON אחד לכל ישות, בדיוק כמו העיצוב של השרת עצמו
// (קובץ studio.json יחיד ב-lib/db.js) - כמות הנתונים של סטודיו צילום אחד
// (מאות רשומות לכל היותר בכל ישות) קטנה בהרבה מהיקף שבו צריך אינדוקס SQL
// אמיתי, וזה מוריד תלות נייטיבית אחת שיכולה לגרום לכשלי בנייה שאי אפשר
// לבדוק מראש בסביבה הזו.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { entityStorageKey, pendingStorageKey } from '../config';
import { EntityName, GenericRecord } from '../types/entities';

export type PendingAction = 'create' | 'update' | 'delete';

export interface PendingChange {
  // מזהה זמני שנוצר במכשיר לרשומה חדשה שעדיין לא אושרה מהשרת (רק ב-create)
  local_id?: string;
  // מזהה השרת - קיים תמיד חוץ מ-create של רשומה חדשה שטרם נשלחה בהצלחה
  id?: number;
  action: PendingAction;
  // עבור create/update - שדות הרשומה שהשתנו (לא כולל שדות בקרה)
  fields?: Record<string, any>;
  // חותמת הזמן של הרשומה כפי שהייתה ידועה למכשיר לפני העריכה המקומית -
  // משמשת את השרת לזיהוי התנגשויות (ראו lib/mobileSync.js/push).
  base_updated_at?: string;
}

function genLocalId(): string {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: any): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// --- קריאה/כתיבה של המראה המקומית של ישות (הנתונים "האמיתיים" כפי שנמשכו
// לאחרונה מהשרת, ממוזגים עם עריכות מקומיות שעדיין לא סונכרנו) ---

export async function getEntityRecords(entity: EntityName): Promise<GenericRecord[]> {
  return readJson<GenericRecord[]>(entityStorageKey(entity), []);
}

export async function setEntityRecords(entity: EntityName, records: GenericRecord[]): Promise<void> {
  await writeJson(entityStorageKey(entity), records);
}

// ממזג רשומות שהתקבלו מהשרת (pull) לתוך המראה המקומית - מחליף רשומות עם
// אותו id, ומוסיף חדשות. לא נוגע ברשומות שלא הוזכרו (הן פשוט לא השתנו).
export async function upsertEntityRecords(entity: EntityName, incoming: GenericRecord[]): Promise<void> {
  if (incoming.length === 0) return;
  const current = await getEntityRecords(entity);
  const byId = new Map(current.map((r) => [r.id, r]));
  for (const rec of incoming) byId.set(rec.id, rec);
  await setEntityRecords(entity, Array.from(byId.values()));
}

export async function removeEntityRecordsByIds(entity: EntityName, ids: number[]): Promise<void> {
  if (ids.length === 0) return;
  const idSet = new Set(ids);
  const current = await getEntityRecords(entity);
  await setEntityRecords(
    entity,
    current.filter((r) => !idSet.has(r.id)),
  );
}

// --- תור השינויים המקומיים שממתינים לסנכרון (push) - כל עריכה/יצירה/מחיקה
// שנעשית באפליקציה, גם כשאין אינטרנט, נרשמת כאן קודם, ורק אז מוחלת על
// המראה המקומית כדי שהמסך יתעדכן מיד ("optimistic update") ---

export async function getPendingChanges(entity: EntityName): Promise<PendingChange[]> {
  return readJson<PendingChange[]>(pendingStorageKey(entity), []);
}

export async function setPendingChanges(entity: EntityName, changes: PendingChange[]): Promise<void> {
  await writeJson(pendingStorageKey(entity), changes);
}

export async function hasPendingChanges(entities: EntityName[]): Promise<boolean> {
  for (const entity of entities) {
    const pending = await getPendingChanges(entity);
    if (pending.length > 0) return true;
  }
  return false;
}

// יוצר רשומה חדשה מקומית: מוסיף אותה מיד למראה המקומית (עם מזהה זמני שלילי
// כדי שלא יתנגש עם מזהי שרת אמיתיים), ומוסיף פריט "create" לתור הסנכרון.
export async function createLocalRecord(entity: EntityName, fields: Record<string, any>): Promise<GenericRecord> {
  const local_id = genLocalId();
  const now = new Date().toISOString();
  // מזהה זמני שלילי-פסאודו (מבוסס hash של המחרוזת) כדי שהמסכים יוכלו
  // להתייחס לרשומה כאילו יש לה id רגיל, עד שהשרת יקצה לה מזהה אמיתי.
  const tempId = -Math.abs(hashString(local_id));
  const record: GenericRecord = { id: tempId, ...fields, created_at: now, updated_at: now, _local_id: local_id, _pending: true };

  const current = await getEntityRecords(entity);
  await setEntityRecords(entity, [...current, record]);

  const pending = await getPendingChanges(entity);
  pending.push({ local_id, action: 'create', fields });
  await setPendingChanges(entity, pending);

  return record;
}

export async function updateLocalRecord(entity: EntityName, id: number, fields: Record<string, any>): Promise<void> {
  const current = await getEntityRecords(entity);
  const idx = current.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const existing = current[idx];
  const baseUpdatedAt = existing.updated_at;
  const updated = { ...existing, ...fields, updated_at: new Date().toISOString(), _pending: true };
  current[idx] = updated;
  await setEntityRecords(entity, current);

  // אם הרשומה עצמה עוד לא סונכרנה (id זמני, יש לה local_id ב-pending
  // create) - רק מעדכנים את השדות בפעולת ה-create הממתינה, לא מוסיפים
  // פעולת update נפרדת (עדיין לא נוצרה בשרת בכלל).
  const pending = await getPendingChanges(entity);
  const pendingCreateIdx = pending.findIndex((p) => p.action === 'create' && existing._local_id && p.local_id === existing._local_id);
  if (pendingCreateIdx !== -1) {
    pending[pendingCreateIdx].fields = { ...pending[pendingCreateIdx].fields, ...fields };
  } else {
    const existingUpdateIdx = pending.findIndex((p) => p.action === 'update' && p.id === id);
    if (existingUpdateIdx !== -1) {
      pending[existingUpdateIdx].fields = { ...pending[existingUpdateIdx].fields, ...fields };
    } else {
      pending.push({ id, action: 'update', fields, base_updated_at: baseUpdatedAt });
    }
  }
  await setPendingChanges(entity, pending);
}

export async function deleteLocalRecord(entity: EntityName, id: number): Promise<void> {
  const current = await getEntityRecords(entity);
  const existing = current.find((r) => r.id === id);
  await setEntityRecords(
    entity,
    current.filter((r) => r.id !== id),
  );

  const pending = await getPendingChanges(entity);
  if (existing && existing._local_id) {
    // הרשומה נוצרה מקומית ועוד לא הגיעה לשרת בכלל - פשוט מבטלים את ה-create
    // הממתין, אין צורך לשלוח מחיקה על משהו שלא קיים בשרת.
    await setPendingChanges(
      entity,
      pending.filter((p) => p.local_id !== existing._local_id),
    );
    return;
  }
  const filtered = pending.filter((p) => p.id !== id);
  filtered.push({ id, action: 'delete' });
  await setPendingChanges(entity, filtered);
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h || 1;
}
