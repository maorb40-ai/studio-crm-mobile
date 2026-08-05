/**
 * CRM מתי - אפליקציית נייד (Android)
 * מתחבר לשרת ה-CRM (F:\studio-crm) ומאפשר עבודה גם בלי אינטרנט, עם סנכרון
 * אוטומטי כשיש רשת. ראו src/sync/syncEngine.ts להסבר המלא על מנגנון הסנכרון.
 *
 * @format
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.charcoalDark} />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
