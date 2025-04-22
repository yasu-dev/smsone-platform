import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Edit, Trash2, RefreshCw, Shield, Clock, Calendar, Info, Activity, Check, X, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRole } from '../types';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  lastLoginAt: string;
  createdAt: string;
  permissions: {
    internationalSms: boolean;
    templateEditing: boolean;
    bulkSending: boolean;
    apiAccess: boolean;
    scheduledSending: boolean;
    analyticsAccess: boolean;
    userManagement: boolean;
  };
}

interface UserActivityData {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

interface UserContractData {
  id: string;
  userId: string;
  planName: string;
  startDate: string;
  endDate: string;
  monthlyFee: number;
  status: 'active' | 'expired' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// ロール表示名マッピング
const roleDisplayNames: Record<UserRole, string> = {
  'admin': '管理者',
  'manager': 'マネージャー',
  'user': '一般ユーザー',
  'operator': 'オペレーター',
  'viewer': '閲覧専用'
};

const UserManagement: React.FC = () => {
  // ユーザーリスト状態
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [activityLogs, setActivityLogs] = useState<UserActivityData[]>([]);
  const [contracts, setContracts] = useState<UserContractData[]>([]);
  
  // UI状態
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [sortField, setSortField] = useState<keyof UserData>('username');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTab, setSelectedTab] = useState<'info' | 'activity' | 'contract'>('info');
  
