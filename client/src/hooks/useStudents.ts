import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Query keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters?: any) => [...studentKeys.lists(), filters] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  byClass: (classNumber: number) => [...studentKeys.all, 'byClass', classNumber] as const,
  byGroup: (groupId: string) => [...studentKeys.all, 'byGroup', groupId] as const,
};

// Hook для получения студентов по классу
export const useStudentsByClass = (classNumber: number | undefined) => {
  return useQuery({
    queryKey: studentKeys.byClass(classNumber!),
    queryFn: async () => {
      const { data } = await api.get('/students', { params: { classNumber } });
      return data;
    },
    enabled: !!classNumber,
    staleTime: 60000, // 1 минута
  });
};

// Hook для получения студентов по группе
export const useStudentsByGroup = (groupId: string | undefined) => {
  return useQuery({
    queryKey: studentKeys.byGroup(groupId!),
    queryFn: async () => {
      const { data } = await api.get(`/students/group/${groupId}`);
      return data;
    },
    enabled: !!groupId,
    staleTime: 60000,
  });
};

// Hook для создания студента
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentData: any) => {
      const { data } = await api.post('/students', studentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
};
