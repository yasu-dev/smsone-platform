import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Header: React.FC = () => {
  const { tenant } = useAuthStore();
  
  return (
    <header className="bg-grey-100" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* 空のdiv - レイアウトを保持するため */}
        <div className="flex items-center">
        </div>
        
        {/* ナビゲーション */}
        <nav className="flex items-center space-x-4">
          {/* ナビゲーションアイテムをここに追加 */}
        </nav>
      </div>
    </header>
  );
};

export default Header; 