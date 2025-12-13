import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Menu, X, MessageCircle, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { extractLanguageFromPath, buildLocalizedUrl } from '@/config/i18n';
import SimplifiedLanguageSwitcher from '../SimplifiedLanguageSwitcher';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    const controlNavbar = () => {
      // 获取当前滚动的距离
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 如果当前滚动距离 > 上次滚动距离（说明在往下滚）
        // 并且滚动超过了 100px (避免刚开始就乱跳)
        setIsVisible(false); // 隐藏
      } else {
        // 否则（说明在往上滚）
        setIsVisible(true);  // 显示
      }

      // 记住这次的滚动位置，供下次比较
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);

    // 清理函数的习惯要养好
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  // 获取当前语言和路径信息
  const { language: currentLanguage, cleanPath } = extractLanguageFromPath(location.pathname);

  // 构建带语言前缀的链接
  const localizedLink = (path: string) => buildLocalizedUrl(path, currentLanguage.code);

  const navigation = [
    { name: t('nav.tools'), href: localizedLink('/tools'), current: cleanPath.startsWith('/tools') },
    { name: t('nav.experiment'), href: localizedLink('/experiment'), current: cleanPath.startsWith('/experiment') },
    { name: t('nav.workflows'), href: localizedLink('/workflows'), current: cleanPath.startsWith('/workflows') },
    { name: t('nav.forum'), href: localizedLink('/forum'), current: cleanPath.startsWith('/forum') },
    { name: t('nav.sync'), href: localizedLink('/sync'), current: cleanPath.startsWith('/sync') },
  ];

  const handleContactClick = () => {
    // Scroll to footer or show contact modal
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed w-full bg-white/90 backdrop-blur-sm shadow-sm border-b z-50 top-0 left-0 h-16 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="w-6 h-6 text-blue-600" />
                <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WSNAIL.COM
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center space-x-6"
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {item.name}
              </Link>
            ))}

            <Button
              variant="ghost"
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/email-contact'}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('nav.contact')}
            </Button>
          </motion.nav>

          {/* Language Switcher and System Notification */}
          <div className="hidden md:flex items-center space-x-4">
            <SimplifiedLanguageSwitcher />
            <Link
              to="/sync"
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="系统通知"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link
              to="/sync"
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-2"
              title="系统通知"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <div className="mr-2">
              <SimplifiedLanguageSwitcher />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t"
          >
            <div className="space-y-2">
              <Link
                to="/sync"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-600 hover:text-blue-600 hover:bg-blue-50 flex items-center"
              >
                <Bell className="w-4 h-4 mr-2" />
                系统通知
              </Link>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${item.current
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/email-contact';
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-600 hover:text-blue-600 hover:bg-blue-50 flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('nav.contact')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
