import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Tag, Search, X } from 'lucide-react';
import useTagStore from '../../store/tagStore';
import TagManagerItem from './TagManagerItem';
import TagForm from './TagForm';
import { Tag as TagType } from '../../utils/tagUtils';

const TagManager: React.FC = () => {
  const { 
    tags, 
    fetchTags, 
    addTag, 
    updateTag, 
    deleteTag,
    setTagValue,
    isLoading,
    error
  } = useTagStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  
  // タグ一覧を取得
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);
  
  // 検索フィルタ
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // タグ追加モードを開始
  const handleAddTag = () => {
    setSelectedTag(null);
    setIsAddMode(true);
    setShowForm(true);
  };
  
  // タグ編集モードを開始
  const handleEditTag = (tag: TagType) => {
    setSelectedTag(tag);
    setIsAddMode(false);
    setShowForm(true);
  };
  
  // フォームを閉じる
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTag(null);
    setIsAddMode(false);
  };
  
  // 新規タグを保存
  const handleSaveTag = async (tagData: Omit<TagType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addTag(tagData);
    } catch (error) {
      console.error('タグ保存エラー:', error);
    }
  };
  
  // 既存タグを更新
  const handleUpdateTag = async (id: string, updates: Partial<TagType>) => {
    try {
      await updateTag(id, updates);
    } catch (error) {
      console.error('タグ更新エラー:', error);
    }
  };
  
  // タグを削除
  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id);
    } catch (error) {
      console.error('タグ削除エラー:', error);
    }
  };
  
  // アニメーション設定
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="tag-manager-container">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-grey-900 flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          タグ管理
        </h2>
        <button
          type="button"
          className="btn-primary flex items-center"
          onClick={handleAddTag}
        >
          <Plus className="h-4 w-4 mr-1" />
          新規タグ
        </button>
      </div>
      
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-grey-400" />
        </div>
        <input
          type="text"
          className="form-input pl-10 pr-10"
          placeholder="タグを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setSearchTerm('')}
          >
            <X className="h-4 w-4 text-grey-400" />
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md text-error-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="tag-list">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-grey-300 border-t-primary-600"></div>
            <p className="mt-2 text-grey-500">タグを読み込み中...</p>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-md">
            <Tag className="h-12 w-12 text-grey-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-grey-900">タグがありません</h3>
            <p className="mt-1 text-sm text-grey-500">
              {searchTerm 
                ? '検索条件に一致するタグが見つかりませんでした。'
                : '新規タグを作成してメッセージをカスタマイズしましょう。'}
            </p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {filteredTags.map(tag => (
                <motion.div key={tag.id} variants={item}>
                  <TagManagerItem
                    tag={tag}
                    onEdit={handleEditTag}
                    onDelete={handleDeleteTag}
                    onUpdate={handleUpdateTag}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {showForm && (
        <TagForm
          tag={isAddMode ? undefined : selectedTag || undefined}
          onClose={handleCloseForm}
          onSave={handleSaveTag}
          onUpdate={handleUpdateTag}
        />
      )}
    </div>
  );
};

export default TagManager; 