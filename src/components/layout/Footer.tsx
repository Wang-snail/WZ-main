import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Heart, Mail, Github, Twitter, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-2">
              <div className="relative">
                <Bot className="w-8 h-8 text-blue-400" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                WSNAIL.COM
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md text-sm">
              {t('footer.description')}
            </p>
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <Heart className="w-4 h-4 text-red-400" />
              <span>{t('footer.slogan')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-3">{t('footer.quickLinks')}</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.about')}
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-semibold mb-3">{t('footer.contact')}</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <div className="text-gray-300">
                  <span className="text-gray-400">{t('footer.wechat')}:</span>
                  <span className="ml-1 font-medium text-white">Reaper-B</span>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">support@wsnail.com</span>
              </li>
              {/* GitHub链接已移除 */}
              <li className="flex items-center space-x-2">
                {/* Twitter hidden as per request */}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-4 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-xs">
              {t('footer.copyright')}
            </div>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                {t('footer.terms')}
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-xs transition-colors">
                {t('footer.help')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
