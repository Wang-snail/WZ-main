import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLanguageFromPath } from '@/i18n';

/**
 * 语言同步组件
 * 监听URL变化，自动同步i18n语言设置
 */
export default function LanguageSynchronizer() {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const languageCode = getLanguageFromPath(location.pathname);

    // 如果当前语言与URL语言不匹配，则切换语言
    if (i18n.language !== languageCode) {
      i18n.changeLanguage(languageCode);
    }
  }, [location.pathname, i18n]);

  return null; // 这是一个逻辑组件，不渲染任何UI
}
