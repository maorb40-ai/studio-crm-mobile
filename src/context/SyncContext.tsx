// עוטף את מנוע הסנכרון (src/sync/syncEngine.ts) בהקשר React כדי שכל מסך
// יוכל לבקש "סנכרון עכשיו" ולראות את הסטטוס (מתי הסתנכרן לאחרונה, האם יש
// התנגשויות שממתינות להכרעה) בלי לדעת שום פרט על AsyncStorage/HTTP.
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { runFullSync, getLastSyncAt, SyncConflict } from '../sync/syncEngine';

interface SyncContextValue {
  syncing: boolean;
  lastSyncAt: string;
  lastError: string;
  conflicts: SyncConflict[];
  dismissConflict: (entity: string, id: number) => void;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState('');
  const [lastError, setLastError] = useState('');
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  useEffect(() => {
    getLastSyncAt().then(setLastSyncAt);
  }, []);

  const syncNow = useCallback(async () => {
    if (!auth || syncing) return;
    setSyncing(true);
    setLastError('');
    const result = await runFullSync(auth.serverUrl, auth.token);
    setSyncing(false);
    if (!result.ok) {
      setLastError(result.error || 'שגיאת סנכרון');
      return;
    }
    if (result.conflicts.length > 0) {
      setConflicts((prev) => [...prev, ...result.conflicts]);
    }
    const now = await getLastSyncAt();
    setLastSyncAt(now);
  }, [auth, syncing]);

  useEffect(() => {
    if (auth) {
      syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const dismissConflict = useCallback((entity: string, id: number) => {
    setConflicts((prev) => prev.filter((c) => !(c.entity === entity && c.id === id)));
  }, []);

  return (
    <SyncContext.Provider value={{ syncing, lastSyncAt, lastError, conflicts, dismissConflict, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync חייב לפעול בתוך SyncProvider');
  return ctx;
}
