import { useEffect } from 'react';

/**
 * Hook для загрузки данных при монтировании компонента
 * Упрощает повторяющийся паттерн useEffect(() => { fetch() }, [])
 * 
 * @param fetchFn - функция для загрузки данных
 * @param deps - зависимости (опционально)
 * 
 * @example
 * useFetchOnMount(fetchStudents);
 * useFetchOnMount(() => fetchTest(id), [id]);
 */
export function useFetchOnMount(fetchFn: () => void | Promise<void>, deps: any[] = []) {
  useEffect(() => {
    fetchFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
