import { create } from 'zustand';
import { AuthState, User, Tenant, UserRole } from '../types';

// デモ用の認証機能を強制的に有効にするフラグ
const FORCE_DEMO_AUTH = true;

// モックテナントデータ
const mockTenants: Record<string, Tenant> = {
  'topaz-sms': {
    id: 'topaz-sms',
    name: 'SMSOne',
    domain: 'topaz-sms.com',
    subdomain: 'app',
    logoUrl: '/logo-topaz.png',
    primaryColor: '#4f46e5',
    secondaryColor: '#9333ea',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  'yamada-electric': {
    id: 'yamada-electric',
    name: 'ヤマダ電機SMS通知',
    domain: 'yamada-denki.jp',
    subdomain: 'sms',
    logoUrl: '/logo-yamada.png',
    primaryColor: '#e11d48',
    secondaryColor: '#be123c',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  'jintech-push': {
    id: 'jintech-push',
    name: 'Push!SMS',
    domain: 'push-sms.jp',
    subdomain: 'app',
    logoUrl: '/logo-jintech.png',
    primaryColor: '#0ea5e9',
    secondaryColor: '#06b6d4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
};

// Topaz合同会社の管理者ユーザー
const mockUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@topaz-sms.com',
  role: 'admin',
  tenant_id: 'topaz-sms',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true,
  permissions: {
    internationalSms: true,
    templateEditing: true,
    bulkSending: true,
    apiAccess: true,
    scheduledSending: true,
    analyticsAccess: true,
    userManagement: true,
    surveysCreation: true
  }
};

// SMSOne利用企業（ヤマダ電機）の担当者
const mockRegularUser: User = {
  id: '2',
  username: 'yamada-staff',
  email: 'sms-admin@yamada-denki.jp',
  role: 'manager',
  tenant_id: 'yamada-electric',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true,
  permissions: {
    internationalSms: false,
    templateEditing: true,
    bulkSending: true,
    apiAccess: true,
    scheduledSending: true,
    analyticsAccess: true,
    userManagement: true,
    surveysCreation: true
  }
};

// OEM提供先（株式会社ジンテック）の管理者
const mockJintechAdmin: User = {
  id: '3',
  username: 'jintech-admin',
  email: 'admin@jintech.co.jp',
  role: 'admin',
  tenant_id: 'jintech-push',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true,
  permissions: {
    internationalSms: true,
    templateEditing: true,
    bulkSending: true,
    apiAccess: true,
    scheduledSending: true,
    analyticsAccess: true,
    userManagement: true,
    surveysCreation: true
  }
};

// 初期状態でのデモ用自動認証
if (FORCE_DEMO_AUTH) {
  console.log('デモ環境の自動認証を設定します');
  localStorage.setItem('auth_token', 'demo_token');
  localStorage.setItem('auth_user_id', '1');
  localStorage.setItem('auth_tenant_id', 'topaz-sms');
}

// ドメインからテナントを特定する関数
const getTenantFromDomain = (): Tenant => {
  const hostname = window.location.hostname;
  
  // localhost環境の場合はデフォルトのテナントを返す
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return mockTenants['topaz-sms'];
  }
  
  // サブドメインがある場合（例: app.topaz-sms.com）
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    const domain = parts.slice(1).join('.');
    
    // テナントの検索
    for (const tenantId in mockTenants) {
      const tenant = mockTenants[tenantId];
      if (domain === tenant.domain && subdomain === tenant.subdomain) {
        return tenant;
      }
    }
  }
  
  // 完全一致の検索
  for (const tenantId in mockTenants) {
    const tenant = mockTenants[tenantId];
    if (hostname === tenant.domain) {
      return tenant;
    }
  }
  
  // 該当がなければデフォルトのテナントを返す
  return mockTenants['topaz-sms'];
};

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  forceLogin: () => void; // 強制ログイン用関数を追加
  updateUser: (updatedUser: User) => void; // ユーザープロフィール更新関数を追加
  // 新規関数
  getTenantInfo: () => Tenant;
  updateTenant: (updatedTenant: Tenant) => void;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  // 初期状態で認証済みに設定
  user: mockUser,
  tenant: mockTenants['topaz-sms'],
  isAuthenticated: true,
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
      
      // ホスト名からテナントを特定
      const tenant = getTenantFromDomain();
      
      // テナントに対応するユーザーの特定
      let user;
      
      // ユーザー名をもとに適切なユーザーデータを取得
      // Topaz合同会社ユーザー
      if (username === 'admin' || username === 'admin@topaz-sms.com') {
        user = mockUser; // Topaz合同会社の管理者
      }
      else if (username === '佐藤太郎' || username === 'sato@topaz-sms.com') {
        user = {
          id: 'topaz-1',
          username: '佐藤太郎',
          email: 'sato@topaz-sms.com',
          role: 'admin' as UserRole,
          tenant_id: 'topaz-sms',
          createdAt: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: true,
            templateEditing: true,
            bulkSending: true,
            apiAccess: true,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: true,
            surveysCreation: true
          }
        };
      }
      else if (username === '鈴木花子' || username === 'suzuki@topaz-sms.com') {
        user = {
          id: 'topaz-2',
          username: '鈴木花子',
          email: 'suzuki@topaz-sms.com',
          role: 'manager',
          tenant_id: 'topaz-sms',
          createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: true,
            templateEditing: true,
            bulkSending: true,
            apiAccess: true,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: false,
            surveysCreation: true
          }
        };
      }
      // SMSOne利用企業（ヤマダ電機）のユーザー
      else if (username === 'yamada-staff' || username === 'sms-admin@yamada-denki.jp') {
        user = mockRegularUser; // ヤマダ電機の担当者
      }
      else if (username === '山田健太' || username === 'yamada-k@yamada-denki.jp') {
        user = {
          id: 'yamada-1',
          username: '山田健太',
          email: 'yamada-k@yamada-denki.jp',
          role: 'admin',
          tenant_id: 'yamada-electric',
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: false,
            templateEditing: true,
            bulkSending: true,
            apiAccess: true,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: true,
            surveysCreation: true
          }
        };
      }
      else if (username === '伊藤直子' || username === 'ito-n@yamada-denki.jp') {
        user = {
          id: 'yamada-2',
          username: '伊藤直子',
          email: 'ito-n@yamada-denki.jp',
          role: 'manager',
          tenant_id: 'yamada-electric',
          createdAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: false,
            templateEditing: true,
            bulkSending: true,
            apiAccess: false,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: false,
            surveysCreation: true
          }
        };
      }
      else if (username === '中村俊介' || username === 'nakamura-s@yamada-denki.jp') {
        user = {
          id: 'yamada-3',
          username: '中村俊介',
          email: 'nakamura-s@yamada-denki.jp',
          role: 'operator',
          tenant_id: 'yamada-electric',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: false,
            templateEditing: true,
            bulkSending: true,
            apiAccess: false,
            scheduledSending: true,
            analyticsAccess: false,
            userManagement: false,
            surveysCreation: false
          }
        };
      }
      // OEM提供先（株式会社ジンテック）のユーザー
      else if (username === 'jintech-admin' || username === 'admin@jintech.co.jp') {
        user = mockJintechAdmin; // ジンテックの管理者
      }
      else if (username === '高橋誠' || username === 'takahashi@jintech.co.jp') {
        user = {
          id: 'jintech-1',
          username: '高橋誠',
          email: 'takahashi@jintech.co.jp',
          role: 'admin',
          tenant_id: 'jintech-push',
          createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: true,
            templateEditing: true,
            bulkSending: true,
            apiAccess: true,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: true,
            surveysCreation: true
          }
        };
      }
      else if (username === '渡辺裕子' || username === 'watanabe@jintech.co.jp') {
        user = {
          id: 'jintech-2',
          username: '渡辺裕子',
          email: 'watanabe@jintech.co.jp',
          role: 'manager',
          tenant_id: 'jintech-push',
          createdAt: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: true,
            templateEditing: true,
            bulkSending: true,
            apiAccess: true,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: false,
            surveysCreation: true
          }
        };
      }
      // OEM顧客ユーザー（大手小売業）
      else if (username === '佐々木剛' || username === 'sasaki@mega-retail.co.jp') {
        user = {
          id: 'retail-1',
          username: '佐々木剛',
          email: 'sasaki@mega-retail.co.jp',
          role: 'manager',
          tenant_id: 'jintech-push', // OEM顧客もジンテックテナントを使用
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: false,
            templateEditing: true,
            bulkSending: true,
            apiAccess: true,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: true,
            surveysCreation: true
          }
        };
      }
      else if (username === '小林恵' || username === 'kobayashi@mega-retail.co.jp') {
        user = {
          id: 'retail-2',
          username: '小林恵',
          email: 'kobayashi@mega-retail.co.jp',
          role: 'operator',
          tenant_id: 'jintech-push', // OEM顧客もジンテックテナントを使用
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          permissions: {
            internationalSms: false,
            templateEditing: true,
            bulkSending: true,
            apiAccess: false,
            scheduledSending: true,
            analyticsAccess: true,
            userManagement: false,
            surveysCreation: false
          }
        };
      }
      // デフォルトではホスト名に応じたデフォルトユーザーを使用
      else {
        if (tenant.id === 'jintech-push') {
          user = mockJintechAdmin;
        } else if (tenant.id === 'yamada-electric') {
          user = mockRegularUser;
        } else {
          user = mockUser;
        }
      }
      
      // テナントIDの一致チェック（実際のアプリではメールドメインとテナント一致なども確認する）
      if (user.tenant_id !== tenant.id) {
        throw new Error('このテナントでのアクセス権限がありません');
      }
      
      // In a real implementation, this would come from the backend
      set({ 
        user,
        tenant,
        isAuthenticated: true, 
        isLoading: false 
      });
      
      // デモ用：ログイン成功時に自動的にLocalStorageにデータを保存
      localStorage.setItem('auth_token', 'demo_token');
      localStorage.setItem('auth_user_id', user.id);
      localStorage.setItem('auth_tenant_id', tenant.id);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'ログインに失敗しました', 
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tenant: null
      });
    }
  },

  logout: () => {
    // Clear authentication state and local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_tenant_id');
    
    set({ 
      user: null,
      tenant: null,
      isAuthenticated: false, 
      error: null 
    });
  },

  // 強制的にログイン状態にする関数を追加
  forceLogin: () => {
    console.log('forceLogin: 強制ログイン開始');
    const tenant = mockTenants['topaz-sms'];
    const user = mockUser;
    
    // LocalStorageに認証情報を保存
    localStorage.setItem('auth_token', 'demo_token');
    localStorage.setItem('auth_user_id', user.id);
    localStorage.setItem('auth_tenant_id', tenant.id);
    
    set({
      user,
      tenant,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    console.log('forceLogin: 強制ログイン完了');
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
    } else if (updatedUser.id === '3') {
      Object.assign(mockJintechAdmin, updatedUser);
    }
  },

  // テナント情報取得
  getTenantInfo: () => {
    const state = get();
    if (state.tenant) {
      return state.tenant;
    }
    return getTenantFromDomain();
  },

  // テナント情報更新（管理者用）
  updateTenant: (updatedTenant: Tenant) => {
    console.log('テナント情報を更新します', updatedTenant);
    
    // 実際の環境では、ここでAPIリクエストを行う
    set({
      tenant: updatedTenant
    });
    
    // モックデータも更新（idがundefinedでないことを確認）
    if (updatedTenant.id && mockTenants[updatedTenant.id]) {
      Object.assign(mockTenants[updatedTenant.id], updatedTenant);
      
      // localStorage更新
      localStorage.setItem('auth_tenant_id', updatedTenant.id);
    }
  },

  checkAuth: async () => {
    console.log('checkAuth: 認証チェック開始');
    set({ isLoading: true });
    
    try {
      // デモ環境では即座に認証状態を設定
      const tenant = mockTenants['topaz-sms'];
      const user = mockUser;
      
      set({
        user,
        tenant,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      console.log('checkAuth: 認証チェック完了');
    } catch (error) {
      console.error('checkAuth: 認証チェックエラー', error);
      set({
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