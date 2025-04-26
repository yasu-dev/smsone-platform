import React from 'react';
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
import PermissionRoute from './routes/PermissionRoute';
import RoleRoute from './routes/RoleRoute';

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* 公開アンケート回答ページ - 認証不要 */}
        <Route path="/survey-response/:surveyId" element={<SurveyResponse />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* 基本ページ - すべてのユーザーがアクセス可能 */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* 権限が必要なページ - 特定の機能権限が必要 */}
            <Route path="/send" element={
              <PermissionRoute permission="bulkSending">
                <SendSMS />
              </PermissionRoute>
            } />
            
            <Route path="/history" element={<MessageHistory />} />
            
            <Route path="/templates" element={
              <PermissionRoute permission="templateEditing">
                <Templates />
              </PermissionRoute>
            } />
            
            <Route path="/settings" element={<Settings />} />
            
            <Route path="/users" element={
              <PermissionRoute permission="userManagement">
                <RoleRoute role={['admin', 'manager']}>
                  <UserManagement />
                </RoleRoute>
              </PermissionRoute>
            } />
            
            <Route path="/shortener" element={
              <PermissionRoute permission="apiAccess">
                <ShortenerTools />
              </PermissionRoute>
            } />
            
            <Route path="/analytics" element={
              <PermissionRoute permission="analyticsAccess">
                <Analytics />
              </PermissionRoute>
            } />
            
            <Route path="/surveys" element={
              <PermissionRoute permission="surveysCreation">
                <Surveys />
              </PermissionRoute>
            } />
            
            <Route path="/surveys/create" element={
              <PermissionRoute permission="surveysCreation">
                <SurveyCreate />
              </PermissionRoute>
            } />
            
            <Route path="/surveys/edit/:id" element={
              <PermissionRoute permission="surveysCreation">
                <SurveyCreate />
              </PermissionRoute>
            } />
            
            <Route path="/surveys/stats/:id" element={
              <PermissionRoute permission="analyticsAccess">
                <SurveyStats />
              </PermissionRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;