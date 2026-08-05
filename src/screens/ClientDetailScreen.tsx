// כרטיס לקוח - עריכת פרטים בסיסיים + רשימת הביקורים (sessions) שלו עם
// אפשרות הוספה. גם כאן הכל עובד מול המראה המקומית, ומסתנכרן ברקע.
import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ScreenContainer, ScreenTitle, AppText, AppTextInput, AppButton, Card } from '../components/ui';
import { useEntity } from '../hooks/useEntity';
import { RootStackParamList } from '../navigation/types';

type Route = RouteProp<RootStackParamList, 'ClientDetail'>;

export default function ClientDetailScreen() {
  const { params } = useRoute<Route>();
  const { records: clients, update, remove } = useEntity('clients');
  const { records: sessions, create: createSession } = useEntity('sessions');

  const client = useMemo(() => clients.find((c) => c.id === params.clientId), [clients, params.clientId]);
  const clientSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.client_id === params.clientId)
        .sort((a, b) => String(b.session_date || '').localeCompare(String(a.session_date || ''))),
    [sessions, params.clientId],
  );

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const [addingSession, setAddingSession] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionOccasion, setSessionOccasion] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  function startEdit() {
    if (!client) return;
    setForm({ full_name: client.full_name || '', phone: client.phone || '', email: client.email || '', notes: client.notes || '' });
    setEditing(true);
  }

  async function saveEdit() {
    if (!client) return;
    setSaving(true);
    await update(client.id, form);
    setSaving(false);
    setEditing(false);
  }

  async function handleAddSession() {
    if (!sessionDate.trim() || !client) return;
    setSavingSession(true);
    await createSession({ client_id: client.id, session_date: sessionDate.trim(), occasion_type: sessionOccasion.trim() });
    setSavingSession(false);
    setSessionDate('');
    setSessionOccasion('');
    setAddingSession(false);
  }

  if (!client) {
    return (
      <ScreenContainer>
        <AppText muted>הלקוח לא נמצא במאגר המקומי - נסו לסנכרן ולנסות שוב.</AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScrollView>
      <ScreenContainer>
        <ScreenTitle>{client.full_name}</ScreenTitle>

        <Card>
          {editing ? (
            <>
              <AppTextInput label="שם מלא" value={form.full_name} onChangeText={(v) => setForm((f) => ({ ...f, full_name: v }))} />
              <AppTextInput label="טלפון" value={form.phone} onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))} keyboardType="phone-pad" />
              <AppTextInput label="אימייל" value={form.email} onChangeText={(v) => setForm((f) => ({ ...f, email: v }))} autoCapitalize="none" />
              <AppTextInput label="הערות" value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} multiline />
              <AppButton title={saving ? 'שומר...' : 'שמירה'} onPress={saveEdit} loading={saving} />
              <AppButton title="ביטול" secondary onPress={() => setEditing(false)} />
            </>
          ) : (
            <>
              <AppText>טלפון: {client.phone || '—'}</AppText>
              <AppText>אימייל: {client.email || '—'}</AppText>
              {!!client.notes && <AppText muted>{client.notes}</AppText>}
              <AppButton title="עריכה" secondary onPress={startEdit} />
              <AppButton title="מחיקת לקוח" danger onPress={() => remove(client.id)} />
            </>
          )}
        </Card>

        <ScreenTitle>ביקורים ({clientSessions.length})</ScreenTitle>
        {addingSession ? (
          <Card>
            <AppTextInput label="תאריך (YYYY-MM-DD)" value={sessionDate} onChangeText={setSessionDate} placeholder="2026-08-10" />
            <AppTextInput label="סוג אירוע" value={sessionOccasion} onChangeText={setSessionOccasion} />
            <AppButton title={savingSession ? 'שומר...' : 'הוספת ביקור'} onPress={handleAddSession} loading={savingSession} />
            <AppButton title="ביטול" secondary onPress={() => setAddingSession(false)} />
          </Card>
        ) : (
          <AppButton title="➕ ביקור חדש" secondary onPress={() => setAddingSession(true)} />
        )}

        {clientSessions.map((s) => (
          <Card key={s.id}>
            <AppText bold>{s.session_date}{s.session_time ? ' ' + s.session_time : ''}</AppText>
            <AppText muted>{s.occasion_type || 'לא צוין סוג אירוע'} · {s.status || 'לא ידוע'}</AppText>
          </Card>
        ))}
      </ScreenContainer>
    </ScrollView>
  );
}
