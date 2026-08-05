// ניהול מצב ההתחברות - כתובת השרת + הטוקן, נשמרים באחסון המקומי כדי
// שהאפליקציה תישאר מחוברת גם אחרי סגירה/פתיחה מחדש (בדיוק כמו עוגיית
// ה-session בדפדפן, רק שכאן זו כותרת Authorization שהאפליקציה שולחת בעצמה).
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE_KEY } from '../config';
import { loginToServer } from '../api/mobileApi';

interface AuthState {
  serverUrl: string;
  token: string;
  businessName: string;
}

interface AuthContextValue {
  auth: AuthState | null;
  loading: boolean;
  login: (serverUrl: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setAuth(JSON.parse(raw));
          } catch {
            // מתעלמים - יוצג מסך התחברות
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (serverUrl: string, password: string) => {
    const resp = await loginToServer(serverUrl, password);
    const next: AuthState = { serverUrl: serverUrl.trim().replace(/\/+$/, ''), token: resp.token, businessName: resp.business_name || '' };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  return <AuthContext.Provider value={{ auth, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth חייב לפעול בתוך AuthProvider');
  return ctx;
}
