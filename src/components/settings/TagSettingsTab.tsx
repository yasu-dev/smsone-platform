import React from 'react';
import { Tag } from 'lucide-react';
import TagManager from '../tags/TagManager';

/**
 * 設定画面のタグ管理タブコンポーネント
 */
const TagSettingsTab: React.FC = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-grey-900 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            タグ管理
          </h2>
          <p className="mt-1 text-sm text-grey-500">
            メッセージのタグを管理・設定します。タグは入力時に {'{タグ名}'} の形式で指定し、表示時にはタグ名または設定した値に置き換わります。
            日本語を含む様々な文字をタグ名として使用可能です。
          </p>
        </div>
      </div>
      
      <TagManager />
    </div>
  );
};

export default TagSettingsTab; 