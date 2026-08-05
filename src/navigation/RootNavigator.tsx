// ניווט ראשי - אם אין התחברות פעילה מציגים את מסך הכניסה בלבד, אחרת את כל
// מסכי האפליקציה. כותרות הניווט מיושרות ל-RTL אוטומטית כי I18nManager
// מוגדר ל-forceRTL(true) עוד לפני עליית האפליקציה (ראו index.js).
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { SyncProvider } from '../context/SyncContext';
import { colors } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ClientsListScreen from '../screens/ClientsListScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import TasksScreen from '../screens/TasksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ViewOnlyListScreen from '../screens/ViewOnlyListScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.charcoalDark,
    text: colors.text,
    border: colors.border,
    primary: colors.navy,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.charcoalDark },
  headerTintColor: colors.text,
  headerBackTitle: 'חזרה',
};

export default function RootNavigator() {
  const { auth, loading } = useAuth();

  if (loading) return null;

  if (!auth) {
    return (
      <NavigationContainer theme={navTheme}>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  return (
    <SyncProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ראשי' }} />
          <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'לקוחות' }} />
          <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: 'כרטיס לקוח' }} />
          <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'משימות' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'הגדרות' }} />
          <Stack.Screen name="ViewOnlyList" component={ViewOnlyListScreen} options={{ title: '' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SyncProvider>
  );
}
