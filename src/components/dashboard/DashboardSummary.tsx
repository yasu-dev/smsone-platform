import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, FileCheck, AlertTriangle, Clock
} from 'lucide-react';
import { DashboardStats } from '../../types';

interface DashboardSummaryProps {
  stats: DashboardStats;
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ stats }) => {
  const summaryItems = [
    {
      id: 'today',
      title: '本日の送信数',
      value: stats.totalSentToday.toLocaleString(),
      icon: <FileCheck className="h-8 w-8 text-success-500" />,
      color: 'bg-success-50 text-success-700 ring-success-600/20',
    },
    {
      id: 'month',
      title: '今月の送信数',
      value: stats.totalSentThisMonth.toLocaleString(),
      icon: <TrendingUp className="h-8 w-8 text-primary-500" />,
      color: 'bg-primary-50 text-primary-700 ring-primary-600/20',
    },
    {
      id: 'delivery',
      title: '本日の配信成功率',
      value: `${stats.deliveryRateToday}%`,
      icon: <TrendingUp className="h-8 w-8 text-success-500" />,
      color: 'bg-success-50 text-success-700 ring-success-600/20',
    },
    {
      id: 'failure',
      title: '本日の配信失敗率',
      icon: <TrendingDown className="h-8 w-8 text-error-500" />,
      value: `${stats.failureRateToday}%`,
      color: 'bg-error-50 text-error-700 ring-error-600/20',
    },
    {
      id: 'pending',
      title: '処理待ちのジョブ',
      value: stats.pendingJobs.toString(),
      icon: <Clock className="h-8 w-8 text-warning-500" />,
      color: 'bg-warning-50 text-warning-700 ring-warning-600/20',
    },
  ];

  // Animation variants for the container
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for each item
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {summaryItems.map((item, index) => (
        <motion.div
          key={item.id}
          className="card overflow-hidden"
          variants={item}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <div className="shrink-0">
              {item.icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-grey-500 truncate">
                {item.title}
              </dt>
              <dd className="flex items-baseline">
                <p className="text-2xl font-semibold text-grey-900">
                  {item.value}
                </p>
              </dd>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardSummary;