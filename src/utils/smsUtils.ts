/**
 * SMS文字数計算ユーティリティ
 */

/**
 * 長文SMSオプション設定
 */
export interface SMSLengthOptions {
  enableLongSMS: boolean;  // 長文SMSオプション
  carrier?: 'docomo' | 'au' | 'softbank' | 'rakuten';  // キャリア指定
}

/**
 * 文字数制限値の定数
 */
export const SMS_CHARACTER_LIMITS = {
  STANDARD: 70,  // 通常SMS: 70文字
  DOCOMO_LONG: 660,  // ドコモ長文SMS: 660文字
  OTHER_LONG: 670,  // au/SoftBank/楽天 長文SMS: 670文字
  URL_HTTP: 19,  // HTTP短縮URL: 19文字
  URL_HTTPS: 20,  // HTTPS短縮URL: 20文字
  LINE_BREAK: 2,  // 改行コード: 2文字分
};

/**
 * SMSメッセージの文字数を計算する
 * 
 * @param text SMS本文
 * @param options 長文SMSなどのオプション
 * @returns 計算された文字数
 */
export const calculateSMSLength = (text: string, options: SMSLengthOptions = { enableLongSMS: false }): number => {
  if (!text) return 0;
  
  // 改行を2文字としてカウント（元の\nを削除して2文字分追加）
  let processedText = text.replace(/\n/g, '##');
  
  // URLタグを短縮URL文字数に置き換え
  processedText = processedText.replace(/{URL(\d*)}/g, (match, p1) => {
    // HTTPSの場合は20文字、HTTP(または不明)の場合は19文字と仮定
    return '#'.repeat(SMS_CHARACTER_LIMITS.URL_HTTPS);
  });
  
  return processedText.length;
};

/**
 * 指定されたキャリアと長文SMSオプションに基づく文字数制限を返す
 * 
 * @param options 長文SMSなどのオプション
 * @returns 文字数制限値
 */
export const getSMSCharacterLimit = (options: SMSLengthOptions = { enableLongSMS: false }): number => {
  if (!options.enableLongSMS) {
    return SMS_CHARACTER_LIMITS.STANDARD;
  }
  
  // 長文SMSオプションあり
  if (options.carrier === 'docomo') {
    return SMS_CHARACTER_LIMITS.DOCOMO_LONG;
  } else {
    return SMS_CHARACTER_LIMITS.OTHER_LONG;
  }
};

/**
 * SMSメッセージが文字数制限を超えているかチェック
 * 
 * @param text SMS本文
 * @param options 長文SMSなどのオプション
 * @returns 制限を超えている場合はtrue
 */
export const isSMSLengthExceeded = (text: string, options: SMSLengthOptions = { enableLongSMS: false }): boolean => {
  const length = calculateSMSLength(text, options);
  const limit = getSMSCharacterLimit(options);
  return length > limit;
};

/**
 * 通常SMS 1通分に相当する文字数を計算
 * 
 * @param text SMS本文
 * @param options 長文SMSなどのオプション
 * @returns 通常SMS何通分に相当するか
 */
export const calculateSMSMessageCount = (text: string, options: SMSLengthOptions = { enableLongSMS: false }): number => {
  const length = calculateSMSLength(text, options);
  const standardLimit = SMS_CHARACTER_LIMITS.STANDARD;
  
  if (length === 0) return 0;
  
  // 切り上げ計算（70文字なら1通、71文字なら2通）
  return Math.ceil(length / standardLimit);
};

/**
 * テキスト内のURLタグをカウントして次のインデックスを決定する
 * 
 * @param text URLタグを含むテキスト
 * @returns 次に使用すべきURLタグインデックス
 */
export const getNextUrlTagIndex = (text: string): number => {
  if (!text) return 1;
  
  const urlTagRegex = /{URL(\d*)}/g;
  const matches = text.match(urlTagRegex) || [];
  
  if (matches.length === 0) return 1;
  
  const indices = matches.map(match => {
    const indexMatch = match.match(/{URL(\d*)}/);
    return indexMatch && indexMatch[1] ? parseInt(indexMatch[1], 10) : 1;
  });
  
  return Math.max(...indices, 0) + 1;
};

/**
 * 既存のURLタグのインデックスを正規化する（連番になるように）
 * 
 * @param text URLタグを含むテキスト
 * @returns 正規化されたテキスト
 */
export const normalizeUrlTags = (text: string): string => {
  if (!text) return text;
  
  let normalizedText = text;
  let urlTagIndex = 1;
  
  // URLタグを抽出
  const urlTagRegex = /{URL(\d*)}/g;
  const matches = [...text.matchAll(urlTagRegex)];
  
  // URLタグを順番に置き換え
  for (const match of matches) {
    const fullMatch = match[0];
    normalizedText = normalizedText.replace(fullMatch, `{URL${urlTagIndex}}`);
    urlTagIndex++;
  }
  
  return normalizedText;
};