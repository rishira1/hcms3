interface AdminUser {
  id: string;
  username: string;
  role: 'district_gs' | 'state_gs';
  district?: string;
}

class AuthManager {
  private token: string | null = null;
  private user: AdminUser | null = null;

  constructor() {
    // Initialize from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (e) {
          this.clearAuth();
        }
      }
    }
  }

  setAuth(token: string, user: AdminUser) {
    this.token = token;
    this.user = user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
    }
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AdminUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export const authManager = new AuthManager();
