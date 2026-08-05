// הגדרות - כתובת השרת המחוברת, סנכרון ידני, והתנתקות. התנתקות רק מוחקת את
// פרטי ההתחברות מהמכשיר (הטוקן/כתובת) - לא מוחקת שום מידע מקומי שכבר
// הסתנכרן, כדי שלא לאבד בטעות עריכות שעוד לא נשלחו לשרת.
import React from 'react';
import { ScreenContainer, ScreenTitle, AppText, AppButton, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';

export default function SettingsScreen() {
  const { auth, logout } = useAuth();
  const { syncing, lastSyncAt, syncNow } = useSync();

  return (
    <ScreenContainer>
      <ScreenTitle>הגדרות</ScreenTitle>
      <Card>
        <AppText muted>עסק</AppText>
        <AppText bold>{auth?.businessName || '—'}</AppText>
        <AppText muted style={{ marginTop: 8 }}>כתובת שרת</AppText>
        <AppText>{auth?.serverUrl || '—'}</AppText>
        <AppText muted style={{ marginTop: 8 }}>סנכרון אחרון</AppText>
        <AppText>{lastSyncAt ? new Date(lastSyncAt).toLocaleString('he-IL') : 'טרם בוצע'}</AppText>
      </Card>
      <AppButton title={syncing ? 'מסנכרן...' : 'סנכרון עכשיו'} onPress={syncNow} loading={syncing} secondary />
      <AppButton title="התנתקות" danger onPress={logout} />
    </ScreenContainer>
  );
}
