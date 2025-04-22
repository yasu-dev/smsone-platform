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
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/send" element={<SendSMS />} />
            <Route path="/history" element={<MessageHistory />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/shortener" element={<ShortenerTools />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;