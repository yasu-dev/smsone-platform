import { create } from 'zustand';
import { AuthState, User } from '../types';

// Mock user data for demo
const mockUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@topaz-sms.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true,
  permissions: {
    internationalSms: true, // 管理者は海外送信機能が有効
    templateEditing: true,
    bulkSending: true,
    apiAccess: true,
    scheduledSending: true,
    analyticsAccess: true,
    userManagement: true
  }
};

// 一般ユーザー用データ
const mockRegularUser: User = {
  id: '2',
  username: 'user',
  email: 'user@topaz-sms.com',
  role: 'user',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true,
  permissions: {
    internationalSms: false, // 一般ユーザーは初期状態では海外送信機能が無効
    templateEditing: true,
    bulkSending: false,
    apiAccess: false,
    scheduledSending: true,
    analyticsAccess: true,
    userManagement: false
  }
};

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo purposes, accept any credentials with password "password"
      if (password !== 'password') {
        throw new Error('Invalid credentials');
      }
      
      // ユーザー名によって異なるユーザーを返す
      const user = username === 'admin' ? mockUser : mockRegularUser;
      
      // In a real implementation, this would come from the backend
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed', 
        isLoading: false,
        isAuthenticated: false,
        user: null 
      });
    }
  },

  logout: () => {
    // Clear authentication state
    set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Mock token validation - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo, check if we have a token in localStorage
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // In a real app, validate the token with the backend
        
        // デモ用：ユーザーIDが保存されていればそれに応じたユーザー情報を返す
        const userId = localStorage.getItem('auth_user_id');
        const user = userId === '2' ? mockRegularUser : mockUser;
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed' 
      });
    }
  },

  // 権限チェック関数
  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user || !user.permissions) return false;
    return !!user.permissions[permission as keyof typeof user.permissions];
  }
}));

export default useAuthStore;