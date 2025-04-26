import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  
  // ロード中の表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-grey-300 border-t-primary-600"></div>
          <p className="mt-4 text-grey-700 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  // 未認証の場合はログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 認証済みの場合は子ルートを表示
  return <Outlet />;
};

export default ProtectedRoute;