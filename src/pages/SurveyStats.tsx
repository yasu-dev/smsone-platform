import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, PieChart, BarChart as BarChartIcon, List, Clipboard } from 'lucide-react';
import useSurveyStore from '../store/surveyStore';
import { Survey, SurveyStatistics, SurveyResponse } from '../types';
import toast from 'react-hot-toast';

const SurveyStats: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchSurveyById, fetchStatistics, fetchResponses, exportResponsesCSV } = useSurveyStore();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [stats, setStats] = useState<SurveyStatistics | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'summary' | 'detail' | 'responses'>('summary');
  const [isExporting, setIsExporting] = useState(false);
  
  // データの取得
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error('アンケートIDが指定されていません');
        navigate('/surveys');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // アンケート情報取得
        const surveyData = await fetchSurveyById(id);
        if (!surveyData) {
          toast.error('アンケートが見つかりませんでした');
          navigate('/surveys');
          return;
        }
        
        setSurvey(surveyData);
        
        // 統計情報取得
        const statsData = await fetchStatistics(id);
        setStats(statsData);
        
        // 回答データ取得
        const responsesData = await fetchResponses(id);
        setResponses(responsesData);
        
      } catch (error) {
        toast.error('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate, fetchSurveyById, fetchStatistics, fetchResponses]);
  
  // CSV出力
  const handleExportCSV = async () => {
    if (!id) return;
    
    setIsExporting(true);
    
    try {
      await exportResponsesCSV(id);
      toast.success('CSVファイルをダウンロードしました');
    } catch (error) {
      toast.error('CSVエクスポートに失敗しました');
    } finally {
      setIsExporting(false);
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
  
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-grey-300 border-t-primary-600"></div>
        <p className="mt-2 text-grey-500">データを読み込み中...</p>
      </div>
    );
  }
  
  if (!survey || !stats) {
    return (
      <div className="text-center py-10">
        <p className="text-grey-600">データが見つかりませんでした</p>
        <button
          onClick={() => navigate('/surveys')}
          className="btn-primary mt-4"
        >
          アンケート一覧に戻る
        </button>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/surveys')}
            className="mr-2 btn-outline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            一覧に戻る
          </button>
          <h1 className="text-2xl font-bold text-grey-900">
            統計: {survey.name}
          </h1>
        </div>
        
        <button
          onClick={handleExportCSV}
          className="btn-primary"
          disabled={isExporting}
        >
          {isExporting ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
          ) : (
            <Download className="h-4 w-4 mr-1" />
          )}
          CSV出力
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="p-4 border-b border-grey-200">
          <h2 className="text-lg font-medium text-grey-900">アンケート概要</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-grey-50 p-4 rounded-lg">
              <p className="text-sm text-grey-500">回答数</p>
              <p className="text-2xl font-bold text-primary-600">{stats.totalResponses}</p>
            </div>
            <div className="bg-grey-50 p-4 rounded-lg">
              <p className="text-sm text-grey-500">完了率</p>
              <p className="text-2xl font-bold text-success-600">{stats.completionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-grey-50 p-4 rounded-lg">
              <p className="text-sm text-grey-500">平均回答時間</p>
              <p className="text-2xl font-bold text-info-600">{Math.floor(stats.averageTimeToComplete / 60)}分{stats.averageTimeToComplete % 60}秒</p>
            </div>
            <div className="bg-grey-50 p-4 rounded-lg">
              <p className="text-sm text-grey-500">実施期間</p>
              <p className="text-sm font-medium">
                {formatDate(survey.startDateTime)} 〜 {formatDate(survey.endDateTime)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mb-6">
        <div className="p-4 border-b border-grey-200">
          <div className="flex flex-wrap gap-2">
            <button
              className={`${
                activeView === 'summary' 
                  ? 'bg-primary-100 text-primary-700 border-primary-200' 
                  : 'bg-white text-grey-600 border-grey-200 hover:bg-grey-50'
              } border rounded-full px-4 py-1 text-sm font-medium flex items-center`}
              onClick={() => setActiveView('summary')}
            >
              <PieChart className="h-4 w-4 mr-1" />
              サマリー
            </button>
            <button
              className={`${
                activeView === 'detail' 
                  ? 'bg-primary-100 text-primary-700 border-primary-200' 
                  : 'bg-white text-grey-600 border-grey-200 hover:bg-grey-50'
              } border rounded-full px-4 py-1 text-sm font-medium flex items-center`}
              onClick={() => setActiveView('detail')}
            >
              <BarChartIcon className="h-4 w-4 mr-1" />
              質問別詳細
            </button>
            <button
              className={`${
                activeView === 'responses' 
                  ? 'bg-primary-100 text-primary-700 border-primary-200' 
                  : 'bg-white text-grey-600 border-grey-200 hover:bg-grey-50'
              } border rounded-full px-4 py-1 text-sm font-medium flex items-center`}
              onClick={() => setActiveView('responses')}
            >
              <List className="h-4 w-4 mr-1" />
              回答一覧
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeView === 'summary' && (
            <div>
              <h3 className="text-lg font-medium text-grey-900 mb-4">回答概要</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {stats.questionStats.map((questionStat, index) => (
                  <div key={questionStat.questionId} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      質問 {index + 1}: {questionStat.questionText}
                    </h4>
                    
                    {questionStat.optionStats ? (
                      <div>
                        <div className="space-y-2 mt-3">
                          {questionStat.optionStats.map(optionStat => (
                            <div key={optionStat.optionId}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{optionStat.optionText}</span>
                                <span className="font-medium">{optionStat.count}票 ({optionStat.percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-grey-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${optionStat.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <p className="text-sm text-grey-600 mb-2">自由回答 ({questionStat.freeTextAnswers?.length || 0}件)</p>
                        <p className="text-sm text-grey-500">
                          最新の回答:
                        </p>
                        <div className="mt-2 max-h-60 overflow-y-auto">
                          {questionStat.freeTextAnswers?.slice(0, 3).map((answer, i) => (
                            <div key={i} className="p-2 bg-grey-50 rounded mb-2 text-sm">
                              {answer}
                            </div>
                          ))}
                          {(questionStat.freeTextAnswers?.length || 0) > 3 && (
                            <p className="text-sm text-grey-500 text-center mt-2">
                              他 {(questionStat.freeTextAnswers?.length || 0) - 3} 件の回答があります
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'detail' && (
            <div className="space-y-8">
              {stats.questionStats.map((questionStat, index) => (
                <div key={questionStat.questionId} className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-grey-900 mb-4">
                    質問 {index + 1}: {questionStat.questionText}
                  </h3>
                  
                  {questionStat.optionStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-grey-700 mb-3">回答分布</h4>
                        <div className="space-y-3">
                          {questionStat.optionStats.map(optionStat => (
                            <div key={optionStat.optionId}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{optionStat.optionText}</span>
                                <span className="font-medium">{optionStat.count}票 ({optionStat.percentage.toFixed(1)}%)</span>
                              </div>
                              <div className="w-full bg-grey-200 rounded-full h-3">
                                <div
                                  className="bg-primary-600 h-3 rounded-full"
                                  style={{ width: `${optionStat.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-grey-700 mb-3">統計情報</h4>
                        <div className="bg-grey-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-grey-500">回答数</p>
                              <p className="text-xl font-medium">{questionStat.totalAnswers}</p>
                            </div>
                            <div>
                              <p className="text-sm text-grey-500">回答率</p>
                              <p className="text-xl font-medium">
                                {stats.totalResponses > 0 
                                  ? ((questionStat.totalAnswers / stats.totalResponses) * 100).toFixed(1) 
                                  : 0}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-grey-500">最多選択</p>
                              <p className="text-md font-medium">
                                {questionStat.optionStats?.sort((a, b) => b.count - a.count)[0]?.optionText || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-grey-500">最少選択</p>
                              <p className="text-md font-medium">
                                {questionStat.optionStats?.sort((a, b) => a.count - b.count)[0]?.optionText || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-grey-700 mb-3">自由回答一覧 ({questionStat.freeTextAnswers?.length || 0}件)</h4>
                      
                      <div className="bg-grey-50 p-4 rounded-lg">
                        <p className="text-sm text-grey-500 mb-3">
                          <span className="font-medium">回答数:</span> {questionStat.totalAnswers} / {stats.totalResponses} ({stats.totalResponses > 0 ? ((questionStat.totalAnswers / stats.totalResponses) * 100).toFixed(1) : 0}%)
                        </p>
                        
                        <div className="max-h-80 overflow-y-auto space-y-2">
                          {questionStat.freeTextAnswers?.map((answer, i) => (
                            <div key={i} className="p-3 bg-white border rounded">
                              <p className="text-sm text-grey-600">{answer}</p>
                            </div>
                          ))}
                          
                          {!questionStat.freeTextAnswers?.length && (
                            <p className="text-sm text-grey-500 text-center py-4">
                              回答がありません
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {activeView === 'responses' && (
            <div>
              <h3 className="text-lg font-medium text-grey-900 mb-4">回答一覧</h3>
              
              {responses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-grey-200">
                    <thead className="bg-grey-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                          回答者
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                          回答日時
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                          回答数
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                          完了状態
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-grey-200">
                      {responses.map(response => (
                        <tr key={response.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-600">
                            {response.recipientPhoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-600">
                            {formatDate(response.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-600">
                            {response.answers.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              response.completedAt 
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-warning-100 text-warning-800'
                            }`}>
                              {response.completedAt ? '完了' : '回答中'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-600">
                            <button
                              onClick={() => {
                                // 詳細表示処理（モーダル表示など）
                                alert(`回答ID: ${response.id} の詳細表示`);
                              }}
                              className="text-primary-600 hover:text-primary-800 mr-2"
                            >
                              <Clipboard className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-grey-50 rounded-lg">
                  <p className="text-grey-500">回答データがありません</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SurveyStats; 