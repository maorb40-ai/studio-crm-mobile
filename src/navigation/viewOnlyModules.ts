// רשימת המודולים "לצפייה בלבד" בשלב זה (ראו lib/mobileSync.js בשרת -
// SYNC_ENTITIES עם canWrite:false) - כל אחד עם כותרת בעברית, אייקון, ואילו
// שדות להציג בכל שורה ברשימה (בלי לדעת/להניח על שאר השדות). זה מה שהופך
// את מסך ViewOnlyListScreen לגנרי - לא צריך מסך נפרד לכל מודול.
import { EntityName } from '../types/entities';
import { ViewOnlyField } from './types';

export interface ViewOnlyModule {
  entity: EntityName;
  title: string;
  icon: string;
  fields: ViewOnlyField[];
}

export const VIEW_ONLY_MODULES: ViewOnlyModule[] = [
  { entity: 'quotes', title: 'הצעות מחיר', icon: '💰', fields: [{ key: 'title', label: 'כותרת' }, { key: 'total', label: 'סכום' }, { key: 'status', label: 'סטטוס' }] },
  { entity: 'contracts', title: 'חוזים', icon: '📄', fields: [{ key: 'title', label: 'כותרת' }, { key: 'status', label: 'סטטוס' }] },
  { entity: 'receipts', title: 'קבלות', icon: '🧾', fields: [{ key: 'receipt_number', label: 'מס׳' }, { key: 'date', label: 'תאריך' }, { key: 'amount', label: 'סכום' }] },
  { entity: 'expenses', title: 'הוצאות', icon: '💸', fields: [{ key: 'category', label: 'קטגוריה' }, { key: 'amount', label: 'סכום' }, { key: 'date', label: 'תאריך' }] },
  { entity: 'galleries', title: 'גלריות', icon: '🖼️', fields: [{ key: 'title', label: 'כותרת' }] },
  { entity: 'testimonials', title: 'המלצות', icon: '⭐', fields: [{ key: 'status', label: 'סטטוס' }] },
  { entity: 'equipment_items', title: 'ציוד', icon: '🎒', fields: [{ key: 'name', label: 'שם' }, { key: 'status', label: 'סטטוס' }] },
  { entity: 'social_posts', title: 'תוכן שיווקי', icon: '📱', fields: [{ key: 'platform', label: 'פלטפורמה' }, { key: 'status', label: 'סטטוס' }] },
  { entity: 'landing_pages', title: 'דפי נחיתה', icon: '🌐', fields: [{ key: 'title', label: 'כותרת' }] },
  { entity: 'materials', title: 'חומרי שיווק', icon: '📁', fields: [{ key: 'title', label: 'כותרת' }] },
  { entity: 'portfolio_items', title: 'תיק עבודות', icon: '📷', fields: [{ key: 'category', label: 'קטגוריה' }, { key: 'caption', label: 'כיתוב' }] },
  { entity: 'inspiration_items', title: 'דוגמאות', icon: '💡', fields: [{ key: 'category', label: 'קטגוריה' }, { key: 'title', label: 'כותרת' }] },
  { entity: 'phonebook_contacts', title: 'ספר טלפונים', icon: '📇', fields: [{ key: 'name', label: 'שם' }] },
];
