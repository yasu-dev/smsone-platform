import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SendSMS from './pages/SendSMS';
import MessageHistory from './pages/MessageHistory';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import ShortenerTools from './pages/ShortenerTools';
import Analytics from './pages/Analytics';
import Surveys from './pages/Surveys';
import SurveyCreate from './pages/SurveyCreate';
import SurveyStats from './pages/SurveyStats';
import SurveyResponse from './pages/SurveyResponse';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import useAuthStore from './store/authStore';

function App() {
  const { checkAuth, forceLogin, isAuthenticated } = useAuthStore();

  // アプリ起動時に認証状態を確認
  useEffect(() => {
    console.log('App: 初期化中...');
    
    // 初期認証状態をコンソールに出力
    console.log('初期認証状態:', isAuthenticated);
    
    // デモ環境では強制的にログイン状態にする
    forceLogin();
    
    // 念のためcheckAuthも実行
    checkAuth();
    
    console.log('App: 初期化完了');
  }, [checkAuth, forceLogin, isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* 公開アンケート回答ページ - 認証不要 */}
        <Route path="/survey-response/:surveyId" element={<SurveyResponse />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/send" element={<SendSMS />} />
            <Route path="/history" element={<MessageHistory />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/shortener" element={<ShortenerTools />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Dashboard />} />
            <Route path="/surveys" element={<Surveys />} />
            <Route path="/surveys/create" element={<SurveyCreate />} />
            <Route path="/surveys/edit/:id" element={<SurveyCreate />} />
            <Route path="/surveys/stats/:id" element={<SurveyStats />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;