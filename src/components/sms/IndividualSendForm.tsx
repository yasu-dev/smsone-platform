import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Send, FileText, Clock, ShieldCheck, FileCheck, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import useTemplateStore from '../../store/templateStore';
import useSMSStore from '../../store/smsStore';
import useAuthStore from '../../store/authStore';
import { Template } from '../../types';
import SenderNumberSelect from './SenderNumberSelect';
import ShortenedUrlInput from './ShortenedUrlInput';
import PhoneNumberInput from './PhoneNumberInput';
import { calculateSMSLength, calculateSMSMessageCount, isSMSLengthExceeded, SMS_CHARACTER_LIMITS } from '../../utils/smsUtils';

const IndividualSendForm: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [isInternational, setIsInternational] = useState(false);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isLongSMSEnabled, setIsLongSMSEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [multipleUrlsEnabled, setMultipleUrlsEnabled] = useState(true);
  const [testRecipient, setTestRecipient] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [urlTagIndex, setUrlTagIndex] = useState(1);
  
  const { templates, fetchTemplates, isLoading: isLoadingTemplates } = useTemplateStore();
  const { sendMessage, sendTestMessage } = useSMSStore();
  const { hasPermission } = useAuthStore();
  
  // 海外送信権限チェック
  const canUseInternational = hasPermission('internationalSms');
  
  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  
  // Update character count when content changes
  useEffect(() => {
    const smsLength = calculateSMSLength(content, { enableLongSMS: isLongSMSEnabled });
    setCharacterCount(smsLength);
    setMessageCount(calculateSMSMessageCount(content, { enableLongSMS: isLongSMSEnabled }));
    
    // URLタグが含まれる数を数えて、次のタグのインデックスを準備する
    const urlTagRegex = /{URL(\d*)}/g;
    const matches = content.match(urlTagRegex) || [];
    
    if (matches.length > 0) {
      const indices = matches.map((match) => {
        const indexMatch = match.match(/{URL(\d*)}/);
        return indexMatch && indexMatch[1] ? parseInt(indexMatch[1], 10) : 1;
      });
      
      const maxIndex = Math.max(...indices, 0);
      setUrlTagIndex(maxIndex + 1);
    } else {
      setUrlTagIndex(1);
    }
  }, [content, isLongSMSEnabled]);

  const handleTemplateSelect = (template: Template) => {
    setContent(template.content);
    setSelectedTemplate(template.id);
    setShowTemplates(false);
    
    // テンプレートに短縮元URLが含まれている場合は設定
    if (template.originalUrl) {
      setOriginalUrl(template.originalUrl);
    }
  };

  // 電話番号入力ハンドラ
  const handlePhoneNumberChange = (value: string, international: boolean, country?: string) => {
    setRecipient(value);
    setIsInternational(international);
    setCountryCode(country);
  };

  // 確認モードに移行
  const handleConfirm = () => {
    if (!validateForm()) return;
    setIsConfirmMode(true);
  };
  
  // フォーム検証
  const validateForm = () => {
    if (!recipient && !isTestMode) {
      toast.error('宛先を入力してください');
      return false;
    }
    
    if (isTestMode && !testRecipient) {
      toast.error('テスト送信用携帯番号を入力してください');
      return false;
    }
    
    if (!content) {
      toast.error('本文を入力してください');
      return false;
    }
    
    // 正規表現で{URL}タグがあるかチェック（数字付きも含む）
    const hasUrlTags = /{URL\d*}/.test(content);
    
    // 本文に{URL}タグがあるのに短縮元URLが設定されていない場合
    if (hasUrlTags && !originalUrl) {
      toast.error('本文に{URL}タグがありますが、短縮元URLが設定されていません');
      return false;
    }
    
    // 文字数制限チェック
    if (isSMSLengthExceeded(content, { enableLongSMS: isLongSMSEnabled })) {
      const limit = isLongSMSEnabled 
        ? (senderNumber.startsWith('090') ? SMS_CHARACTER_LIMITS.DOCOMO_LONG : SMS_CHARACTER_LIMITS.OTHER_LONG)
        : SMS_CHARACTER_LIMITS.STANDARD;
      toast.error(`文字数制限(${limit}文字)を超えています`);
      return false;
    }
    
    return true;
  };

  // 編集モードに戻る
  const handleBackToEdit = () => {
    setIsConfirmMode(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfirmMode) {
      handleConfirm();
      return;
    }
    
    if (!validateForm()) return;
    
    const actualRecipient = isTestMode ? testRecipient : recipient;
    
    setIsSending(true);
    
    try {
      if (isTestMode) {
        // テスト送信
        await sendTestMessage({
          recipient: testRecipient,
          content,
          sender: senderNumber,
          templateId: selectedTemplate || undefined,
          originalUrl: originalUrl || undefined,
          isInternational,
          countryCode
        });
        toast.success(`テスト送信を完了しました`);
      } else {
        // 通常送信
        await sendMessage({
          recipient: actualRecipient,
          content,
          sender: senderNumber,
          templateId: selectedTemplate || undefined,
          originalUrl: originalUrl || undefined,
          isInternational,
          countryCode
        });
        toast.success('メッセージを送信しました');
      }
      
      // 送信後の処理
      resetForm();
    } catch (error) {
      toast.error('送信に失敗しました');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // フォームリセット
  const resetForm = () => {
    setRecipient('');
    setContent('');
    setSelectedTemplate('');
    setIsConfirmMode(false);
    setIsScheduled(false);
    setScheduledDate('');
    setScheduledTime('');
    setOriginalUrl('');
    setTestRecipient('');
    setIsTestMode(false);
    setIsInternational(false);
    setCountryCode(undefined);
    setUrlTagIndex(1);
  };

  const handleSenderNumberChange = (number: string) => {
    setSenderNumber(number);
  };
  
  const handleOriginalUrlUpdate = (url: string) => {
    setOriginalUrl(url);
  };
  
  const handleInsertTag = (tag: string) => {
    const textArea = document.getElementById('content') as HTMLTextAreaElement;
    if (textArea) {
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const newContent = content.substring(0, start) + tag + content.substring(end);
      setContent(newContent);
      
      // カーソル位置を挿入したタグの後ろに設定
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      // テキストエリアが見つからない場合は末尾に追加
      setContent(content + tag);
    }
    
    // URLタグを挿入した後、次のタグインデックスを更新
    if (tag.startsWith('{URL')) {
      // タグパターンを正規表現で検出
      const match = tag.match(/{URL(\d*)}/) || [];
      const currentIndex = match[1] ? parseInt(match[1], 10) : 1;
      setUrlTagIndex(currentIndex + 1);
    }
  };

  // テスト送信モードを切り替え
  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    if (isConfirmMode) {
      setIsConfirmMode(false);
    }
  };

  // 文字数制限値
  const characterLimit = isLongSMSEnabled 
    ? (senderNumber.startsWith('090') ? SMS_CHARACTER_LIMITS.DOCOMO_LONG : SMS_CHARACTER_LIMITS.OTHER_LONG)
    : SMS_CHARACTER_LIMITS.STANDARD;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="card"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="mb-5">
        <h2 className="text-lg font-medium text-grey-900">個別送信</h2>
        <p className="mt-1 text-sm text-grey-500">
          電話番号と本文を入力して個別にSMSを送信します。テンプレートを使用することもできます。
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div className="space-y-6" variants={container}>
          <motion.div variants={item}>
            <div className="flex items-center mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTestMode}
                  onChange={toggleTestMode}
                  className="form-checkbox"
                />
                <span className="ml-2 text-sm font-medium text-grey-700">テスト送信モード</span>
              </label>
              <div className="ml-4 text-sm text-grey-500">
                {isTestMode ? '実際には送信せず、テスト用携帯番号にのみ送信します' : '通常の送信モードです'}
              </div>
            </div>
          </motion.div>

          {isTestMode ? (
            <motion.div variants={item}>
              <label htmlFor="test-recipient" className="form-label flex items-center">
                テスト送信用携帯番号 <span className="text-error-500 ml-1">*</span>
              </label>
              <div className="mt-1">
                {canUseInternational ? (
                  <PhoneNumberInput
                    value={testRecipient}
                    onChange={(value, isIntl, code) => {
                      setTestRecipient(value);
                      setIsInternational(isIntl);
                      setCountryCode(code);
                    }}
                    placeholder="例: 09012345678"
                    disabled={isConfirmMode}
                    required
                  />
                ) : (
                  <input
                    type="tel"
                    id="test-recipient"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="例: 09012345678"
                    className="form-input"
                    disabled={isConfirmMode}
                    required
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div variants={item}>
              <label htmlFor="recipient" className="form-label">
                宛先（電話番号）{canUseInternational && <span className="ml-2 text-xs text-primary-600">国際送信対応</span>}
              </label>
              <div className="mt-1">
                {canUseInternational ? (
                  <PhoneNumberInput
                    value={recipient}
                    onChange={handlePhoneNumberChange}
                    placeholder="例: 09012345678"
                    disabled={isConfirmMode}
                  />
                ) : (
                  <input
                    type="tel"
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="例: 09012345678"
                    className="form-input"
                    disabled={isConfirmMode}
                  />
                )}
              </div>
            </motion.div>
          )}

          <motion.div variants={item}>
            <SenderNumberSelect 
              onChange={handleSenderNumberChange}
              disabled={isConfirmMode}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <ShortenedUrlInput 
              onUpdate={handleOriginalUrlUpdate}
              onInsertTag={handleInsertTag}
              initialUrl={originalUrl}
              showMultipleUrls={multipleUrlsEnabled}
              urlIndex={urlTagIndex}
              disabled={isConfirmMode}
            />
          </motion.div>

          <motion.div variants={item}>
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="form-label">
                本文
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="inline-flex items-center text-primary-600 hover:text-primary-500 text-sm"
                  disabled={isConfirmMode}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  テンプレートを使用
                </button>
              </div>
            </div>
            <div className="mt-1">
              <textarea
                id="content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="メッセージを入力してください。{info1}のような動的タグや{URL1}、{URL2}などのタグを使用できます。"
                className="form-input"
                disabled={isConfirmMode}
              />
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm text-grey-500 flex items-center">
                <span className={characterCount > characterLimit ? 'text-error-600' : ''}>
                  文字数: {characterCount} / {characterLimit}文字
                </span>
                {messageCount > 1 && (
                  <span className="ml-2 px-2 py-0.5 bg-grey-100 rounded-full text-xs">
                    {messageCount}通分
                  </span>
                )}
                {characterCount > characterLimit && (
                  <span className="text-error-600 ml-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    制限を超えています
                  </span>
                )}
              </div>
              
              <div className="flex items-center">
                <label className="inline-flex items-center text-sm mr-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLongSMSEnabled}
                    onChange={() => setIsLongSMSEnabled(!isLongSMSEnabled)}
                    className="form-checkbox mr-2 h-4 w-4"
                    disabled={isConfirmMode}
                  />
                  長文SMS
                </label>
                
                <button
                  type="button"
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`inline-flex items-center text-sm mr-4 ${
                    isScheduled ? 'text-primary-600' : 'text-grey-500 hover:text-grey-700'
                  }`}
                  disabled={isConfirmMode}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  送信予約
                </button>
              </div>
            </div>
            
            {/* Preview box */}
            {content && (
              <div className="mt-4 p-4 border border-grey-200 rounded-md bg-grey-50">
                <p className="text-sm font-medium text-grey-700 mb-2">プレビュー:</p>
                <p className="text-sm text-grey-800 whitespace-pre-wrap">
                  {content
                    .replace(/{info\d+}/g, '【ダミーデータ】')
                    .replace(/{URL\d*}/g, originalUrl ? 'https://sms.l/abc123' : '{URL}')}
                </p>
              </div>
            )}
          </motion.div>

          {/* Template selector dropdown */}
          {showTemplates && !isConfirmMode && (
            <motion.div 
              className="mt-2 border border-grey-200 rounded-md shadow-sm overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 bg-grey-50 border-b border-grey-200">
                <h4 className="font-medium text-grey-900">テンプレート選択</h4>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {isLoadingTemplates ? (
                  <div className="p-4 text-center text-grey-500">読み込み中...</div>
                ) : templates.length === 0 ? (
                  <div className="p-4 text-center text-grey-500">テンプレートがありません</div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 border-b border-grey-200 hover:bg-grey-50 cursor-pointer"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <p className="font-medium text-grey-900">{template.name}</p>
                      <p className="text-sm text-grey-500 mt-1 line-clamp-2">{template.content}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Scheduled sending options */}
          {isScheduled && !isConfirmMode && (
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1">
                <label htmlFor="scheduled-date" className="form-label">
                  予約日
                </label>
                <input
                  type="date"
                  id="scheduled-date"
                  className="form-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="scheduled-time" className="form-label">
                  予約時間
                </label>
                <input
                  type="time"
                  id="scheduled-time"
                  className="form-input"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {/* 確認モード表示 */}
          {isConfirmMode && (
            <motion.div 
              variants={item}
              className="border border-grey-200 rounded-md p-4 bg-grey-50"
            >
              <h3 className="font-medium text-grey-900 mb-3">送信内容の確認</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-grey-500">宛先</p>
                    <p className="text-sm text-grey-900 flex items-center">
                      {isInternational && (
                        <span className="mr-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          <Globe className="h-3 w-3 mr-1" />
                          国際
                        </span>
                      )}
                      {isTestMode ? testRecipient : recipient}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-grey-500">送信元</p>
                    <p className="text-sm text-grey-900">{senderNumber}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-grey-500">本文</p>
                  <p className="text-sm text-grey-900 whitespace-pre-wrap p-3 bg-white rounded border border-grey-200">
                    {content
                      .replace(/{info\d+}/g, '【ダミーデータ】')
                      .replace(/{URL\d*}/g, originalUrl ? 'https://sms.l/abc123' : '{URL}')}
                  </p>
                </div>
                
                {originalUrl && (
                  <div>
                    <p className="text-sm font-medium text-grey-500">短縮元URL</p>
                    <p className="text-sm text-grey-900 font-mono">{originalUrl}</p>
                  </div>
                )}
                
                {isScheduled && scheduledDate && scheduledTime && (
                  <div>
                    <p className="text-sm font-medium text-grey-500">予約送信日時</p>
                    <p className="text-sm text-grey-900">
                      {scheduledDate} {scheduledTime}
                    </p>
                  </div>
                )}
                
                {isTestMode && (
                  <div className="p-3 bg-warning-50 border border-warning-200 rounded-md">
                    <p className="text-sm text-warning-800 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-warning-500" />
                      テスト送信モードが有効です。送信先は「{testRecipient}」のみとなります。
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div variants={item} className="pt-4 flex space-x-4">
            {isConfirmMode ? (
              <>
                <button
                  type="button"
                  onClick={handleBackToEdit}
                  className="btn-secondary flex-1"
                >
                  編集に戻る
                </button>
                
                <button
                  type="submit"
                  disabled={isSending}
                  className="btn-primary flex-1"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      SMS送信
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isSending || (!recipient && !isTestMode) || !content || (characterCount > characterLimit)}
                className="btn-primary w-full"
              >
                <FileCheck className="mr-2 h-5 w-5" />
                確認
              </button>
            )}
          </motion.div>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default IndividualSendForm;