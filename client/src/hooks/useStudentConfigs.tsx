import { useState, useEffect } from 'react';
import api from '../lib/api';

interface UseStudentConfigsOptions {
  studentIds: string[];
  batchSize?: number;
  enabled?: boolean;
}

interface UseStudentConfigsResult {
  configs: Map<string, any>;
  loading: boolean;
  error: string | null;
  progress: { loaded: number; total: number };
}

/**
 * Хук для загрузки конфигураций студентов партиями
 * Автоматически использует batch endpoint или загружает по частям
 */
export function useStudentConfigs({
  studentIds,
  batchSize = 5,
  enabled = true,
}: UseStudentConfigsOptions): UseStudentConfigsResult {
  const [configs, setConfigs] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });

  useEffect(() => {
    if (!enabled || studentIds.length === 0) {
      return;
    }

    let cancelled = false;

    const loadConfigs = async () => {
      setLoading(true);
      setError(null);
      setProgress({ loaded: 0, total: studentIds.length });

      try {
        // Пробуем использовать batch endpoint
        if (studentIds.length > 3) {
          try {
            const { data } = await api.post('/student-test-configs/batch', {
              studentIds,
            });

            if (cancelled) return;

            const configMap = new Map<string, any>();
            data.forEach((config: any, index: number) => {
              if (config) {
                configMap.set(studentIds[index], config);
              }
            });

            setConfigs(configMap);
            setProgress({ loaded: studentIds.length, total: studentIds.length });
            setLoading(false);
            return;
          } catch (batchError) {
            console.warn('Batch endpoint failed, using individual requests');
          }
        }

        // Fallback: загружаем партиями
        const configMap = new Map<string, any>();
        let loaded = 0;

        for (let i = 0; i < studentIds.length; i += batchSize) {
          if (cancelled) break;

          const batch = studentIds.slice(i, i + batchSize);

          const batchResults = await Promise.all(
            batch.map(async (studentId) => {
              try {
                const { data } = await api.get(`/student-test-configs/${studentId}`);
                return { studentId, config: data };
              } catch (err) {
                console.error(`Failed to load config for ${studentId}:`, err);
                return { studentId, config: null };
              }
            })
          );

          batchResults.forEach(({ studentId, config }) => {
            if (config) {
              configMap.set(studentId, config);
            }
          });

          loaded += batch.length;
          setProgress({ loaded, total: studentIds.length });
          setConfigs(new Map(configMap));

          // Небольшая задержка между партиями
          if (i + batchSize < studentIds.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Xatolik yuz berdi');
          setLoading(false);
        }
      }
    };

    loadConfigs();

    return () => {
      cancelled = true;
    };
  }, [studentIds.join(','), batchSize, enabled]);

  return { configs, loading, error, progress };
}

/**
 * Простая функция для загрузки конфигураций партиями
 * Использовать когда не нужен реактивный хук
 */
export async function loadStudentConfigsBatch(
  studentIds: string[],
  options: {
    batchSize?: number;
    onProgress?: (loaded: number, total: number) => void;
  } = {}
): Promise<Map<string, any>> {
  const { batchSize = 5, onProgress } = options;

  if (studentIds.length === 0) {
    return new Map();
  }

  // Пробуем batch endpoint
  if (studentIds.length > 3) {
    try {
      const { data } = await api.post('/student-test-configs/batch', {
        studentIds,
      });

      const configMap = new Map<string, any>();
      data.forEach((config: any, index: number) => {
        if (config) {
          configMap.set(studentIds[index], config);
        }
      });

      onProgress?.(studentIds.length, studentIds.length);
      return configMap;
    } catch (error) {
      console.warn('Batch endpoint failed, using individual requests');
    }
  }

  // Fallback: загружаем партиями
  const configMap = new Map<string, any>();
  let loaded = 0;

  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (studentId) => {
        try {
          const { data } = await api.get(`/student-test-configs/${studentId}`);
          return { studentId, config: data };
        } catch (err) {
          console.error(`Failed to load config for ${studentId}:`, err);
          return { studentId, config: null };
        }
      })
    );

    batchResults.forEach(({ studentId, config }) => {
      if (config) {
        configMap.set(studentId, config);
      }
    });

    loaded += batch.length;
    onProgress?.(loaded, studentIds.length);

    // Небольшая задержка между партиями
    if (i + batchSize < studentIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return configMap;
}
