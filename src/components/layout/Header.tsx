import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Menu, X, Gamepad2, Workflow, Star, TrendingUp, Settings, ChevronDown, MoreHorizontal, BookOpen, Newspaper } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { extractLanguageFromPath, buildLocalizedUrl } from '@/config/i18n';
import SimplifiedLanguageSwitcher from '../SimplifiedLanguageSwitcher';

// Updated: 2025-09-18 13:05 - Force deployment sync
export default function Header() {
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // 获取当前语言和路径信息
  const { language: currentLanguage, cleanPath } = extractLanguageFromPath(location.pathname);

  // 构建带语言前缀的链接
  const localizedLink = (path: string) => buildLocalizedUrl(path, currentLanguage.code);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: t('nav.home'), href: localizedLink('/'), current: cleanPath === '/' },
    { name: t('nav.games'), href: localizedLink('/games'), current: cleanPath === '/games', icon: Gamepad2 },
    { name: t('nav.aiTools'), href: localizedLink('/ai-tools'), current: cleanPath === '/ai-tools' },
  ];

  const moreNavigation = [
    { name: t('nav.platformNews'), href: localizedLink('/platform-news'), current: cleanPath === '/platform-news', icon: Newspaper },
    { name: t('nav.workflows'), href: localizedLink('/workflows'), current: cleanPath === '/workflows', icon: Workflow },
    { name: t('nav.toolReviews'), href: localizedLink('/tool-reviews'), current: cleanPath === '/tool-reviews', icon: Star },
    { name: '经验库', href: localizedLink('/kajian-lessons'), current: cleanPath.startsWith('/kajian-lessons'), icon: BookOpen },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="w-8 h-8 text-blue-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                {item.icon && <item.icon className="w-4 h-4 mr-1" />}
                {item.name}
              </Link>
            ))}

            {/* More Menu */}
            <div className="relative" ref={moreMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 flex items-center"
              >
                <MoreHorizontal className="w-4 h-4 mr-1" />
                更多
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>

              {moreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50"
                >
                  <div className="py-1">
                    {moreNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors flex items-center ${item.current
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
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
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
              {/* Main navigation items */}
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
                  {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                  {item.name}
                </Link>
              ))}

              {/* More navigation items */}
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  更多功能
                </div>
                {moreNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center ${item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
