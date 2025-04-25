import React, { useState } from 'react';
import UrlAnalytics from './UrlAnalytics';
import MessageAnalytics from './MessageAnalytics';
import SurveyAnalytics from './SurveyAnalytics';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('url');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="url">URL分析</TabsTrigger>
          <TabsTrigger value="message">メッセージ分析</TabsTrigger>
          <TabsTrigger value="survey">アンケート分析</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="mt-2">
          <UrlAnalytics />
        </TabsContent>
        
        <TabsContent value="message" className="mt-2">
          <MessageAnalytics />
        </TabsContent>
        
        <TabsContent value="survey" className="mt-2">
          <SurveyAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 