import React, { ReactNode } from 'react';
import { UserCog } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { UserRole } from '../../types';

interface RoleGuardProps {
  requiredRole: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

// ロール階層（高い権限から順）
const roleHierarchy: Record<UserRole, number> = {
  'admin': 100,
  'manager': 80,
  'user': 60,
  'operator': 40,
  'viewer': 20
};

/**
 * 特定のロールが必要なコンポーネントをラップするガードコンポーネント
 * 必要なロール以上の権限がない場合は代替表示またはエラーメッセージを表示
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  requiredRole, 
  children, 
  fallback 
}) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return null;
  }
  
  // 要求されたロールが配列の場合はいずれかのロールに合致すればOK
  if (Array.isArray(requiredRole)) {
    const hasRequiredRole = requiredRole.some(role => 
      roleHierarchy[user.role] >= roleHierarchy[role]
    );
    
    if (hasRequiredRole) {
      return <>{children}</>;
    }
  } else {
    // 単一のロールの場合は、ユーザーのロールが要求ロール以上であればOK
    if (roleHierarchy[user.role] >= roleHierarchy[requiredRole]) {
      return <>{children}</>;
    }
  }
  
  // 代替表示がある場合はそれを表示
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // 代替表示がない場合はデフォルトのアクセス拒否メッセージ
  const roleText = Array.isArray(requiredRole) 
    ? requiredRole.map(r => getRoleDisplayName(r)).join('または')
    : getRoleDisplayName(requiredRole);
  
  return (
    <div className="p-6 text-center bg-grey-50 rounded-lg border border-grey-200">
      <UserCog className="mx-auto h-12 w-12 text-grey-300 mb-4" />
      <h3 className="text-lg font-medium text-grey-900 mb-2">アクセス権限がありません</h3>
      <p className="text-sm text-grey-600 mb-4">
        この機能を利用するには「{roleText}」以上の権限が必要です。
      </p>
      <p className="text-xs text-grey-500">
        必要な場合は管理者にお問い合わせください。
      </p>
    </div>
  );
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

export default RoleGuard; 