// רשימת משימות - סימון "בוצע", הוספה, מחיקה. אותו רעיון בדיוק כמו עמוד
// המשימות באתר (app/tasks/page.jsx), רק בתצוגת מובייל.
import React, { useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ScreenContainer, ScreenTitle, AppText, AppTextInput, AppButton, Card } from '../components/ui';
import { useEntity } from '../hooks/useEntity';

export default function TasksScreen() {
  const { records, create, update, remove } = useEntity('tasks');
  const [newText, setNewText] = useState('');
  const [saving, setSaving] = useState(false);

  const sorted = useMemo(() => {
    return [...records].sort((a, b) => {
      if (!!a.done !== !!b.done) return a.done ? 1 : -1;
      return String(b.created_at || '').localeCompare(String(a.created_at || ''));
    });
  }, [records]);

  async function handleAdd() {
    if (!newText.trim()) return;
    setSaving(true);
    await create({ text: newText.trim() });
    setSaving(false);
    setNewText('');
  }

  return (
    <ScreenContainer>
      <ScreenTitle>משימות ({records.length})</ScreenTitle>
      <Card>
        <AppTextInput placeholder="משימה חדשה..." value={newText} onChangeText={setNewText} />
        <AppButton title={saving ? 'שומר...' : 'הוספה'} onPress={handleAdd} loading={saving} />
      </Card>
      {sorted.map((t) => (
        <Card key={t.id}>
          <TouchableOpacity onPress={() => update(t.id, { done: !t.done })}>
            <AppText bold style={t.done ? { textDecorationLine: 'line-through', color: '#9096a8' } : undefined}>
              {t.done ? '☑' : '☐'} {t.text}
            </AppText>
          </TouchableOpacity>
          {!!t.due_date && <AppText muted>יעד: {t.due_date}</AppText>}
          <AppButton title="מחיקה" danger onPress={() => remove(t.id)} />
        </Card>
      ))}
    </ScreenContainer>
  );
}
