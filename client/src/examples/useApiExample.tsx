/**
 * ПРИМЕРЫ использования React Query хуков
 * 
 * Этот файл показывает, как правильно использовать useApiQuery и useApiMutation
 * Скопируйте эти паттерны в свои компоненты
 */

import { useApiQuery, useApiMutation, usePaginatedQuery } from '../hooks/useApi';
import { useState } from 'react';

// ============================================
// ПРИМЕР 1: Простой GET запрос
// ============================================

function TestsList() {
  const { data, isLoading, error } = useApiQuery<any[]>(
    'tests', // ключ кэша
    '/api/tests' // endpoint
  );

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div>
      {data?.map(test => (
        <div key={test._id}>{test.title}</div>
      ))}
    </div>
  );
}

// ============================================
// ПРИМЕР 2: GET с параметрами
// ============================================

function TestsBySubject({ subjectId }: { subjectId: string }) {
  const { data, isLoading } = useApiQuery<any[]>(
    ['tests', subjectId], // составной ключ
    `/api/tests?subject=${subjectId}`
  );

  // Кэш будет отдельный для каждого subjectId
  // ['tests', '123'] - один кэш
  // ['tests', '456'] - другой кэш

  return <div>{/* ... */}</div>;
}

// ============================================
// ПРИМЕР 3: Условная загрузка
// ============================================

function TestDetails({ testId }: { testId?: string }) {
  const { data, isLoading } = useApiQuery<any>(
    ['test', testId],
    `/api/tests/${testId}`,
    {
      enabled: !!testId, // загружать только если testId существует
    }
  );

  if (!testId) return <div>Выберите тест</div>;
  if (isLoading) return <div>Загрузка...</div>;

  return <div>{data?.title}</div>;
}

// ============================================
// ПРИМЕР 4: POST запрос (создание)
// ============================================

function CreateTestForm() {
  const createTest = useApiMutation('/api/tests', 'post', {
    invalidateKeys: ['tests'], // обновить список тестов после создания
    successMessage: 'Test yaratildi!',
    errorMessage: 'Xatolik yuz berdi',
  });

  const handleSubmit = async (formData: any) => {
    await createTest.mutateAsync(formData);
    // После успеха автоматически:
    // 1. Показывается toast
    // 2. Инвалидируется кэш 'tests'
    // 3. Список тестов обновляется
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ title: 'New Test' });
    }}>
      <button disabled={createTest.isPending}>
        {createTest.isPending ? 'Сохранение...' : 'Создать'}
      </button>
    </form>
  );
}

// ============================================
// ПРИМЕР 5: PUT запрос (обновление)
// ============================================

function EditTestForm({ testId }: { testId: string }) {
  const updateTest = useApiMutation(`/api/tests/${testId}`, 'put', {
    invalidateKeys: ['tests', 'test'], // обновить список и детали
    successMessage: 'Test yangilandi!',
  });

  const handleUpdate = async (formData: any) => {
    await updateTest.mutateAsync(formData);
  };

  return <div>{/* форма редактирования */}</div>;
}

// ============================================
// ПРИМЕР 6: DELETE запрос
// ============================================

function DeleteTestButton({ testId }: { testId: string }) {
  const deleteTest = useApiMutation(`/api/tests/${testId}`, 'delete', {
    invalidateKeys: ['tests'],
    successMessage: "Test o'chirildi!",
    onSuccess: () => {
      // Дополнительные действия после удаления
      console.log('Test deleted');
    },
  });

  return (
    <button 
      onClick={() => deleteTest.mutate({})}
      disabled={deleteTest.isPending}
    >
      {deleteTest.isPending ? "O'chirilmoqda..." : "O'chirish"}
    </button>
  );
}

// ============================================
// ПРИМЕР 7: Пагинация
// ============================================

function PaginatedTests() {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = usePaginatedQuery<{ tests: any[]; hasMore: boolean }>(
    'tests',
    '/api/tests',
    page,
    10 // limit
  );

  return (
    <div>
      {isLoading && <div>Загрузка...</div>}
      
      {data?.tests?.map((test: any) => (
        <div key={test._id}>{test.title}</div>
      ))}

      <div>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Назад
        </button>
        
        <span>Страница {page}</span>
        
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.hasMore}
        >
          Вперед
        </button>
      </div>
    </div>
  );
}

// ============================================
// ПРИМЕР 8: Множественные запросы
// ============================================

function Dashboard() {
  const { data: tests } = useApiQuery('tests', '/api/tests');
  const { data: students } = useApiQuery('students', '/api/students');
  const { data: stats } = useApiQuery('stats', '/api/statistics');

  // Все запросы выполняются параллельно
  // Каждый кэшируется отдельно
  // При обновлении одного, другие не перезагружаются

  return <div>{/* dashboard */}</div>;
}

