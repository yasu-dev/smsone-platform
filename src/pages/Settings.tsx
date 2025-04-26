import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  CreditCard, 
  MessageSquare, 
  HelpCircle, 
  Tag,
  Building
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import SecuritySettings from '../components/settings/SecuritySettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import BillingSettings from '../components/settings/BillingSettings';
import MessagingSettings from '../components/settings/MessagingSettings';
import HelpSupport from '../components/settings/HelpSupport';
import TagSettingsTab from '../components/settings/TagSettingsTab';
import TenantSettingsTab from '../components/settings/TenantSettingsTab';

// タブの型定義
type SettingsTab = 
  | 'security' 
  | 'notifications' 
  | 'billing' 
  | 'messaging' 
  | 'support'
  | 'tags'
  | 'tenant';

// 管理者向け設定画面
const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('tenant');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  // トパーズ社の管理者かどうか
  const isTopazAdmin = isAdmin && user?.tenant_id === 'topaz-sms';

  // タブを切り替える処理
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
  };

  // アクティブなタブのコンテンツを表示する
  const renderTabContent = () => {
    switch (activeTab) {
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'messaging':
        return <MessagingSettings />;
      case 'support':
        return <HelpSupport />;
      case 'tags':
        return <TagSettingsTab />;
      case 'tenant':
        return <TenantSettingsTab />;
      default:
        return <TagSettingsTab />;
    }
  };

  // アニメーション設定
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-8">
      <motion.div
        className="flex flex-col md:flex-row gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* 左側のタブメニュー */}
        <motion.div 
          className="w-full md:w-64 shrink-0" 
          variants={item}
        >
          <div className="bg-white rounded-lg shadow-sm border border-grey-200 overflow-hidden">
            <div className="p-4 border-b border-grey-200">
              <h2 className="text-lg font-semibold text-grey-900 flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2 text-primary-600" />
                設定
              </h2>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === 'tags' 
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'text-grey-700 hover:bg-grey-50'
                    }`}
                    onClick={() => handleTabChange('tags')}
                  >
                    <Tag className="h-5 w-5 mr-3" />
                    タグ管理
                  </button>
                </li>
                {/* トパーズ社の管理者のみに表示するテナント設定タブ */}
                {isTopazAdmin && (
                  <li>
                    <button
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                        activeTab === 'tenant' 
                          ? 'bg-primary-50 text-primary-700 font-medium' 
                          : 'text-grey-700 hover:bg-grey-50'
                      }`}
                      onClick={() => handleTabChange('tenant')}
                    >
                      <Building className="h-5 w-5 mr-3" />
                      テナント設定
                    </button>
                  </li>
                )}
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === 'notifications' 
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'text-grey-700 hover:bg-grey-50'
                    }`}
                    onClick={() => handleTabChange('notifications')}
                  >
                    <Bell className="h-5 w-5 mr-3" />
                    通知設定
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === 'billing' 
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'text-grey-700 hover:bg-grey-50'
                    }`}
                    onClick={() => handleTabChange('billing')}
                  >
                    <CreditCard className="h-5 w-5 mr-3" />
                    請求・支払い
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      activeTab === 'support' 
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'text-grey-700 hover:bg-grey-50'
                    }`}
                    onClick={() => handleTabChange('support')}
                  >
                    <HelpCircle className="h-5 w-5 mr-3" />
                    ヘルプ＆サポート
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </motion.div>
        
        {/* 右側のコンテンツ */}
        <motion.div className="flex-1" variants={item}>
          <div className="bg-white rounded-lg shadow-sm border border-grey-200 p-6">
            {renderTabContent()}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings;