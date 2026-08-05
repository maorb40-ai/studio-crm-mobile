// מפתחות אחסון מקומי (AsyncStorage) - כל המידע נשמר תחת מפתחות עם קידומת
// אחידה כדי שיהיה קל לנקות הכל (למשל בהתנתקות) בלי לפגוע במידע של אפליקציות
// אחרות במכשיר.
export const STORAGE_PREFIX = 'studioCrm:';
export const AUTH_STORAGE_KEY = STORAGE_PREFIX + 'auth';
export const META_STORAGE_KEY = STORAGE_PREFIX + 'meta';

export function entityStorageKey(entity: string): string {
  return STORAGE_PREFIX + 'data:' + entity;
}

export function pendingStorageKey(entity: string): string {
  return STORAGE_PREFIX + 'pending:' + entity;
}
