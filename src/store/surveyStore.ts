import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Survey, SurveyQuestion, SurveyResponse, SurveyStatistics, SurveyStatus, ApiResponse } from '../types';
import toast from 'react-hot-toast';

// モック用の生成関数
const generateMockSurveys = (count: number = 10): Survey[] => {
  const surveys: Survey[] = [];
  
  for (let i = 0; i < count; i++) {
    const questions: SurveyQuestion[] = [];
    const questionCount = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < questionCount; j++) {
      const questionType = Math.random() > 0.3 ? 'single' : (Math.random() > 0.5 ? 'multiple' : 'free');
      const options = questionType !== 'free' ? Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, index) => ({
        id: `option-${uuidv4()}`,
        questionId: `question-${j + 1}`,
        optionText: `選択肢 ${index + 1}`,
        order: index + 1
      })) : undefined;
      
      questions.push({
        id: `question-${j + 1}`,
        surveyId: `survey-${i + 1}`,
        questionText: `質問 ${j + 1}`,
        questionType: questionType as any,
        branchingType: 'independent',
        isEnabled: true,
        order: j + 1,
        options,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    const startDate = new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14);
    
    surveys.push({
      id: `survey-${i + 1}`,
      name: `アンケート${i + 1}`,
      tagName: `SURVEY${i + 1}`,
      htmlTitle: `顧客満足度調査${i + 1}`,
      userId: `user-${Math.floor(Math.random() * 5) + 1}`,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      questionType: questions[0].questionType,
      branchingType: 'independent',
      allowMultipleAnswers: questions[0].questionType === 'multiple',
      maxSelections: questions[0].questionType === 'multiple' ? Math.floor(Math.random() * 5) + 2 : undefined,
      completionText: 'アンケートにご回答いただき、ありがとうございました。',
      expirationText: 'このアンケートの回答期間は終了しました。',
      status: ['active', 'inactive', 'draft', 'expired'][Math.floor(Math.random() * 4)] as SurveyStatus,
      questions,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return surveys;
};

// モック用の回答生成関数
const generateMockResponses = (surveys: Survey[]): SurveyResponse[] => {
  const responses: SurveyResponse[] = [];
  
  surveys.forEach(survey => {
    const responseCount = Math.floor(Math.random() * 50) + 5;
    
    for (let i = 0; i < responseCount; i++) {
      const answers = survey.questions.map(question => {
        if (question.questionType === 'free') {
          return {
            id: uuidv4(),
            responseId: `response-${i}-${survey.id}`,
            questionId: question.id,
            freeText: `自由回答テキスト${Math.floor(Math.random() * 100)}`,
            answeredAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
          };
        } else {
          // 単一選択または複数選択
          const options = question.options || [];
          const selectedOptions = question.questionType === 'single'
            ? [options[Math.floor(Math.random() * options.length)]]
            : options.filter(() => Math.random() > 0.5).slice(0, Math.floor(Math.random() * options.length) + 1);
          
          return selectedOptions.map(option => ({
            id: uuidv4(),
            responseId: `response-${i}-${survey.id}`,
            questionId: question.id,
            optionId: option.id,
            answeredAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
          }))[0]; // 一時的に一つだけ返す（正しくは全て返すべき）
        }
      });
      
      responses.push({
        id: `response-${i}-${survey.id}`,
        surveyId: survey.id,
        recipientPhoneNumber: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
        senderPhoneNumber: `0120${Math.floor(100000 + Math.random() * 900000)}`,
        messageId: uuidv4(),
        completedAt: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
        answers
      });
    }
  });
  
  return responses;
};

// モック用の統計生成関数
const generateMockStatistics = (survey: Survey, responses: SurveyResponse[]): SurveyStatistics => {
  const surveyResponses = responses.filter(r => r.surveyId === survey.id);
  const totalResponses = surveyResponses.length;
  const completedResponses = surveyResponses.filter(r => r.completedAt).length;
  
  const questionStats = survey.questions.map(question => {
    const answers = surveyResponses.flatMap(r => r.answers.filter(a => a.questionId === question.id));
    
    if (question.questionType === 'free') {
      return {
        questionId: question.id,
        questionText: question.questionText,
        totalAnswers: answers.length,
        freeTextAnswers: answers.filter(a => a.freeText).map(a => a.freeText as string)
      };
    } else {
      const optionCounts = new Map<string, number>();
      
      answers.forEach(answer => {
        if (answer.optionId) {
          const count = optionCounts.get(answer.optionId) || 0;
          optionCounts.set(answer.optionId, count + 1);
        }
      });
      
      const options = question.options || [];
      const optionStats = options.map(option => {
        const count = optionCounts.get(option.id) || 0;
        return {
          optionId: option.id,
          optionText: option.optionText,
          count,
          percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0
        };
      });
      
      return {
        questionId: question.id,
        questionText: question.questionText,
        totalAnswers: answers.length,
        optionStats
      };
    }
  });
  
  return {
    totalResponses,
    completionRate: totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0,
    averageTimeToComplete: Math.floor(Math.random() * 300) + 60, // 60-360秒
    questionStats
  };
};

interface SurveyState {
  surveys: Survey[];
  responses: SurveyResponse[];
  currentSurvey: Survey | null;
  isLoading: boolean;
  error: string | null;
  // API関数
  fetchSurveys: () => Promise<void>;
  fetchSurveyById: (id: string) => Promise<Survey | null>;
  createSurvey: (survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Survey>;
  updateSurvey: (id: string, updates: Partial<Survey>) => Promise<Survey>;
  deleteSurvey: (id: string) => Promise<boolean>;
  // レスポンス
  fetchResponses: (surveyId: string) => Promise<SurveyResponse[]>;
  fetchStatistics: (surveyId: string) => Promise<SurveyStatistics>;
  // CSV
  exportResponsesCSV: (surveyId: string) => Promise<string>;
}

const useSurveyStore = create<SurveyState>((set, get) => ({
  surveys: [],
  responses: [],
  currentSurvey: null,
  isLoading: false,
  error: null,
  
  // API関数の実装
  fetchSurveys: async () => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch('/api/surveys');
      // const data = await response.json();
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockSurveys = generateMockSurveys(10);
      
      set({
        surveys: mockSurveys,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching surveys:', error);
      set({
        isLoading: false,
        error: 'アンケートの取得に失敗しました'
      });
      toast.error('アンケートの取得に失敗しました');
    }
  },
  
  fetchSurveyById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch(`/api/surveys/${id}`);
      // const data = await response.json();
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 500));
      const { surveys } = get();
      const survey = surveys.find(s => s.id === id) || null;
      
      if (!survey) {
        throw new Error('アンケートが見つかりませんでした');
      }
      
      set({
        currentSurvey: survey,
        isLoading: false
      });
      
      return survey;
    } catch (error) {
      console.error('Error fetching survey:', error);
      set({
        isLoading: false,
        error: 'アンケートの取得に失敗しました'
      });
      toast.error('アンケートの取得に失敗しました');
      return null;
    }
  },
  
  createSurvey: async (surveyData) => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch('/api/surveys', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(surveyData)
      // });
      // const data = await response.json();
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 800));
      const newSurvey: Survey = {
        ...surveyData,
        id: `survey-${uuidv4()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({
        surveys: [...state.surveys, newSurvey],
        isLoading: false
      }));
      
      toast.success('アンケートを作成しました');
      return newSurvey;
    } catch (error) {
      console.error('Error creating survey:', error);
      set({
        isLoading: false,
        error: 'アンケートの作成に失敗しました'
      });
      toast.error('アンケートの作成に失敗しました');
      throw error;
    }
  },
  
  updateSurvey: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch(`/api/surveys/${id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // const data = await response.json();
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 500));
      const { surveys } = get();
      const surveyIndex = surveys.findIndex(s => s.id === id);
      
      if (surveyIndex === -1) {
        throw new Error('アンケートが見つかりませんでした');
      }
      
      const updatedSurvey = {
        ...surveys[surveyIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const updatedSurveys = [...surveys];
      updatedSurveys[surveyIndex] = updatedSurvey;
      
      set({
        surveys: updatedSurveys,
        currentSurvey: updatedSurvey,
        isLoading: false
      });
      
      toast.success('アンケートを更新しました');
      return updatedSurvey;
    } catch (error) {
      console.error('Error updating survey:', error);
      set({
        isLoading: false,
        error: 'アンケートの更新に失敗しました'
      });
      toast.error('アンケートの更新に失敗しました');
      throw error;
    }
  },
  
  deleteSurvey: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch(`/api/surveys/${id}`, {
      //   method: 'DELETE'
      // });
      // const data = await response.json();
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 500));
      const { surveys } = get();
      const updatedSurveys = surveys.filter(s => s.id !== id);
      
      set({
        surveys: updatedSurveys,
        isLoading: false
      });
      
      toast.success('アンケートを削除しました');
      return true;
    } catch (error) {
      console.error('Error deleting survey:', error);
      set({
        isLoading: false,
        error: 'アンケートの削除に失敗しました'
      });
      toast.error('アンケートの削除に失敗しました');
      return false;
    }
  },
  
  fetchResponses: async (surveyId) => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch(`/api/surveys/${surveyId}/responses`);
      // const data = await response.json();
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 800));
      const { surveys } = get();
      const mockResponses = generateMockResponses(surveys);
      const filteredResponses = mockResponses.filter(r => r.surveyId === surveyId);
      
      set({
        responses: filteredResponses,
        isLoading: false
      });
      
      return filteredResponses;
    } catch (error) {
      console.error('Error fetching responses:', error);
      set({
        isLoading: false,
        error: 'アンケート回答の取得に失敗しました'
      });
      toast.error('アンケート回答の取得に失敗しました');
      return [];
    }
  },
  
  fetchStatistics: async (surveyId) => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch(`/api/surveys/${surveyId}/statistics`);
      // const data = await response.json();
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { surveys } = get();
      const survey = surveys.find(s => s.id === surveyId);
      
      if (!survey) {
        throw new Error('アンケートが見つかりませんでした');
      }
      
      const mockResponses = generateMockResponses([survey]);
      const statistics = generateMockStatistics(survey, mockResponses);
      
      set({ isLoading: false });
      
      return statistics;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      set({
        isLoading: false,
        error: 'アンケート統計の取得に失敗しました'
      });
      toast.error('アンケート統計の取得に失敗しました');
      throw error;
    }
  },
  
  exportResponsesCSV: async (surveyId) => {
    set({ isLoading: true, error: null });
    try {
      // 本番ではAPIリクエストを行う
      // const response = await fetch(`/api/surveys/${surveyId}/export-csv`);
      // const data = await response.blob();
      // const url = window.URL.createObjectURL(data);
      
      // モックデータ
      await new Promise(resolve => setTimeout(resolve, 1200));
      const { surveys } = get();
      const survey = surveys.find(s => s.id === surveyId);
      
      if (!survey) {
        throw new Error('アンケートが見つかりませんでした');
      }
      
      // CSVダウンロードのシミュレーション
      set({ isLoading: false });
      
      toast.success('CSVファイルをダウンロードしました');
      return 'mock-csv-download-url';
    } catch (error) {
      console.error('Error exporting CSV:', error);
      set({
        isLoading: false,
        error: 'CSVエクスポートに失敗しました'
      });
      toast.error('CSVエクスポートに失敗しました');
      throw error;
    }
  }
}));

export default useSurveyStore; 