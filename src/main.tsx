import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// アプリケーションの初期化遅延を少し入れる
// これにより認証処理が完了する前にUIが表示されることを防ぐ
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

// アプリケーションのレンダリング前にLocalStorageをチェック
const hasToken = localStorage.getItem('auth_token');
console.log('認証トークンの存在確認:', !!hasToken);

// レンダリング開始
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);