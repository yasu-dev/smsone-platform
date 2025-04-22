import React, { useState, useEffect } from 'react';
import { Link2, Lock, Info, Plus, X, ExternalLink, FileCode, Copy, AlertCircle } from 'lucide-react';
import useShortenedUrlStore from '../../store/shortenedUrlStore';
import toast from 'react-hot-toast';

interface ShortenedUrlInputProps {
  onUpdate: (url: string, index?: number) => void;
  onInsertTag: (tag: string) => void;
  initialUrl?: string;
  urlIndex?: number; // 複数URLサポート用（1-4）
  showMultipleUrls?: boolean;
  disabled?: boolean;
}

const ShortenedUrlInput: React.FC<ShortenedUrlInputProps> = ({
  onUpdate,
  onInsertTag,
  initialUrl = '',
  urlIndex = 1,
  showMultipleUrls = false,
  disabled = false
}) => {
  const { 
    validateUrl,
    shortenUrl,
    hasAccessCodeFeature,
    isLoading,
    error
  } = useShortenedUrlStore();
  
  const [originalUrl, setOriginalUrl] = useState(initialUrl);
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodeInput, setShowAccessCodeInput] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);
  
  // 初期値設定
  useEffect(() => {
    if (initialUrl && initialUrl !== originalUrl) {
      setOriginalUrl(initialUrl);
    }
  }, [initialUrl]);
  
  // 元のURLが変更されたら結果をリセット
  useEffect(() => {
    if (originalUrl !== initialUrl) {
      setShortenedUrl('');
      setIsUrlProcessed(false);
      setUrlError('');
    }
  }, [originalUrl, initialUrl]);
  
  // URLタグ挿入
  const handleInsertTag = () => {
    // urlIndexに基づいてタグを生成（1の場合は数字なし、それ以外は数字付き）
    const tag = `{URL${urlIndex}}`;
    onInsertTag(tag);
  };
  
  // URL短縮ボタンハンドラ
  const handleShortenUrl = async () => {
    if (!originalUrl.trim()) {
      setUrlError('短縮元URLを入力してください');
      return;
    }
    
    if (!validateUrl(originalUrl)) {
      setUrlError('有効なURLを入力してください');
      return;
    }
    
    if (originalUrl.length > 2083) {
      setUrlError('URLは2083文字以内で入力してください');
      return;
    }
    
    setUrlError('');
    
    try {
      const shortened = await shortenUrl(originalUrl, urlIndex);
      setShortenedUrl(shortened);
      setIsUrlProcessed(true);
      onUpdate(originalUrl, urlIndex);
    } catch (error) {
      setUrlError('URL短縮に失敗しました');
      console.error(error);
    }
  };
  
  // アクセスコード保存
  const handleSaveAccessCode = () => {
    if (!accessCode.trim()) {
      toast.error('アクセスコードを入力してください');
      return;
    }
    
    // アクセスコードの検証（英数字と特殊文字、1-20文字）
    const validCodePattern = /^[@%+'!#$^?:;.,()\[\]{}~\-_a-zA-Z0-9]{1,20}$/;
    if (!validCodePattern.test(accessCode)) {
      toast.error('無効なアクセスコードです。英数字および一部の特殊文字のみ使用可能です（1～20文字）');
      return;
    }
    
    toast.success('アクセスコードを設定しました');
    setShowAccessCodeInput(false);
  };
  
  // プレビューURLをクリップボードにコピー
  const handleCopyUrl = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl)
        .then(() => toast.success('URLをコピーしました'))
        .catch(() => toast.error('コピーに失敗しました'));
    }
  };
  
  // タグの表示文字列
  const tagText = `{URL${urlIndex}}`;
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`original-url-${urlIndex}`} className="form-label">
          短縮元URL {urlIndex > 1 ? urlIndex : ''}
        </label>
        
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-grey-400" />
            </div>
            <input
              type="url"
              id={`original-url-${urlIndex}`}
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/page"
              className={`form-input pl-10 pr-20 ${urlError ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}`}
              disabled={disabled}
            />
            {hasAccessCodeFeature && !disabled && (
              <button
                type="button"
                onClick={() => setShowAccessCodeInput(!showAccessCodeInput)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-grey-400 hover:text-grey-600"
                title="アクセスコードを設定"
                disabled={disabled}
              >
                <Lock className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleShortenUrl}
            disabled={isLoading || !originalUrl.trim() || disabled}
            className="ml-2 btn-secondary whitespace-nowrap"
          >
            短縮URL生成
          </button>
          
          <button
            type="button"
            onClick={handleInsertTag}
            className="ml-2 btn-secondary whitespace-nowrap"
            title={`本文に${tagText}タグを挿入`}
            disabled={disabled}
          >
            {tagText}挿入
          </button>
        </div>
        
        {urlError && (
          <p className="mt-1 text-sm text-error-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {urlError}
          </p>
        )}
        
        {!urlError && (
          <p className="mt-1 text-xs text-grey-500">
            短縮元URLの最大文字数は2083文字です。本文に{tagText}タグを挿入することで、生成された短縮URLが表示されます。
          </p>
        )}
      </div>
      
      {/* アクセスコード入力 */}
      {showAccessCodeInput && hasAccessCodeFeature && !disabled && (
        <div className="p-3 border border-grey-200 rounded-md bg-grey-50">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor={`access-code-${urlIndex}`} className="text-sm font-medium text-grey-700">
              アクセスコード設定
            </label>
            <button
              type="button"
              onClick={() => setShowAccessCodeInput(false)}
              className="text-grey-400 hover:text-grey-600"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex">
            <input
              type="text"
              id={`access-code-${urlIndex}`}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="英数字 1～20文字"
              className="form-input flex-grow"
              maxLength={20}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleSaveAccessCode}
              className="ml-2 btn-primary"
              disabled={disabled}
            >
              保存
            </button>
          </div>
          
          <p className="mt-1 text-xs text-grey-500">
            URLにアクセスする際に必要なパスワードを設定できます。英数字と一部の特殊文字が使用可能です。
          </p>
        </div>
      )}
      
      {/* 短縮URL結果表示 */}
      {isUrlProcessed && shortenedUrl && (
        <div className="p-3 border border-grey-200 rounded-md bg-grey-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-grey-700 flex items-center">
              <FileCode className="h-4 w-4 mr-1 text-primary-500" />
              短縮URL {urlIndex > 1 ? urlIndex : ''}
            </h4>
            
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-1 text-grey-500 hover:text-grey-700"
                title="URLをコピー"
                disabled={disabled}
              >
                <Copy className="h-4 w-4" />
              </button>
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-grey-500 hover:text-grey-700"
                title="新しいタブで開く"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <p className="text-sm text-primary-600 font-mono bg-white p-2 rounded border border-grey-200">
            {shortenedUrl}
          </p>
          
          <div className="mt-2 text-xs text-grey-600 flex items-start">
            <Info className="h-4 w-4 text-grey-400 mr-1 flex-shrink-0 mt-0.5" />
            <p>
              HTTPの場合は19文字、HTTPSの場合は20文字に短縮されます。auの場合は19バイト換算です。{' '}
              {accessCode && <span className="text-warning-600">このURLにはアクセスコードが設定されています。</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortenedUrlInput;