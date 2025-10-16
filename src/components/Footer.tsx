import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Heart, Mail, Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Bot className="w-8 h-8 text-blue-400" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                WSNAIL.COM
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              探索AI的无限可能，发现最佳工具，体验智能占卜，让技术为生活增添更多精彩。
            </p>
            <div className="flex items-center space-x-2 text-gray-300">
              <Heart className="w-5 h-5 text-red-400" />
              <span>让AI技术更贴近生活</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link to="/ai-tools" className="text-gray-300 hover:text-white transition-colors">
                  AI工具库
                </Link>
              </li>
              <li>
                <Link to="/divination" className="text-gray-300 hover:text-white transition-colors">
                  AI占卜大师
                </Link>
              </li>
              <li>
                <Link to="/analyzer" className="text-gray-300 hover:text-white transition-colors">
                  智能情感分析
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-green-400" />
                <div className="text-gray-300">
                  <span className="text-gray-400 text-sm">微信:</span>
                  <span className="ml-1 font-medium text-white">wsnail-com</span>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">contact@wsnail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-gray-400" />
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Twitter className="w-4 h-4 text-gray-400" />
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 WSNAIL.COM. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                隐私政策
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                使用条款
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                帮助中心
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
