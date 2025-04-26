import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, User, LogOut, ChevronDown, Bell,
  PanelRightOpen, PanelRightClose
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
  onSidebarToggle?: () => void;
  isSidebarCollapsed?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle, onSidebarToggle, isSidebarCollapsed = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout, tenant } = useAuthStore();
  const navigate = useNavigate();
  
  // Refs for dropdown containers
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // テナントのスタイルを適用
  useEffect(() => {
    if (tenant?.primaryColor) {
      document.documentElement.style.setProperty('--color-primary-600', tenant.primaryColor);
      if (tenant.secondaryColor) {
        document.documentElement.style.setProperty('--color-primary-700', tenant.secondaryColor);
      }
    }
  }, [tenant]);

  // Handle clicks outside of dropdown menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close notifications dropdown if click is outside
      if (notificationsOpen && 
          notificationsRef.current && 
          !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      
      // Close profile menu dropdown if click is outside
      if (profileMenuOpen && 
          profileMenuRef.current && 
          !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    // Add event listener when dropdowns are open
    if (notificationsOpen || profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen, profileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
    setNotificationsOpen(false);
  };

  const toggleSidebar = () => {
    // 親コンポーネントのサイドバー開閉関数を呼び出す
    if (onSidebarToggle) {
      onSidebarToggle();
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Mock notifications for the demo
  const notifications = [
    { id: 1, text: 'CSV一括送信が完了しました', time: '5分前', link: '/history' },
    { id: 2, text: 'システムメンテナンスのお知らせ', time: '1時間前', link: '/dashboard' },
    { id: 3, text: '新機能が追加されました', time: '1日前', link: '/dashboard' },
  ];

  const handleNotificationClick = (link: string) => {
    navigate(link);
    setNotificationsOpen(false);
  };

  // テナント名
  const tenantName = tenant?.name || 'SMSOne';
  const isSMSOne = tenantName === 'SMSOne';

  return (
    <nav className="bg-grey-50 text-grey-900 fixed top-0 w-full z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* テナント名とサイドバー開閉アイコンを表示 */}
          <div className="flex-1 flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <span className={`text-lg font-extrabold ${isSMSOne ? 'text-black' : ''}`} style={{
                fontFamily: "'Arial', 'Helvetica', sans-serif",
                letterSpacing: '0.05em',
                fontWeight: 600,
                ...(isSMSOne ? {
                  color: '#000000'
                } : {})
              }}>
                {tenantName}
              </span>
              
              {/* サイドバー開閉アイコン */}
              <button
                type="button"
                className="hidden sm:flex ml-3 rounded-full p-1 text-grey-700 hover:text-grey-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-grey-50"
                onClick={toggleSidebar}
              >
                {isSidebarCollapsed ? (
                  <PanelRightOpen className="h-6 w-6" />
                ) : (
                  <PanelRightClose className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            {/* Notifications dropdown */}
            <div className="relative ml-3" ref={notificationsRef}>
              <button
                type="button"
                className="relative rounded-full bg-grey-50 p-1 text-grey-700 hover:text-grey-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-grey-50"
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
                          className="px-4 py-3 hover:bg-grey-50 border-b border-grey-100 last:border-b-0 cursor-pointer"
                          onClick={() => handleNotificationClick(notification.link)}
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
                        onClick={() => setNotificationsOpen(false)}
                        style={tenant?.primaryColor ? { color: tenant.primaryColor } : {}}
                      >
                        すべての通知を見る
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile dropdown */}
            <div className="relative ml-3" ref={profileMenuRef}>
              <div>
                <button
                  type="button"
                  className="flex rounded-full bg-grey-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-grey-50"
                  onClick={toggleProfileMenu}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-grey-200 flex items-center justify-center text-grey-700">
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
                      {tenant && (
                        <p className="text-xs text-primary-600 mt-1"
                          style={tenant?.primaryColor ? { color: tenant.primaryColor } : {}}
                        >
                          {tenant.name}
                        </p>
                      )}
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
          <div className="flex sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-grey-700 hover:bg-grey-200 hover:text-grey-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={toggleMobileMenu}
            >
              <span className="absolute -inset-0.5"></span>
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
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
            <div className="border-t border-grey-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-grey-200 flex items-center justify-center text-grey-700">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-grey-900">{user?.username}</div>
                  <div className="text-sm font-medium text-grey-700">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-grey-700 hover:bg-grey-100 hover:text-grey-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-grey-500" />
                    プロフィール
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-grey-700 hover:bg-grey-100 hover:text-grey-900"
                >
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-5 w-5 text-grey-500" />
                    ログアウト
                  </div>
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