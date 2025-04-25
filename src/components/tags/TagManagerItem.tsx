import React, { useState } from 'react';
import { Edit, Trash2, Info, Check, X } from 'lucide-react';
import { Tag } from '../../utils/tagUtils';

interface TagManagerItemProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Tag>) => void;
}

const TagManagerItem: React.FC<TagManagerItemProps> = ({ 
  tag, 
  onEdit, 
  onDelete,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(tag.value || '');
  
  const handleEdit = () => {
    onEdit(tag);
  };
  
  const handleDelete = () => {
    if (window.confirm(`"${tag.name}"タグを削除してもよろしいですか？`)) {
      onDelete(tag.id);
    }
  };
  
  const startEditing = () => {
    setEditedValue(tag.value || '');
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
  };
  
  const saveValue = () => {
    onUpdate(tag.id, { value: editedValue });
    setIsEditing(false);
  };

  // 表示用のデフォルトテキストを決定
  const getDefaultDisplayText = () => {
    // サンプル表示テキストをタグの種類に応じて返す
    if (tag.name.startsWith('info')) {
      return 'お知らせ内容を入力';
    } else if (tag.name.startsWith('URL')) {
      return 'URLを入力';
    } else if (tag.name.includes('name') || tag.name.includes('名前') || tag.name.includes('氏名')) {
      return 'お客様の名前を入力';
    } else if (tag.name.includes('company') || tag.name.includes('会社')) {
      return '会社名を入力';
    } else if (tag.name.includes('date') || tag.name.includes('日付')) {
      return '日付を入力';
    } else if (tag.name.includes('time') || tag.name.includes('時間')) {
      return '時間を入力';
    } else if (tag.name.includes('place') || tag.name.includes('場所')) {
      return '場所を入力';
    } else if (tag.name.includes('invoice') || tag.name.includes('receipt') || tag.name.includes('伝票')) {
      return '伝票番号を入力';
    } else {
      return `${tag.name}`;
    }
  };

  return (
    <div className="tag-item">
      <div className="flex items-center">
        <span className="tag-badge-common">
          {tag.value || getDefaultDisplayText()}
        </span>
        {isEditing ? (
          <div className="flex items-center ml-2">
            <input
              type="text"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="form-input text-sm h-8 mr-2"
              placeholder="値を入力"
              autoFocus
            />
            <button
              className="p-1 hover:bg-grey-100 rounded-full text-green-600"
              onClick={saveValue}
              title="保存"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              className="p-1 hover:bg-grey-100 rounded-full text-red-600 ml-1"
              onClick={cancelEditing}
              title="キャンセル"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            className="ml-2 p-1 hover:bg-grey-100 rounded-full text-blue-600"
            onClick={startEditing}
            title="値を編集"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {tag.description && !isEditing && (
          <span 
            className="ml-2 text-grey-400 cursor-help"
            title={tag.description}
          >
            <Info className="h-4 w-4" />
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        <span className="text-xs text-grey-500 mr-2">
          {`{${tag.name}}`}
        </span>
        <button
          className="p-1 hover:bg-grey-100 rounded-full text-grey-600"
          onClick={handleEdit}
          title="タグを編集"
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          className="p-1 hover:bg-grey-100 rounded-full text-red-600 ml-1"
          onClick={handleDelete}
          title="タグを削除"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default TagManagerItem; 