/**
 * 多语言配置
 * 用于SEO优化的URL结构
 */

export interface LanguageConfig {
  code: string;      // 语言代码 (如: zh, en, jp)
  i18nCode: string;  // i18next语言代码 (如: zh, en, ja, ko)
  name: string;      // 语言名称
  nativeName: string; // 原生语言名称
  locale: string;    // 完整locale (如: zh-CN, en-US)
  urlPrefix?: string; // URL前缀 (默认语言为空)
  isDefault: boolean; // 是否为默认语言
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'zh',
    i18nCode: 'zh',
    name: 'Chinese',
    nativeName: '简体中文',
    locale: 'zh-CN',
    urlPrefix: '', // 默认语言,不需要前缀
    isDefault: true,
  },
  {
    code: 'en',
    i18nCode: 'en',
    name: 'English',
    nativeName: 'English',
    locale: 'en-US',
    urlPrefix: 'en',
    isDefault: false,
  },
  {
    code: 'jp',
    i18nCode: 'ja', // URL是jp,但i18n代码是ja
    name: 'Japanese',
    nativeName: '日本語',
    locale: 'ja-JP',
    urlPrefix: 'jp',
    isDefault: false,
  },
  {
    code: 'kr',
    i18nCode: 'ko', // URL是kr,但i18n代码是ko
    name: 'Korean',
    nativeName: '한국어',
    locale: 'ko-KR',
    urlPrefix: 'kr',
    isDefault: false,
  },
  {
    code: 'es',
    i18nCode: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    locale: 'es-ES',
    urlPrefix: 'es',
    isDefault: false,
  },
];

// 默认语言
export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.find(lang => lang.isDefault)!;

// 获取语言配置
export function getLanguageByCode(code: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

// 获取语言配置通过URL前缀
export function getLanguageByUrlPrefix(prefix: string): LanguageConfig | undefined {
  if (!prefix) return DEFAULT_LANGUAGE;
  return SUPPORTED_LANGUAGES.find(lang => lang.urlPrefix === prefix);
}

// 从URL路径中提取语言代码
export function extractLanguageFromPath(pathname: string): {
  language: LanguageConfig;
  cleanPath: string;
} {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { language: DEFAULT_LANGUAGE, cleanPath: '/' };
  }

  // 检查第一个段是否是语言前缀
  const firstSegment = segments[0];
  const language = getLanguageByUrlPrefix(firstSegment);

  if (language && !language.isDefault) {
    // 移除语言前缀,返回干净的路径
    const cleanPath = '/' + segments.slice(1).join('/');
    return { language, cleanPath: cleanPath || '/' };
  }

  // 没有语言前缀,使用默认语言
  return { language: DEFAULT_LANGUAGE, cleanPath: pathname };
}

// 构建多语言URL
export function buildLocalizedUrl(
  path: string,
  languageCode: string
): string {
  const language = getLanguageByCode(languageCode);
  if (!language) return path;

  // 如果是默认语言,不添加前缀
  if (language.isDefault) return path;

  // 确保路径以 / 开头
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 添加语言前缀
  return `/${language.urlPrefix}${cleanPath}`;
}

// 生成hreflang链接
export function generateHreflangLinks(currentPath: string): Array<{
  lang: string;
  url: string;
}> {
  const baseUrl = 'https://wsnail.com';

  return SUPPORTED_LANGUAGES.map(language => ({
    lang: language.locale,
    url: baseUrl + buildLocalizedUrl(currentPath, language.code),
  }));
}

// 检查是否需要301重定向
// 如果访问的是 /zh/* 格式,应该重定向到 /*
export function shouldRedirectToDefault(pathname: string): string | null {
  if (pathname.startsWith('/zh/') || pathname === '/zh') {
    // 去掉 /zh 前缀
    const redirectPath = pathname.replace(/^\/zh/, '') || '/';
    return redirectPath;
  }
  return null;
}
