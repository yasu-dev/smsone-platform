import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import SendingTrendChart from '../components/dashboard/SendingTrendChart';
import RecentMessages from '../components/dashboard/RecentMessages';
import useDashboardStore from '../store/dashboardStore';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { stats, fetchStats, isLoading, error } = useDashboardStore();
  const location = useLocation();
  const isNotificationsPage = location.pathname === '/notifications';
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-error-600">
        エラーが発生しました: {error}
      </div>
    );
  }

  // 通知一覧
  const notifications = [
    { id: 1, text: 'CSV一括送信が完了しました', time: '5分前', detail: '送信先: 50件、成功: 48件、失敗: 2件' },
    { id: 2, text: 'システムメンテナンスのお知らせ', time: '1時間前', detail: '5月1日午前2時より2時間のメンテナンスを予定しています。' },
    { id: 3, text: '新機能が追加されました', time: '1日前', detail: 'アンケート機能が追加されました。詳細はお知らせをご覧ください。' },
    { id: 4, text: '先週の送信レポートが生成されました', time: '3日前', detail: '先週は合計230件のメッセージを送信しました。' },
    { id: 5, text: 'アカウント情報が更新されました', time: '1週間前', detail: '管理者によりあなたのアクセス権が変更されました。' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {isNotificationsPage ? (
        <>
          <h1 className="text-2xl font-bold text-grey-900 mb-6 flex items-center">
            <Bell className="h-6 w-6 mr-2 text-primary-600" />
            通知一覧
          </h1>
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-grey-200">
              {notifications.map((notification) => (
                <motion.div 
                  key={notification.id}
                  className="p-4 hover:bg-grey-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-md font-medium text-grey-900">{notification.text}</h3>
                  <p className="text-sm text-grey-600 mt-1">{notification.detail}</p>
                  <p className="text-xs text-grey-400 mt-2">{notification.time}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-grey-900 mb-6">ダッシュボード</h1>
          
          {stats && (
            <>
              <DashboardSummary stats={stats} />
              <SendingTrendChart data={stats.dailySendingTrend} />
              <RecentMessages messages={stats.recentMessages} />
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;