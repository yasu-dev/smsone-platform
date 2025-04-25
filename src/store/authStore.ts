import { create } from 'zustand';
import { AuthState, User } from '../types';

// デモ用の認証機能を強制的に有効にするフラグ
const FORCE_DEMO_AUTH = true;

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
    userManagement: true,
    surveysCreation: true // 管理者はアンケート作成権限が有効
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
    bulkSending: true, // 一般ユーザーも一括送信できるように変更
    apiAccess: false,
    scheduledSending: true,
    analyticsAccess: true,
    userManagement: false,
    surveysCreation: false // 一般ユーザーはアンケート作成権限が無効
  }
};

// 初期状態でのデモ用自動認証
if (FORCE_DEMO_AUTH) {
  console.log('デモ環境の自動認証を設定します');
  localStorage.setItem('auth_token', 'demo_token');
  localStorage.setItem('auth_user_id', '1');
}

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  forceLogin: () => void; // 強制ログイン用関数を追加
  updateUser: (updatedUser: User) => void; // ユーザープロフィール更新関数を追加
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
        throw new Error('ユーザー名またはパスワードが正しくありません');
      }
      
      // ユーザー名によって異なるユーザーを返す
      const user = username === 'admin' ? mockUser : mockRegularUser;
      
      // In a real implementation, this would come from the backend
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      
      // デモ用：ログイン成功時に自動的にLocalStorageにデータを保存
      localStorage.setItem('auth_token', 'demo_token');
      localStorage.setItem('auth_user_id', user.id);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'ログインに失敗しました', 
        isLoading: false,
        isAuthenticated: false,
        user: null 
      });
    }
  },

  logout: () => {
    // Clear authentication state and local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    
    set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });
  },

  // 強制的にログイン状態にする関数を追加
  forceLogin: () => {
    console.log('強制的にログイン状態にします');
    localStorage.setItem('auth_token', 'demo_token');
    localStorage.setItem('auth_user_id', '1');
    
    set({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    });
  },

  // ユーザープロフィール更新関数を追加
  updateUser: (updatedUser: User) => {
    console.log('ユーザー情報を更新します', updatedUser);
    
    // 実際の環境では、ここでAPIリクエストを行う
    // モック環境では単純にステートを更新するだけ
    set({
      user: updatedUser
    });
    
    // userId に応じてモックユーザーデータも更新（次回ログイン時のために）
    if (updatedUser.id === '1') {
      Object.assign(mockUser, updatedUser);
    } else if (updatedUser.id === '2') {
      Object.assign(mockRegularUser, updatedUser);
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // デモ環境用の自動ログイン処理
      if (FORCE_DEMO_AUTH) {
        console.log('デモ環境のため自動的にログイン状態にします');
        
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false
        });
        return;
      }
      
      // Token validation simulation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for token in localStorage
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Get user ID or default to admin
        const userId = localStorage.getItem('auth_user_id') || '1';
        const user = userId === '2' ? mockRegularUser : mockUser;
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        // デモ環境用：初期状態でadminユーザーで自動ログイン
        // 実際の環境では以下のコードは削除し、未認証状態を返す
        localStorage.setItem('auth_token', 'demo_token');
        localStorage.setItem('auth_user_id', '1');
        
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false
        });
        
        /* 実際の環境用のコード
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        */
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      
      // エラー発生時も自動ログイン
      if (FORCE_DEMO_AUTH) {
        console.log('エラー発生時の自動ログイン処理を実行します');
        localStorage.setItem('auth_token', 'demo_token');
        localStorage.setItem('auth_user_id', '1');
        
        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return;
      }
      
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error instanceof Error ? error.message : '認証チェックに失敗しました' 
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