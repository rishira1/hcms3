import { useState, useEffect } from 'react';
import { authManager } from '@/lib/auth';

interface AdminUser {
  id: string;
  username: string;
  role: 'district_gs' | 'state_gs';
  district?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(authManager.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.isAuthenticated());

  useEffect(() => {
    const updateAuthState = () => {
      setUser(authManager.getUser());
      setIsAuthenticated(authManager.isAuthenticated());
    };

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_token' || e.key === 'admin_user') {
        updateAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, userData: AdminUser) => {
    authManager.setAuth(token, userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authManager.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    getAuthHeaders: () => authManager.getAuthHeaders()
  };
}
