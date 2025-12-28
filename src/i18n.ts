import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 翻译资源 - GEO本地化支持
const resources = {
  zh: {
    translation: {
      nav: {
        home: '首页',
        tools: '工具',
        community: '讨论',
        wiki: '行业信息',
        sync: '同步',
        contact: '联系我们'
      },
      home: {
        title: '跨境智能平台',
        subtitle: '让跨境电商决策更智能',
        description: 'AI驱动的跨境电商全链路解决方案'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        tools: 'Tools',
        community: 'Community',
        wiki: 'Industry Info',
        sync: 'Sync',
        contact: 'Contact'
      },
      home: {
        title: 'Cross-Border Intelligence Platform',
        subtitle: 'Smarter Decisions for Cross-Border E-commerce',
        description: 'AI-driven cross-border e-commerce solution'
      }
    }
  },
  ja: {
    translation: {
      nav: {
        home: 'ホーム',
        tools: 'ツール',
        community: 'コミュニティ',
        wiki: '業界情報',
        sync: '同期',
        contact: 'お問い合わせ'
      },
      home: {
        title: '越境ECインテリジェンスプラットフォーム',
        subtitle: '越境ECの意思決定をよりスマートに',
        description: 'AI駆動の越境ECソリューション'
      }
    }
  },
  ko: {
    translation: {
      nav: {
        home: '홈',
        tools: '도구',
        community: '커뮤니티',
        wiki: '업계 정보',
        sync: '동기화',
        contact: '연락처'
      },
      home: {
        title: '跨境 전자상거래 인텔리전스 플랫폼',
        subtitle: '跨境 전자상거래 의사결정을 더 똑똑하게',
        description: 'AI 기반跨境 전자상거래 솔루션'
      }
    }
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        tools: 'Herramientas',
        community: 'Comunidad',
        wiki: 'Información',
        sync: 'Sincronizar',
        contact: 'Contacto'
      },
      home: {
        title: 'Plataforma de Inteligencia de Comercio Transfronterizo',
        subtitle: 'Decisiones más inteligentes para el comercio transfronterizo',
        description: 'Solución de comercio transfronterizo impulsada por IA'
      }
    }
  },
  fr: {
    translation: {
      nav: {
        home: 'Accueil',
        tools: 'Outils',
        community: 'Communauté',
        wiki: 'Informations',
        sync: 'Synchroniser',
        contact: 'Contact'
      },
      home: {
        title: 'Plateforme de Commerce Transfrontalier',
        subtitle: 'Des décisions plus intelligentes pour le commerce transfrontalier',
        description: 'Solution de commerce transfrontalier alimentée par l\'IA'
      }
    }
  },
  ru: {
    translation: {
      nav: {
        home: 'Главная',
        tools: 'Инструменты',
        community: 'Сообщество',
        wiki: 'Информация',
        sync: 'Синхронизация',
        contact: 'Контакт'
      },
      home: {
        title: 'Платформа Трансграничной Электронной Коммерции',
        subtitle: 'Более умные решения для трансграничной электронной коммерции',
        description: 'Решение для трансграничной электронной коммерции на базе ИИ'
      }
    }
  },
  pt: {
    translation: {
      nav: {
        home: 'Início',
        tools: 'Ferramentas',
        community: 'Comunidade',
        wiki: 'Informações',
        sync: 'Sincronizar',
        contact: 'Contato'
      },
      home: {
        title: 'Plataforma de Inteligência de Comércio Transfronteiriço',
        subtitle: 'Decisões mais inteligentes para comércio transfronteiriço',
        description: 'Solução de comércio transfronteiriço impulsada por IA'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // 默认语言
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false
    }
  });

/**
 * 从路径中提取语言代码
 */
export function getLanguageFromPath(pathname: string): string {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  // 支持的语言列表
  const supportedLanguages = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'ru', 'pt'];
  
  // 如果第一个路径段是支持的语言，返回该语言
  if (supportedLanguages.includes(firstSegment)) {
    return firstSegment;
  }
  
  // 默认返回中文
  return 'zh';
}

export default i18n;