import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Send, History, FileText, Settings, Users, 
  BarChart2, FileQuestion, Link as LinkIcon
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
  onClick?: () => void;
  isMobile?: boolean;
  onToggle?: () => void;
}

interface SidebarProps {
  onToggle?: () => void;
  isCollapsed: boolean;
  isMobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label, icon, isCollapsed, onClick, isMobile, onToggle }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={to}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
          isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-grey-600 hover:bg-grey-100 hover:text-grey-900'
        }`}
        title={isCollapsed ? label : ''}
        onClick={onClick}
      >
        <span className={isCollapsed ? 'mx-auto' : 'mr-3'}>
          <motion.div
            animate={{ scale: isActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        </span>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onToggle, isCollapsed, isMobile = false }) => {
  const { user } = useAuthStore();
  const { tenant } = useAuthStore();
  const userRole = user?.role;
  const hasPermission = useAuthStore(state => state.hasPermission);
  const tenantName = tenant?.name || 'SMSOne';
  const isSMSOne = tenantName === 'SMSOne';

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle();
    }
  };

  const handleLinkClick = () => {
    // モバイル表示時にリンクをクリックしたらメニューを閉じる
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  const sidebarVariants = {
    expanded: { width: '100%' },
    collapsed: { width: '4rem' }
  };

  return (
    <motion.div
      className="flex flex-col h-full overflow-y-auto bg-white relative"
      initial={isCollapsed ? "collapsed" : "expanded"}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div 
        className="flex-1 space-y-1 p-3"
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <NavLink 
          to="/" 
          label="ダッシュボード" 
          icon={<Home />} 
          isCollapsed={isCollapsed} 
          onClick={handleLinkClick} 
          isMobile={isMobile}
          onToggle={onToggle}
        />
        
        <NavLink to="/send" label="SMS送信" icon={<Send />} isCollapsed={isCollapsed} onClick={handleLinkClick} />
        <NavLink to="/history" label="送信履歴" icon={<History />} isCollapsed={isCollapsed} onClick={handleLinkClick} />
        <NavLink to="/templates" label="テンプレート" icon={<FileText />} isCollapsed={isCollapsed} onClick={handleLinkClick} />
        {(userRole === 'admin' || hasPermission('surveysCreation')) && (
          <NavLink to="/surveys" label="アンケート" icon={<FileQuestion />} isCollapsed={isCollapsed} onClick={handleLinkClick} />
        )}
        <NavLink to="/analytics" label="分析" icon={<BarChart2 />} isCollapsed={isCollapsed} onClick={handleLinkClick} />
        {(userRole === 'admin' || userRole === 'manager') && hasPermission('userManagement') && (
          <NavLink to="/users" label="ユーザー管理" icon={<Users />} isCollapsed={isCollapsed} onClick={handleLinkClick} />
        )}
        <NavLink to="/settings" label="設定" icon={<Settings />} isCollapsed={isCollapsed} onClick={handleLinkClick} />
      </motion.div>
    </motion.div>
  );
};

export default Sidebar; 