// User Types
export type UserRole = 'admin' | 'user' | 'manager' | 'operator' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  permissions?: {
    internationalSms?: boolean;
    templateEditing?: boolean;
    bulkSending?: boolean;
    apiAccess?: boolean;
    scheduledSending?: boolean;
    analyticsAccess?: boolean;
    userManagement?: boolean;
    surveysCreation?: boolean;
    // 他の権限も追加可能
  };
}

// Authentication Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// SMS Types
export type SMSStatus = 
  | 'sent'     // 送信済み
  | 'delivered' // 配信完了
  | 'failed'   // 配信失敗
  | 'pending'  // 送信待ち
  | 'processing' // 処理中
  | 'queued'   // キュー登録済
  | 'canceled' // キャンセル済
  | 'expired'  // 期限切れ
  | 'rejected' // 拒否
  | 'unknown';  // 不明

export interface SMSMessage {
  id: string;
  recipient: string;
  sender: string;
  content: string;
  status: SMSStatus;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  memo?: string;
  userId: string;
  templateId?: string;
  originalUrl?: string;
  shortenedUrl?: string;
  originalUrl2?: string;
  shortenedUrl2?: string;
  originalUrl3?: string;
  shortenedUrl3?: string;
  originalUrl4?: string;
  shortenedUrl4?: string;
  accessCode?: string;
  accessCode2?: string;
  accessCode3?: string;
  accessCode4?: string;
  isInternational?: boolean;
  countryCode?: string;
  price?: number; // 送信料金（円）
  characterCount?: number; // 文字数
}

// Template Types
export interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isShared: boolean;
  tags?: string[];
  originalUrl?: string;
  originalUrl2?: string;
  originalUrl3?: string;
  originalUrl4?: string;
}

// Sender Number Types
export interface SenderNumber {
  id: string;
  number: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  isInternational?: boolean; // 国際送信対応かどうか
  isPhoneNumber?: boolean; // 電話番号形式かどうか
  userId?: string; // 所有ユーザーID（未設定の場合は全ユーザー共通）
}

// Carrier Types
export type CarrierType = 'docomo' | 'au' | 'softbank' | 'rakuten';

export interface Carrier {
  id: CarrierType;
  name: string;
  hasDynamicSender: boolean;
  fixedNumber?: string;
}

// Shortened URL Types
export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortenedUrl: string;
  createdAt: string;
  expiresAt?: string;
  clickCount: number;
  userId: string;
  accessCode?: string;
}

export interface ShortenedUrlStats {
  totalClicks: number;
  uniqueClicks: number;
  clicksPerDay: {
    date: string;
    count: number;
  }[];
}

// Country Types for International SMS
export interface Country {
  code: string;       // 国コード (例: 'US')
  dialCode: string;   // 国番号 (例: '+1')
  name: string;       // 国名 (例: 'United States')
  flag?: string;      // 国旗絵文字 (例: '🇺🇸')
}

// CSV Job Types
export type CSVJobStatus = 
  | 'pending'    // 処理待ち
  | 'processing' // 処理中
  | 'completed'  // 完了
  | 'failed'     // 失敗
  | 'canceled';  // キャンセル済

export interface CSVJob {
  id: string;
  fileName: string;
  status: CSVJobStatus;
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
}

// Dashboard Types
export interface DashboardStats {
  totalSentToday: number;
  totalSentThisMonth: number;
  activeSending: number; // 現在送信中の数（配信処理が実行中のSMS数）
  waitingToSend: number; // 送信キュー内のSMS数（まだ送信が開始されていないもの）
  scheduledMessages: number; // 予約送信のメッセージ数
  messageSendRate: number; // 現在の送信処理速度（件/分）
  systemStatus: 'normal' | 'maintenance' | 'degraded' | 'outage'; // システム状態
  recentMessages: SMSMessage[];
  dailySendingTrend: {
    date: string;
    count: number;
  }[];
  hourlySendingData: {
    hour: number;
    count: number;
  }[];
}

// User Management Types
export interface UserContract {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  plan: string;
  fee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// アンケート機能の型定義
export type SurveyStatus = 'active' | 'inactive' | 'draft' | 'expired';

export type QuestionType = 'single' | 'multiple' | 'free';

export type BranchingType = 'independent' | 'branched';

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  questionType: QuestionType;
  branchingType: BranchingType;
  parentQuestionId?: string;
  parentAnswerId?: string;
  isEnabled: boolean;
  order: number;
  options?: SurveyQuestionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  order: number;
}

export interface Survey {
  id: string;
  name: string;
  tagName: string;
  htmlTitle: string;
  userId: string;
  startDateTime: string;
  endDateTime: string;
  questionType: QuestionType;
  branchingType: BranchingType;
  allowMultipleAnswers: boolean;
  maxSelections?: number;
  completionText: string;
  expirationText: string;
  status: SurveyStatus;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  recipientPhoneNumber: string;
  senderPhoneNumber: string;
  messageId: string;
  completedAt?: string;
  createdAt: string;
  answers: SurveyAnswer[];
}

export interface SurveyAnswer {
  id: string;
  responseId: string;
  questionId: string;
  optionId?: string;
  freeText?: string;
  answeredAt: string;
}

export interface SurveyStatistics {
  totalResponses: number;
  completionRate: number;
  averageTimeToComplete: number;
  questionStats: {
    questionId: string;
    questionText: string;
    totalAnswers: number;
    optionStats?: {
      optionId: string;
      optionText: string;
      count: number;
      percentage: number;
    }[];
    freeTextAnswers?: string[];
  }[];
}