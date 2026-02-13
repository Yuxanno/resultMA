import { useAuthStore } from '@/store/authStore';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string): boolean => {
    // Simplified: if user is logged in, they have all permissions
    return !!user;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return !!user;
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return !!user;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: []
  };
};
