import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, User, LogOut, ChevronDown, Bell, 
  LayoutDashboard, Mail, FileText, Settings, Users, History, Link2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';
import useAuthStore from '../../store/authStore';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setNotificationsOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const navigation = [
    { name: 'ダッシュボード', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'SMS送信', href: '/send', icon: <Mail className="h-5 w-5" /> },
    { name: '送信履歴', href: '/history', icon: <History className="h-5 w-5" /> },
    { name: 'テンプレート', href: '/templates', icon: <FileText className="h-5 w-5" /> },
  ];
  
  // URL短縮ツールへのリンク - 表示はされないが機能は維持
  const hiddenNavigation = [
    { name: 'URL短縮ツール', href: '/shortener', icon: <Link2 className="h-5 w-5" /> },
  ];

  // Admin-only menu items
  const adminNavigation = user?.role === 'admin' ? [
    { name: 'ユーザー管理', href: '/users', icon: <Users className="h-5 w-5" /> },
    { name: '設定', href: '/settings', icon: <Settings className="h-5 w-5" /> },
  ] : [];

  // Combine regular and admin navigation
  const fullNavigation = [...navigation, ...adminNavigation];

  // Mock notifications for the demo
  const notifications = [
    { id: 1, text: 'CSV一括送信が完了しました', time: '5分前' },
    { id: 2, text: 'システムメンテナンスのお知らせ', time: '1時間前' },
    { id: 3, text: '新機能が追加されました', time: '1日前' },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/">
                <Logo size="md" />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {fullNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    isActive(item.href)
                      ? 'border-b-2 border-primary-500 text-grey-900'
                      : 'border-b-2 border-transparent text-grey-500 hover:border-grey-300 hover:text-grey-700'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Notifications dropdown */}
            <div className="relative ml-3">
              <button
                type="button"
                className="relative rounded-full bg-white p-1 text-grey-400 hover:text-grey-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={toggleNotifications}
              >
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] text-white">
                  3
                </span>
                <Bell className="h-6 w-6" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="px-4 py-2 text-center border-b border-grey-200">
                      <h3 className="text-sm font-medium text-grey-900">通知</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-grey-50 border-b border-grey-100 last:border-b-0"
                        >
                          <p className="text-sm text-grey-700">{notification.text}</p>
                          <p className="text-xs text-grey-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-grey-200 px-4 py-2">
                      <Link
                        to="/notifications"
                        className="block text-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        すべての通知を見る
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div className="relative ml-3">
              <div>
                <button
                  type="button"
                  className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={toggleProfileMenu}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="ml-2 text-grey-700 text-sm hidden md:block">{user?.username}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-grey-500" />
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <div className="border-b border-grey-200 px-4 py-2">
                      <p className="text-sm font-medium text-grey-900">{user?.username}</p>
                      <p className="text-xs text-grey-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-grey-700 hover:bg-grey-50"
                    >
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        プロフィール
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-grey-700 hover:bg-grey-50"
                    >
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        ログアウト
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-grey-400 hover:bg-grey-100 hover:text-grey-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden"
          >
            <div className="space-y-1 pb-3 pt-2">
              {fullNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium leading-5 ${
                    isActive(item.href)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-transparent text-grey-500 hover:border-grey-300 hover:bg-grey-50 hover:text-grey-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </div>
                </Link>
              ))}
            </div>
            <div className="border-t border-grey-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-grey-800">
                    {user?.username}
                  </div>
                  <div className="text-sm font-medium text-grey-500">
                    {user?.email}
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-grey-400 hover:text-grey-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  onClick={toggleNotifications}
                >
                  <span className="absolute flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-error-500 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-error-500"></span>
                  </span>
                  <Bell className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-grey-500 hover:bg-grey-100 hover:text-grey-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  プロフィール
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-grey-500 hover:bg-grey-100 hover:text-grey-800"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;