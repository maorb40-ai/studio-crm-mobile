// רשימת לקוחות - חיפוש, הוספת לקוח חדש, מעבר לכרטיס לקוח. עובד תמיד מול
// המראה המקומית (useEntity) - גם בלי אינטרנט אפשר להוסיף לקוח חדש; הוא
// יסתנכרן לשרת אוטומטית בהזדמנות הראשונה שיש רשת.
import React, { useMemo, useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer, ScreenTitle, AppText, AppTextInput, AppButton, Card } from '../components/ui';
import { useEntity } from '../hooks/useEntity';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ClientsListScreen() {
  const navigation = useNavigation<Nav>();
  const { records, loading, create } = useEntity('clients');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...records].sort((a, b) => String(a.full_name || '').localeCompare(String(b.full_name || ''), 'he'));
    if (!q) return sorted;
    return sorted.filter(
      (c) => String(c.full_name || '').toLowerCase().includes(q) || String(c.phone || '').includes(q),
    );
  }, [records, query]);

  async function handleAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    await create({ full_name: newName.trim(), phone: newPhone.trim() });
    setSaving(false);
    setNewName('');
    setNewPhone('');
    setAdding(false);
  }

  return (
    <ScreenContainer>
      <ScreenTitle>לקוחות ({records.length})</ScreenTitle>
      <AppTextInput placeholder="חיפוש לפי שם או טלפון..." value={query} onChangeText={setQuery} />

      {adding ? (
        <Card>
          <AppTextInput label="שם מלא" value={newName} onChangeText={setNewName} />
          <AppTextInput label="טלפון" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" />
          <AppButton title={saving ? 'שומר...' : 'הוספת לקוח'} onPress={handleAdd} loading={saving} />
          <AppButton title="ביטול" secondary onPress={() => setAdding(false)} />
        </Card>
      ) : (
        <AppButton title="➕ לקוח חדש" secondary onPress={() => setAdding(true)} />
      )}

      {loading ? (
        <AppText muted>טוען...</AppText>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}>
              <Card>
                <AppText bold>{item.full_name || 'ללא שם'}</AppText>
                <AppText muted>{item.phone || 'אין טלפון'}</AppText>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenContainer>
  );
}
