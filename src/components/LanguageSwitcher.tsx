import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_LANGUAGES, extractLanguageFromPath, buildLocalizedUrl } from '@/config/i18n';
import { useTranslation } from 'react-i18next';

/**
 * 语言切换器组件
 * 显示当前语言并允许用户切换到其他支持的语言
 */
export default function LanguageSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前语言
  const { language: currentLanguage, cleanPath } = extractLanguageFromPath(location.pathname);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 切换语言
  const handleLanguageChange = (languageCode: string) => {
    // 构建新的URL
    const newPath = buildLocalizedUrl(cleanPath, languageCode);

    // 切换i18n语言
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    if (language) {
      i18n.changeLanguage(language.i18nCode);
    }

    // 导航到新URL
    navigate(newPath);

    // 关闭下拉菜单
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 语言切换按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
      </button>

      {/* 语言选项下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50"
          >
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                    language.code === currentLanguage.code
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{language.nativeName}</span>
                    <span className="text-xs text-gray-400">{language.name}</span>
                  </div>
                  {language.code === currentLanguage.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}