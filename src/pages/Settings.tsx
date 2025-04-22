import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, User, Key, UserCheck, UserX, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

interface UserPermission {
  id: string;
  username: string;
  email: string;
  hasInternationalSms: boolean;
}

// 管理者向け設定画面
const Settings: React.FC = () => {
  const { user, hasPermission } = useAuthStore();
  const navigate = useNavigate();
  
  // 管理者権限チェック
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-10">
        <h2 className="text-lg font-medium text-grey-900 mb-2">アクセス権限がありません</h2>
        <p className="text-grey-500">この画面は管理者のみアクセスできます。</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold text-grey-900 mb-6">設定</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white shadow-card rounded-lg p-5">
            <nav className="space-y-1">
              <button className="text-primary-600 hover:bg-primary-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full">
                <Globe className="text-primary-500 group-hover:text-primary-600 mr-3 h-5 w-5" />
                国際送信設定
              </button>
              <Link 
                to="/users" 
                className="text-grey-600 hover:bg-grey-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full"
              >
                <Users className="text-grey-500 group-hover:text-grey-600 mr-3 h-5 w-5" />
                ユーザー管理
              </Link>
              <button className="text-grey-600 hover:bg-grey-50 group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full">
                <Key className="text-grey-500 group-hover:text-grey-600 mr-3 h-5 w-5" />
                API設定
              </button>
            </nav>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <InternationalSmsSettings />
        </div>
      </div>
    </motion.div>
  );
};

// 国際送信設定コンポーネント
const InternationalSmsSettings: React.FC = () => {
  // モックユーザーリスト（実際にはAPIからデータを取得）
  const [users, setUsers] = useState<UserPermission[]>([
    { id: '1', username: 'admin', email: 'admin@topaz-sms.com', hasInternationalSms: true },
    { id: '2', username: 'user', email: 'user@topaz-sms.com', hasInternationalSms: false },
    { id: '3', username: 'marketer', email: 'marketer@topaz-sms.com', hasInternationalSms: true },
    { id: '4', username: 'editor', email: 'editor@topaz-sms.com', hasInternationalSms: false },
    { id: '5', username: 'viewer', email: 'viewer@topaz-sms.com', hasInternationalSms: false },
  ]);
  
  const [isSaving, setIsSaving] = useState(false);
  
  // 権限更新ハンドラ
  const togglePermission = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, hasInternationalSms: !user.hasInternationalSms } 
        : user
    ));
  };
  
  // 全ユーザーの権限を一括設定
  const setAllPermissions = (value: boolean) => {
    setUsers(users.map(user => ({ ...user, hasInternationalSms: value })));
  };
  
  // 変更を保存
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // API呼び出しをシミュレート
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('権限設定を保存しました');
    } catch (error) {
      toast.error('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white shadow-card rounded-lg overflow-hidden">
      <div className="p-6 border-b border-grey-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-grey-900">国際送信権限設定</h2>
            <p className="mt-1 text-sm text-grey-500">
              海外向けSMS送信が可能なユーザーを管理します。
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              type="button"
              className="btn-secondary text-xs flex items-center"
              onClick={() => setAllPermissions(true)}
            >
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              全て許可
            </button>
            <button
              type="button"
              className="btn-secondary text-xs flex items-center"
              onClick={() => setAllPermissions(false)}
            >
              <UserX className="h-3.5 w-3.5 mr-1" />
              全て不許可
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-grey-200">
          <thead className="bg-grey-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                ユーザー名
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                海外送信権限
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-grey-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-grey-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-grey-900">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-grey-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        checked={user.hasInternationalSms}
                        onChange={() => togglePermission(user.id)}
                      />
                      <span className="ml-2 text-sm text-grey-700">
                        {user.hasInternationalSms ? '許可' : '不許可'}
                      </span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-grey-50 px-6 py-3 flex justify-end">
        <button
          type="button"
          className="btn-primary"
          onClick={saveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              変更を保存
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;