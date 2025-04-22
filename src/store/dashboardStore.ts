import { create } from 'zustand';
import { DashboardStats, SMSMessage } from '../types';

// Generate mock dashboard data
const generateMockDashboardData = (): DashboardStats => {
  // Generate daily trend data for the past 14 days
  const dailyTrend = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 13 + i);
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(100 + Math.random() * 900)
    };
  });

  // Recent messages
  const statuses = ['sent', 'delivered', 'failed', 'pending'] as const;
  const recentMessages: SMSMessage[] = Array.from({ length: 5 }, (_, i) => {
    const createdAt = new Date();
    createdAt.setMinutes(createdAt.getMinutes() - Math.floor(Math.random() * 60));
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `recent-${i + 1}`,
      recipient: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
      sender: `Topaz${Math.floor(Math.random() * 10)}`,
      content: `テスト通知です。お客様の注文 #${Math.floor(10000 + Math.random() * 90000)} の発送が完了しました。`,
      status,
      createdAt: createdAt.toISOString(),
      sentAt: status !== 'pending' ? new Date().toISOString() : undefined,
      userId: '1',
    };
  });

  return {
    totalSentToday: 742,
    totalSentThisMonth: 15840,
    deliveryRateToday: 97.8,
    failureRateToday: 2.2,
    pendingJobs: 3,
    recentMessages,
    dailySendingTrend: dailyTrend,
  };
};

interface DashboardStore {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data for demo
      const mockStats = generateMockDashboardData();
      
      set({ 
        stats: mockStats, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats', 
        isLoading: false 
      });
    }
  }
}));

export default useDashboardStore;