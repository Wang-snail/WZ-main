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
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { DivinationResult } from '../../types';
import { storageService } from '../../services/localStorage';
import SEOHead from '../../components/common/SEOHead';
import { useNavigate } from 'react-router-dom';
import DivinationServiceForm from '../../components/features/DivinationServiceForm';
import DivinationHistory from '../../components/features/DivinationHistory';
import DivinationResultDisplay from '../../components/features/DivinationResultDisplay';

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
        title="AI占卜大师 - 寻找内心的平静 | 塔罗牌、星座、周易 | WSNAIL.COM"
        description="在这个喧嚣的世界中寻找内心的平静。WSNAIL提供专业的AI塔罗牌占卜、星座运势分析、周易八卦算命。结合古代智慧与现代AI技术，为您提供温暖而准确的指引。"
        keywords="AI占卜,内心平静,塔罗牌,星座运势,周易,八卦,心灵疗愈,WSNAIL"
        url="https://wsnail.com/divination"
        canonical="https://wsnail.com/divination"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "AI占卜大师",
          "description": "寻找内心的平静，提供专业的AI占卜服务",
          "provider": {
            "@type": "Organization",
            "name": "WSNAIL.COM"
          }
        }}
      />

      <div className="min-h-screen bg-[#FDFBF7]">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl font-serif-display font-medium text-gray-800 mb-6 tracking-wide">
                寻找内心的平静
              </h1>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-8"></div>
            </motion.div>

            <motion.p
              className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              当世界变得喧嚣，我们更需要聆听内心的声音。
              <br />
              结合古老智慧与现代科技，为您指引方向，抚平焦虑。
            </motion.p>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-white/50 border border-gray-200 p-1 rounded-full">
                <TabsTrigger
                  value="services"
                  className="px-8 py-2 rounded-full data-[state=active]:bg-gray-800 data-[state=active]:text-white transition-all duration-300"
                >
                  占卜服务
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="px-8 py-2 rounded-full data-[state=active]:bg-gray-800 data-[state=active]:text-white transition-all duration-300"
                >
                  历史记录
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="services">
              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {divinationServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    <div
                      className="group cursor-pointer bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
                      onClick={() => setActiveService(service.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-6 p-4 bg-gray-50 rounded-full group-hover:bg-[#FDFBF7] transition-colors duration-500">
                          {React.cloneElement(service.icon as React.ReactElement, {
                            className: "w-8 h-8 text-gray-700 stroke-[1.5px]"
                          })}
                        </div>

                        <h3 className="text-xl font-serif-display font-medium text-gray-800 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-light">
                          {service.subtitle}
                        </p>

                        <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                          {service.description}
                        </p>

                        <div className="w-full pt-6 border-t border-gray-50">
                          <Button
                            variant="ghost"
                            className="w-full hover:bg-gray-50 text-gray-600 font-light tracking-wide group-hover:text-gray-900 transition-colors"
                          >
                            {canUseFree ? '开始体验' : '¥9.9 解锁'}
                          </Button>
                        </div>
                      </div>
                    </div>
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
        <footer className="bg-white border-t border-gray-100 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="mb-4">
              <span className="text-xl font-serif-display font-bold text-gray-800">
                WSNAIL
              </span>
            </div>
            <p className="text-gray-500 font-light text-sm mb-8">
              愿您在每一次探索中，都能找到属于自己的答案。
            </p>
            <div className="text-xs text-gray-400">
              © 2025 WSNAIL.COM · All Rights Reserved
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}