import { useAuthStore } from '@/store/authStore';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super Admin barcha ruxsatlarga ega
    if (user.role === 'SUPER_ADMIN') return true;
    
    // Ruxsatlar ro'yxatini tekshirish
    if (!user.permissions || user.permissions.length === 0) {
      return false;
    }
    
    // Barcha ruxsatlarga ega bo'lsa
    if (user.permissions.includes('*')) return true;
    
    // Aniq ruxsatni tekshirish
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || []
  };
};
