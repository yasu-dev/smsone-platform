import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { UserRole } from '../types';
import { UserCog } from 'lucide-react';

interface RoleRouteProps {
  role: UserRole | UserRole[];
  children: ReactNode;
}

// ロール階層（高い権限から順）
const roleHierarchy: Record<UserRole, number> = {
  'admin': 100,
  'manager': 80,
  'user': 60,
  'operator': 40,
  'viewer': 20
};

// ロール表示名の取得
function getRoleDisplayName(role: UserRole): string {
  const roleDisplayNames: Record<UserRole, string> = {
    'admin': '管理者',
    'manager': 'マネージャー',
    'user': '一般ユーザー',
    'operator': 'オペレーター',
    'viewer': '閲覧専用'
  };
  
  return roleDisplayNames[role] || role;
}

/**
 * 特定のロールを要求するルートコンポーネント
 * 要求されたロール以上の権限がない場合はアクセス拒否メッセージを表示
 */
const RoleRoute: React.FC<RoleRouteProps> = ({ role, children }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 要求されたロールが配列の場合はいずれかのロールに合致すればOK
  if (Array.isArray(role)) {
    const hasRequiredRole = role.some(r => 
      roleHierarchy[user.role] >= roleHierarchy[r]
    );
    
    if (hasRequiredRole) {
      return <>{children}</>;
    }
  } else {
    // 単一のロールの場合は、ユーザーのロールが要求ロール以上であればOK
    if (roleHierarchy[user.role] >= roleHierarchy[role]) {
      return <>{children}</>;
    }
  }
  
  // 要求されるロールテキストの生成
  const roleText = Array.isArray(role) 
    ? role.map(r => getRoleDisplayName(r)).join('または')
    : getRoleDisplayName(role);
  
  // 権限がない場合はアクセス拒否メッセージ
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center bg-white p-8 rounded-lg border border-grey-200 shadow-sm">
        <UserCog className="mx-auto h-16 w-16 text-grey-300 mb-4" />
        <h2 className="text-2xl font-medium text-grey-900 mb-3">アクセス権限がありません</h2>
        <p className="text-grey-600 mb-6">
          このページを表示するには「{roleText}」以上の役割が必要です。
          必要な権限がない場合は、管理者にお問い合わせください。
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            前のページに戻る
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            ダッシュボードへ
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleRoute; 