import React, { createContext, useContext, useState } from 'react';

// タブのコンテキスト
interface TabsContextProps {
  selectedTab: string;
  setSelectedTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextProps | undefined>(undefined);

// タブの使用時のエラーハンドリング
const useTabContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs コンポーネントのコンテキスト外で使用されています');
  }
  return context;
};

// タブコンテナ
interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className = '' }) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// タブリスト
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-2 overflow-x-auto ${className}`}>
      {children}
    </div>
  );
};

// タブトリガー
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }) => {
  const { selectedTab, setSelectedTab } = useTabContext();
  const isSelected = selectedTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => setSelectedTab(value)}
      className={`
        px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${isSelected 
          ? 'bg-primary-100 text-primary-700 shadow-sm' 
          : 'text-grey-600 hover:text-grey-900 hover:bg-grey-100'}
        flex items-center
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// タブコンテンツ
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  const { selectedTab } = useTabContext();
  
  if (selectedTab !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      className={className}
    >
      {children}
    </div>
  );
}; 