import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Settings,
  Github,
  Globe,
  Key,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Upload,
  RotateCcw,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import {
  WebsiteConfig,
  WebsiteConfigManager,
  GitHubAPI,
  VercelAPI
} from '../utils/websiteConfig';

const WebsiteConfigPage: React.FC = () => {
  const [config, setConfig] = useState<WebsiteConfig>(WebsiteConfigManager.loadConfig());

  const [showSecrets, setShowSecrets] = useState({
    githubAPI: false,
    vercelKey: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    github: 'unknown',
    vercel: 'unknown'
  });
  const [repoInfo, setRepoInfo] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);

  // 保存配置
  const saveConfig = () => {
    try {
      WebsiteConfigManager.saveConfig(config);
      toast.success('配置已保存');
    } catch (error) {
      toast.error('保存配置失败');
    }
  };

  // 测试GitHub连接
  const testGitHubConnection = async () => {
    setIsLoading(true);
    try {
      const githubAPI = new GitHubAPI(config.githubAPI, config.githubRepo);
      const isConnected = await githubAPI.testConnection();

      if (isConnected) {
        setConnectionStatus(prev => ({ ...prev, github: 'success' }));
        const info = await githubAPI.getRepoInfo();
        setRepoInfo(info);
        toast.success('GitHub 连接成功');
      } else {
        setConnectionStatus(prev => ({ ...prev, github: 'error' }));
        toast.error('GitHub 连接失败');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, github: 'error' }));
      toast.error('GitHub 连接测试失败');
    }
    setIsLoading(false);
  };

  // 测试Vercel连接
  const testVercelConnection = async () => {
    setIsLoading(true);
    try {
      const vercelAPI = new VercelAPI(config.vercelKey, config.vercelProjectId);
      const isConnected = await vercelAPI.testConnection();

      if (isConnected) {
        setConnectionStatus(prev => ({ ...prev, vercel: 'success' }));
        const deploymentList = await vercelAPI.getDeployments();
        setDeployments(deploymentList.deployments || []);
        toast.success('Vercel 连接成功');
      } else {
        setConnectionStatus(prev => ({ ...prev, vercel: 'error' }));
        toast.error('Vercel 连接失败');
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, vercel: 'error' }));
      toast.error('Vercel 连接测试失败');
    }
    setIsLoading(false);
  };

  // 触发部署
  const triggerDeploy = async () => {
    setIsLoading(true);
    try {
      const vercelAPI = new VercelAPI(config.vercelKey, config.vercelProjectId);
      await vercelAPI.triggerDeploy();
      toast.success('部署已触发');
      // 重新获取部署列表
      setTimeout(() => testVercelConnection(), 2000);
    } catch (error) {
      toast.error('部署操作失败');
    }
    setIsLoading(false);
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

  const toggleSecretVisibility = (field: 'githubAPI' | 'vercelKey') => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Helmet>
        <title>网站配置管理 | WSNAIL.COM</title>
        <meta name="description" content="管理网站部署配置，包括GitHub仓库和Vercel项目设置" />
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Github className="w-5 h-5 mr-2 text-gray-800" />
                  GitHub 配置
                </h2>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(connectionStatus.github)}
                  <Button
                    onClick={testGitHubConnection}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    测试连接
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub API Token
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets.githubAPI ? "text" : "password"}
                      value={config.githubAPI}
                      onChange={(e) => handleConfigChange('githubAPI', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('githubAPI')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showSecrets.githubAPI ?
                        <EyeOff className="w-4 h-4 text-gray-400" /> :
                        <Eye className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vercel 配置 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Key className="w-5 h-5 mr-2 text-blue-600" />
                  Vercel 配置
                </h2>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(connectionStatus.vercel)}
                  <Button
                    onClick={testVercelConnection}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    测试连接
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vercel 项目 ID
                  </label>
                  <input
                    type="text"
                    value={config.vercelProjectId}
                    onChange={(e) => handleConfigChange('vercelProjectId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vercel API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets.vercelKey ? "text" : "password"}
                      value={config.vercelKey}
                      onChange={(e) => handleConfigChange('vercelKey', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecretVisibility('vercelKey')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showSecrets.vercelKey ?
                        <EyeOff className="w-4 h-4 text-gray-400" /> :
                        <Eye className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">操作</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={saveConfig}
                  className="flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  保存配置
                </Button>
                <Button
                  onClick={triggerDeploy}
                  disabled={isLoading}
                  variant="outline"
                  className="flex items-center justify-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  触发部署
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

            {/* 状态监控 */}
            {(repoInfo || deployments.length > 0) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  状态监控
                </h2>

                {repoInfo && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">GitHub 仓库状态</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>仓库名:</strong> {repoInfo.name}
                        </div>
                        <div>
                          <strong>分支:</strong> {repoInfo.default_branch}
                        </div>
                        <div>
                          <strong>更新时间:</strong> {new Date(repoInfo.updated_at).toLocaleString()}
                        </div>
                        <div>
                          <strong>大小:</strong> {repoInfo.size} KB
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {deployments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">最近部署</h3>
                    <div className="space-y-2">
                      {deployments.slice(0, 5).map((deployment: any) => (
                        <div key={deployment.uid} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                deployment.state === 'READY' ? 'bg-green-500' :
                                deployment.state === 'ERROR' ? 'bg-red-500' :
                                'bg-yellow-500'
                              }`} />
                              <span className="font-medium">{deployment.state}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(deployment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {deployment.url && (
                            <a
                              href={`https://${deployment.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {deployment.url}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  <strong>Vercel:</strong>
                  <span className="ml-2">项目 ID: {config.vercelProjectId.slice(0, 8)}...</span>
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