// מסך הבית - מרכז ניווט לכל המודולים, בדיוק כמו הדשבורד באתר. מציג גם את
// סטטוס הסנכרון (מתי הסתנכרן לאחרונה, האם רץ עכשיו, האם יש התנגשויות).
import React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer, ScreenTitle, AppText, AppButton, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { RootStackParamList } from '../navigation/types';
import { VIEW_ONLY_MODULES } from '../navigation/viewOnlyModules';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDate(iso: string): string {
  if (!iso) return 'עדיין לא בוצע סנכרון';
  try {
    return new Date(iso).toLocaleString('he-IL');
  } catch {
    return iso;
  }
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { auth } = useAuth();
  const { syncing, lastSyncAt, lastError, conflicts, syncNow } = useSync();

  return (
    <ScrollView>
      <ScreenContainer>
        <ScreenTitle>{auth?.businessName || 'CRM מתי'}</ScreenTitle>

        <Card>
          <AppText bold>סנכרון</AppText>
          <AppText muted style={{ marginTop: 4 }}>עודכן לאחרונה: {formatDate(lastSyncAt)}</AppText>
          {!!lastError && <AppText style={{ color: '#e0555f', marginTop: 4 }}>{lastError}</AppText>}
          {conflicts.length > 0 && (
            <AppText style={{ color: '#d0a028', marginTop: 4 }}>
              יש {conflicts.length} התנגשויות שממתינות לבדיקה - רשומה שהשתנתה גם באתר וגם במכשיר
            </AppText>
          )}
          <AppButton title={syncing ? 'מסנכרן...' : 'סנכרון עכשיו'} onPress={syncNow} loading={syncing} secondary />
        </Card>

        <Card>
          <AppText bold style={{ marginBottom: 8 }}>ניהול (עריכה מלאה, כולל בלי אינטרנט)</AppText>
          <AppButton title="👤 לקוחות" onPress={() => navigation.navigate('ClientsList')} />
          <AppButton title="✅ משימות" onPress={() => navigation.navigate('Tasks')} />
        </Card>

        <Card>
          <AppText bold style={{ marginBottom: 8 }}>צפייה (שאר המודולים - עריכה תתווסף בהמשך)</AppText>
          {VIEW_ONLY_MODULES.map((m) => (
            <AppButton
              key={m.entity}
              title={m.icon + ' ' + m.title}
              secondary
              onPress={() => navigation.navigate('ViewOnlyList', { entity: m.entity, title: m.title, fields: m.fields })}
            />
          ))}
        </Card>

        <AppButton title="⚙ הגדרות והתנתקות" secondary onPress={() => navigation.navigate('Settings')} />
      </ScreenContainer>
    </ScrollView>
  );
}
