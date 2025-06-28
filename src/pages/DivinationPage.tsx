import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Star, 
  Hand, 
  Type,
  ArrowLeft,
  Compass,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DivinationResult } from '../types';
import { storageService } from '../services/localStorage';
import SEOHead from '../components/SEOHead';
import { useNavigate } from 'react-router-dom';
import DivinationServiceForm from '../components/DivinationServiceForm';
import DivinationHistory from '../components/DivinationHistory';
import DivinationResultDisplay from '../components/DivinationResultDisplay';

export default function DivinationPage() {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [results, setResults] = useState<DivinationResult[]>([]);
  const [currentResult, setCurrentResult] = useState<DivinationResult | null>(null);
  const [canUseFree, setCanUseFree] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const navigate = useNavigate();

  useEffect(() => {
    setCanUseFree(storageService.canUseFree());
    setResults(storageService.getDivinationHistory());
  }, []);

  const handleServiceComplete = (result: DivinationResult) => {
    storageService.saveDivinationResult(result);
    setResults([result, ...results]);
    setActiveService(null);
    setCurrentResult(result);
    
    if (canUseFree) {
      storageService.markFreeUsed();
      setCanUseFree(false);
    }
  };

  const divinationServices = [
    {
      id: 'tarot',
      title: '专业塔罗占卜',
      subtitle: 'Professional Tarot Divination',
      description: '78张塔罗牌系统，多种牌阵布局，正逆位解读功能，大小阿卡那完整牌组，专业牌义解读服务',
      features: ['78张塔罗牌系统', '多种牌阵布局 (包括凯尔特十字牌阵)', '正逆位解读功能', '大小阿卡那完整牌组', '专业牌义解读服务'],
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
    },
    {
      id: 'constellation',
      title: '星座命盘分析',
      subtitle: 'Constellation Natal Chart Analysis',
      description: '四象分类系统，上升星座分析，配对分析功能，太阳/月亮/上升星座解读，四象元素分析，星座配对建议',
      features: ['四象分类系统', '上升星座分析', '配对分析功能', '太阳/月亮/上升星座解读', '四象元素分析', '星座配对建议'],
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
    },
    {
      id: 'iching',
      title: '周易六十四卦',
      subtitle: 'I Ching 64 Hexagrams',
      description: '易经智慧应用，六爻占卜系统，时间起卦方法，64卦象完整系统，六爻详解分析，世应五行生克关系',
      features: ['易经智慧应用', '六爻占卜系统', '时间起卦方法', '64卦象完整系统', '六爻详解分析', '世应五行生克关系'],
      icon: <Compass className="w-8 h-8 text-green-500" />,
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-green-100 to-teal-100',
    },
    {
      id: 'palmistry',
      title: '专业手相分析',
      subtitle: 'Professional Palmistry Analysis',
      description: '三大主线分析（生命线、智慧线、感情线），手型分析系统，指纹识别功能，手掌���陵解读',
      features: ['三大主线分析 (生命线、智慧线、感情线)', '手型分析系统', '指纹识别功能', '手掌丘陵解读'],
      icon: <Hand className="w-8 h-8 text-blue-500" />,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100',
    },
    {
      id: 'nameanalysis',
      title: '姓名测字算卦',
      subtitle: 'Name Character Fortune-telling',
      description: '汉字五行属性分析，笔画分析系统，姓名学原理应用，字形结构解读',
      features: ['汉字五行属性分析', '笔画分析系统', '姓名学原理应用', '字形结构解读'],
      icon: <Type className="w-8 h-8 text-red-500" />,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-red-100 to-pink-100',
    },
    {
      id: 'fengshui',
      title: '九宫飞星',
      subtitle: 'Nine Palace Flying Stars',
      description: '风水布局分析，飞星运势判断，方位吉凶分析，九宫格方位系统，风水布局建议',
      features: ['风水布局分析', '飞星运势判断', '方位吉凶分析', '九宫格方位系统', '风水布局建议'],
      icon: <Zap className="w-8 h-8 text-indigo-500" />,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-gradient-to-br from-indigo-100 to-purple-100',
    },
  ];

  if (currentResult) {
    return <DivinationResultDisplay 
      result={currentResult}
      onBack={() => setCurrentResult(null)}
    />
  }

  if (activeService) {
    return <DivinationServiceForm 
      service={divinationServices.find(s => s.id === activeService)!}
      onBack={() => setActiveService(null)}
      onComplete={handleServiceComplete}
      canUseFree={canUseFree}
    />;
  }

  return (
    <>
      <SEOHead 
        title="AI占卜大师 - 塔罗牌占卜、星座运势、八卦算命、手相分析 | WSNAIL.COM"
        description="专业AI占卜平台，提供塔罗牌占卜、星座运势分析、周易八卦算命、手相分析、姓名测字、九宫飞星等传统占卜服务。结合古代智慧与现代AI技术，为您提供准确的命运指导。"
        keywords="AI占卜,塔罗牌占卜,星座运势,八卦算命,手相分析,姓名测字,九宫飞星,风水分析,命运预测,WSNAIL"
        url="https://wsnail.com/divination"
        canonical="https://wsnail.com/divination"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI占卜大师",
          "description": "专业AI占卜平��，提供多种传统占卜服务",
          "provider": {
            "@type": "Organization",
            "name": "WSNAIL.COM"
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src="/images/logo.svg" alt="WSNAIL.COM" className="h-8 w-auto mr-3" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  WSNAIL.COM
                </span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Button variant="ghost" onClick={() => navigate('/')}>首页</Button>
                <Button variant="ghost" onClick={() => navigate('/ai-tools')}>AI工具库</Button>
                <Button variant="ghost" className="text-purple-600 font-medium">AI占卜</Button>
                <Button variant="ghost" onClick={() => navigate('/analyzer')}>情感分析</Button>
              </nav>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/')}
                className="md:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI占卜大师
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              结合古代智慧与现代AI技术，为您提供专业的命运指导。
              <br />
              探索塔罗奥秘，解读星座密码，领悟易经智慧。
            </motion.p>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="services" className="text-lg py-3">占卜服务</TabsTrigger>
              <TabsTrigger value="history" className="text-lg py-3">历史记录</TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {divinationServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 ${service.bgColor} hover:scale-105`}
                          onClick={() => setActiveService(service.id)}>
                      <CardHeader className="text-center pb-4">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center shadow-lg`}>
                          {service.icon}
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                          {service.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500 font-medium">{service.subtitle}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                          {service.description}
                        </p>
                        <div className="space-y-2 mb-6">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color} mr-2`}></div>
                              {feature}
                            </div>
                          ))}
                        </div>
                        <Button 
                          className={`w-full bg-gradient-to-r ${service.color} text-white border-0 hover:shadow-lg transition-all duration-300`}
                        >
                          {canUseFree ? '免费体验' : '¥9.9 开始占卜'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <DivinationHistory results={results} onResultClick={(result) => {
                setCurrentResult(result);
              }} />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <img src="/images/logo.svg" alt="WSNAIL.COM" className="h-8 w-auto mr-3" />
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    WSNAIL.COM
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  专业的AI工具集合平台，提供占卜、分析、创作等多种智能服务。
                </p>
                <p className="text-sm text-gray-500">
                  Created by MiniMax Agent
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">快速链接</h3>
                <div className="space-y-2">
                  <a href="/" className="block text-gray-600 hover:text-purple-600 transition-colors">��页</a>
                  <a href="/ai-tools" className="block text-gray-600 hover:text-purple-600 transition-colors">AI工具库</a>
                  <a href="/divination" className="block text-gray-600 hover:text-purple-600 transition-colors">AI占卜</a>
                  <a href="/analyzer" className="block text-gray-600 hover:text-purple-600 transition-colors">情感分析</a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">联系我们</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">邮箱: contact@wsnail.com</p>
                  <div className="flex space-x-4 mt-4">
                    <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                      <span className="sr-only">GitHub</span>
                      {/* GitHub icon */}
                    </a>
                    <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                      <span className="sr-only">Twitter</span>
                      {/* Twitter icon */}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}