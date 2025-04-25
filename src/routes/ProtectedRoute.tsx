import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth, forceLogin } = useAuthStore();
  const location = useLocation();
  
  // コンソールに現在の認証状態を出力
  console.log('ProtectedRoute: 現在のパス =', location.pathname);
  console.log('ProtectedRoute: 認証状態 =', isAuthenticated ? '認証済み' : '未認証');
  console.log('ProtectedRoute: ロード状態 =', isLoading ? 'ロード中' : '完了');
  
  useEffect(() => {
    console.log('ProtectedRoute: useEffect実行');
    
    // 認証済みでなく、ロード中でもない場合に認証チェック
    if (!isAuthenticated) {
      console.log('認証されていません。認証処理を実行します');
      
      if (isLoading) {
        console.log('ロード中のため待機します');
      } else {
        console.log('forceLogin関数を実行します');
        forceLogin(); // 強制ログイン
        checkAuth();  // 念のため認証チェックも実行
      }
    } else {
      console.log('既に認証されています');
    }
  }, [isAuthenticated, isLoading, checkAuth, forceLogin]);
  
  // ロード中の表示
  if (isLoading) {
    console.log('ロード中の表示を返します');
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
    console.log('未認証のため、ログインページへリダイレクトします');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 認証済みの場合は子ルートを表示
  console.log('認証済み: 保護されたコンテンツを表示します');
  return <Outlet />;
};

export default ProtectedRoute;