// ============================================
// ПРИМЕР 9: Зависимые запросы
// ============================================

function TestWithSubject({ testId }: { testId: string }) {
  // Сначала загружаем тест
  const { data: test } = useApiQuery<any>(
    ['test', testId],
    `/api/tests/${testId}`
  );

  // Затем загружаем предмет (только когда test загружен)
  const { data: subject } = useApiQuery<any>(
    ['subject', test?.subject],
    `/api/subjects/${test?.subject}`,
    {
      enabled: !!test?.subject, // загружать только если subject ID есть
    }
  );

  return (
    <div>
      <h1>{test?.title}</h1>
      <p>Предмет: {subject?.name}</p>
    </div>
  );
}

// ============================================
// ПРИМЕР 10: Оптимистичные обновления
// ============================================

function OptimisticUpdate({ testId }: { testId: string }) {
  const { data: test } = useApiQuery<any>(
    ['test', testId],
    `/api/tests/${testId}`
  );

  const updateTest = useApiMutation(`/api/tests/${testId}`, 'put', {
    invalidateKeys: ['test'],
    onSuccess: (newData) => {
      // UI уже обновлен оптимистично
      // Здесь можно добавить дополнительную логику
    },
  });

  const handleTogglePublished = async () => {
    // Оптимистичное обновление UI
    // (можно реализовать через queryClient.setQueryData)
    
    await updateTest.mutateAsync({
      published: !test.published
    });
  };

  return (
    <button onClick={handleTogglePublished}>
      {test?.published ? 'Снять с публикации' : 'Опубликовать'}
    </button>
  );
}

// ============================================
// ПРИМЕР 11: Обработка ошибок
// ============================================

function TestsWithErrorHandling() {
  const { data, isLoading, error, refetch } = useApiQuery<any[]>(
    'tests',
    '/api/tests',
    {
      onError: (error) => {
        console.error('Failed to load tests:', error);
      },
    }
  );

  if (error) {
    return (
      <div>
        <p>Ошибка загрузки: {error.message}</p>
        <button onClick={() => refetch()}>Повторить</button>
      </div>
    );
  }

  return <div>{/* список тестов */}</div>;
}

// ============================================
// ПРИМЕР 12: Кастомное время кэширования
// ============================================

function RealtimeData() {
  const { data } = useApiQuery<any>(
    'realtime-stats',
    '/api/statistics/realtime',
    {
      staleTime: 10000, // 10 секунд - данные свежие
      // После 10 секунд данные считаются устаревшими
      // и будут перезагружены при следующем рендере
    }
  );

  return <div>{/* статистика */}</div>;
}

// ============================================
// РЕКОМЕНДАЦИИ
// ============================================

/**
 * ✅ ЛУЧШИЕ ПРАКТИКИ:
 * 
 * 1. Используйте осмысленные ключи кэша
 *    - 'tests' для списка
 *    - ['test', id] для деталей
 *    - ['tests', filter] для фильтрованных списков
 * 
 * 2. Инвалидируйте правильно
 *    - После создания: ['tests']
 *    - После обновления: ['tests', ['test', id]]
 *    - После удаления: ['tests']
 * 
 * 3. Используйте enabled для условной загрузки
 *    - Зависимые запросы
 *    - Модальные окна
 *    - Табы
 * 
 * 4. Обрабатывайте состояния загрузки
 *    - isLoading - первая загрузка
 *    - isFetching - фоновое обновление
 *    - isPending - мутация в процессе
 * 
 * 5. Не дублируйте запросы
 *    - React Query автоматически дедуплицирует
 *    - Используйте один и тот же ключ
 * 
 * ⚠️ ИЗБЕГАЙТЕ:
 * 
 * 1. Не делайте запросы в useEffect
 *    ❌ useEffect(() => { fetchData() }, [])
 *    ✅ useApiQuery('key', '/api/data')
 * 
 * 2. Не храните данные в useState
 *    ❌ const [data, setData] = useState()
 *    ✅ const { data } = useApiQuery(...)
 * 
 * 3. Не забывайте инвалидировать кэш
 *    ❌ mutate без invalidateKeys
 *    ✅ mutate с invalidateKeys
 * 
 * 4. Не используйте слишком общие ключи
 *    ❌ 'data'
 *    ✅ 'tests', 'students', 'subjects'
 */

export {
  TestsList,
  TestsBySubject,
  TestDetails,
  CreateTestForm,
  EditTestForm,
  DeleteTestButton,
  PaginatedTests,
  Dashboard,
  TestWithSubject,
  OptimisticUpdate,
  TestsWithErrorHandling,
  RealtimeData,
};