  // ユーザー編集用フォーム状態
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user' as UserRole,
    status: 'active' as 'active' | 'inactive' | 'pending',
    permissions: {
      internationalSms: false,
      templateEditing: false,
      bulkSending: false,
      apiAccess: false,
      scheduledSending: false,
      analyticsAccess: false,
      userManagement: false
    },
    password: '',
    confirmPassword: ''
  });
  
  // 検証エラー状態
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 初回データ取得
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // 検索条件変更時のフィルタリング
  useEffect(() => {
    filterUsers();
  }, [searchTerm, users, sortField, sortDirection]);
  
  // ユーザーデータ取得
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // モックデータ取得（APIリクエストのシミュレーション）
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUsers = generateMockUsers();
      const mockActivityLogs = generateMockActivityLogs(mockUsers);
      const mockContracts = generateMockContracts(mockUsers);
      
      setUsers(mockUsers);
      setActivityLogs(mockActivityLogs);
      setContracts(mockContracts);
      setFilteredUsers(mockUsers);
    } catch (error) {
      toast.error('ユーザーデータの取得に失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // モックユーザーデータ生成
  const generateMockUsers = (): UserData[] => {
    const roles: UserRole[] = ['admin', 'manager', 'user', 'operator', 'viewer'];
    const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];
    
    return Array.from({ length: 25 }, (_, i) => {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const isAdmin = role === 'admin';
      const isManager = role === 'manager';
      
      return {
        id: `user-${i + 1}`,
        username: `ユーザー${i + 1}`,
        email: `user${i + 1}@example.com`,
        role,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
        permissions: {
          internationalSms: isAdmin || isManager || Math.random() > 0.5,
          templateEditing: isAdmin || isManager || Math.random() > 0.3,
          bulkSending: isAdmin || isManager || Math.random() > 0.5,
          apiAccess: isAdmin || Math.random() > 0.7,
          scheduledSending: isAdmin || isManager || Math.random() > 0.2,
          analyticsAccess: isAdmin || isManager || Math.random() > 0.5,
          userManagement: isAdmin
        }
      };
    });
  };
  
  // モックアクティビティログ生成
  const generateMockActivityLogs = (users: UserData[]): UserActivityData[] => {
    const actions = [
      'ログイン',
      'プロフィール更新',
      'パスワード変更',
      'SMS送信',
      'テンプレート作成',
      '一括送信実行',
      '設定変更',
      'API利用',
      'ログイン失敗'
    ];
    
    const logs: UserActivityData[] = [];
    
    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString();
      
      logs.push({
        id: `log-${i + 1}`,
        userId: user.id,
        action,
        timestamp,
        details: `${user.username}が${action}を実行しました（${Math.random() > 0.5 ? 'Webアプリ' : 'モバイルアプリ'}から）`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      });
    }
    
    // タイムスタンプでソート（新しい順）
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return logs;
  };
  
  // モック契約データ生成
  const generateMockContracts = (users: UserData[]): UserContractData[] => {
    const plans = ['スタンダードプラン', 'プレミアムプラン', 'エンタープライズプラン', 'スモールビジネスプラン', 'フリープラン'];
    const fees = [0, 5000, 10000, 30000, 50000, 100000];
    const statuses: Array<'active' | 'expired' | 'pending'> = ['active', 'expired', 'pending'];
    
    return users.map(user => {
      const startDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      return {
        id: `contract-${user.id}`,
        userId: user.id,
        planName: plans[Math.floor(Math.random() * plans.length)],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        monthlyFee: fees[Math.floor(Math.random() * fees.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: startDate.toISOString(),
        updatedAt: new Date(startDate.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
      };
    });
  };

  // ユーザーフィルタリング
  const filterUsers = () => {
    let result = [...users];
    
    // 検索条件でフィルタリング
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm) ||
        user.id.toLowerCase().includes(lowerSearchTerm) ||
        roleDisplayNames[user.role].toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // ソート
    result = result.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      return 0;
    });
    
    setFilteredUsers(result);
  };
  
  // ソートフィールド変更
  const handleSort = (field: keyof UserData) => {
    setSortDirection(currentDirection => 
      sortField === field && currentDirection === 'asc' ? 'desc' : 'asc'
    );
    setSortField(field);
  };
  
  // 特定ユーザーのアクティビティログを取得
  const getUserActivityLogs = (userId: string): UserActivityData[] => {
    return activityLogs.filter(log => log.userId === userId).slice(0, 20);
  };
  
  // ユーザー契約情報取得
  const getUserContract = (userId: string): UserContractData | undefined => {
    return contracts.find(contract => contract.userId === userId);
  };

  // ページネーション
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  // ユーザー詳細表示
  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setSelectedTab('info');
  };
  
  // ユーザー編集モーダル表示
  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: { ...user.permissions },
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };
  
  // 新規ユーザー作成モーダル表示
  const handleShowCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      role: 'user',
      status: 'active',
      permissions: {
        internationalSms: false,
        templateEditing: true,
        bulkSending: false,
        apiAccess: false,
        scheduledSending: true,
        analyticsAccess: true,
        userManagement: false
      },
      password: '',
      confirmPassword: ''
    });
    setValidationErrors({});
    setShowCreateModal(true);
  };
  
  // ユーザー削除
  const handleDeleteUser = async (user: UserData) => {
    if (confirm(`「${user.username}」を削除してもよろしいですか？`)) {
      try {
        // 削除API呼び出しシミュレーション
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 成功したらリストから削除
        setUsers(users.filter(u => u.id !== user.id));
        toast.success(`「${user.username}」を削除しました`);
        
        // 詳細表示中のユーザーが削除された場合は詳細表示を閉じる
        if (selectedUser?.id === user.id) {
          setSelectedUser(null);
        }
      } catch (error) {
        toast.error('ユーザーの削除に失敗しました');
      }
    }
  };
  
  // フォーム入力ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // 権限チェックボックスハンドラ
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [name]: checked
      }
    });
  };
  
  // ステータス変更ハンドラ（専用のトグルボタン用）
  const handleStatusChange = (status: 'active' | 'inactive' | 'pending') => {
    setFormData({
      ...formData,
      status
    });
  };
  
  // フォームバリデーション
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'ユーザー名は必須です';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!editingUser) { // 新規作成時のみパスワード必須
      if (!formData.password) {
        errors.password = 'パスワードは必須です';
      } else if (formData.password.length < 8) {
        errors.password = 'パスワードは8文字以上で入力してください';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'パスワードが一致しません';
      }
    } else if (formData.password && formData.password.length < 8) { // 編集時にパスワードが入力されている場合
      errors.password = 'パスワードは8文字以上で入力してください';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // 新規ユーザー作成
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // 作成API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser: UserData = {
        id: `user-${Date.now()}`,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions: { ...formData.permissions },
        createdAt: new Date().toISOString(),
        lastLoginAt: ''
      };
      
      // ユーザー一覧に追加
      setUsers([...users, newUser]);
      
      // 契約情報も生成
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      const newContract: UserContractData = {
        id: `contract-${newUser.id}`,
        userId: newUser.id,
        planName: 'スタンダードプラン',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        monthlyFee: 5000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setContracts([...contracts, newContract]);
      
      // モーダルを閉じる
      setShowCreateModal(false);
      toast.success('ユーザーを作成しました');
    } catch (error) {
      toast.error('ユーザー作成に失敗しました');
    }
  };
  
  // ユーザー更新
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editingUser) {
      return;
    }
    
    try {
      // 更新API呼び出しシミュレーション
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // ユーザー情報更新
      const updatedUser: UserData = {
        ...editingUser,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        permissions: { ...formData.permissions }
      };
      
      // ユーザー一覧を更新
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      
      // 詳細表示中のユーザーが更新された場合は詳細表示も更新
      if (selectedUser?.id === editingUser.id) {
        setSelectedUser(updatedUser);
      }
      
      // モーダルを閉じる
      setShowEditModal(false);
      toast.success('ユーザー情報を更新しました');
    } catch (error) {
      toast.error('ユーザー更新に失敗しました');
    }
  };
  
  // 日付フォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 日付のみフォーマット
  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  // 通貨フォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold text-grey-900 mb-6">ユーザー管理</h1>
      
      <div className="card mb-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-grey-400" />
            </div>
            <input
              type="search"
              placeholder="ユーザー名またはメールアドレスで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleShowCreateModal}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              新規ユーザー
            </button>
            <button
              onClick={() => fetchUsers()}
              className="btn-secondary"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              更新
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-grey-300 border-t-primary-600"></div>
            <p className="mt-2 text-grey-500">データを読み込み中...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-md">
            <User className="h-12 w-12 text-grey-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-grey-900">ユーザーが見つかりません</h3>
            <p className="mt-1 text-sm text-grey-500">
              {searchTerm 
                ? '検索条件に一致するユーザーが見つかりませんでした。検索条件を変更してください。'
                : 'ユーザーが存在しません。新規ユーザーを作成してください。'}
            </p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-grey-200">
                <thead className="bg-grey-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('username')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        ユーザー名
                        {sortField === 'username' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        メールアドレス
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        権限
                        {sortField === 'role' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        状態
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('lastLoginAt')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        最終ログイン
                        {sortField === 'lastLoginAt' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        登録日時
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">アクション</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-grey-200">
                  {currentItems.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-grey-50 cursor-pointer"
                      onClick={() => handleViewUser(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-grey-900">{user.username}</div>
                            <div className="text-xs text-grey-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-grey-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1.5 text-grey-400" />
                          <span className="text-sm text-grey-900">{roleDisplayNames[user.role]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.status === 'active' ? (
                          <span className="badge-success flex items-center w-fit">
                            <Check className="h-3 w-3 mr-1" />
                            有効
                          </span>
                        ) : user.status === 'inactive' ? (
                          <span className="badge-error flex items-center w-fit">
                            <X className="h-3 w-3 mr-1" />
                            無効
                          </span>
                        ) : (
                          <span className="badge-warning flex items-center w-fit">
                            <Clock className="h-3 w-3 mr-1" />
                            保留中
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-grey-400" />
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : '未ログイン'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1.5 text-grey-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
                          }}
                          className="text-error-600 hover:text-error-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* ページネーション */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-700">
                  全 <span className="font-medium">{filteredUsers.length}</span> 件中 
                  <span className="font-medium"> {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} </span>
                  件を表示
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-grey-300 bg-white text-grey-500 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-grey-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-grey-300 bg-white text-grey-500 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* ユーザー詳細表示 */}
      {selectedUser && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-grey-900">{selectedUser.username}</h2>
                <p className="text-sm text-grey-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditUser(selectedUser)}
                className="btn-secondary"
              >
                <Edit className="h-4 w-4 mr-1.5" />
                編集
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn-secondary"
              >
                閉じる
              </button>
            </div>
          </div>
          
          {/* タブメニュー */}
          <div className="border-b border-grey-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`py-2 px-1 ${
                  selectedTab === 'info'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'border-b-2 border-transparent text-grey-500 hover:text-grey-700 hover:border-grey-300'
                }`}
                onClick={() => setSelectedTab('info')}
              >
                基本情報
              </button>
              <button
                className={`py-2 px-1 ${
                  selectedTab === 'activity'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'border-b-2 border-transparent text-grey-500 hover:text-grey-700 hover:border-grey-300'
                }`}
                onClick={() => setSelectedTab('activity')}
              >
                アクティビティ履歴
              </button>
              <button
                className={`py-2 px-1 ${
                  selectedTab === 'contract'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'border-b-2 border-transparent text-grey-500 hover:text-grey-700 hover:border-grey-300'
                }`}
                onClick={() => setSelectedTab('contract')}
              >
                契約情報
              </button>
            </nav>
          </div>
          
          {/* タブコンテンツ */}
          {selectedTab === 'info' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本情報 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-grey-900 flex items-center">
                    <User className="h-5 w-5 mr-1.5 text-grey-500" />
                    基本情報
                  </h3>
                  
                  <div className="rounded-lg border border-grey-200 overflow-hidden">
                    <div className="px-4 py-3 bg-grey-50">
                      <p className="text-sm font-medium text-grey-700">アカウント詳細</p>
                    </div>
                    <div className="divide-y divide-grey-200">
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">ユーザーID</div>
                        <div className="col-span-2 text-sm text-grey-900">{selectedUser.id}</div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">ユーザー名</div>
                        <div className="col-span-2 text-sm text-grey-900">{selectedUser.username}</div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">メールアドレス</div>
                        <div className="col-span-2 text-sm text-grey-900">{selectedUser.email}</div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">権限</div>
                        <div className="col-span-2 text-sm text-grey-900 flex items-center">
                          <Shield className="h-4 w-4 mr-1.5 text-grey-400" />
                          {roleDisplayNames[selectedUser.role]}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">状態</div>
                        <div className="col-span-2">
                          {selectedUser.status === 'active' ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              有効
                            </span>
                          ) : selectedUser.status === 'inactive' ? (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              無効
                            </span>
                          ) : (
                            <span className="badge-warning flex items-center w-fit">
                              <Clock className="h-3 w-3 mr-1" />
                              保留中
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">登録日時</div>
                        <div className="col-span-2 text-sm text-grey-900">{formatDate(selectedUser.createdAt)}</div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">最終ログイン</div>
                        <div className="col-span-2 text-sm text-grey-900">
                          {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : '未ログイン'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 権限情報 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-grey-900 flex items-center">
                    <Shield className="h-5 w-5 mr-1.5 text-grey-500" />
                    権限設定
                  </h3>
                  
                  <div className="rounded-lg border border-grey-200 overflow-hidden">
                    <div className="px-4 py-3 bg-grey-50">
                      <p className="text-sm font-medium text-grey-700">機能権限</p>
                    </div>
                    <div className="divide-y divide-grey-200">
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">国際SMS送信</div>
                        <div className="col-span-2">
                          {selectedUser.permissions.internationalSms ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              許可
                            </span>
                          ) : (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              不許可
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">テンプレート編集</div>
                        <div className="col-span-2">
                          {selectedUser.permissions.templateEditing ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              許可
                            </span>
                          ) : (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              不許可
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">一括送信</div>
                        <div className="col-span-2">
                          {selectedUser.permissions.bulkSending ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              許可
                            </span>
                          ) : (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              不許可
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">API利用</div>
                        <div className="col-span-2">
                          {selectedUser.permissions.apiAccess ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              許可
                            </span>
                          ) : (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              不許可
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">予約送信</div>
                        <div className="col-span-2">
                          {selectedUser.permissions.scheduledSending ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              許可
                            </span>
                          ) : (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              不許可
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">分析機能</div>
                        <div className="col-span-2">
                          {selectedUser.permissions.analyticsAccess ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              許可
                            </span>
                          ) : (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              不許可
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-1">
                        <div className="text-sm font-medium text-grey-500">ユーザー管理</div>
                        <div className="col-span-2">
                          {selectedUser.permissions.userManagement ? (
                            <span className="badge-success flex items-center w-fit">
                              <Check className="h-3 w-3 mr-1" />
                              許可
                            </span>
                          ) : (
                            <span className="badge-error flex items-center w-fit">
                              <X className="h-3 w-3 mr-1" />
                              不許可
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {selectedTab === 'activity' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-grey-900 flex items-center">
                  <Activity className="h-5 w-5 mr-1.5 text-grey-500" />
                  アクティビティ履歴
                </h3>
                <button className="btn-secondary text-sm">
                  <Download className="h-4 w-4 mr-1.5" />
                  CSVダウンロード
                </button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-grey-200">
                  <thead className="bg-grey-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                        アクション
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                        日時
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                        IPアドレス
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                        詳細
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-grey-200">
                    {getUserActivityLogs(selectedUser.id).map((log) => (
                      <tr key={log.id} className="hover:bg-grey-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-grey-900">{log.action}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-grey-500">{formatDate(log.timestamp)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 text-sm text-grey-500">
                          <div className="max-w-lg truncate">{log.details}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {getUserActivityLogs(selectedUser.id).length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-md mt-4">
                  <Activity className="h-12 w-12 text-grey-400 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-grey-900">アクティビティ履歴がありません</h3>
                </div>
              )}
            </>
          )}
          
          {selectedTab === 'contract' && (
            <>
              <div className="mb-4">
                <h3 className="font-medium text-grey-900 flex items-center">
                  <FileText className="h-5 w-5 mr-1.5 text-grey-500" />
                  契約情報
                </h3>
              </div>
              
              {getUserContract(selectedUser.id) ? (
                <div>
                  {(() => {
                    const contract = getUserContract(selectedUser.id)!;
                    return (
                      <div className="rounded-lg border border-grey-200 overflow-hidden">
                        <div className="px-4 py-3 bg-grey-50">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-grey-700">契約詳細</p>
                            <div>
                              {contract.status === 'active' ? (
                                <span className="badge-success flex items-center w-fit">
                                  <Check className="h-3 w-3 mr-1" />
                                  有効
                                </span>
                              ) : contract.status === 'expired' ? (
                                <span className="badge-error flex items-center w-fit">
                                  <X className="h-3 w-3 mr-1" />
                                  期限切れ
                                </span>
                              ) : (
                                <span className="badge-warning flex items-center w-fit">
                                  <Clock className="h-3 w-3 mr-1" />
                                  保留中
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-grey-200">
                          <div className="px-4 py-3 grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium text-grey-500">契約プラン</div>
                            <div className="col-span-2 text-sm text-grey-900">{contract.planName}</div>
                          </div>
                          <div className="px-4 py-3 grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium text-grey-500">契約開始日</div>
                            <div className="col-span-2 text-sm text-grey-900">{formatDateOnly(contract.startDate)}</div>
                          </div>
                          <div className="px-4 py-3 grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium text-grey-500">契約終了日</div>
                            <div className="col-span-2 text-sm text-grey-900">{formatDateOnly(contract.endDate)}</div>
                          </div>
                          <div className="px-4 py-3 grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium text-grey-500">月額料金</div>
                            <div className="col-span-2 text-sm text-grey-900">{formatCurrency(contract.monthlyFee)}</div>
                          </div>
                          <div className="px-4 py-3 grid grid-cols-3 gap-1">
                            <div className="text-sm font-medium text-grey-500">最終更新日</div>
                            <div className="col-span-2 text-sm text-grey-900">{formatDate(contract.updatedAt)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="mt-4 p-3 border rounded-md bg-primary-50 text-primary-800 flex">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0 text-primary-500" />
                    <div className="text-sm">
                      <p className="font-medium">契約情報の変更について</p>
                      <p className="mt-1">契約内容の変更は営業担当者にお問い合わせください。</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <FileText className="h-12 w-12 text-grey-400 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-grey-900">契約情報がありません</h3>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* 新規ユーザー作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-grey-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-b border-grey-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-grey-900">新規ユーザー作成</h2>
              <button
                type="button"
                className="text-grey-400 hover:text-grey-500"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-4 flex-grow overflow-y-auto">
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  {/* 基本情報 */}
                  <div>
                    <label htmlFor="username" className="form-label">
                      ユーザー名 <span className="text-error-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.username ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                        placeholder="例: 山田太郎"
                      />
                      {validationErrors.username && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.username}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="form-label">
                      メールアドレス <span className="text-error-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.email ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                        placeholder="例: yamada@example.com"
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="role" className="form-label">
                        権限 <span className="text-error-500">*</span>
                      </label>
                      <div className="mt-1">
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="admin">管理者</option>
                          <option value="manager">マネージャー</option>
                          <option value="user">一般ユーザー</option>
                          <option value="operator">オペレーター</option>
                          <option value="viewer">閲覧専用</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">ステータス</label>
                      <div className="mt-1 flex space-x-4">
                        <button
                          type="button"
                          onClick={() => handleStatusChange('active')}
                          className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                            formData.status === 'active' 
                              ? 'bg-success-100 text-success-800 border border-success-200' 
                              : 'bg-grey-100 text-grey-700 border border-grey-200'
                          }`}
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          有効
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange('inactive')}
                          className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                            formData.status === 'inactive' 
                              ? 'bg-error-100 text-error-800 border border-error-200' 
                              : 'bg-grey-100 text-grey-700 border border-grey-200'
                          }`}
                        >
                          <X className="h-4 w-4 mr-1.5" />
                          無効
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="form-label">
                      パスワード <span className="text-error-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.password ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                      />
                      {validationErrors.password && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      パスワード（確認） <span className="text-error-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.confirmPassword ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                      />
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* 権限設定 */}
                  <div>
                    <label className="form-label">機能権限</label>
                    <div className="mt-2 space-y-3 border rounded-md p-4 bg-grey-50">
                      <div className="flex items-center">
                        <input
                          id="internationalSms"
                          name="internationalSms"
                          type="checkbox"
                          checked={formData.permissions.internationalSms}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="internationalSms" className="ml-2 block text-sm text-grey-700">
                          国際SMS送信
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="templateEditing"
                          name="templateEditing"
                          type="checkbox"
                          checked={formData.permissions.templateEditing}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="templateEditing" className="ml-2 block text-sm text-grey-700">
                          テンプレート編集
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="bulkSending"
                          name="bulkSending"
                          type="checkbox"
                          checked={formData.permissions.bulkSending}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="bulkSending" className="ml-2 block text-sm text-grey-700">
                          一括送信
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="apiAccess"
                          name="apiAccess"
                          type="checkbox"
                          checked={formData.permissions.apiAccess}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="apiAccess" className="ml-2 block text-sm text-grey-700">
                          API利用
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="scheduledSending"
                          name="scheduledSending"
                          type="checkbox"
                          checked={formData.permissions.scheduledSending}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="scheduledSending" className="ml-2 block text-sm text-grey-700">
                          予約送信
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="analyticsAccess"
                          name="analyticsAccess"
                          type="checkbox"
                          checked={formData.permissions.analyticsAccess}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="analyticsAccess" className="ml-2 block text-sm text-grey-700">
                          分析機能
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="userManagement"
                          name="userManagement"
                          type="checkbox"
                          checked={formData.permissions.userManagement}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="userManagement" className="ml-2 block text-sm text-grey-700">
                          ユーザー管理
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-grey-200 flex justify-end">
              <button
                type="button"
                className="btn-secondary mr-3"
                onClick={() => setShowCreateModal(false)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleCreateUser}
              >
                作成
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* ユーザー編集モーダル */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-grey-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-b border-grey-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-grey-900">ユーザー編集</h2>
              <button
                type="button"
                className="text-grey-400 hover:text-grey-500"
                onClick={() => setShowEditModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-4 flex-grow overflow-y-auto">
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-grey-500">ユーザーID</p>
                      <p className="text-sm text-grey-900">{editingUser.id}</p>
                    </div>
                  </div>
                  
                  {/* 基本情報 */}
                  <div>
                    <label htmlFor="username" className="form-label">
                      ユーザー名 <span className="text-error-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.username ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                      />
                      {validationErrors.username && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.username}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="form-label">
                      メールアドレス <span className="text-error-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.email ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="role" className="form-label">
                        権限 <span className="text-error-500">*</span>
                      </label>
                      <div className="mt-1">
                        <select
                          id="role"
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="admin">管理者</option>
                          <option value="manager">マネージャー</option>
                          <option value="user">一般ユーザー</option>
                          <option value="operator">オペレーター</option>
                          <option value="viewer">閲覧専用</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">ステータス</label>
                      <div className="mt-1 flex space-x-4">
                        <button
                          type="button"
                          onClick={() => handleStatusChange('active')}
                          className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                            formData.status === 'active' 
                              ? 'bg-success-100 text-success-800 border border-success-200' 
                              : 'bg-grey-100 text-grey-700 border border-grey-200'
                          }`}
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          有効
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange('inactive')}
                          className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                            formData.status === 'inactive' 
                              ? 'bg-error-100 text-error-800 border border-error-200' 
                              : 'bg-grey-100 text-grey-700 border border-grey-200'
                          }`}
                        >
                          <X className="h-4 w-4 mr-1.5" />
                          無効
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="form-label">
                      パスワード（変更する場合のみ）
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.password ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                        placeholder="パスワードを変更する場合のみ入力"
                      />
                      {validationErrors.password && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.password}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">
                      パスワード（確認）
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`form-input ${validationErrors.confirmPassword ? 'border-error-300 focus:ring-error-500 focus:border-error-500' : ''}`}
                        placeholder="パスワードを変更する場合のみ入力"
                      />
                      {validationErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-error-600">{validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* 権限設定 */}
                  <div>
                    <label className="form-label">機能権限</label>
                    <div className="mt-2 space-y-3 border rounded-md p-4 bg-grey-50">
                      <div className="flex items-center">
                        <input
                          id="internationalSms"
                          name="internationalSms"
                          type="checkbox"
                          checked={formData.permissions.internationalSms}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="internationalSms" className="ml-2 block text-sm text-grey-700">
                          国際SMS送信
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="templateEditing"
                          name="templateEditing"
                          type="checkbox"
                          checked={formData.permissions.templateEditing}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="templateEditing" className="ml-2 block text-sm text-grey-700">
                          テンプレート編集
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="bulkSending"
                          name="bulkSending"
                          type="checkbox"
                          checked={formData.permissions.bulkSending}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="bulkSending" className="ml-2 block text-sm text-grey-700">
                          一括送信
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="apiAccess"
                          name="apiAccess"
                          type="checkbox"
                          checked={formData.permissions.apiAccess}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="apiAccess" className="ml-2 block text-sm text-grey-700">
                          API利用
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="scheduledSending"
                          name="scheduledSending"
                          type="checkbox"
                          checked={formData.permissions.scheduledSending}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="scheduledSending" className="ml-2 block text-sm text-grey-700">
                          予約送信
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="analyticsAccess"
                          name="analyticsAccess"
                          type="checkbox"
                          checked={formData.permissions.analyticsAccess}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="analyticsAccess" className="ml-2 block text-sm text-grey-700">
                          分析機能
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="userManagement"
                          name="userManagement"
                          type="checkbox"
                          checked={formData.permissions.userManagement}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="userManagement" className="ml-2 block text-sm text-grey-700">
                          ユーザー管理
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-grey-200 flex justify-end">
              <button
                type="button"
                className="btn-secondary mr-3"
                onClick={() => setShowEditModal(false)}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleUpdateUser}
              >
                更新
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;