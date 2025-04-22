import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, FileText, AlertCircle, FileCheck, Info, Send, 
  Clock, ShieldCheck, FileSpreadsheet, FileDown, X, Check, Globe 
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import SenderNumberSelect from './SenderNumberSelect';
import ShortenedUrlInput from './ShortenedUrlInput';
import PhoneNumberInput from './PhoneNumberInput';
import { calculateSMSLength, calculateSMSMessageCount, SMS_CHARACTER_LIMITS, getNextUrlTagIndex } from '../../utils/smsUtils';
import useSMSStore from '../../store/smsStore';
import useAuthStore from '../../store/authStore';

interface FileRow {
  [key: string]: string;
}

type FileFormat = 'csv' | 'excel';
type FileEncoding = 'shift-jis' | 'utf-8';

const BulkSendForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<FileRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [multipleUrlsEnabled, setMultipleUrlsEnabled] = useState(true);
  const [isLongSMSEnabled, setIsLongSMSEnabled] = useState(false);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>('shift-jis');
  const [fileFormat, setFileFormat] = useState<FileFormat>('csv');
  const [showDropZone, setShowDropZone] = useState(false);
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [isInternational, setIsInternational] = useState(false);
  const [countryCode, setCountryCode] = useState<string | undefined>(undefined);
  const [isTestMode, setIsTestMode] = useState(false);
  const [hasInternationalNumbers, setHasInternationalNumbers] = useState(false);
  const [urlTagIndex, setUrlTagIndex] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const { sendTestMessage } = useSMSStore();
  const { hasPermission } = useAuthStore();
  
  // 海外送信権限チェック
  const canUseInternational = hasPermission('internationalSms');

  // 文字数と通数の計算
  const characterCount = calculateSMSLength(previewTemplate, { enableLongSMS: isLongSMSEnabled });
  const messageCount = calculateSMSMessageCount(previewTemplate, { enableLongSMS: isLongSMSEnabled });
  
  // 文字数制限値
  const characterLimit = isLongSMSEnabled 
    ? (senderNumber.startsWith('090') ? SMS_CHARACTER_LIMITS.DOCOMO_LONG : SMS_CHARACTER_LIMITS.OTHER_LONG)
    : SMS_CHARACTER_LIMITS.STANDARD;
    
  // プレビュー更新時にURLタグインデックスを更新
  useEffect(() => {
    if (previewTemplate) {
      setUrlTagIndex(getNextUrlTagIndex(previewTemplate));
    }
  }, [previewTemplate]);

  // ドラッグ&ドロップ関連のイベントハンドラ
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setShowDropZone(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setShowDropZone(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setShowDropZone(false);
      
      if (e.dataTransfer?.files.length) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }
    };

    // イベントリスナー登録
    const div = dropZoneRef.current;
    if (div) {
      div.addEventListener('dragover', handleDragOver);
      div.addEventListener('dragleave', handleDragLeave);
      div.addEventListener('drop', handleDrop);
    }

    // クリーンアップ
    return () => {
      if (div) {
        div.removeEventListener('dragover', handleDragOver);
        div.removeEventListener('dragleave', handleDragLeave);
        div.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

  // ファイル拡張子からファイル形式を自動検出
  const detectFileFormat = (fileName: string): FileFormat => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      return 'excel';
    }
    return 'csv';
  };

  // ファイル選択処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    handleFile(selectedFile);
  };

  // 国際電話番号かどうかを判断する関数
  const isInternationalPhoneNumber = (phoneNumber: string): boolean => {
    // 国際電話番号のパターン: +から始まる、または国コードと思われる数字から始まる
    const internationalPattern = /^\+|^00|^81[0-9]/;
    return internationalPattern.test(phoneNumber);
  };

  // ファイル処理（共通部分）
  const handleFile = (selectedFile: File) => {
    if (isConfirmMode) {
      setIsConfirmMode(false);
    }
    
    // ファイル拡張子からフォーマットを自動検出
    const detectedFormat = detectFileFormat(selectedFile.name);
    setFileFormat(detectedFormat);
    
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxFileSize) {
      toast.error('ファイルサイズは50MB以内である必要があります');
      resetFileUpload();
      return;
    }
    
    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);
    
    // アップロード進捗シミュレーション
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 20;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);
    
    // ファイル形式に応じた処理
    if (detectedFormat === 'excel') {
      parseExcelFile(selectedFile, progressInterval);
    } else {
      parseCsvFile(selectedFile, progressInterval);
    }
  };

  // CSV形式のパース処理
  const parseCsvFile = (file: File, progressInterval: number) => {
    const config = {
      header: true,
      skipEmptyLines: true,
      encoding: fileEncoding,
      complete: (results: Papa.ParseResult<FileRow>) => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setIsUploading(false);
        processFileData(results.data, file.name);
      },
      error: (error: any) => {
        clearInterval(progressInterval);
        setIsUploading(false);
        toast.error('ファイルの解析に失敗しました');
        console.error(error);
        resetFileUpload();
      }
    };
    
    Papa.parse(file, config);
  };

  // Excel形式のパース処理
  const parseExcelFile = (file: File, progressInterval: number) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // 最初のシートを取得
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // シートからJSONデータに変換
        const jsonData = XLSX.utils.sheet_to_json<FileRow>(worksheet, { 
          header: 'A',
          blankrows: false
        });
        
        // CSVと同じ形式に変換（キーをA、B、CからCSVの列名に変換）
        const processedData = jsonData.map(row => {
          const newRow: FileRow = {};
          
          // 最初の行のA列をtelに変換
          if ('A' in row) newRow['tel'] = row['A'];
          
          // B-E列をinfo1-info4に変換
          if ('B' in row) newRow['info1'] = row['B'];
          if ('C' in row) newRow['info2'] = row['C'];
          if ('D' in row) newRow['info3'] = row['D'];
          if ('E' in row) newRow['info4'] = row['E'];
          
          // F列をmemoに変換
          if ('F' in row) newRow['memo'] = row['F'];
          
          // H列をtemplateIdに変換
          if ('H' in row) newRow['templateId'] = row['H'];
          
          // J列をmessageに変換
          if ('J' in row) newRow['message'] = row['J'];
          
          // K列をoriginal_urlに変換
          if ('K' in row) newRow['original_url'] = row['K'];
          
          // Q列をsend_datetimeに変換
          if ('Q' in row) newRow['send_datetime'] = row['Q'];
          
          // BZ列をskipに変換
          if ('BZ' in row) newRow['skip'] = row['BZ'];
          
          return newRow;
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        setIsUploading(false);
        
        processFileData(processedData, file.name);
      } catch (error) {
        clearInterval(progressInterval);
        setIsUploading(false);
        toast.error('Excelファイルの解析に失敗しました');
        console.error(error);
        resetFileUpload();
      }
    };
    
    reader.onerror = () => {
      clearInterval(progressInterval);
      setIsUploading(false);
      toast.error('ファイルの読み込みに失敗しました');
      resetFileUpload();
    };
    
    reader.readAsBinaryString(file);
  };

  // ファイルデータの処理（共通部分）
  const processFileData = (data: FileRow[], fileName: string) => {
    // 最初の行のデータを確認
    const firstRow = data[0];
    
    if (!firstRow) {
      toast.error('ファイルにデータが含まれていません');
      resetFileUpload();
      return;
    }
    
    // 最大レコード数チェック
    if (data.length > 500000) {
      toast.error('ファイルに含まれるレコード数が多すぎます（最大50万レコード）');
      resetFileUpload();
      return;
    }
    
    // 必須項目（電話番号）のチェック
    if (!('tel' in firstRow) && !('A' in firstRow)) {
      toast.error('ファイル形式が正しくありません。宛先電話番号の列が必要です（A列または「tel」列）');
      resetFileUpload();
      return;
    }
    
    // 国際電話番号の有無をチェック
    let foundInternational = false;
    if (canUseInternational) {
      // 各行の電話番号を確認
      for (const row of data) {
        const phoneNumber = row.tel || row.A || '';
        if (isInternationalPhoneNumber(phoneNumber)) {
          foundInternational = true;
          break;
        }
      }
    }
    setHasInternationalNumbers(foundInternational);
    
    setParsedData(data);
    
    // プレビュー用のテンプレート生成
    if (firstRow) {
      if ('message' in firstRow) {
        setPreviewTemplate(firstRow.message);
      } else if ('J' in firstRow) {
        setPreviewTemplate(firstRow.J);
      }
    }
    
    // 短縮元URLがファイルにある場合
    if (firstRow) {
      if ('original_url' in firstRow && firstRow.original_url) {
        setOriginalUrl(firstRow.original_url);
      } else if ('K' in firstRow && firstRow.K) {
        setOriginalUrl(firstRow.K);
      }
    }
    
    toast.success(`${data.length}件のデータを読み込みました${foundInternational ? '（国際電話番号を含む）' : ''}`);
  };

  // ファイルアップロードのリセット
  const resetFileUpload = () => {
    setFile(null);
    setParsedData([]);
    setPreviewTemplate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setHasInternationalNumbers(false);
  };

  // 確認モードに移行
  const handleConfirm = () => {
    if (!validateForm()) return;
    setIsConfirmMode(true);
  };
  
  // フォーム検証
  const validateForm = () => {
    if (!file || parsedData.length === 0) {
      toast.error('送信するファイルを選択してください');
      return false;
    }
    
    if (isTestMode && !testRecipient) {
      toast.error('テスト送信用携帯番号を入力してください');
      return false;
    }
    
    // URLタグパターンを検出
    const urlTagPattern = /{URL\d*}/;
    
    // 本文に{URL}タグがあるのに短縮元URLが設定されていない場合（ファイルの場合は各行に設定されているかチェック）
    if (urlTagPattern.test(previewTemplate) && !originalUrl) {
      // 各行にoriginal_url列があるか確認
      const hasUrlInFile = parsedData.some(row => 
        ('original_url' in row && row.original_url) || 
        ('K' in row && row.K)
      );
      if (!hasUrlInFile) {
        toast.error('本文にURLタグがありますが、短縮元URLが設定されていません');
        return false;
      }
    }
    
    // 文字数チェック
    if (characterCount > characterLimit) {
      toast.error(`文字数制限(${characterLimit}文字)を超えています`);
      return false;
    }
    
    // 国際電話番号の権限チェック
    if (hasInternationalNumbers && !canUseInternational) {
      toast.error('このファイルには国際電話番号が含まれていますが、海外送信権限がありません');
      return false;
    }
    
    return true;
  };

  // 編集モードに戻る
  const handleBackToEdit = () => {
    setIsConfirmMode(false);
  };

  // 電話番号入力ハンドラ
  const handlePhoneNumberChange = (value: string, international: boolean, country?: string) => {
    setTestRecipient(value);
    setIsInternational(international);
    setCountryCode(country);
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfirmMode) {
      handleConfirm();
      return;
    }
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      if (isTestMode) {
        // テスト送信処理
        await sendTestMessage({
          recipient: testRecipient,
          content: previewTemplate,
          sender: senderNumber,
          originalUrl: originalUrl,
          isInternational,
          countryCode
        });
        
        toast.success(`テスト送信を完了しました`);
      } else {
        // 実際のアプリではAPIへの送信を行う
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success(`${parsedData.length}件のSMS送信を開始しました${hasInternationalNumbers ? '（国際電話番号を含む）' : ''}`);
      }
      
      // フォームリセット
      resetForm();
    } catch (error) {
      toast.error('送信に失敗しました');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // フォームリセット
  const resetForm = () => {
    resetFileUpload();
    setIsScheduled(false);
    setScheduledDate('');
    setScheduledTime('');
    setOriginalUrl('');
    setIsConfirmMode(false);
    setTestRecipient('');
    setIsTestMode(false);
    setIsInternational(false);
    setCountryCode(undefined);
    setHasInternationalNumbers(false);
    setUrlTagIndex(1);
  };

  // 送信元番号変更ハンドラ
  const handleSenderNumberChange = (number: string) => {
    setSenderNumber(number);
  };
  
  // 短縮元URL更新ハンドラ
  const handleOriginalUrlUpdate = (url: string) => {
    setOriginalUrl(url);
  };
  
  // タグ挿入ハンドラ
  const handleInsertTag = (tag: string) => {
    toast.info(`ファイルの本文（message列またはJ列）に${tag}タグを含めてください`);
    
    // URLタグを挿入した後、次のタグインデックスを更新
    if (tag.startsWith('{URL')) {
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

  // ファイルフォーマット変更ハンドラ
  const handleFileFormatChange = (format: FileFormat) => {
    setFileFormat(format);
    resetFileUpload();
  };

  // エンコーディング変更ハンドラ
  const handleEncodingChange = (encoding: FileEncoding) => {
    setFileEncoding(encoding);
    
    // ファイルが既にアップロードされている場合は再解析
    if (file) {
      handleFile(file);
    }
  };

  // アニメーション定義
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

  // サンプルExcelダウンロードハンドラ
  const handleDownloadSample = () => {
    // サンプルデータ
    const sampleData = [
      { tel: '09012345678', info1: 'サンプル名前', message: 'こんにちは{info1}様、サンプルメッセージです。' },
      { tel: '08011112222', info1: 'テスト太郎', message: 'こんにちは{info1}様、サンプルメッセージです。' }
    ];
    
    // ワークブック生成
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // ワークシート追加
    XLSX.utils.book_append_sheet(wb, ws, 'サンプルデータ');
    
    // ダウンロード
    XLSX.writeFile(wb, 'sms_sample_data.xlsx');
  };

  return (
    <motion.div 
      className="card"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="mb-5">
        <h2 className="text-lg font-medium text-grey-900">一斉送信</h2>
        <p className="mt-1 text-sm text-grey-500">
          CSVファイルまたはExcelファイルをアップロードして複数の宛先にSMSを一斉送信します。
          {canUseInternational && <span className="ml-1 text-primary-600">国際電話番号への送信も可能です。</span>}
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
                  disabled={isConfirmMode}
                />
                <span className="ml-2 text-sm font-medium text-grey-700">テスト送信モード</span>
              </label>
              <div className="ml-4 text-sm text-grey-500">
                {isTestMode ? 'ファイル内の宛先ではなく、テスト用携帯番号にのみ送信します' : '通常の送信モードです'}
              </div>
            </div>
          </motion.div>

          {isTestMode && (
            <motion.div variants={item}>
              <label htmlFor="test-recipient" className="form-label flex items-center">
                テスト送信用携帯番号 <span className="text-error-500 ml-1">*</span>
              </label>
              <div className="mt-1">
                {canUseInternational ? (
                  <PhoneNumberInput
                    value={testRecipient}
                    onChange={handlePhoneNumberChange}
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
            <p className="mt-1 text-xs text-grey-500">
              ファイルでURLを指定する場合、11列目(K列、名前: original_url)に設定してください。
              この欄に入力されたURLはテンプレートに設定された短縮元URLよりも優先されます。
            </p>
          </motion.div>

          <motion.div variants={item}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="inline-flex items-center text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLongSMSEnabled}
                  onChange={() => setIsLongSMSEnabled(!isLongSMSEnabled)}
                  className="form-checkbox mr-2 h-4 w-4"
                  disabled={isConfirmMode}
                />
                長文SMS
              </label>
              <span className="text-xs text-grey-500">
                {isLongSMSEnabled ? (
                  <>docomo: 660文字、au/SoftBank/Rakuten: 670文字</>
                ) : (
                  <>通常SMS: 70文字まで</>
                )}
              </span>
            </div>
          </motion.div>

          {!isConfirmMode && (
            <>
              <motion.div variants={item}>
                <div className="mb-4">
                  <label className="form-label">文字コードを選択</label>
                  <div className="mt-1 flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="encoding"
                        checked={fileEncoding === 'shift-jis'}
                        onChange={() => handleEncodingChange('shift-jis')}
                        disabled={isConfirmMode}
                      />
                      <span className="ml-2 text-sm text-grey-700">Shift-JIS (Windows推奨)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="encoding"
                        checked={fileEncoding === 'utf-8'}
                        onChange={() => handleEncodingChange('utf-8')}
                        disabled={isConfirmMode}
                      />
                      <span className="ml-2 text-sm text-grey-700">UTF-8</span>
                    </label>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <div className="mb-4">
                  <label className="form-label mb-2">ファイル形式</label>
                  <div className="flex space-x-4 border border-grey-200 rounded-md p-3 bg-grey-50">
                    <button
                      type="button"
                      onClick={() => handleFileFormatChange('csv')}
                      className={`flex items-center px-4 py-2 rounded ${
                        fileFormat === 'csv' 
                          ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                          : 'bg-white border border-grey-300 text-grey-700 hover:bg-grey-100'
                      }`}
                      disabled={isConfirmMode}
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      CSVファイル
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileFormatChange('excel')}
                      className={`flex items-center px-4 py-2 rounded ${
                        fileFormat === 'excel' 
                          ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                          : 'bg-white border border-grey-300 text-grey-700 hover:bg-grey-100'
                      }`}
                      disabled={isConfirmMode}
                    >
                      <FileSpreadsheet className="h-5 w-5 mr-2" />
                      Excelファイル
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="flex items-center px-3 py-2 text-sm text-grey-700 bg-white border border-grey-300 rounded hover:bg-grey-100"
                      title="サンプルファイルをダウンロード"
                      disabled={isConfirmMode}
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      サンプル
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-grey-500">
                    {fileFormat === 'csv' 
                      ? 'CSVファイル形式: エクセルなどで作成し、CSV(カンマ区切り)で保存してください。' 
                      : 'Excel形式: .xlsx または .xls 形式のファイルに対応しています。'}
                  </p>
                </div>
              </motion.div>

              <motion.div variants={item}>
                <label className="form-label">ファイルアップロード</label>
                <div className="mt-1" ref={dropZoneRef}>
                  <div 
                    className={`border-2 border-dashed rounded-md px-6 pt-5 pb-6 transition-all duration-200 ${
                      showDropZone 
                        ? 'border-primary-400 bg-primary-50' 
                        : file 
                          ? 'border-primary-400 bg-primary-50' 
                          : 'border-grey-300 hover:border-grey-400'
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      {fileFormat === 'csv' 
                        ? <FileText className={`mx-auto h-12 w-12 ${file ? 'text-primary-500' : 'text-grey-400'}`} />
                        : <FileSpreadsheet className={`mx-auto h-12 w-12 ${file ? 'text-primary-500' : 'text-grey-400'}`} />
                      }
                      <div className="flex text-sm text-grey-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                        >
                          <span>{fileFormat === 'csv' ? 'CSVファイル' : 'Excelファイル'}を選択</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept={fileFormat === 'csv' ? '.csv' : '.xlsx,.xls'}
                            className="sr-only"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            disabled={isUploading || isProcessing || isConfirmMode}
                          />
                        </label>
                        <p className="pl-1">またはここにドラッグ&ドロップ</p>
                      </div>
                      <p className="text-xs text-grey-500">
                        {file ? file.name : `${fileFormat === 'csv' ? '.csv' : '.xlsx/.xls'} 形式のファイルをアップロードしてください`}
                      </p>
                      <p className="text-xs text-grey-500 mt-1">
                        最大ファイルサイズ: 50MB、最大レコード数: 50万件
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {isUploading && (
            <motion.div 
              variants={item}
              className="relative pt-1"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-xs font-medium text-primary-600">アップロード中</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-primary-600">{Math.round(uploadProgress)}%</span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-100">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
                ></div>
              </div>
            </motion.div>
          )}

          {parsedData.length > 0 && !isConfirmMode && (
            <motion.div variants={item} className="border rounded-md overflow-hidden">
              <div className="bg-primary-50 px-4 py-3 border-b border-primary-200 flex items-center">
                <FileCheck className="h-5 w-5 text-primary-500 mr-2" />
                <div>
                  <span className="font-medium text-primary-900">
                    {fileFormat === 'csv' ? 'CSVファイル' : 'Excelファイル'}の解析結果
                  </span>
                  <p className="text-sm text-primary-700 mt-1">
                    合計 {parsedData.length} 件のデータが読み込まれました
                    {hasInternationalNumbers && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <Globe className="h-3 w-3 mr-1" />
                        国際電話番号を含む
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-grey-500 mr-2" />
                    <span className="font-medium text-grey-700">データサンプル（先頭3件）</span>
                  </div>
                  
                  <div className="mt-2 border rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-grey-200">
                      <thead className="bg-grey-50">
                        <tr>
                          {Object.keys(parsedData[0]).map((header) => (
                            <th 
                              key={header}
                              className="px-4 py-2 text-left text-xs font-medium text-grey-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-grey-200">
                        {parsedData.slice(0, 3).map((row, index) => (
                          <tr key={index}>
                            {Object.entries(row).map(([key, value], valueIndex) => (
                              <td 
                                key={`${index}-${key}`}
                                className="px-4 py-2 text-sm text-grey-900 max-w-xs truncate"
                              >
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {previewTemplate && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-grey-500 mr-2" />
                        <span className="font-medium text-grey-700">メッセージテンプレートプレビュー</span>
                      </div>
                      <div className="text-sm text-grey-600">
                        <span className={characterCount > characterLimit ? 'text-error-600' : ''}>
                          {characterCount} / {characterLimit}文字
                        </span>
                        {messageCount > 1 && (
                          <span className="ml-2 px-2 py-0.5 bg-grey-100 rounded-full text-xs">
                            {messageCount}通分
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 border rounded-md bg-grey-50">
                      <p className="text-sm text-grey-800 whitespace-pre-wrap">
                        {previewTemplate
                          .replace(/{info\d+}/g, '【ダミーデータ】')
                          .replace(/{URL\d*}/g, originalUrl ? 'https://sms.l/abc123' : '{URL}')}
                      </p>
                    </div>
                    {characterCount > characterLimit && (
                      <p className="mt-1 text-sm text-error-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        文字数制限を超えています。送信できません。
                      </p>
                    )}
                  </div>
                )}
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
                    <p className="text-sm font-medium text-grey-500">ファイル名</p>
                    <p className="text-sm text-grey-900">
                      {file?.name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-grey-500">データ件数</p>
                    <p className="text-sm text-grey-900 flex items-center">
                      {parsedData.length}件
                      {hasInternationalNumbers && canUseInternational && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          <Globe className="h-3 w-3 mr-1" />
                          国際電話番号を含む
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-grey-500">送信元</p>
                    <p className="text-sm text-grey-900">{senderNumber}</p>
                  </div>
                  
                  {isTestMode && (
                    <div>
                      <p className="text-sm font-medium text-grey-500">テスト送信先</p>
                      <p className="text-sm text-grey-900 flex items-center">
                        {isInternational && (
                          <span className="mr-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            <Globe className="h-3 w-3 mr-1" />
                            国際
                          </span>
                        )}
                        {testRecipient}
                      </p>
                    </div>
                  )}
                </div>
                
                {previewTemplate && (
                  <div>
                    <p className="text-sm font-medium text-grey-500">メッセージプレビュー</p>
                    <p className="text-sm text-grey-900 whitespace-pre-wrap p-3 bg-white rounded border border-grey-200">
                      {previewTemplate
                        .replace(/{info\d+}/g, '【ダミーデータ】')
                        .replace(/{URL\d*}/g, originalUrl ? 'https://sms.l/abc123' : '{URL}')}
                    </p>
                  </div>
                )}
                
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

          {!isConfirmMode && (
            <motion.div variants={item}>
              <div className="flex items-center">
                <input
                  id="schedule"
                  name="schedule"
                  type="checkbox"
                  checked={isScheduled}
                  onChange={() => setIsScheduled(!isScheduled)}
                  className="form-checkbox"
                  disabled={isConfirmMode}
                />
                <label htmlFor="schedule" className="ml-2 block text-sm text-grey-700">
                  送信を予約する
                </label>
              </div>
            </motion.div>
          )}

          {isScheduled && !isConfirmMode && (
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1">
                <label htmlFor="bulk-scheduled-date" className="form-label">
                  予約日
                </label>
                <input
                  type="date"
                  id="bulk-scheduled-date"
                  className="form-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  disabled={isConfirmMode}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="bulk-scheduled-time" className="form-label">
                  予約時間
                </label>
                <input
                  type="time"
                  id="bulk-scheduled-time"
                  className="form-input"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  disabled={isConfirmMode}
                />
              </div>
            </motion.div>
          )}

          <motion.div variants={item} className="pt-4">
            {isConfirmMode ? (
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBackToEdit}
                  className="btn-secondary flex-1"
                >
                  編集に戻る
                </button>
                
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary flex-1"
                >
                  {isProcessing ? (
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
                      {isTestMode ? 'テスト送信' : 'スタート'}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isProcessing || !file || parsedData.length === 0 || (previewTemplate && characterCount > characterLimit) || (isTestMode && !testRecipient) || (hasInternationalNumbers && !canUseInternational)}
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

export default BulkSendForm;