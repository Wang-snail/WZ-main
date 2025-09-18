import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Settings,
  Github,
  Globe,
  Save,
  AlertCircle,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import {
  WebsiteConfig,
  WebsiteConfigManager
} from '../utils/websiteConfig';

const WebsiteConfigPage: React.FC = () => {
  // 只在开发环境中可用
  const isDevelopment = import.meta.env.DEV;

  const [config, setConfig] = useState<WebsiteConfig>(WebsiteConfigManager.loadConfig());

  const [isLoading, setIsLoading] = useState(false);

  // 保存配置
  const saveConfig = () => {
    try {
      WebsiteConfigManager.saveConfig(config);
      toast.success('配置已保存');
    } catch (error) {
      toast.error('保存配置失败');
    }
  };


  // 导出配置
  const exportConfig = () => {
    const configJson = WebsiteConfigManager.exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-config.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('配置已导出');
  };

  // 导入配置
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configJson = e.target?.result as string;
        const newConfig = WebsiteConfigManager.importConfig(configJson);
        setConfig(newConfig);
        toast.success('配置已导入');
      } catch (error) {
        toast.error('导入配置失败');
      }
    };
    reader.readAsText(file);
  };

  // 重置配置
  const resetConfig = () => {
    const defaultConfig = WebsiteConfigManager.resetToDefault();
    setConfig(defaultConfig);
    toast.success('配置已重置为默认值');
  };

  const handleConfigChange = (field: keyof WebsiteConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };


  // 在生产环境中显示访问限制页面
  if (!isDevelopment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <Helmet>
          <title>访问受限 | WSNAIL.COM</title>
          <meta name="description" content="此页面仅在开发环境中可用" />
        </Helmet>
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">访问受限</h1>
          <p className="text-gray-600 mb-6">
            此配置管理页面仅在本地开发环境中可用，以保护敏感信息安全。
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-lg"
          >
            <p className="text-sm text-gray-500">
              如需访问配置管理功能，请在本地开发环境中访问：
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                http://localhost:3000/website-config
              </code>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Helmet>
        <title>网站配置管理 (开发环境) | WSNAIL.COM</title>
        <meta name="description" content="开发环境专用：管理网站部署配置，包括GitHub仓库和Vercel项目设置" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">网站配置管理</h1>
            </div>
            <p className="text-gray-600">管理您的网站部署配置和API密钥</p>
          </div>

          <div className="grid gap-6">
            {/* 基本信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-600" />
                基本信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    网站名称
                  </label>
                  <input
                    type="text"
                    value={config.siteName}
                    onChange={(e) => handleConfigChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    域名
                  </label>
                  <input
                    type="text"
                    value={config.domain}
                    onChange={(e) => handleConfigChange('domain', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    本地路径
                  </label>
                  <input
                    type="text"
                    value={config.localPath}
                    onChange={(e) => handleConfigChange('localPath', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* GitHub 配置 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Github className="w-5 h-5 mr-2 text-gray-800" />
                GitHub 配置
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub 仓库地址
                </label>
                <input
                  type="text"
                  value={config.githubRepo}
                  onChange={(e) => handleConfigChange('githubRepo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>


            {/* 操作按钮 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">操作</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={saveConfig}
                  className="flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存配置
                </Button>
                <Button
                  onClick={exportConfig}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出配置
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    className="flex items-center justify-center w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    导入配置
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  onClick={resetConfig}
                  variant="destructive"
                  size="sm"
                  className="flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  重置为默认配置
                </Button>
              </div>
            </div>


            {/* 快速信息 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">快速信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>网站地址:</strong>
                  <a href={`https://${config.domain}`} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline ml-2">
                    {config.domain}
                  </a>
                </div>
                <div>
                  <strong>本地开发:</strong>
                  <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline ml-2">
                    localhost:3000
                  </a>
                </div>
                <div>
                  <strong>GitHub:</strong>
                  <a href={config.githubRepo} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline ml-2">
                    查看仓库
                  </a>
                </div>
                <div>
                  <strong>本地路径:</strong>
                  <span className="ml-2 text-gray-600">{config.localPath}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WebsiteConfigPage;