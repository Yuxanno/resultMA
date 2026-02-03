import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useToast } from './useToast';

/**
 * Хук для GET запросов с автоматическим кэшированием
 */
export function useApiQuery<T>(
  key: string | string[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  }
) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => {
      const response = await api.get<T>(endpoint);
      return response.data;
    },
    staleTime: options?.staleTime,
    enabled: options?.enabled,
  });
}

/**
 * Хук для POST/PUT/DELETE запросов с автоматической инвалидацией кэша
 */
export function useApiMutation<TData = any, TVariables = any>(
  endpoint: string,
  method: 'post' | 'put' | 'delete' = 'post',
  options?: {
    invalidateKeys?: string[];
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await api[method]<TData>(endpoint, variables);
      return response.data;
    },
    onSuccess: (data) => {
      // Инвалидируем указанные ключи кэша
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      if (options?.successMessage) {
        toast(options.successMessage, 'success');
      }

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || options?.errorMessage || 'Xatolik yuz berdi';
      toast(message, 'error');
      options?.onError?.(error);
    },
  });
}

/**
 * Хук для пагинированных запросов
 */
export function usePaginatedQuery<T>(
  key: string,
  endpoint: string,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: [key, page, limit],
    queryFn: async () => {
      const response = await api.get<T>(`${endpoint}?page=${page}&limit=${limit}`);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
}
