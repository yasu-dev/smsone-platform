import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import useAuthStore from './store/authStore';

// アプリケーションの初期化
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

// アプリケーションのレンダリング前に認証状態を設定
const { forceLogin } = useAuthStore.getState();
forceLogin();

// レンダリング開始
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);