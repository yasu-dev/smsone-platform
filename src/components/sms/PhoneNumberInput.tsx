import React, { useState, useEffect, useRef } from 'react';
import { Globe, Phone, ChevronDown, Search, X } from 'lucide-react';
import { countries, popularCountries } from '../../data/countries';
import { Country } from '../../types';
import useAuthStore from '../../store/authStore';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string, isInternational: boolean, countryCode?: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  allowInternational?: boolean;
  initialCountryCode?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  placeholder = '例: 09012345678',
  required = false,
  disabled = false,
  className = '',
  allowInternational,
  initialCountryCode = 'JP'
}) => {
  const { hasPermission } = useAuthStore();
  const canUseInternational = allowInternational !== undefined ? allowInternational : hasPermission('internationalSms');

  const [inputValue, setInputValue] = useState(value);
  const [isInternational, setIsInternational] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countries);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 初期選択国を設定
  useEffect(() => {
    const japanCountry = countries.find(c => c.code === 'JP') || countries[0];
    const initialCountry = initialCountryCode ? 
      countries.find(c => c.code === initialCountryCode) || japanCountry : 
      japanCountry;
    setSelectedCountry(initialCountry);
  }, [initialCountryCode]);
  
  // 入力値の変更を追跡
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);
  
  // 検索結果をフィルタリング
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCountries(countries);
      return;
    }
    
    const filtered = countries.filter(country => 
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredCountries(filtered);
  }, [searchTerm]);
  
  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 入力値の変更ハンドラ
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const formattedValue = isInternational && selectedCountry 
      ? `${selectedCountry.dialCode} ${newValue}`.trim()
      : newValue;
    
    onChange(formattedValue, isInternational, selectedCountry?.code);
  };
  
  // 国際電話モード切り替え
  const toggleInternational = () => {
    if (!canUseInternational) return;
    
    const newIsInternational = !isInternational;
    setIsInternational(newIsInternational);
    
    // 入力フィールドの値を更新
    if (newIsInternational && selectedCountry) {
      onChange(`${selectedCountry.dialCode} ${inputValue}`.trim(), newIsInternational, selectedCountry.code);
    } else {
      onChange(inputValue, newIsInternational);
    }
    
    // フォーカスを入力フィールドに戻す
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };
  
  // 国選択
  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
    setSearchTerm('');
    
    if (isInternational) {
      onChange(`${country.dialCode} ${inputValue}`.trim(), true, country.code);
    }
  };
  
  // 入力が国内番号かどうかを判定
  const isDomesticNumber = (value: string) => {
    // 日本の携帯番号パターン (例: 080-1234-5678, 09012345678)
    const japanesePhonePattern = /^0[7-9]0[0-9]{8}$|^0[7-9]0-[0-9]{4}-[0-9]{4}$/;
    return japanesePhonePattern.test(value.replace(/\s/g, ''));
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex">
        {/* 国際電話トグルボタン（権限がある場合のみ表示） */}
        {canUseInternational && (
          <button
            type="button"
            onClick={toggleInternational}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-500 
              hover:text-grey-700 z-10 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            title={isInternational ? '国内電話番号モードに切り替え' : '国際電話番号モードに切り替え'}
          >
            {isInternational ? <Globe className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          </button>
        )}
        
        {/* 国選択ドロップダウン（国際電話モードの場合のみ表示） */}
        {isInternational && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              className={`flex items-center space-x-1 py-2 px-3 border rounded-l-md 
                border-grey-300 bg-grey-50 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={disabled}
            >
              <span className="text-lg">{selectedCountry?.flag}</span>
              <span className="text-sm font-medium">{selectedCountry?.dialCode}</span>
              <ChevronDown className="h-4 w-4 text-grey-500" />
            </button>
            
            {countryDropdownOpen && (
              <div className="absolute left-0 z-50 mt-1 w-64 rounded-md border border-grey-300 bg-white shadow-lg">
                <div className="p-2 border-b border-grey-200">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-grey-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="国名または国番号で検索..."
                      className="pl-8 pr-2 py-1.5 w-full text-sm border border-grey-300 rounded-md"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-grey-400 hover:text-grey-600"
                        onClick={() => setSearchTerm('')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {!searchTerm && (
                  <div className="p-2 border-b border-grey-200">
                    <h3 className="text-xs font-medium text-grey-500 mb-1">よく使う国</h3>
                    <div className="grid grid-cols-2 gap-1">
                      {popularCountries.map((country) => (
                        <button
                          key={country.code}
                          className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-left text-sm 
                            ${selectedCountry?.code === country.code ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-100'}`}
                          onClick={() => selectCountry(country)}
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span className="truncate">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredCountries.length === 0 ? (
                    <p className="p-2 text-sm text-grey-500 text-center">検索結果がありません</p>
                  ) : (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        className={`flex justify-between items-center w-full px-3 py-2 rounded-md text-sm 
                          ${selectedCountry?.code === country.code ? 'bg-primary-50 text-primary-700' : 'hover:bg-grey-100'}`}
                        onClick={() => selectCountry(country)}
                      >
                        <span className="flex items-center space-x-2">
                          <span className="text-lg">{country.flag}</span>
                          <span className="truncate">{country.name}</span>
                        </span>
                        <span className="text-grey-500">{country.dialCode}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 電話番号入力フィールド */}
        <input
          type="tel"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={isInternational ? '電話番号（国番号除く）' : placeholder}
          required={required}
          disabled={disabled}
          className={`form-input ${isInternational ? 'rounded-l-none' : 'pl-10'} ${canUseInternational ? 'pl-10' : ''}`}
        />
      </div>
      
      {/* 国際電話表示 */}
      {isInternational && inputValue && (
        <div className="mt-1 text-xs flex items-center">
          <div className={`inline-flex items-center rounded-full px-2 py-0.5 ${
            isDomesticNumber(inputValue) ? 'bg-warning-100 text-warning-800' : 'bg-primary-100 text-primary-800'
          }`}>
            <Globe className="h-3 w-3 mr-1" />
            {selectedCountry?.name} 
            <span className="mx-1">•</span> 
            {`${selectedCountry?.dialCode} ${inputValue}`}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;