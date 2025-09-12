// 多语言支持工具
export const SUPPORTED_LANGUAGES = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

// 语言映射
export const LANGUAGE_MAP: Record<string, string> = {
  'zh': 'zh-CN',
  'en': 'en',
  'ja': 'ja',
  'ko': 'ko',
  'es': 'es',
  'de': 'de',
  'fr': 'fr',
  'it': 'it',
  'ru': 'ru',
};

// 获取当前语言
export const getCurrentLanguage = (): string => {
  // 检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam && SUPPORTED_LANGUAGES.some(lang => lang.code === langParam)) {
    return langParam;
  }
  
  // 检查 localStorage
  const savedLang = localStorage.getItem('preferred_language');
  if (savedLang && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLang)) {
    return savedLang;
  }
  
  // 默认返回中文
  return 'zh';
};

// 设置语言
export const setLanguage = (langCode: string): void => {
  if (SUPPORTED_LANGUAGES.some(lang => lang.code === langCode)) {
    localStorage.setItem('preferred_language', langCode);
    // 更新 URL 参数但不刷新页面
    const url = new URL(window.location.href);
    url.searchParams.set('lang', langCode);
    window.history.replaceState({}, '', url.toString());
  }
};

// 生成多语言URL
export const generateLocalizedURL = (path: string, langCode: string): string => {
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // 根路径特殊处理
  if (normalizedPath === '/') {
    return langCode === 'zh' ? '/' : `/${langCode}`;
  }
  
  // 其他路径添加语言前缀（除了默认语言）
  return langCode === 'zh' ? normalizedPath : `/${langCode}${normalizedPath}`;
};

// 从URL中提取语言
export const extractLanguageFromURL = (url: string): { lang: string, path: string } => {
  const urlObj = new URL(url, window.location.origin);
  const pathname = urlObj.pathname;
  
  // 检查是否以支持的语言开头
  for (const lang of SUPPORTED_LANGUAGES) {
    if (pathname.startsWith(`/${lang.code}/`)) {
      return {
        lang: lang.code,
        path: pathname.substring(lang.code.length + 1) || '/'
      };
    }
    if (pathname === `/${lang.code}`) {
      return {
        lang: lang.code,
        path: '/'
      };
    }
  }
  
  // 默认返回中文
  return {
    lang: 'zh',
    path: pathname
  };
};