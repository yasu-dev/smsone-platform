import React, { useState } from 'react';
import { Search, Download, Calendar, ClipboardList, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Line } from 'recharts';

// モックデータ
interface Survey {
  id: string;
  title: string;
  createdAt: string;
  responseCount: number;
  completionRate: number;
  isActive: boolean;
}

interface SurveyQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text' | 'rating';
  options?: string[];
  responses: any[];
}

interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  createdAt: string;
  completed: boolean;
  answers: {
    questionId: string;
    answer: any;
  }[];
}

const SurveyAnalytics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  
  // モックデータ作成（より充実したデータを生成）
  const surveys: Survey[] = React.useMemo(() => {
    return [
      {
        id: 'survey-1',
        title: 'お客様満足度調査',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 187,
        completionRate: 92.5,
        isActive: true,
      },
      {
        id: 'survey-2',
        title: '商品購入後アンケート',
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 143,
        completionRate: 88.2,
        isActive: true,
      },
      {
        id: 'survey-3',
        title: 'サービス利用後アンケート',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 98,
        completionRate: 85.7,
        isActive: true,
      },
      {
        id: 'survey-4',
        title: 'ウェブサイト使用感調査',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 76,
        completionRate: 79.3,
        isActive: true,
      },
      {
        id: 'survey-5',
        title: 'イベント参加後アンケート',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 42,
        completionRate: 94.1,
        isActive: true,
      },
      {
        id: 'survey-6',
        title: '新機能フィードバック',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 21,
        completionRate: 81.0,
        isActive: true,
      },
      {
        id: 'survey-7',
        title: '年末顧客満足度調査',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 203,
        completionRate: 90.2,
        isActive: false,
      },
      {
        id: 'survey-8',
        title: '従業員満足度調査',
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        responseCount: 48,
        completionRate: 97.8,
        isActive: false,
      }
    ];
  }, []);
  
  // フィルタリング
  const filteredSurveys = surveys.filter(survey => 
    survey.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 選択されたアンケートの回答データを取得
  const selectedSurvey = selectedSurveyId 
    ? surveys.find(s => s.id === selectedSurveyId) 
    : null;
  
  // 選択されたアンケートの質問と回答データ（モック）
  const surveyQuestions: SurveyQuestion[] = React.useMemo(() => {
    if (!selectedSurvey) return [];
    
    // お客様満足度調査の場合
    if (selectedSurvey.id === 'survey-1') {
      return [
        {
          id: 'q1',
          question: '全体的な満足度を教えてください',
          type: 'rating',
          responses: [
            { rating: 5, count: 97 },
            { rating: 4, count: 52 },
            { rating: 3, count: 25 },
            { rating: 2, count: 10 },
            { rating: 1, count: 3 },
          ]
        },
        {
          id: 'q2',
          question: '最も役立った機能は何ですか？',
          type: 'single',
          options: ['SMS一斉送信', '短縮URL', 'テンプレート機能', '送信予約', 'SMS分析'],
          responses: [
            { option: 'SMS一斉送信', count: 78 },
            { option: '短縮URL', count: 42 },
            { option: 'テンプレート機能', count: 35 },
            { option: '送信予約', count: 20 },
            { option: 'SMS分析', count: 12 },
          ]
        },
        {
          id: 'q3',
          question: '今後追加して欲しい機能はありますか？（複数選択可）',
          type: 'multiple',
          options: ['AI文章生成', 'チャットサポート', '詳細な分析', 'API連携強化', 'モバイルアプリ'],
          responses: [
            { option: 'AI文章生成', count: 93 },
            { option: 'チャットサポート', count: 52 },
            { option: '詳細な分析', count: 77 },
            { option: 'API連携強化', count: 63 },
            { option: 'モバイルアプリ', count: 48 },
          ]
        },
        {
          id: 'q4',
          question: 'サービスの改善点や要望があれば教えてください',
          type: 'text',
          responses: [
            "使いやすくて助かっています。",
            "送信結果の確認がもう少し分かりやすいと良いです。",
            "APIの連携がもっと簡単だと嬉しいです。",
            "短縮URLの分析機能が素晴らしいです。",
            "テンプレートの数をもっと増やして欲しいです。",
            "一斉送信の際、もう少し細かいセグメントが設定できると良いと思います。",
            "送信予約の時間指定がより細かくできると使いやすいです。",
            "全体的に満足していますが、料金プランがもう少し柔軟だと嬉しいです。",
            "メッセージの送信状況がリアルタイムで確認できると良いです。",
            "AI機能の強化を期待しています。"
          ]
        }
      ];
    }
    
    // 商品購入後アンケートの場合
    if (selectedSurvey.id === 'survey-2') {
      return [
        {
          id: 'q1',
          question: '商品の品質に満足していますか？',
          type: 'rating',
          responses: [
            { rating: 5, count: 72 },
            { rating: 4, count: 43 },
            { rating: 3, count: 18 },
            { rating: 2, count: 7 },
            { rating: 1, count: 3 },
          ]
        },
        {
          id: 'q2',
          question: '配送までの時間はいかがでしたか？',
          type: 'rating',
          responses: [
            { rating: 5, count: 85 },
            { rating: 4, count: 35 },
            { rating: 3, count: 15 },
            { rating: 2, count: 5 },
            { rating: 1, count: 3 },
          ]
        },
        {
          id: 'q3',
          question: '梱包状態はいかがでしたか？',
          type: 'rating',
          responses: [
            { rating: 5, count: 93 },
            { rating: 4, count: 32 },
            { rating: 3, count: 12 },
            { rating: 2, count: 4 },
            { rating: 1, count: 2 },
          ]
        },
        {
          id: 'q4',
          question: '次回も当店で購入したいと思いますか？',
          type: 'single',
          options: ['必ず購入したい', 'たぶん購入したい', 'わからない', 'たぶん購入しない', '購入しない'],
          responses: [
            { option: '必ず購入したい', count: 78 },
            { option: 'たぶん購入したい', count: 47 },
            { option: 'わからない', count: 12 },
            { option: 'たぶん購入しない', count: 4 },
            { option: '購入しない', count: 2 },
          ]
        }
      ];
    }
    
    // その他のアンケートの場合はデフォルトのデータを返す
    return [
      {
        id: 'q1',
        question: '全体的な満足度を教えてください',
        type: 'rating',
        responses: [
          { rating: 5, count: Math.floor(Math.random() * 50) + 30 },
          { rating: 4, count: Math.floor(Math.random() * 40) + 20 },
          { rating: 3, count: Math.floor(Math.random() * 20) + 10 },
          { rating: 2, count: Math.floor(Math.random() * 10) + 2 },
          { rating: 1, count: Math.floor(Math.random() * 5) },
        ]
      },
      {
        id: 'q2',
        question: '最も役立った機能は何ですか？',
        type: 'single',
        options: ['SMS一斉送信', '短縮URL', 'テンプレート機能', '送信予約', 'SMS分析'],
        responses: [
          { option: 'SMS一斉送信', count: Math.floor(Math.random() * 30) + 20 },
          { option: '短縮URL', count: Math.floor(Math.random() * 25) + 15 },
          { option: 'テンプレート機能', count: Math.floor(Math.random() * 20) + 10 },
          { option: '送信予約', count: Math.floor(Math.random() * 15) + 5 },
          { option: 'SMS分析', count: Math.floor(Math.random() * 10) + 5 },
        ]
      }
    ];
  }, [selectedSurvey]);
  
  // 日別回答数（モック）
  const dailyResponses = React.useMemo(() => {
    if (!selectedSurvey) return [];
    
    // 調査日に応じたデータを生成
    const surveyCreatedDate = new Date(selectedSurvey.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - surveyCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToShow = Math.min(14, daysSinceCreation + 1);
    
    return Array.from({ length: daysToShow }, (_, i) => {
      const date = new Date(surveyCreatedDate);
      date.setDate(surveyCreatedDate.getDate() + i);
      
      // 開始直後は回答が多く、徐々に減少するパターンを再現
      let count;
      if (i < 3) {
        // 最初の3日間は多め
        count = Math.floor(selectedSurvey.responseCount * (0.2 - i * 0.05) * Math.random()) + 5;
      } else if (i < 7) {
        // 次の4日間は中程度
        count = Math.floor(selectedSurvey.responseCount * 0.08 * Math.random()) + 3;
      } else {
        // それ以降は少なめ
        count = Math.floor(selectedSurvey.responseCount * 0.05 * Math.random()) + 1;
      }
      
      return {
        date: date.toISOString().split('T')[0],
        count,
      };
    });
  }, [selectedSurvey]);
  
  // 回答完了率の計算
  const completionRateData = React.useMemo(() => {
    if (!selectedSurvey) return { completed: 0, abandoned: 0, rate: 0 };
    
    const completed = Math.floor(selectedSurvey.responseCount * (selectedSurvey.completionRate / 100));
    const abandoned = selectedSurvey.responseCount - completed;
    
    return {
      completed,
      abandoned,
      rate: selectedSurvey.completionRate
    };
  }, [selectedSurvey]);
  
  // サーベイレスポンスの詳細データ生成
  const generateSurveyResponses = (surveyId: string, count: number) => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => {
      const responseDate = new Date();
      responseDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
      
      // 95%の確率で完了状態に
      const completed = Math.random() < 0.95;
      
      return {
        id: `response-${surveyId}-${i}`,
        surveyId,
        respondentId: `user-${Math.floor(Math.random() * 1000)}`,
        createdAt: responseDate.toISOString(),
        completed,
        timestamp: responseDate.getTime()
      };
    });
  };
  
  // 時系列データ生成関数
  const generateTimeSeriesData = (responseData: any[], surveyId: string) => {
    const timestamps = responseData
      .filter(r => r.surveyId === surveyId)
      .map(r => r.timestamp);
    
    if (timestamps.length === 0) return [];
    
    // 日別にグループ化
    const grouped: {[key: string]: number} = {};
    timestamps.forEach(ts => {
      const date = new Date(ts).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    
    // 日付でソート
    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // すべてのアンケートのレスポンスデータを生成
  const allSurveyResponses = React.useMemo(() => {
    let responses: any[] = [];
    
    surveys.forEach(survey => {
      responses = [
        ...responses,
        ...generateSurveyResponses(survey.id, survey.responseCount)
      ];
    });
    
    return responses;
  }, [surveys]);
  
  // 選択されたアンケートのレスポンス時系列データ
  const selectedSurveyTimeData = React.useMemo(() => {
    if (!selectedSurvey) return [];
    return generateTimeSeriesData(allSurveyResponses, selectedSurvey.id);
  }, [selectedSurvey, allSurveyResponses]);
  
  // デモグラフィックデータ生成（模擬的な回答者属性データ）
  const demographicData = React.useMemo(() => {
    if (!selectedSurvey) return null;
    
    // 年齢分布
    const ageGroups = [
      { group: '18-24歳', count: Math.floor(selectedSurvey.responseCount * (0.15 + Math.random() * 0.1)) },
      { group: '25-34歳', count: Math.floor(selectedSurvey.responseCount * (0.25 + Math.random() * 0.1)) },
      { group: '35-44歳', count: Math.floor(selectedSurvey.responseCount * (0.20 + Math.random() * 0.1)) },
      { group: '45-54歳', count: Math.floor(selectedSurvey.responseCount * (0.18 + Math.random() * 0.1)) },
      { group: '55-64歳', count: Math.floor(selectedSurvey.responseCount * (0.12 + Math.random() * 0.08)) },
      { group: '65歳以上', count: 0 }
    ];
    // 残りを計算
    ageGroups[5].count = selectedSurvey.responseCount - ageGroups.slice(0, 5).reduce((sum, item) => sum + item.count, 0);
    
    // 性別分布
    const genderData = [
      { gender: '男性', count: Math.floor(selectedSurvey.responseCount * (0.48 + Math.random() * 0.04)) },
      { gender: '女性', count: Math.floor(selectedSurvey.responseCount * (0.48 + Math.random() * 0.04)) },
      { gender: 'その他/無回答', count: 0 }
    ];
    // 残りを計算
    genderData[2].count = selectedSurvey.responseCount - genderData.slice(0, 2).reduce((sum, item) => sum + item.count, 0);
    
    // 地域分布
    const regionData = [
      { region: '関東', count: Math.floor(selectedSurvey.responseCount * (0.35 + Math.random() * 0.05)) },
      { region: '関西', count: Math.floor(selectedSurvey.responseCount * (0.20 + Math.random() * 0.05)) },
      { region: '中部', count: Math.floor(selectedSurvey.responseCount * (0.12 + Math.random() * 0.03)) },
      { region: '九州', count: Math.floor(selectedSurvey.responseCount * (0.10 + Math.random() * 0.03)) },
      { region: '東北', count: Math.floor(selectedSurvey.responseCount * (0.08 + Math.random() * 0.02)) },
      { region: '北海道', count: Math.floor(selectedSurvey.responseCount * (0.05 + Math.random() * 0.02)) },
      { region: '中国', count: Math.floor(selectedSurvey.responseCount * (0.05 + Math.random() * 0.02)) },
      { region: '四国', count: Math.floor(selectedSurvey.responseCount * (0.04 + Math.random() * 0.02)) },
      { region: '沖縄', count: 0 }
    ];
    // 残りを計算
    regionData[8].count = selectedSurvey.responseCount - regionData.slice(0, 8).reduce((sum, item) => sum + item.count, 0);
    
    // デバイス分布
    const deviceData = [
      { device: 'スマートフォン', count: Math.floor(selectedSurvey.responseCount * (0.68 + Math.random() * 0.07)) },
      { device: 'PC', count: Math.floor(selectedSurvey.responseCount * (0.20 + Math.random() * 0.05)) },
      { device: 'タブレット', count: Math.floor(selectedSurvey.responseCount * (0.10 + Math.random() * 0.03)) },
      { device: 'その他', count: 0 }
    ];
    // 残りを計算
    deviceData[3].count = selectedSurvey.responseCount - deviceData.slice(0, 3).reduce((sum, item) => sum + item.count, 0);
    
    return {
      ageGroups,
      genderData,
      regionData,
      deviceData
    };
  }, [selectedSurvey]);
  
  const exportSurveyData = () => {
    if (!selectedSurvey) return;
    
    // CSV出力処理
    let csvContent = `アンケート: ${selectedSurvey.title}\n`;
    csvContent += `作成日: ${new Date(selectedSurvey.createdAt).toLocaleDateString('ja-JP')}\n`;
    csvContent += `回答数: ${selectedSurvey.responseCount}\n`;
    csvContent += `完了率: ${selectedSurvey.completionRate.toFixed(1)}%\n\n`;
    
    // 質問ごとの回答集計
    surveyQuestions.forEach(question => {
      csvContent += `質問: ${question.question}\n`;
      csvContent += `タイプ: ${question.type}\n`;
      
      if (question.type === 'rating') {
        csvContent += `評価,回答数\n`;
        question.responses.forEach(response => {
          csvContent += `${response.rating},${response.count}\n`;
        });
      } else if (question.type === 'single' || question.type === 'multiple') {
        csvContent += `選択肢,回答数\n`;
        question.responses.forEach(response => {
          csvContent += `${response.option},${response.count}\n`;
        });
      } else if (question.type === 'text') {
        csvContent += `回答\n`;
        question.responses.forEach(response => {
          csvContent += `"${response}"\n`;
        });
      }
      
      csvContent += `\n`;
    });
    
    // 日別回答数
    csvContent += `日付,回答数\n`;
    dailyResponses.forEach(item => {
      csvContent += `${item.date},${item.count}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `survey_${selectedSurvey.id}_analytics.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SurveyDetails = ({ survey, questions, demographicData, timeSeriesData }: any) => {
    if (!survey) return null;
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">アンケート概要</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">回答数:</span>
                <span className="font-medium">{survey.responseCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">完了率:</span>
                <span className="font-medium">{survey.completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">作成日:</span>
                <span className="font-medium">{new Date(survey.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ステータス:</span>
                <span className={`font-medium ${survey.isActive ? 'text-green-500' : 'text-gray-500'}`}>
                  {survey.isActive ? 'アクティブ' : '終了'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">回答者属性</h3>
            {demographicData && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">性別</h4>
                  <div className="space-y-1">
                    {demographicData.genderData.map((item: any) => (
                      <div key={item.gender} className="flex justify-between text-sm">
                        <span>{item.gender}</span>
                        <span>{Math.round(item.count / survey.responseCount * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">年代</h4>
                  <div className="space-y-1">
                    {demographicData.ageGroups.map((item: any) => (
                      <div key={item.group} className="flex justify-between text-sm">
                        <span>{item.group}</span>
                        <span>{Math.round(item.count / survey.responseCount * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">時系列回答数</h3>
          {timeSeriesData && timeSeriesData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date: string) => {
                      const d = new Date(date);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">データがありません</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">地域分布</h3>
            {demographicData && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicData.regionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {demographicData.regionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={[
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
                          '#8B5CF6', '#EC4899', '#6366F1', '#F97316', '#14B8A6'
                        ][index % 9]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">デバイス分布</h3>
            {demographicData && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicData.deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="device"
                    >
                      {demographicData.deviceData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium">質問と回答</h3>
          {questions.map((question: SurveyQuestion) => (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium mb-4">{question.question}</h4>
              
              {question.type === 'rating' && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={question.responses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {(question.type === 'single' || question.type === 'multiple') && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={question.responses} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="option" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {question.type === 'text' && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {question.responses.map((response, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded text-sm">
                      {response}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-grey-900">アンケート分析</h2>
            <p className="mt-1 text-sm text-grey-500">
              SMSで送信したアンケートの回答状況を分析できます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                {dateRange === 'today' ? '今日' : 
                 dateRange === 'week' ? '直近7日間' : 
                 dateRange === 'month' ? '直近30日間' : '期間指定'}
              </button>
              
              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4 border border-grey-200">
                  <div className="space-y-2">
                    <button 
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'today' ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-50'}`}
                      onClick={() => {
                        setDateRange('today');
                        setShowDatePicker(false);
                      }}
                    >
                      今日
                    </button>
                    <button 
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'week' ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-50'}`}
                      onClick={() => {
                        setDateRange('week');
                        setShowDatePicker(false);
                      }}
                    >
                      直近7日間
                    </button>
                    <button 
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'month' ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-50'}`}
                      onClick={() => {
                        setDateRange('month');
                        setShowDatePicker(false);
                      }}
                    >
                      直近30日間
                    </button>
                    <div className={`${dateRange === 'custom' ? 'bg-primary-50 rounded-md p-2' : ''}`}>
                      <div className="text-sm text-grey-700 mb-2">期間指定</div>
                      <div className="flex flex-col space-y-2">
                        <input 
                          type="date"
                          className="form-input text-sm py-1"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input 
                          type="date"
                          className="form-input text-sm py-1"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                        <button 
                          type="button"
                          className="btn-primary btn-sm"
                          onClick={() => {
                            if (startDate && endDate) {
                              setDateRange('custom');
                              setShowDatePicker(false);
                            }
                          }}
                        >
                          適用
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-grey-400" />
            </div>
            <input
              type="search"
              className="form-input pl-10"
              placeholder="アンケート名を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredSurveys.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-md">
            <ClipboardList className="h-12 w-12 text-grey-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-grey-900">データがありません</h3>
            <p className="mt-1 text-sm text-grey-500">
              {searchTerm ? '検索条件に一致するアンケートが見つかりませんでした。' : 'アンケートデータがありません。'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-grey-200">
              <thead className="bg-grey-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    アンケート名
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    回答数
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    完了率
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    作成日
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-grey-200">
                {filteredSurveys.map((survey) => (
                  <tr 
                    key={survey.id}
                    className={`hover:bg-grey-50 cursor-pointer ${selectedSurveyId === survey.id ? 'bg-primary-50' : ''}`}
                    onClick={() => setSelectedSurveyId(survey.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-grey-900">{survey.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-grey-900">{survey.responseCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-grey-900">{survey.completionRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                      {new Date(survey.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        survey.isActive ? 'bg-success-100 text-success-800' : 'bg-grey-100 text-grey-800'
                      }`}>
                        {survey.isActive ? '有効' : '終了'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {selectedSurvey && (
        <div className="mt-6">
          <SurveyDetails 
            survey={selectedSurvey} 
            questions={surveyQuestions} 
            demographicData={demographicData}
            timeSeriesData={selectedSurveyTimeData}
          />
        </div>
      )}
    </div>
  );
};

export default SurveyAnalytics; 