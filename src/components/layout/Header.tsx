import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { extractLanguageFromPath, buildLocalizedUrl } from '@/config/i18n';
import SimplifiedLanguageSwitcher from '../SimplifiedLanguageSwitcher';

export default function Header() {
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 获取当前语言和路径信息
  const { language: currentLanguage, cleanPath } = extractLanguageFromPath(location.pathname);

  // 构建带语言前缀的链接
  const localizedLink = (path: string) => buildLocalizedUrl(path, currentLanguage.code);

  const navigation = [
    { name: t('nav.home'), href: localizedLink('/'), current: cleanPath === '/' },
    // { name: 'Contact Advisor', href: '#contact', current: false, action: true }, // Placeholder
  ];

  const handleContactClick = () => {
    // Scroll to footer or show contact modal
    const footer = document.getElementById('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
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

          {/* Language Switcher */}
          <div className="hidden md:block">
            <SimplifiedLanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
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
