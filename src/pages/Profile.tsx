import React, { useState } from 'react';
import { User, Save, AtSign, Key, Building } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, tenant, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // パスワード変更のバリデーション
    if (showPasswordSection) {
      if (!formData.currentPassword) {
        toast.error('現在のパスワードを入力してください');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('新しいパスワードと確認用パスワードが一致しません');
        return;
      }
      
      if (formData.newPassword && formData.newPassword.length < 8) {
        toast.error('パスワードは8文字以上である必要があります');
        return;
      }
    }
    
    // プロフィール更新処理
    try {
      // モックのため、実際のAPIリクエストは行わず、ストアの更新だけを行う
      if (updateUser) {
        updateUser({
          ...user!,
          username: formData.username,
          email: formData.email,
        });
      }
      
      toast.success('プロフィールを更新しました');
      setIsEditing(false);
      setShowPasswordSection(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error('更新に失敗しました');
    }
  };

  if (!user) {
    return <div className="text-center py-8">ログインしてください</div>;
  }

  // ロール表示名の変換
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': '管理者',
      'manager': 'マネージャー',
      'operator': 'オペレーター',
      'viewer': '閲覧ユーザー',
      'user': 'ユーザー'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700"
          style={tenant?.primaryColor ? { 
            backgroundColor: `${tenant.primaryColor}20`, 
            color: tenant.primaryColor 
          } : {}}
        >
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-grey-900">プロフィール</h1>
          <p className="text-sm text-grey-500">アカウント情報の確認と編集</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-grey-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-grey-900">ユーザー情報</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white border border-grey-300 rounded-md text-sm font-medium text-grey-700 hover:bg-grey-50"
              >
                編集
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowPasswordSection(false);
                  setFormData({
                    username: user.username,
                    email: user.email,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="px-4 py-2 bg-white border border-grey-300 rounded-md text-sm font-medium text-grey-700 hover:bg-grey-50"
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
        
        <div className="px-6 py-4">
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-grey-500">ユーザー名</div>
                <div className="sm:col-span-2 text-sm text-grey-900">{user.username}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-grey-500">メールアドレス</div>
                <div className="sm:col-span-2 text-sm text-grey-900">{user.email}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-grey-500">テナント</div>
                <div className="sm:col-span-2 text-sm text-grey-900 flex items-center">
                  <Building className="h-4 w-4 mr-1.5 text-grey-400" />
                  <span className="text-primary-600"
                    style={tenant?.primaryColor ? { color: tenant.primaryColor } : {}}
                  >
                    {tenant?.name || '-'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-grey-500">ロール</div>
                <div className="sm:col-span-2 text-sm text-grey-900">
                  {getRoleDisplayName(user.role)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-sm font-medium text-grey-500">最終ログイン</div>
                <div className="sm:col-span-2 text-sm text-grey-900">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString('ja-JP') : 'なし'}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-grey-700 mb-1">
                  ユーザー名
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-grey-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="ユーザー名"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-grey-700 mb-1">
                  メールアドレス
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign className="h-4 w-4 text-grey-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="メールアドレス"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                <div className="text-sm font-medium text-grey-500">テナント</div>
                <div className="sm:col-span-2 text-sm text-grey-500 flex items-center">
                  <Building className="h-4 w-4 mr-1.5 text-grey-400" />
                  <span className="text-primary-600"
                    style={tenant?.primaryColor ? { color: tenant.primaryColor } : {}}
                  >
                    {tenant?.name || '-'}
                  </span>
                  <span className="ml-2 text-xs text-grey-400">(変更不可)</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                <div className="text-sm font-medium text-grey-500">ロール</div>
                <div className="sm:col-span-2 text-sm text-grey-500">
                  {getRoleDisplayName(user.role)}
                  <span className="ml-2 text-xs text-grey-400">(変更不可)</span>
                </div>
              </div>
              
              {!showPasswordSection ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    style={tenant?.primaryColor ? { color: tenant.primaryColor } : {}}
                  >
                    パスワードを変更する
                  </button>
                </div>
              ) : (
                <div className="space-y-4 border-t border-grey-200 pt-4 mt-4">
                  <h3 className="text-sm font-medium text-grey-900">パスワード変更</h3>
                  
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-grey-700 mb-1">
                      現在のパスワード
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-grey-400" />
                      </div>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder="現在のパスワード"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-grey-700 mb-1">
                      新しいパスワード
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-grey-400" />
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder="新しいパスワード（8文字以上）"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-grey-700 mb-1">
                      新しいパスワード（確認）
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-grey-400" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-grey-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder="新しいパスワード（確認）"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  保存する
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;