import api from './api';
import { batchRequests } from './batchRequests';

/**
 * Получить конфигурации студентов партиями
 * Использует batch API endpoint для оптимизации
 */
export async function getStudentConfigsBatch(
  studentIds: string[],
  options: {
    batchSize?: number;
    useBatchEndpoint?: boolean;
  } = {}
): Promise<any[]> {
  const { batchSize = 5, useBatchEndpoint = true } = options;
  
  if (studentIds.length === 0) {
    return [];
  }
  
  // Если включен batch endpoint и студентов много - используем его
  if (useBatchEndpoint && studentIds.length > 3) {
    try {
      const { data } = await api.post('/student-test-configs/batch', {
        studentIds
      });
      return data;
    } catch (error) {
      console.warn('Batch endpoint failed, falling back to individual requests:', error);
      // Fallback на обычные запросы
    }
  }
  
  // Fallback: делаем запросы партиями
  return batchRequests(
    studentIds,
    async (studentId) => {
      try {
        const { data } = await api.get(`/student-test-configs/${studentId}`);
        return data;
      } catch (error) {
        console.error(`Failed to load config for student ${studentId}:`, error);
        return null;
      }
    },
    batchSize
  );
}

/**
 * Получить конфигурации для массива студентов
 * Автоматически извлекает ID из объектов студентов
 */
export async function getStudentConfigsForStudents(
  students: Array<{ _id: string; [key: string]: any }>,
  options?: {
    batchSize?: number;
    useBatchEndpoint?: boolean;
  }
): Promise<Map<string, any>> {
  const studentIds = students.map(s => s._id);
  const configs = await getStudentConfigsBatch(studentIds, options);
  
  // Создаем Map для удобного доступа
  const configMap = new Map<string, any>();
  
  configs.forEach((config, index) => {
    if (config) {
      configMap.set(studentIds[index], config);
    }
  });
  
  return configMap;
}

/**
 * Хук для прогресса загрузки конфигураций
 */
export async function getStudentConfigsWithProgress(
  studentIds: string[],
  onProgress?: (loaded: number, total: number) => void,
  options?: {
    batchSize?: number;
  }
): Promise<any[]> {
  const { batchSize = 5 } = options || {};
  const results: any[] = [];
  
  for (let i = 0; i < studentIds.length; i += batchSize) {
    const batch = studentIds.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (studentId) => {
        try {
          const { data } = await api.get(`/student-test-configs/${studentId}`);
          return data;
        } catch (error) {
          console.error(`Failed to load config for student ${studentId}:`, error);
          return null;
        }
      })
    );
    
    results.push(...batchResults);
    
    // Вызываем callback прогресса
    if (onProgress) {
      onProgress(Math.min(i + batchSize, studentIds.length), studentIds.length);
    }
    
    // Небольшая задержка между партиями
    if (i + batchSize < studentIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}
