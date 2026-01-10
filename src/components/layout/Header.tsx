import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Menu, X, MessageCircle, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { extractLanguageFromPath, buildLocalizedUrl } from '@/config/i18n';
import SimplifiedLanguageSwitcher from '../SimplifiedLanguageSwitcher';

// 需要完全隐藏导航栏的路径（全屏页面）
const HIDDEN_PATHS = ['/lab', '/experiment', '/tools/fba-calculator', '/processes', '/test-ui'];

const HEADER_HEIGHT = 56; // h-14 = 56px

export default function Header() {
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 80;

  const { language: currentLanguage, cleanPath } = extractLanguageFromPath(location.pathname);
  const localizedLink = (path: string) => buildLocalizedUrl(path, currentLanguage.code);

  // 检查是否应该完全隐藏导航栏（全屏页面）
  const shouldHideCompletely = useCallback(() => {
    return HIDDEN_PATHS.some(path => cleanPath.startsWith(path));
  }, [cleanPath]);

  // 滚动监听
  useEffect(() => {
    if (shouldHideCompletely()) {
      setIsVisible(false);
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const lastY = lastScrollY.current;

        // 向下滚动超过阈值隐藏，向上滚动显示
        if (currentScrollY > scrollThreshold) {
          if (currentScrollY > lastY && isVisible) {
            // 向下滚动 - 隐藏
            setIsVisible(false);
          } else if (currentScrollY < lastY && !isVisible) {
            // 向上滚动 - 显示
            setIsVisible(true);
          }
        } else if (!isVisible) {
          // 在顶部，必须显示
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldHideCompletely, isVisible]);

  // 导航项
  const navigation = [
    { name: t('nav.tools'), href: localizedLink('/tools'), current: cleanPath.startsWith('/tools') },
    { name: t('nav.workflows'), href: localizedLink('/community'), current: cleanPath.startsWith('/community') || cleanPath.startsWith('/workflows') || cleanPath.startsWith('/forum') || cleanPath.startsWith('/discussion') },
    { name: '工作流', href: '/flow', current: cleanPath.startsWith('/flow'), external: true },
    { name: t('nav.sync'), href: localizedLink('/sync'), current: cleanPath.startsWith('/sync') },
  ];

  // 全屏页面直接返回 null
  if (shouldHideCompletely()) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.header
          initial={{ y: -HEADER_HEIGHT }}
          animate={{ y: 0 }}
          exit={{ y: -HEADER_HEIGHT }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b"
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-full">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="relative">
                  <Bot className="w-6 h-6 text-blue-600" />
                  <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WSNAIL.COM
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center">
                {navigation.map((item, index) => (
                  <React.Fragment key={item.name}>
                    {index > 0 && <div className="w-px h-5 bg-gray-200 mx-1" />}
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          item.current
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {item.name}
                      </a>
                    ) : (
                      <Link
                        to={item.href}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          item.current
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </nav>

              {/* Right side: Contact, Language, Bell */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 h-8 px-2"
                  onClick={() => window.location.href = '/email-contact'}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {t('nav.contact')}
                </Button>
                <div className="w-px h-5 bg-gray-200 mx-1" />
                <SimplifiedLanguageSwitcher />
                <Link
                  to="/sync"
                  className="relative p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors ml-1"
                  title="系统通知"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </Link>
              </div>

              {/* Mobile menu */}
              <div className="md:hidden flex items-center gap-1">
                <Link
                  to="/sync"
                  className="relative p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="系统通知"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </Link>
                <SimplifiedLanguageSwitcher />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden absolute left-0 right-0 bg-white border-t border-gray-100 shadow-lg"
                >
                  <div className="py-3 px-4 space-y-1">
                    {navigation.map((item) => (
                      item.external ? (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            item.current
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {item.name}
                        </a>
                      ) : (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            item.current
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {item.name}
                        </Link>
                      )
                    ))}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.href = '/email-contact';
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t('nav.contact')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
