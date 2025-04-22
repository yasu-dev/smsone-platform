import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import useSenderNumberStore from '../../store/senderNumberStore';

interface SenderNumberSelectProps {
  onChange: (senderNumber: string) => void;
  initialSenderNumber?: string;
  disabled?: boolean;
}

const SenderNumberSelect: React.FC<SenderNumberSelectProps> = ({
  onChange,
  initialSenderNumber,
  disabled = false
}) => {
  const { 
    fetchSenderNumbers, 
    getAvailableSenderNumbers,
    isLoading 
  } = useSenderNumberStore();
  
  const [senderNumber, setSenderNumber] = useState<string>(initialSenderNumber || '');
  
  // 初期データの読み込み
  useEffect(() => {
    fetchSenderNumbers();
  }, [fetchSenderNumbers]);
  
  // 初期値設定
  useEffect(() => {
    if (!initialSenderNumber && !senderNumber) {
      const availableNumbers = getAvailableSenderNumbers();
      if (availableNumbers.length > 0) {
        const defaultNumber = availableNumbers[0].number;
        setSenderNumber(defaultNumber);
        onChange(defaultNumber);
      }
    }
  }, [getAvailableSenderNumbers, initialSenderNumber, senderNumber, onChange]);
  
  // 利用可能な送信元番号一覧
  const availableSenderNumbers = getAvailableSenderNumbers();
  
  // 送信元番号選択変更ハンドラ
  const handleSenderNumberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSenderNumber(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor="sender-number" className="form-label">
          送信元電話番号
        </label>
        
        <select
          id="sender-number"
          className="form-select"
          value={senderNumber}
          onChange={handleSenderNumberChange}
          disabled={disabled || isLoading || availableSenderNumbers.length === 0}
        >
          {availableSenderNumbers.length === 0 ? (
            <option value="">利用可能な送信元番号がありません</option>
          ) : (
            availableSenderNumbers.map((sn) => (
              <option key={sn.id} value={sn.number}>
                {sn.number}
              </option>
            ))
          )}
        </select>
        
        <div className="mt-2 text-sm text-grey-600 flex items-start">
          <Info className="h-4 w-4 text-grey-400 mr-1 flex-shrink-0 mt-0.5" />
          <p>ドコモ、au、楽天モバイル宛ての送信元電話番号です。ソフトバンク宛ての送信時は、送信元番号は「21061」で固定されます。</p>
        </div>
      </div>
    </div>
  );
};

export default SenderNumberSelect;