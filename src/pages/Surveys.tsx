import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ChevronDown, ChevronUp, Plus, Edit, Trash2, RefreshCw, 
  ChevronLeft, ChevronRight, Download, BarChart, Eye, Calendar, Link, X, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import useSurveyStore from '../store/surveyStore';
import { Survey, SurveyStatus } from '../types';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

// ステータス表示マッピング
const statusDisplayNames: Record<SurveyStatus, { label: string, color: string }> = {
  'active': { label: '有効', color: 'bg-success-100 text-success-800 border-success-200' },
  'inactive': { label: '無効', color: 'bg-grey-100 text-grey-700 border-grey-200' },
  'draft': { label: '下書き', color: 'bg-info-100 text-info-800 border-info-200' },
  'expired': { label: '期限切れ', color: 'bg-error-100 text-error-800 border-error-200' }
};

const Surveys: React.FC = () => {
  // アンケートリスト状態
  const { surveys, isLoading, fetchSurveys, deleteSurvey, exportResponsesCSV } = useSurveyStore();
  const { hasPermission } = useAuthStore();
  const navigate = useNavigate();
  
  // UI状態
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Survey>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'all'>('all');
  
  // 初回データ取得
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);
  
  // 検索・フィルタリング
  useEffect(() => {
    let result = [...surveys];
    
    // ステータスフィルタリング
    if (statusFilter !== 'all') {
      result = result.filter(survey => survey.status === statusFilter);
    }
    
    // 検索条件でフィルタリング
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(survey => 
        survey.name.toLowerCase().includes(lowerSearchTerm) ||
        survey.tagName.toLowerCase().includes(lowerSearchTerm) ||
        survey.htmlTitle.toLowerCase().includes(lowerSearchTerm)
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
    
    setFilteredSurveys(result);
  }, [surveys, searchTerm, sortField, sortDirection, statusFilter]);
  
  // ページネーション
  const totalPages = Math.max(1, Math.ceil(filteredSurveys.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSurveys.slice(indexOfFirstItem, indexOfLastItem);
  
  // ページ変更ハンドラ
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // ソートハンドラ
  const handleSort = (field: keyof Survey) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };
  
  // 削除確認モーダル
  const handleShowDeleteModal = (survey: Survey) => {
    setSurveyToDelete(survey);
    setShowDeleteModal(true);
  };
  
  // アンケート削除
  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return;
    
    try {
      await deleteSurvey(surveyToDelete.id);
      setShowDeleteModal(false);
      setSurveyToDelete(null);
      
      // 現在のページの項目が0になった場合は前のページに移動
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error) {
      toast.error('アンケートの削除に失敗しました');
    }
  };
  
  // CSV出力
  const handleExportCSV = async (surveyId: string) => {
    try {
      await exportResponsesCSV(surveyId);
    } catch (error) {
      toast.error('CSVエクスポートに失敗しました');
    }
  };
  
  // 作成画面に移動
  const handleCreateSurvey = () => {
    navigate('/surveys/create');
  };
  
  // 編集画面に移動
  const handleEditSurvey = (id: string) => {
    navigate(`/surveys/edit/${id}`);
  };
  
  // 統計画面に移動
  const handleViewStats = (id: string) => {
    navigate(`/surveys/stats/${id}`);
  };
  
  // 詳細画面に移動（回答ページの確認用）
  const handleViewSurvey = (id: string) => {
    // 公開URLを新しいタブで開く
    window.open(`/survey-response/${id}`, '_blank');
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
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-2xl font-bold text-grey-900 mb-6">アンケート</h1>
      
      <div className="card mb-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-grey-400" />
            </div>
            <input
              type="search"
              placeholder="アンケート名、タグ名などで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button
                className="btn-secondary flex items-center"
                onClick={() => {
                  const dropdown = document.getElementById('statusFilterDropdown');
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                ステータス: {statusFilter === 'all' ? 'すべて' : statusDisplayNames[statusFilter].label}
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              <div
                id="statusFilterDropdown"
                className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1"
              >
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    statusFilter === 'all' ? 'bg-grey-100' : ''
                  }`}
                  onClick={() => setStatusFilter('all')}
                >
                  すべて
                </button>
                {(Object.keys(statusDisplayNames) as SurveyStatus[]).map(status => (
                  <button
                    key={status}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      statusFilter === status ? 'bg-grey-100' : ''
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {statusDisplayNames[status].label}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleCreateSurvey}
              className="btn-primary"
              disabled={!hasPermission('surveysCreation')}
            >
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </button>
            <button
              onClick={() => fetchSurveys()}
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
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-md">
            <FileText className="h-12 w-12 text-grey-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-grey-900">アンケートが見つかりません</h3>
            <p className="mt-1 text-sm text-grey-500">
              {searchTerm || statusFilter !== 'all'
                ? '検索条件に一致するアンケートが見つかりませんでした。検索条件を変更してください。'
                : 'アンケートが存在しません。新規アンケートを作成してください。'}
            </p>
            {(!searchTerm && statusFilter === 'all' && hasPermission('surveysCreation')) && (
              <button
                onClick={handleCreateSurvey}
                className="mt-4 btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                新規アンケート作成
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-grey-200">
                <thead className="bg-grey-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        アンケート名
                        {sortField === 'name' && (
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
                        onClick={() => handleSort('tagName')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        タグ名
                        {sortField === 'tagName' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('updatedAt')}
                        className="flex items-center font-medium hover:text-grey-700"
                      >
                        更新日時
                        {sortField === 'updatedAt' && (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                      有効期間
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-grey-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-grey-200">
                  {currentItems.map((survey) => (
                    <tr key={survey.id} className="hover:bg-grey-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-grey-900 truncate max-w-[200px]">
                          {survey.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-grey-900 bg-grey-100 inline-block px-2 py-1 rounded text-sm">
                          {survey.tagName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${statusDisplayNames[survey.status].color}`}>
                          {statusDisplayNames[survey.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-grey-700">
                        {formatDate(survey.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-grey-700">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 text-grey-400 mr-1" />
                          <span>
                            {new Date(survey.startDateTime).toLocaleDateString('ja-JP')} 〜 {new Date(survey.endDateTime).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewSurvey(survey.id)}
                            className="text-grey-600 hover:text-grey-900"
                            title="詳細"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditSurvey(survey.id)}
                            className="text-grey-600 hover:text-grey-900"
                            title="編集"
                            disabled={!hasPermission('surveysCreation')}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleViewStats(survey.id)}
                            className="text-info-600 hover:text-info-800"
                            title="統計"
                          >
                            <BarChart className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleExportCSV(survey.id)}
                            className="text-success-600 hover:text-success-800"
                            title="CSV出力"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          {hasPermission('surveysCreation') && (
                            <button
                              onClick={() => handleShowDeleteModal(survey)}
                              className="text-error-600 hover:text-error-800"
                              title="削除"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-4">
                <div className="text-sm text-grey-700">
                  全 <span className="font-medium">{filteredSurveys.length}</span> 件中 
                  <span className="font-medium"> {indexOfFirstItem + 1}</span> - 
                  <span className="font-medium"> {Math.min(indexOfLastItem, filteredSurveys.length)}</span> 件を表示
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn-icon"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-grey-500 hover:bg-grey-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-icon"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 削除確認モーダル */}
      {showDeleteModal && surveyToDelete && (
        <div className="fixed inset-0 bg-grey-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-grey-900">アンケートの削除</h3>
                <button
                  type="button"
                  className="text-grey-400 hover:text-grey-500"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-grey-700 mb-4">
                アンケート「{surveyToDelete.name}」を削除しますか？<br />
                この操作は元に戻せません。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className="btn-error"
                  onClick={handleDeleteSurvey}
                >
                  削除
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Surveys; 