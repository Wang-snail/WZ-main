import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getCurrentLanguage, setLanguage } from '../utils/languageUtils';

interface LanguageSwitcherProps {
  onLanguageChange?: (langCode: string) => void;
}

export default function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  useEffect(() => {
    // 检测浏览器语言并自动设置
    const browserLang = navigator.language.toLowerCase();
    let detectedLang = 'en'; // 默认语言
    
    // 根据浏览器语言映射到支持的语言
    if (browserLang.includes('zh')) {
      detectedLang = 'zh';
    } else if (browserLang.includes('ja')) {
      detectedLang = 'ja';
    } else if (browserLang.includes('ko')) {
      detectedLang = 'ko';
    } else if (browserLang.includes('es')) {
      detectedLang = 'es';
    } else if (browserLang.includes('de')) {
      detectedLang = 'de';
    } else if (browserLang.includes('fr')) {
      detectedLang = 'fr';
    } else if (browserLang.includes('it')) {
      detectedLang = 'it';
    } else if (browserLang.includes('ru')) {
      detectedLang = 'ru';
    }
    
    // 如果检测到的语言在支持列表中且与当前语言不同，则设置
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === detectedLang) && detectedLang !== currentLang) {
      handleLanguageChange(detectedLang);
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setCurrentLang(langCode);
    if (onLanguageChange) {
      onLanguageChange(langCode);
    }
    // 重新加载页面以应用语言更改
    window.location.reload();
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-5 h-5 text-gray-500" />
      <select 
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}