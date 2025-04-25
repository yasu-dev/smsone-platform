import React, { useState, useEffect } from 'react';
import { 
  Calendar, BarChart3, ArrowUpRight, Search, Download,
  BarChart2, Clock, ExternalLink, Calendar as CalendarIcon
} from 'lucide-react';
import useSMSStore from '../../store/smsStore';
import { SMSMessage } from '../../types';

interface UrlClickData {
  url: string;
  clicks: number;
  lastClickedAt?: string;
  originalUrl?: string;
  messageId: string;
}

const UrlAnalytics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedUrlId, setSelectedUrlId] = useState<string | null>(null);
  
  const { messages } = useSMSStore();
  
  const urlsWithClicks: UrlClickData[] = React.useMemo(() => {
    // より現実的なデモデータを生成
    const mockUrls: UrlClickData[] = [];
    
    // 人気の高いURLパターン
    const popularDomains = [
      'example.com/products',
      'example.com/campaign',
      'example.com/events',
      'example.com/limited',
      'example.com/special',
      'example.shop/items',
      'example.store/discount'
    ];
    
    // 現実的なクリック数分布を生成
    const generateClicks = (popular: boolean) => {
      if (popular) {
        // 人気の高いURL（20%の確率）
        return Math.floor(Math.random() * 80) + 40;
      } else {
        // 通常のURL
        return Math.floor(Math.random() * 30) + 5;
      }
    };
    
    // URLのクリック時間分布を現実的に生成
    const generateClickTime = () => {
      const now = new Date();
      // 過去7日間のランダムな時間を生成、最近の方がクリック確率が高くなるよう調整
      const hoursAgo = Math.floor(Math.pow(Math.random(), 2) * 168); // 7日 = 168時間
      now.setHours(now.getHours() - hoursAgo);
      return now.toISOString();
    };
    
    messages.forEach(message => {
      // URLが含まれているメッセージを対象とする
      if (message.shortenedUrl) {
        const isPopular = Math.random() < 0.2;
        const domainIndex = Math.floor(Math.random() * popularDomains.length);
        const productId = Math.floor(1000 + Math.random() * 9000);
        
        const originalUrl = message.originalUrl || 
                          `https://${popularDomains[domainIndex]}/${productId}?ref=sms&campaign=summer_sale`;
        
        mockUrls.push({
          url: message.shortenedUrl,
          clicks: generateClicks(isPopular),
          lastClickedAt: generateClickTime(),
          originalUrl: originalUrl,
          messageId: message.id
        });
      }
      
      if (message.shortenedUrl2) {
        const isPopular = Math.random() < 0.15;
        const domainIndex = Math.floor(Math.random() * popularDomains.length);
        const productId = Math.floor(1000 + Math.random() * 9000);
        
        const originalUrl = message.originalUrl2 || 
                          `https://${popularDomains[domainIndex]}/${productId}?ref=sms&campaign=new_arrival`;
        
        mockUrls.push({
          url: message.shortenedUrl2,
          clicks: generateClicks(isPopular),
          lastClickedAt: generateClickTime(),
          originalUrl: originalUrl,
          messageId: message.id
        });
      }
    });
    
    // クリック数の多い順にソート
    return mockUrls.sort((a, b) => b.clicks - a.clicks);
  }, [messages]);
  
  // 検索とフィルタリング
  const filteredUrls = urlsWithClicks.filter(item => {
    const matchesSearch = 
      item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.originalUrl && item.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 日付範囲のフィルタリングはここに実装します
    
    return matchesSearch;
  });
  
  const selectedUrlData = selectedUrlId 
    ? urlsWithClicks.find(item => item.url === selectedUrlId) 
    : null;
  
  // URL詳細データを生成（より詳細なデモデータ）
  const urlDetailData = React.useMemo(() => {
    if (!selectedUrlData) return null;
    
    // より現実的な時間帯別クリック数分布
    const hourlyClicks = Array.from({ length: 24 }, (_, i) => {
      let clicks;
      if (i >= 9 && i <= 13) {
        // 午前のピーク時間帯
        clicks = Math.floor(Math.random() * 6) + 2;
      } else if (i >= 18 && i <= 22) {
        // 夕方から夜のピーク時間帯
        clicks = Math.floor(Math.random() * 8) + 3;
      } else if (i >= 0 && i <= 6) {
        // 深夜から早朝
        clicks = Math.floor(Math.random() * 2);
      } else {
        // その他の時間帯
        clicks = Math.floor(Math.random() * 4) + 1;
      }
      
      return {
        hour: i,
        clicks
      };
    });
    
    // 曜日別のクリック傾向を反映した日別データ
    const now = new Date();
    const dailyClicks = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - (13 - i));
      const dayOfWeek = date.getDay(); // 0: 日曜, 6: 土曜
      
      let clickFactor;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // 週末
        clickFactor = 0.7 + Math.random() * 0.6;
      } else if (dayOfWeek === 1 || dayOfWeek === 5) {
        // 月曜と金曜
        clickFactor = 1.0 + Math.random() * 0.8;
      } else {
        // 火・水・木
        clickFactor = 0.8 + Math.random() * 0.7;
      }
      
      // 直近の日付ほどクリック数が多い傾向を加味
      const recencyFactor = 0.6 + (i / 14) * 0.8;
      
      return {
        date: date.toISOString().split('T')[0],
        clicks: Math.floor(selectedUrlData.clicks / 14 * clickFactor * recencyFactor),
        day: ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]
      };
    });
    
    // デバイス別クリック比率
    const deviceClicks = [
      { device: 'スマートフォン', count: Math.floor(selectedUrlData.clicks * (0.65 + Math.random() * 0.15)) },
      { device: 'タブレット', count: Math.floor(selectedUrlData.clicks * (0.1 + Math.random() * 0.1)) },
      { device: 'PC', count: Math.floor(selectedUrlData.clicks * (0.1 + Math.random() * 0.1)) }
    ];
    
    // 残りをその他に設定
    const otherCount = selectedUrlData.clicks - deviceClicks.reduce((sum, item) => sum + item.count, 0);
    deviceClicks.push({ device: 'その他', count: Math.max(0, otherCount) });
    
    // 地域別クリック分布
    const regionClicks = [
      { region: '東京', count: Math.floor(selectedUrlData.clicks * (0.25 + Math.random() * 0.1)) },
      { region: '大阪', count: Math.floor(selectedUrlData.clicks * (0.15 + Math.random() * 0.1)) },
      { region: '名古屋', count: Math.floor(selectedUrlData.clicks * (0.1 + Math.random() * 0.05)) },
      { region: '福岡', count: Math.floor(selectedUrlData.clicks * (0.08 + Math.random() * 0.05)) },
      { region: '札幌', count: Math.floor(selectedUrlData.clicks * (0.06 + Math.random() * 0.04)) },
      { region: 'その他', count: 0 }
    ];
    
    // その他の地域を計算
    regionClicks[5].count = selectedUrlData.clicks - regionClicks.slice(0, 5).reduce((sum, item) => sum + item.count, 0);
    
    return {
      totalClicks: selectedUrlData.clicks,
      hourlyClicks,
      dailyClicks,
      deviceClicks,
      regionClicks,
      uniqueClicks: Math.floor(selectedUrlData.clicks * (0.7 + Math.random() * 0.2)), // ユニーククリック数
      firstClick: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
      lastClick: selectedUrlData.lastClickedAt,
      clickThroughRate: Math.floor(40 + Math.random() * 40) // 40%〜80%のCTR
    };
  }, [selectedUrlData]);
  
  const exportUrlData = () => {
    // CSV出力処理
    const headers = ['短縮URL', '元URL', 'クリック数', '最終クリック日時'];
    
    const csvRows = [
      headers.join(','),
      ...filteredUrls.map(item => {
        return [
          item.url,
          item.originalUrl || '-',
          item.clicks,
          item.lastClickedAt ? new Date(item.lastClickedAt).toLocaleString('ja-JP') : '-'
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `url_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-grey-900">URL分析</h2>
            <p className="mt-1 text-sm text-grey-500">
              送信したSMS内の短縮URLのクリック状況を分析できます
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
            <button
              type="button"
              className="btn-secondary"
              onClick={exportUrlData}
            >
              <Download className="h-4 w-4 mr-1" />
              エクスポート
            </button>
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
              placeholder="URLを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {filteredUrls.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-md">
            <BarChart3 className="h-12 w-12 text-grey-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-grey-900">データがありません</h3>
            <p className="mt-1 text-sm text-grey-500">
              {searchTerm ? '検索条件に一致するURLが見つかりませんでした。' : 'クリックデータがありません。'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-grey-200">
              <thead className="bg-grey-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    短縮URL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    クリック数
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                    最終クリック
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">詳細</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-grey-200">
                {filteredUrls.map((item) => (
                  <tr 
                    key={item.url}
                    className={`hover:bg-grey-50 cursor-pointer ${selectedUrlId === item.url ? 'bg-primary-50' : ''}`}
                    onClick={() => setSelectedUrlId(item.url)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-grey-900 font-medium">{item.url}</span>
                        <span className="text-xs text-grey-500 mt-1 truncate max-w-xs">{item.originalUrl}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BarChart2 className="h-4 w-4 text-primary-500 mr-2" />
                        <span className="text-sm text-grey-900">{item.clicks}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                      {item.lastClickedAt ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-grey-400 mr-2" />
                          <span>{new Date(item.lastClickedAt).toLocaleString('ja-JP')}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary-600 hover:text-primary-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {selectedUrlData && urlDetailData && (
        <div className="card">
          <div className="mb-5">
            <h2 className="text-lg font-medium text-grey-900">URL詳細分析</h2>
            <p className="mt-1 text-sm text-grey-500 truncate max-w-full">
              {selectedUrlData.url} - {selectedUrlData.originalUrl}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-grey-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-grey-500 mb-1">総クリック数</h3>
              <div className="text-2xl font-bold text-grey-900">{urlDetailData.totalClicks}</div>
            </div>
            
            <div className="bg-grey-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-grey-500 mb-1">ユニーククリック数</h3>
              <div className="text-2xl font-bold text-grey-900">{urlDetailData.uniqueClicks}</div>
            </div>
            
            <div className="bg-grey-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-grey-500 mb-1">最終クリック</h3>
              <div className="text-lg font-bold text-grey-900">
                {urlDetailData.lastClick 
                  ? new Date(urlDetailData.lastClick).toLocaleString('ja-JP')
                  : '-'}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-grey-900 mb-3">日別クリック数</h3>
              <div className="h-64 bg-grey-50 p-4 rounded-lg">
                {/* 実際の実装ではグラフライブラリを使用します */}
                <div className="h-full flex items-end justify-between">
                  {urlDetailData.dailyClicks.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary-500 rounded-t-sm transition-all"
                        style={{ 
                          height: `${(item.clicks / Math.max(...urlDetailData.dailyClicks.map(d => d.clicks))) * 100}%`,
                          minHeight: item.clicks > 0 ? '10%' : '0'
                        }}
                      ></div>
                      <div className="text-xs text-grey-500 mt-2">
                        {new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-xs font-medium text-grey-700">
                        {item.clicks}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-grey-900 mb-3">時間帯別クリック数</h3>
              <div className="h-64 bg-grey-50 p-4 rounded-lg">
                <div className="h-full flex items-end justify-between">
                  {urlDetailData.hourlyClicks.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-4 bg-primary-300 rounded-t-sm transition-all"
                        style={{ 
                          height: `${(item.clicks / Math.max(...urlDetailData.hourlyClicks.map(d => d.clicks))) * 100}%`,
                          minHeight: item.clicks > 0 ? '10%' : '0'
                        }}
                      ></div>
                      <div className="text-xs text-grey-500 mt-2">
                        {item.hour}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlAnalytics; 