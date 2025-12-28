import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Database,
  TrendingUp,
  Target,
  Map,
  Globe,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '仪表盘', icon: BarChart3 },
  { id: 'data-source', label: '数据源配置', icon: Database },
  { id: 'bcg-matrix', label: 'BCG矩阵分析', icon: TrendingUp },
  { id: 'roadmap', label: '产品路线图', icon: Map },
  { id: 'market-analysis', label: '市场机会分析', icon: Target },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="p-4">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-blue-700" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 数据源状态 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">数据源状态</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Google Trends</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              活跃
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">百度指数</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              活跃
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">世界银行数据</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              活跃
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">国家统计局</span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              活跃
            </span>
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">系统信息</span>
        </div>
        <p className="text-xs text-blue-600">
          智策平台 v2.0<br/>
          实时数据分析 · 权威数据源<br/>
          数据更新: 2025-12-24
        </p>
      </div>
    </div>
  );
};

export default Sidebar;