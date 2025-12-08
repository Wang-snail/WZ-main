import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { extractLanguageFromPath } from '@/config/i18n';

// 导入翻译文件
import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import pt from './locales/pt.json';

// 语言资源配置
const resources = {
  zh: { translation: zh },
  en: { translation: en },
  ja: { translation: ja },
  ko: { translation: ko },
  es: { translation: es },
  fr: { translation: fr },
  ru: { translation: ru },
  pt: { translation: pt },
};

// 从URL路径获取语言代码
export function getLanguageFromPath(pathname: string): string {
  const { language } = extractLanguageFromPath(pathname);
  return language.i18nCode;
}

// 初始化i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguageFromPath(window.location.pathname), // 从URL获取初始语言
    fallbackLng: 'zh', // 回退语言为中文
    interpolation: {
      escapeValue: false, // React已经处理了XSS
    },
    react: {
      useSuspense: false, // 禁用Suspense以避免闪烁
    },
  });

export default i18n;
