// מסך רשימה גנרי לכל מודול "לצפייה בלבד" - לא יודע כלום ספציפית על
// לקוחות/גלריות/חוזים וכו', רק מקבל את שם הישות ואילו שדות להציג (דרך
// route.params, ראו src/navigation/viewOnlyModules.ts). הנתונים תמיד
// מהמראה המקומית (עובד גם בלי אינטרנט) - עריכה עוד לא נתמכת למודולים האלה.
import React from 'react';
import { FlatList } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ScreenContainer, ScreenTitle, AppText, Card } from '../components/ui';
import { useEntity } from '../hooks/useEntity';
import { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'ViewOnlyList'>;

export default function ViewOnlyListScreen() {
  const { params } = useRoute<Route>();
  const { records, loading } = useEntity(params.entity);

  return (
    <ScreenContainer>
      <ScreenTitle>{params.title} ({records.length})</ScreenTitle>
      {loading ? (
        <AppText muted>טוען...</AppText>
      ) : records.length === 0 ? (
        <AppText muted>אין עדיין נתונים - ודאו שבוצע סנכרון (במסך הבית).</AppText>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Card>
              {params.fields.map((f) => (
                <AppText key={f.key} muted={!item[f.key]}>
                  {f.label}: {item[f.key] != null && item[f.key] !== '' ? String(item[f.key]) : '—'}
                </AppText>
              ))}
            </Card>
          )}
        />
      )}
    </ScreenContainer>
  );
}
