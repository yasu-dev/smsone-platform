import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Edit, Trash2, RefreshCw, Shield, Clock, Calendar, Info, Activity, Check, X, Download, FileText, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import MessagingSettings from '../components/settings/MessagingSettings';

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
    surveysCreation: boolean; // アンケート作成権限を追加
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

// MessagingSettingsコンポーネントのProps型を定義
interface MessagingSettingsProps {
  userId?: string;
}

// MessagingSettingsコンポーネントを修正してuserIdをオプショナルに対応
const UserMessagingSettings: React.FC<MessagingSettingsProps> = ({ userId }) => {
  // 仮の実装 - 実際のコンポーネントに置き換える
  return (
    <div>
      <p>ユーザーID: {userId || '未指定'}</p>
      {/* 実際の送信者名設定コンポーネントの内容を表示 */}
    </div>
  );
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
      userManagement: false,
      surveysCreation: false // アンケート作成権限を追加
    },
    password: '',
    confirmPassword: ''
  });
  
  // 検証エラー状態
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // ナビゲーション用hook
  const navigate = useNavigate();
  
  // メッセージ設定モーダル用の状態
  const [showMessageSettings, setShowMessageSettings] = useState(false);
  const [selectedUserForSettings, setSelectedUserForSettings] = useState<UserData | null>(null);
  
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
    // 実際の企業ユーザーのデータを返す
    return [
      // Topaz合同会社のユーザー
      {
        id: 'topaz-1',
        username: '佐藤太郎',
        email: 'sato@topaz-sms.com',
        role: 'admin',
        status: 'active',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: true,
          templateEditing: true,
          bulkSending: true,
          apiAccess: true,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: true,
          surveysCreation: true
        }
      },
      {
        id: 'topaz-2',
        username: '鈴木花子',
        email: 'suzuki@topaz-sms.com',
        role: 'manager',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: true,
          templateEditing: true,
          bulkSending: true,
          apiAccess: true,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: false,
          surveysCreation: true
        }
      },
      
      // ヤマダ電機のユーザー
      {
        id: 'yamada-1',
        username: '山田健太',
        email: 'yamada-k@yamada-denki.jp',
        role: 'admin',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: false,
          templateEditing: true,
          bulkSending: true,
          apiAccess: true,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: true,
          surveysCreation: true
        }
      },
      {
        id: 'yamada-2',
        username: '伊藤直子',
        email: 'ito-n@yamada-denki.jp',
        role: 'manager',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: false,
          templateEditing: true,
          bulkSending: true,
          apiAccess: false,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: false,
          surveysCreation: true
        }
      },
      {
        id: 'yamada-3',
        username: '中村俊介',
        email: 'nakamura-s@yamada-denki.jp',
        role: 'operator',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: false,
          templateEditing: true,
          bulkSending: true,
          apiAccess: false,
          scheduledSending: true,
          analyticsAccess: false,
          userManagement: false,
          surveysCreation: false
        }
      },
      
      // ジンテック社のユーザー
      {
        id: 'jintech-1',
        username: '高橋誠',
        email: 'takahashi@jintech.co.jp',
        role: 'admin',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: true,
          templateEditing: true,
          bulkSending: true,
          apiAccess: true,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: true,
          surveysCreation: true
        }
      },
      {
        id: 'jintech-2',
        username: '渡辺裕子',
        email: 'watanabe@jintech.co.jp',
        role: 'manager',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 145 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: true,
          templateEditing: true,
          bulkSending: true,
          apiAccess: true,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: false,
          surveysCreation: true
        }
      },
      
      // ジンテックのOEMサービス利用企業（大手小売業）
      {
        id: 'retail-1',
        username: '佐々木剛',
        email: 'sasaki@mega-retail.co.jp',
        role: 'manager',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: false,
          templateEditing: true,
          bulkSending: true,
          apiAccess: true,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: true,
          surveysCreation: true
        }
      },
      {
        id: 'retail-2',
        username: '小林恵',
        email: 'kobayashi@mega-retail.co.jp',
        role: 'operator',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: {
          internationalSms: false,
          templateEditing: true,
          bulkSending: true,
          apiAccess: false,
          scheduledSending: true,
          analyticsAccess: true,
          userManagement: false,
          surveysCreation: false
        }
      },
      
      // 今後追加予定のユーザー
      {
        id: 'new-user',
        username: '新規ユーザー',
        email: 'newuser@example.com',
        role: 'user',
        status: 'pending',
        lastLoginAt: '',
        createdAt: new Date().toISOString(),
        permissions: {
          internationalSms: false,
          templateEditing: false,
          bulkSending: false,
          apiAccess: false,
          scheduledSending: false,
          analyticsAccess: false,
          userManagement: false,
          surveysCreation: false
        }
      }
    ];
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
        userManagement: false,
        surveysCreation: false // アンケート作成権限を追加
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
  
  // ユーザー作成フォーム用のresetForm関数を追加
  const resetForm = () => {
    setFormData({
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
        userManagement: false,
        surveysCreation: false
      },
      password: '',
      confirmPassword: ''
    });
    setValidationErrors({});
  };
  
  // validateForm関数を修正して常にエラーオブジェクトを返すようにする
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'ユーザー名は必須です';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスは必須です';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    // 新規作成時のみパスワード検証
    if (!editingUser) {
      if (!formData.password) {
        errors.password = 'パスワードは必須です';
      } else if (formData.password.length < 8) {
        errors.password = 'パスワードは8文字以上である必要があります';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'パスワードが一致しません';
      }
    }
    
    return errors;
  };
  
  // 新規ユーザー作成
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // フォーム検証
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // モックAPIリクエスト（実際の実装では適切なAPIコールに置き換え）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: UserData = {
        id: `user-${Date.now()}`,
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        permissions: {
          ...formData.permissions
        }
      };
      
      // ユーザーリストに追加
      setUsers([...users, newUser]);
      
      // モーダルを閉じる
      setShowCreateModal(false);
      
      // フォームをリセット
      resetForm();
      
      // 成功メッセージ
      toast.success('ユーザーが作成されました');
      
      // 送信者名設定は同一画面で行うため、別画面への遷移は削除
      // navigateToMessageSettings(newUser.id);
    } catch (error) {
      toast.error('ユーザーの作成に失敗しました');
      console.error(error);
    } finally {
      setIsLoading(false);
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
      
      // 送信者名設定画面への遷移は不要になったので削除
      // navigateToMessageSettings(updatedUser.id);
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
  
  // ユーザー作成成功時にメッセージ設定画面に遷移する関数
  const navigateToMessageSettings = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      // テスト確認用にコンソールログを追加
      console.log(`ユーザー「${user.username}」の送信者名設定画面へ遷移します。UserID: ${userId}`);
      // ユーザー情報をセット
      setSelectedUserForSettings(user);
      // メッセージ設定モーダルを表示
      setShowMessageSettings(true);
      
      // テスト用：ユーザー作成から送信者名設定画面への遷移を記録
      window.sessionStorage.setItem('navigation_test', JSON.stringify({
        from: 'user_creation',
        to: 'message_settings',
        userId: userId,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.error(`ユーザーID ${userId} が見つかりません。送信者名設定画面への遷移に失敗しました。`);
    }
  };
  
  // レンダリング部分にメッセージ設定モーダルを追加
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
        <div className="fixed inset-0 bg-grey-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-b border-grey-200 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-grey-900">{selectedUser.username}</h2>
                  <p className="text-sm text-grey-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="text-grey-400 hover:text-grey-500"
                onClick={() => setSelectedUser(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* タブメニュー */}
            <div className="border-b border-grey-200">
              <nav className="px-6 flex space-x-8">
                <button
                  className={`py-3 px-1 ${
                    selectedTab === 'info'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'border-b-2 border-transparent text-grey-500 hover:text-grey-700 hover:border-grey-300'
                  }`}
                  onClick={() => setSelectedTab('info')}
                >
                  基本情報
                </button>
                <button
                  className={`py-3 px-1 ${
                    selectedTab === 'activity'
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'border-b-2 border-transparent text-grey-500 hover:text-grey-700 hover:border-grey-300'
                  }`}
                  onClick={() => setSelectedTab('activity')}
                >
                  アクティビティ履歴
                </button>
                <button
                  className={`py-3 px-1 ${
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
            <div className="p-6">
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
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            
              {/* 他のタブのコンテンツはそのまま */}
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
            
            <div className="px-6 py-3 border-t border-grey-200 bg-grey-50 flex justify-end">
              <button
                type="button"
                className="btn-secondary mr-3"
                onClick={() => setSelectedUser(null)}
              >
                閉じる
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleEditUser(selectedUser)}
              >
                <Edit className="h-4 w-4 mr-2" />
                編集
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* 新規ユーザー作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-grey-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
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
                      
                      <div className="flex items-center">
                        <input
                          id="surveysCreation"
                          name="surveysCreation"
                          type="checkbox"
                          checked={formData.permissions.surveysCreation}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="surveysCreation" className="ml-2 block text-sm text-grey-700">
                          アンケート作成
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* 送信者名設定を直接新規ユーザー作成画面に表示 */}
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium text-grey-900 flex items-center mb-4">
                      <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
                      送信者名設定
                    </h3>
                    <div className="bg-grey-50 rounded-md p-4">
                      <p className="text-sm text-grey-500 mb-4">
                        ユーザーを作成すると、送信者名設定を行うことができます。
                        送信者名はSMS送信時に表示される発信元として使用されます。
                        最低1つの送信者名を登録することをお勧めします。
                      </p>
                      <MessagingSettings />
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
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
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
                      
                      <div className="flex items-center">
                        <input
                          id="surveysCreation"
                          name="surveysCreation"
                          type="checkbox"
                          checked={formData.permissions.surveysCreation}
                          onChange={handlePermissionChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="surveysCreation" className="ml-2 block text-sm text-grey-700">
                          アンケート作成
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* 送信者名設定を直接ユーザー編集画面に表示 */}
                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-medium text-grey-900 flex items-center mb-4">
                      <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
                      送信者名設定
                    </h3>
                    <div className="bg-grey-50 rounded-md p-4">
                      <MessagingSettings userId={editingUser?.id} />
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
      
      {/* メッセージ設定モーダル */}
      {showMessageSettings && selectedUserForSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-grey-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-grey-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary-600" />
                  送信者名設定 - {selectedUserForSettings.username}
                </h2>
                <button
                  onClick={() => setShowMessageSettings(false)}
                  className="text-grey-500 hover:text-grey-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-2 text-sm text-grey-500">
                <strong>ユーザー登録完了</strong>：「{selectedUserForSettings.username}」さんの送信者名設定を行ってください。
                送信者名はSMS送信時に表示される発信元として使用されます。
              </p>
              <p className="mt-1 text-sm text-grey-500">
                この設定は後からいつでも変更できます。最低1つの送信者名を登録することをお勧めします。
              </p>
            </div>
            
            <div className="p-6">
              <MessagingSettings userId={selectedUserForSettings.id} />
            </div>
            
            <div className="px-6 py-4 border-t border-grey-200 flex justify-end">
              <button
                onClick={() => setShowMessageSettings(false)}
                className="btn-primary"
              >
                <Check className="h-4 w-4 mr-2" />
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;