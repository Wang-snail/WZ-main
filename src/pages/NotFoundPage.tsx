/**
 * 404页面组件
 * 集成导航错误处理和智能重定向功能
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { navigationErrorHandler } from '@/utils/navigationErrorHandler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SuggestedRoute {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const NotFoundPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [suggestedRoutes, setSuggestedRoutes] = useState<SuggestedRoute[]>([]);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // 尝试处理404重定向
    const redirectHandled = navigationErrorHandler.handle404(currentPath);
    
    if (redirectHandled) {
      setIsRedirecting(true);
      return;
    }

    // 生成建议路由
    generateSuggestedRoutes(currentPath);
    
    // 启动自动重定向倒计时
    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.pathname, navigate]);

  const generateSuggestedRoutes = (currentPath: string) => {
    const routes: SuggestedRoute[] = [
      {
        path: '/',
        title: '首页',
        description: '返回网站首页',
        icon: <Home className="w-5 h-5" />
      },
      {
        path: '/lab',
        title: '数据实验室',
        description: '探索数据分析工具',
        icon: <Search className="w-5 h-5" />
      },
      {
        path: '/tools',
        title: '工具中心',
        description: '查看所有可用工具',
        icon: <RefreshCw className="w-5 h-5" />
      }
    ];

    // 根据当前路径智能推荐
    if (currentPath.includes('workflow') || currentPath.includes('guide')) {
      routes.unshift({
        path: '/lab',
        title: '数据实验室 (推荐)',
        description: '实战指南已迁移至数据实验室',
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
      });
    }

    if (currentPath.includes('tool') || currentPath.includes('calculator')) {
      routes.unshift({
        path: '/tools',
        title: '工具中心 (推荐)',
        description: '查找相关计算工具',
        icon: <Search className="w-5 h-5 text-blue-500" />
      });
    }

    setSuggestedRoutes(routes);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleStopRedirect = () => {
    setRedirectCountdown(0);
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                正在重定向...
              </h2>
              <p className="text-gray-600">
                检测到页面已迁移，正在为您跳转到新地址
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 主要错误信息 */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              页面未找到
            </CardTitle>
            <p className="text-gray-600 mt-2">
              抱歉，您访问的页面不存在或已被移动
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>请求的URL:</strong> <code className="bg-white px-2 py-1 rounded">{location.pathname}</code>
              </p>
            </div>

            {/* 自动重定向提示 */}
            {redirectCountdown > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-800">
                      {redirectCountdown} 秒后自动返回首页
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStopRedirect}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 建议的页面 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">您可能在寻找</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {suggestedRoutes.map((route, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => navigate(route.path)}
                >
                  <div className="flex items-center space-x-3 w-full">
                    {route.icon}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{route.title}</div>
                      <div className="text-sm text-gray-500">{route.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回上一页</span>
          </Button>
          
          <Button
            onClick={() => navigate('/', { replace: true })}
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>返回首页</span>
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>刷新页面</span>
          </Button>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            如果您认为这是一个错误，请{' '}
            <a 
              href="/email-contact" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              联系我们
            </a>
            {' '}报告此问题
          </p>
        </div>

        {/* 开发环境调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg text-orange-800">调试信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-orange-700 space-y-2">
                <div><strong>路径:</strong> {location.pathname}</div>
                <div><strong>搜索参数:</strong> {location.search || '无'}</div>
                <div><strong>哈希:</strong> {location.hash || '无'}</div>
                <div><strong>状态:</strong> {JSON.stringify(location.state) || '无'}</div>
                <div><strong>用户代理:</strong> {navigator.userAgent}</div>
                <div><strong>引用页:</strong> {document.referrer || '直接访问'}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;