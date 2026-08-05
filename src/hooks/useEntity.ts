// הוק משותף לכל מסך שמציג/עורך רשומות של ישות אחת - קורא מהאחסון המקומי
// (לא מהשרת ישירות - המסכים תמיד עובדים מול המראה המקומית, כדי שהם יעבדו
// גם בלי אינטרנט; הסנכרון ברקע הוא מה שמעדכן את המראה המקומית מול השרת).
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  getEntityRecords,
  createLocalRecord,
  updateLocalRecord,
  deleteLocalRecord,
} from '../storage/localStore';
import { EntityName, GenericRecord } from '../types/entities';
import { useSync } from '../context/SyncContext';

export function useEntity(entity: EntityName) {
  const [records, setRecords] = useState<GenericRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { syncNow } = useSync();

  const reload = useCallback(async () => {
    const data = await getEntityRecords(entity);
    setRecords(data);
    setLoading(false);
  }, [entity]);

  useEffect(() => {
    reload();
  }, [reload]);

  // רענון מהאחסון המקומי כל פעם שחוזרים למסך (למשל אחרי סנכרון שרץ ברקע
  // בזמן שהמשתמש היה במסך אחר).
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const create = useCallback(
    async (fields: Record<string, any>) => {
      const record = await createLocalRecord(entity, fields);
      await reload();
      syncNow();
      return record;
    },
    [entity, reload, syncNow],
  );

  const update = useCallback(
    async (id: number, fields: Record<string, any>) => {
      await updateLocalRecord(entity, id, fields);
      await reload();
      syncNow();
    },
    [entity, reload, syncNow],
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteLocalRecord(entity, id);
      await reload();
      syncNow();
    },
    [entity, reload, syncNow],
  );

  return { records, loading, reload, create, update, remove };
}
