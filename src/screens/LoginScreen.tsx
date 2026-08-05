// מסך התחברות - כתובת השרת (למשל כתובת ה-ngrok הקבועה שכבר מוגדרת למערכת,
// או כתובת רשת מקומית) + אותה סיסמה יחידה כמו הכניסה לפאנל הניהול באתר.
import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer, ScreenTitle, AppText, AppTextInput, AppButton, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [serverUrl, setServerUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!serverUrl.trim()) {
      setError('יש להזין את כתובת השרת');
      return;
    }
    if (!password) {
      setError('יש להזין סיסמה');
      return;
    }
    setLoading(true);
    try {
      await login(serverUrl, password);
    } catch (e: any) {
      setError(e?.message || 'שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ScreenContainer>
          <ScreenTitle>כניסה - CRM מתי</ScreenTitle>
          <Card>
            <AppText muted style={{ marginBottom: 10 }}>
              הזינו את כתובת השרת (הקישור המרוחק/ngrok שמוגדר במערכת, או כתובת הרשת המקומית) ואת אותה
              סיסמה שמשמשת אתכם להיכנס לפאנל הניהול באתר.
            </AppText>
            <AppTextInput
              label="כתובת השרת"
              placeholder="https://xxxx.ngrok-free.app"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <AppTextInput label="סיסמה" placeholder="הסיסמה" value={password} onChangeText={setPassword} secureTextEntry />
            {!!error && (
              <AppText style={{ color: '#e0555f', marginBottom: 8 }}>{error}</AppText>
            )}
            <AppButton title={loading ? 'מתחבר...' : 'כניסה'} onPress={handleLogin} loading={loading} />
          </Card>
        </ScreenContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
