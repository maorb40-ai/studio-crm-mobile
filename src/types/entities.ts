// טיפוסי הישויות המסונכרנות - תואמים בדיוק למבנה הנתונים בשרת (lib/db.js
// ב-F:\studio-crm). לא כל שדה מיוצג כאן - רק מה שהאפליקציה משתמשת בו
// בפועל; שדות לא-מוכרים שמגיעים מהשרת פשוט נשמרים כמו שהם (any נוסף).

export type EntityName =
  | 'clients'
  | 'sessions'
  | 'tasks'
  | 'children'
  | 'quotes'
  | 'contracts'
  | 'receipts'
  | 'expenses'
  | 'galleries'
  | 'testimonials'
  | 'equipment_items'
  | 'social_posts'
  | 'landing_pages'
  | 'materials'
  | 'portfolio_items'
  | 'inspiration_items'
  | 'phonebook_contacts';

// ישויות שניתנות לעריכה/יצירה מהמכשיר (push) - תואם בדיוק לרשימת
// SYNC_ENTITIES עם canWrite:true ב-lib/mobileSync.js בשרת. ישויות אחרות
// הן לצפייה בלבד בשלב הנוכחי.
export const WRITABLE_ENTITIES: EntityName[] = ['clients', 'sessions', 'tasks'];

export interface Client {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  address?: string;
  session_type?: string;
  loyalty_status?: string;
  client_type?: string;
  notes?: string;
  tags?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Session {
  id: number;
  client_id: number;
  session_date: string;
  session_time?: string;
  occasion_type?: string;
  location?: string;
  details?: string;
  amount_charged?: number;
  amount_paid?: number;
  payment_status?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Task {
  id: number;
  text: string;
  due_date?: string;
  done?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// רשומה גנרית לישויות לצפייה-בלבד - לא יודעים/לא צריך לדעת את כל השדות
// מראש כדי להציג רשימה בסיסית.
export interface GenericRecord {
  id: number;
  [key: string]: any;
}
