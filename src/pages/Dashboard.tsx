import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import SendingTrendChart from '../components/dashboard/SendingTrendChart';
import RecentMessages from '../components/dashboard/RecentMessages';
import useDashboardStore from '../store/dashboardStore';

const Dashboard: React.FC = () => {
  const { stats, fetchStats, isLoading, error } = useDashboardStore();
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-grey-300 border-t-primary-600"></div>
          <p className="mt-4 text-grey-500">データを読み込み中...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-error-50 p-4 rounded-md text-error-800">
        <p>エラーが発生しました: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-grey-900 mb-6">ダッシュボード</h1>
        
        <DashboardSummary stats={stats} />
        <SendingTrendChart data={stats.dailySendingTrend} />
        <RecentMessages messages={stats.recentMessages} />
      </motion.div>
    </div>
  );
};

export default Dashboard;