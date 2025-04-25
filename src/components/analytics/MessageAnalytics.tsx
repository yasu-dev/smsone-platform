import React, { useState, useEffect } from 'react';
import { PieChart, BarChart2, Search, Download, Calendar, FileType, CreditCard, DollarSign } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart as RechartPieChart,
  Pie,
  Cell
} from 'recharts';
import useSMSStore from '../../store/smsStore';
import { SMSStatus } from '../../types';
import { calculateTotalSMSPrice, calculateAverageSMSPrice, calculateDailySMSPrices } from '../../utils/smsUtils';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type DateRangeType = 'today' | 'week' | 'month' | 'custom';

type StatusCount = {
  status: SMSStatus;
  count: number;
};

type CarrierCount = {
  carrier: string;
  count: number;
};

// 日別送信料金のデータを生成
const generateDailyPriceData = (startDate: Date, endDate: Date) => {
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const data = [];

  // 乱数シード値として日付を固定
  const seed = new Date('2023-10-01').getTime();
  
  // 一貫した乱数生成のための関数
  const pseudoRandom = (n: number) => {
    return ((Math.sin(n * seed) + 1) / 2);
  };

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // 曜日によって異なる金額パターンを設定
    const dayOfWeek = date.getDay();
    const dayIndex = i + 1;
    let price;
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // 土日: 少なめ
      price = Math.floor(pseudoRandom(dayIndex) * 5) + 2;
    } else if (dayOfWeek === 1 || dayOfWeek === 5) {
      // 月・金: 多め
      price = Math.floor(pseudoRandom(dayIndex) * 15) + 8;
    } else if (dayOfWeek === 3) {
      // 水曜日: 最も多い
      price = Math.floor(pseudoRandom(dayIndex) * 10) + 18;
    } else {
      // 火・木: 中程度
      price = Math.floor(pseudoRandom(dayIndex) * 7) + 5;
    }
    
    // 割合はランダムに調整 (80-95%が国内)
    const domesticRatio = 0.85 + pseudoRandom(dayIndex) * 0.1;
    
    // 送信数を計算
    const countBase = 20 + Math.floor(dayIndex * 1.5); // 日が進むごとに若干増加
    const count = Math.floor(pseudoRandom(dayIndex) * 50) + countBase;
    const domesticCount = Math.floor(count * domesticRatio);
    const internationalCount = count - domesticCount;
    
    // 1通あたりの料金
    const perDomesticPrice = 3.9;
    const perIntlPrice = 100.0;
    
    const domesticPrice = Math.round(domesticCount * perDomesticPrice * 10) / 10;
    const internationalPrice = Math.round(internationalCount * perIntlPrice * 10) / 10;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      count,
      domesticCount,
      internationalCount,
      domesticPrice,
      internationalPrice
    });
  }
  
  return data;
};

// 時間別データを生成
const generateHourlyData = (date: Date) => {
  // 乱数シード値として固定
  const seed = new Date('2023-10-01').getTime();
  
  // 一貫した乱数生成のための関数
  const pseudoRandom = (n: number) => {
    return ((Math.sin(n * seed) + 1) / 2);
  };
  
  return Array.from({ length: 24 }, (_, hour) => {
    // 0〜50通の間での固定的な値を生成
    const hourFactor = hour + 1;
    let count;
    
    if (hour >= 9 && hour <= 12) {
      // 午前中（9-12時）: 多め
      count = Math.floor(pseudoRandom(hourFactor) * 15) + 25;
    } else if (hour >= 13 && hour <= 18) {
      // 午後（13-18時）: 中程度
      count = Math.floor(pseudoRandom(hourFactor) * 20) + 15;
    } else if (hour >= 19 && hour <= 22) {
      // 夜（19-22時）: やや少なめ
      count = Math.floor(pseudoRandom(hourFactor) * 10) + 10;
    } else {
      // 深夜・早朝: 少なめ
      count = Math.floor(pseudoRandom(hourFactor) * 5) + 1;
    }
    
    // 割合は一貫した値に設定 (80-95%が国内)
    const domesticRatio = 0.85 + pseudoRandom(hourFactor) * 0.1;
    const domesticCount = Math.floor(count * domesticRatio);
    const internationalCount = count - domesticCount;
    
    // 1通あたりの料金
    const perDomesticPrice = 3.9;
    const perIntlPrice = 100.0;
    
    const domesticPrice = Math.round(domesticCount * perDomesticPrice * 10) / 10;
    const internationalPrice = Math.round(internationalCount * perIntlPrice * 10) / 10;
    const price = Math.round((domesticPrice + internationalPrice) * 10) / 10;
    
    return {
      date: date.toISOString(),
      label: `${hour}時`,
      price,
      count,
      domesticPrice,
      internationalPrice,
      domesticCount,
      internationalCount
    };
  });
};

