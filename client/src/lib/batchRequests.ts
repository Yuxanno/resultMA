/**
 * Утилита для батчинга (группировки) запросов
 * Ограничивает количество параллельных запросов
 */

/**
 * Выполняет запросы партиями с ограничением параллельности
 * @param items - массив элементов для обработки
 * @param fn - функция для выполнения для каждого элемента
 * @param batchSize - размер партии (по умолчанию 5)
 */
export async function batchRequests<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<R[]> {
  const results: R[] = [];
  
  // Разбиваем на партии
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Выполняем партию параллельно
    const batchResults = await Promise.all(
      batch.map(item => fn(item))
    );
    
    results.push(...batchResults);
    
    // Небольшая задержка между партиями (опционально)
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return results;
}

/**
 * Выполняет запросы партиями с обработкой ошибок
 * @param items - массив элементов для обработки
 * @param fn - функция для выполнения для каждого элемента
 * @param batchSize - размер партии (по умолчанию 5)
 */
export async function batchRequestsWithErrors<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<Array<{ success: boolean; data?: R; error?: any; item: T }>> {
  const results: Array<{ success: boolean; data?: R; error?: any; item: T }> = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        try {
          const data = await fn(item);
          return { success: true, data, item };
        } catch (error) {
          return { success: false, error, item };
        }
      })
    );
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({ success: false, error: result.reason, item: batch[0] });
      }
    });
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return results;
}

/**
 * Создает функцию-обертку для батчинга запросов
 * Использует debounce для группировки запросов
 */
export function createBatchLoader<K, V>(
  loadFn: (keys: K[]) => Promise<V[]>,
  options: {
    maxBatchSize?: number;
    batchDelay?: number;
  } = {}
) {
  const { maxBatchSize = 10, batchDelay = 10 } = options;
  
  let queue: Array<{
    key: K;
    resolve: (value: V) => void;
    reject: (error: any) => void;
  }> = [];
  
  let timeoutId: NodeJS.Timeout | null = null;
  
  const processBatch = async () => {
    if (queue.length === 0) return;
    
    const currentBatch = queue.splice(0, maxBatchSize);
    const keys = currentBatch.map(item => item.key);
    
    try {
      const results = await loadFn(keys);
      
      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(item => {
        item.reject(error);
      });
    }
    
    // Если еще есть элементы в очереди, обрабатываем следующую партию
    if (queue.length > 0) {
      timeoutId = setTimeout(processBatch, batchDelay);
    }
  };
  
  return (key: K): Promise<V> => {
    return new Promise((resolve, reject) => {
      queue.push({ key, resolve, reject });
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(processBatch, batchDelay);
    });
  };
}

/**
 * Ограничитель параллельных запросов (Semaphore)
 */
export class RequestLimiter {
  private queue: Array<() => void> = [];
  private running: number = 0;
  
  constructor(private limit: number = 5) {}
  
  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.limit) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    
    this.running++;
    
    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// Глобальный лимитер для всех запросов
export const globalRequestLimiter = new RequestLimiter(5);
