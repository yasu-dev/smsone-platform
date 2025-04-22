import { create } from 'zustand';
import { SenderNumber, CarrierType, Carrier } from '../types';

// 利用可能キャリア一覧
const carriers: Carrier[] = [
  { id: 'docomo', name: 'NTT docomo', hasDynamicSender: true },
  { id: 'au', name: 'KDDI au', hasDynamicSender: true },
  { id: 'softbank', name: 'SoftBank', hasDynamicSender: false, fixedNumber: '21061' },
  { id: 'rakuten', name: 'Rakuten Mobile', hasDynamicSender: true },
];

// モック送信元番号データ
const mockSenderNumbers: SenderNumber[] = [
  { id: 'sender-1', number: '0120378777', description: '', isActive: true, createdAt: new Date().toISOString() },
  { id: 'sender-2', number: '0120297888', description: '', isActive: true, createdAt: new Date().toISOString() },
  { id: 'sender-3', number: '0433307000', description: '', isActive: true, createdAt: new Date().toISOString() },
  { id: 'sender-4', number: '0433307011', description: '', isActive: true, createdAt: new Date().toISOString() },
];

// モックキャリア別送信元番号マッピング
const carrierNumberMapping: Record<CarrierType, string[]> = {
  docomo: ['sender-1', 'sender-2', 'sender-3', 'sender-4'],
  au: ['sender-1', 'sender-2', 'sender-3', 'sender-4'],
  softbank: [], // SoftBankは固定番号のため空配列
  rakuten: ['sender-1', 'sender-2', 'sender-3', 'sender-4'],
};

interface SenderNumberStore {
  senderNumbers: SenderNumber[];
  carriers: Carrier[];
  availableCarriers: Carrier[];
  isLoading: boolean;
  error: string | null;
  fetchSenderNumbers: () => Promise<void>;
  getAvailableSenderNumbers: () => SenderNumber[];
  getSoftBankSenderNumber: () => string;
}

const useSenderNumberStore = create<SenderNumberStore>((set, get) => ({
  senderNumbers: [],
  carriers,
  availableCarriers: carriers,
  isLoading: false,
  error: null,

  fetchSenderNumbers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ 
        senderNumbers: mockSenderNumbers, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch sender numbers', 
        isLoading: false 
      });
    }
  },

  getAvailableSenderNumbers: () => {
    const { senderNumbers } = get();
    // Return all active sender numbers
    return senderNumbers
      .filter(sn => sn.isActive)
      .sort((a, b) => a.number.localeCompare(b.number));
  },

  getSoftBankSenderNumber: () => {
    return '21061';
  }
}));

export default useSenderNumberStore;