const statusColors: Record<SMSStatus, string> = {
  sent: '#3B82F6', // primary
  delivered: '#10B981', // success
  failed: '#EF4444', // error
  pending: '#F59E0B', // warning
  processing: '#6366F1', // indigo
  queued: '#8B5CF6', // purple
  canceled: '#6B7280', // grey
  expired: '#9CA3AF', // grey-400
  rejected: '#EF4444', // error
  unknown: '#D1D5DB', // grey-300
};

export const MessageAnalytics: React.FC = () => {
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeType>('week');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 6)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { messages } = useSMSStore();
  
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [filteredDailyPriceData, setFilteredDailyPriceData] = useState<any[]>([]);
  const [filteredDailyCountData, setFilteredDailyCountData] = useState<any[]>([]);
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPriceAll, setTotalPriceAll] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [domesticPrice, setDomesticPrice] = useState(0);
  const [internationalPrice, setInternationalPrice] = useState(0);
  const [domesticCount, setDomesticCount] = useState(0);
  const [internationalCount, setInternationalCount] = useState(0);
  const [averageCount, setAverageCount] = useState(0);
  const [carrierData, setCarrierData] = useState<any[]>([]);

  // キャリア別の送信数データを生成
  const generateCarrierData = (totalCount: number) => {
    // シード値を固定して一貫した値を生成
    const seed = new Date('2023-10-01').getTime();
    const pseudoRandom = (n: number) => ((Math.sin(n * seed) + 1) / 2);
    
    // キャリアの比率を設定
    const docomoRatio = 0.4 + pseudoRandom(1) * 0.05;
    const auRatio = 0.3 + pseudoRandom(2) * 0.05;
    const softbankRatio = 0.2 + pseudoRandom(3) * 0.03;
    // rakutenは残りの比率
    const rakutenRatio = 1 - docomoRatio - auRatio - softbankRatio;
    
    return [
      { carrier: 'docomo', count: Math.floor(totalCount * docomoRatio), color: '#6366F1' },
      { carrier: 'au', count: Math.floor(totalCount * auRatio), color: '#10B981' },
      { carrier: 'softbank', count: Math.floor(totalCount * softbankRatio), color: '#F59E0B' },
      { carrier: 'rakuten', count: Math.floor(totalCount * rakutenRatio), color: '#EF4444' },
    ];
  };

  // 日付範囲に基づいてデータを更新
  useEffect(() => {
    let data;
    let dateStart, dateEnd;
    
    if (dateRange === 'today') {
      dateStart = new Date();
      dateEnd = new Date();
      data = generateHourlyData(new Date());
    } else if (dateRange === 'week') {
      dateStart = new Date(new Date().setDate(new Date().getDate() - 6));
      dateEnd = new Date();
      data = generateDailyPriceData(dateStart, dateEnd);
    } else if (dateRange === 'month') {
      dateStart = new Date(new Date().setDate(new Date().getDate() - 29));
      dateEnd = new Date();
      data = generateDailyPriceData(dateStart, dateEnd);
    } else {
      // custom date range
      dateStart = startDate;
      dateEnd = endDate;
      data = generateDailyPriceData(dateStart, dateEnd);
    }
    
    setDailyData(data);
    setStartDate(dateStart);
    setEndDate(dateEnd);
    
    // 総計を計算
    const totalPriceSum = data.reduce((sum: number, item: any) => sum + item.price, 0);
    const totalCountSum = data.reduce((sum: number, item: any) => sum + item.count, 0);
    const totalDomesticPrice = data.reduce((sum: number, item: any) => sum + (item.domesticPrice || 0), 0);
    const totalIntlPrice = data.reduce((sum: number, item: any) => sum + (item.internationalPrice || 0), 0);
    const totalDomesticCount = data.reduce((sum: number, item: any) => sum + (item.domesticCount || 0), 0);
    const totalIntlCount = data.reduce((sum: number, item: any) => sum + (item.internationalCount || 0), 0);
    
    setTotalPrice(Math.round(totalPriceSum * 10) / 10);
    setTotalPriceAll(Math.round((totalDomesticPrice + totalIntlPrice) * 10) / 10);
    setTotalCount(totalCountSum);
    setDomesticPrice(Math.round(totalDomesticPrice * 10) / 10);
    setInternationalPrice(Math.round(totalIntlPrice * 10) / 10);
    setDomesticCount(totalDomesticCount);
    setInternationalCount(totalIntlCount);
    
    // キャリアデータを生成
    setCarrierData(generateCarrierData(totalDomesticCount));
    
    // 平均送信数を計算
    const days = dateRange === 'today' ? 1 : Math.max(1, Math.round((dateEnd.getTime() - dateStart.getTime()) / (1000 * 60 * 60 * 24)));
    setAverageCount(Math.round(totalCountSum / days));
    
    // フィルターしたデータをセット
    setFilteredDailyPriceData(data);
    setFilteredDailyCountData(data);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, startDate, endDate]);

  // 日付範囲を設定するハンドラー
  const handleDateRangeSelect = (type: DateRangeType) => {
    setDateRange(type);
    
    let start, end;
    const today = new Date();
    
    switch (type) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - 6));
        end = new Date();
        break;
      case 'month':
        start = new Date(new Date().setDate(new Date().getDate() - 29));
        end = new Date();
        break;
      default:
        // カスタム日付範囲の場合は既存の値を使用
        start = startDate;
        end = endDate;
    }
    
    setStartDate(start);
    setEndDate(end);
    setShowDateRangePicker(false);
  };

  // フィルターハンドラー
  const handleFilterData = (period: DateRangeType) => {
    setDateRange(period);
    handleDateRangeSelect(period);
  };

  // カスタム日付範囲が選択された時のハンドラー
  const handleCustomDateSelect = () => {
    if (customStartDate && customEndDate) {
      setStartDate(new Date(customStartDate));
      setEndDate(new Date(customEndDate));
      setDateRange('custom');
      setShowDateRangePicker(false);
    }
  };

  // 国内/国際送信の比率データ
  const deliveryRatioData = [
    { name: '国内送信', value: domesticCount, color: '#3B82F6' },
    { name: '国際送信', value: internationalCount, color: '#EC4899' },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium text-grey-900">メッセージ分析</h2>
            <p className="mt-1 text-sm text-grey-500">
              送信したSMSの配信状況やステータスを分析できます
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setShowDateRangePicker(!showDateRangePicker)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                {dateRange === 'today' ? '今日' : 
                 dateRange === 'week' ? '直近7日間' : 
                 dateRange === 'month' ? '直近30日間' : 
                 dateRange === 'custom' && startDate && endDate ? 
                   `${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}` : 
                   '期間指定'}
              </button>
              
              {showDateRangePicker && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 p-4 border border-grey-200">
                  <div className="space-y-2">
                    <button 
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'today' ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-50'}`}
                      onClick={() => handleDateRangeSelect('today')}
                    >
                      今日
                    </button>
                    <button 
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'week' ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-50'}`}
                      onClick={() => handleDateRangeSelect('week')}
                    >
                      直近7日間
                    </button>
                    <button 
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${dateRange === 'month' ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-50'}`}
                      onClick={() => handleDateRangeSelect('month')}
                    >
                      直近30日間
                    </button>
                    <div className={`${dateRange === 'custom' ? 'bg-primary-50 rounded-md p-2' : ''}`}>
                      <div className="text-sm text-grey-700 mb-2">期間指定</div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <span className="text-sm text-grey-600 mr-2">開始日:</span>
                          <input
                            type="date"
                            className="form-input text-sm py-1 flex-1"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-grey-600 mr-2">終了日:</span>
                          <input
                            type="date"
                            className="form-input text-sm py-1 flex-1"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-primary btn-sm w-full mt-2"
                          onClick={handleCustomDateSelect}
                          disabled={!customStartDate || !customEndDate}
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
              onClick={() => {
                // CSV出力処理
                const headers = ['ステータス', '件数', '割合(%)', '料金（円）'];
                
                const totalMessages = deliveryRatioData.reduce((sum, item) => sum + item.value, 0);
                
                const csvRows = [
                  headers.join(','),
                  ...deliveryRatioData.map(item => {
                    const statusMessages = messages.filter(m => m.status === item.name);
                    const statusTotalPrice = calculateTotalSMSPrice(statusMessages);
                    
                    return [
                      item.name,
                      item.value,
                      ((item.value / totalMessages) * 100).toFixed(2),
                      statusTotalPrice.toFixed(1)
                    ].join(',');
                  }),
                  '',
                  ['総配信数', totalMessages, '100.00', totalPriceAll.toFixed(1)].join(','),
                  '',
                  ['平均送信料金（円/通）', '', '', (totalPriceAll / totalMessages).toFixed(2)].join(','),
                  '',
                  ['国際送信数', internationalCount, 
                    ((internationalCount / totalMessages) * 100).toFixed(2),
                    internationalPrice.toFixed(1)].join(','),
                  ['国内送信数', domesticCount, 
                    ((domesticCount / totalMessages) * 100).toFixed(2),
                    domesticPrice.toFixed(1)].join(','),
                  ['国際送信率(%)', '', ((internationalCount / totalMessages) * 100).toFixed(2), ''].join(','),
                ];
                
                const csvContent = csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `message_analytics_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              エクスポート
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-grey-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-grey-500 mb-1">総送信数</h3>
            <div className="text-2xl font-bold text-grey-900">{totalCount}</div>
          </div>
          <div className="bg-grey-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-grey-500 mb-1">総送信料金</h3>
            <div className="text-2xl font-bold text-grey-900">{totalPriceAll.toFixed(1)}円</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-grey-900 mb-3">ステータス別送信数</h3>
            <div className="bg-grey-50 p-4 rounded-lg">
              <div className="space-y-2">
                {deliveryRatioData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-grey-700">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-grey-900">{item.value}</span>
                      <span className="text-xs text-grey-500 ml-2">
                        ({((item.value / totalCount) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 h-4 bg-grey-200 rounded-full overflow-hidden flex">
                {deliveryRatioData.map((item, index) => (
                  <div 
                    key={index}
                    style={{ 
                      width: `${(item.value / totalCount) * 100}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-grey-900 mb-3">キャリア別送信数</h3>
            <div className="bg-grey-50 p-4 rounded-lg">
              <div className="space-y-2">
                {carrierData.map((item, index) => (
                  <div key={item.carrier} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-grey-700">{item.carrier}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-grey-900">{item.count}</span>
                      <span className="text-xs text-grey-500 ml-2">
                        ({((item.count / domesticCount) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 h-4 bg-grey-200 rounded-full overflow-hidden flex">
                {carrierData.map((item, index) => (
                  <div 
                    key={index}
                    style={{ 
                      width: `${(item.count / domesticCount) * 100}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium text-grey-900 mb-4">送信料金分析</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-grey-800 mb-2">
                {dateRange === 'today' ? '本日の送信料金' :
                 dateRange === 'week' ? '週間送信料金' :
                 dateRange === 'month' ? '月間送信料金' :
                 '期間内送信料金'}
              </h3>
              <div className="text-3xl font-bold text-grey-900">{totalPrice.toLocaleString()}円</div>
              <div className="text-sm text-grey-500">
                {dateRange === 'today' ? '本日の合計' :
                 dateRange === 'week' ? '週間合計' :
                 dateRange === 'month' ? '月間合計' :
                 '期間内合計'}
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredDailyPriceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="label" 
                    fontSize={12} 
                    tickMargin={5} 
                    stroke="#6B7280"
                  />
                  <YAxis 
                    fontSize={12} 
                    tickFormatter={(value) => `${value}円`}
                    stroke="#6B7280"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}円`, '送信料金']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar 
                    dataKey="price" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]} 
                    name="送信料金"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-grey-800 mb-2">国内/国際送信料金</h3>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <div className="text-xl font-semibold text-grey-900">{domesticPrice.toLocaleString()}円</div>
                  <div className="text-sm text-grey-500">国内送信</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-grey-900">{internationalPrice.toLocaleString()}円</div>
                  <div className="text-sm text-grey-500">国際送信</div>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      国内送信 {Math.round((domesticPrice / totalPriceAll) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
                      国際送信 {Math.round((internationalPrice / totalPriceAll) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div style={{ width: `${(domesticPrice / totalPriceAll) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                  <div style={{ width: `${(internationalPrice / totalPriceAll) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-grey-50 rounded-lg">
              <h4 className="text-sm font-medium text-grey-700 mb-2">料金詳細</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">平均メッセージ単価 (国内):</span>
                  <span className="text-sm font-medium text-grey-900">
                    {domesticCount > 0 ? `${(domesticPrice / domesticCount).toFixed(2)}円/通` : '0円/通'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">平均メッセージ単価 (国際):</span>
                  <span className="text-sm font-medium text-grey-900">
                    {internationalCount > 0 ? `${(internationalPrice / internationalCount).toFixed(2)}円/通` : '0円/通'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">総平均メッセージ単価:</span>
                  <span className="text-sm font-medium text-grey-900">
                    {totalCount > 0 ? `${(totalPrice / totalCount).toFixed(2)}円/通` : '0円/通'}
                  </span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-grey-200">
                  <span className="text-sm text-grey-600">日平均送信料金:</span>
                  <span className="text-sm font-medium text-grey-900">
                    {(totalPrice / Math.max(1, (dateRange === 'today' ? 1 : filteredDailyPriceData.length))).toFixed(1)}円/日
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium text-grey-900 mb-4">送信数分析</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-grey-800 mb-2">
                {dateRange === 'today' ? '本日の送信数' :
                 dateRange === 'week' ? '週間送信数' :
                 dateRange === 'month' ? '月間送信数' :
                 '期間内送信数'}
              </h3>
              <div className="text-3xl font-bold text-grey-900">{totalCount.toLocaleString()}通</div>
              <div className="text-sm text-grey-500">
                平均: {averageCount.toLocaleString()}通/日
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredDailyCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="label" 
                    fontSize={12} 
                    tickMargin={5} 
                    stroke="#6B7280"
                  />
                  <YAxis 
                    fontSize={12} 
                    tickFormatter={(value) => `${value}通`}
                    stroke="#6B7280"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()}通`, '送信数']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]} 
                    name="送信数"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium text-grey-800 mb-2">国内/国際送信内訳</h3>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <div className="text-xl font-semibold text-grey-900">{domesticCount.toLocaleString()}通</div>
                  <div className="text-sm text-grey-500">国内送信</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-grey-900">{internationalCount.toLocaleString()}通</div>
                  <div className="text-sm text-grey-500">国際送信</div>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      国内送信 {Math.round((domesticCount / totalCount) * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-pink-600 bg-pink-200">
                      国際送信 {Math.round((internationalCount / totalCount) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div style={{ width: `${(domesticCount / totalCount) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                  <div style={{ width: `${(internationalCount / totalCount) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500"></div>
                </div>
              </div>
              
              <div className="h-56 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={deliveryRatioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => `${entry.name}: ${Math.round((entry.value / (domesticCount + internationalCount)) * 100)}%`}
                    >
                      {deliveryRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), '送信数']}
                    />
                  </RechartPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageAnalytics; 