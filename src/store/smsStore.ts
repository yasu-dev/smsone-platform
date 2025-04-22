import { create } from 'zustand';
import { SMSMessage, SMSStatus } from '../types';

// Generate random SMS messages for demo
const generateMockMessages = (count: number): SMSMessage[] => {
  const statuses: SMSStatus[] = ['sent', 'delivered', 'failed', 'pending', 'processing'];
  
  return Array.from({ length: count }, (_, i) => {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 48));
    
    const sentAt = new Date(createdAt);
    sentAt.setMinutes(sentAt.getMinutes() + Math.floor(Math.random() * 5));
    
    const deliveredAt = new Date(sentAt);
    deliveredAt.setMinutes(deliveredAt.getMinutes() + Math.floor(Math.random() * 5));
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // 10%の確率で国際送信とする
    const isInternational = Math.random() < 0.1;
    const recipient = isInternational
      ? `+${Math.floor(1 + Math.random() * 98)}${Math.floor(10000000 + Math.random() * 90000000)}`
      : `090${Math.floor(1000000 + Math.random() * 9000000)}`;
    
    return {
      id: `sms-${i + 1}`,
      recipient,
      sender: `SMSOne${Math.floor(Math.random() * 10)}`,
      content: `テスト通知です。お客様の注文 #${Math.floor(10000 + Math.random() * 90000)} の発送が完了しました。`,
      status,
      createdAt: createdAt.toISOString(),
      sentAt: status !== 'pending' ? sentAt.toISOString() : undefined,
      deliveredAt: status === 'delivered' ? deliveredAt.toISOString() : undefined,
      userId: '1',
      templateId: Math.random() > 0.5 ? `template-${Math.floor(Math.random() * 5) + 1}` : undefined,
      memo: Math.random() > 0.7 ? '担当: 佐藤' : undefined,
      isInternational,
      countryCode: isInternational ? ['US', 'GB', 'CN', 'KR', 'TH'][Math.floor(Math.random() * 5)] : undefined,
    };
  });
};

interface SMSStore {
  messages: SMSMessage[];
  isLoading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  sendMessage: (message: Partial<SMSMessage>) => Promise<void>;
  sendTestMessage: (message: Partial<SMSMessage>) => Promise<void>;
}

const useSMSStore = create<SMSStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchMessages: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data for demo
      const mockMessages = generateMockMessages(25);
      
      set({ 
        messages: mockMessages, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch messages', 
        isLoading: false 
      });
    }
  },

  sendMessage: async (message: Partial<SMSMessage>) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create a new message with mock data
      const newMessage: SMSMessage = {
        id: `sms-${Date.now()}`,
        recipient: message.recipient || '',
        sender: message.sender || 'SMSOne',
        content: message.content || '',
        status: 'sent',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        userId: '1',
        templateId: message.templateId,
        originalUrl: message.originalUrl,
        isInternational: message.isInternational,
        countryCode: message.countryCode,
      };
      
      // Add to the messages list
      set({ 
        messages: [newMessage, ...get().messages], 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message', 
        isLoading: false 
      });
    }
  },

  sendTestMessage: async (message: Partial<SMSMessage>) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create a new test message with mock data
      const newMessage: SMSMessage = {
        id: `test-sms-${Date.now()}`,
        recipient: message.recipient || '',
        sender: message.sender || 'SMSOne',
        content: message.content || '',
        status: 'sent',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        userId: '1',
        templateId: message.templateId,
        originalUrl: message.originalUrl,
        memo: '[テスト送信]',
        isInternational: message.isInternational,
        countryCode: message.countryCode,
      };
      
      // Add to the messages list
      set({ 
        messages: [newMessage, ...get().messages], 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send test message', 
        isLoading: false 
      });
    }
  }
}));

export default useSMSStore;