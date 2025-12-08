import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Users,
  Shield,
  BookOpen,
  ArrowLeft,
  Send,
  Download,
  Trash2,
  Mic,
  Upload,
  FileText,
  MessageCircle,
  Brain,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import { aiServiceManager } from '../services/aiServiceManager';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AnalysisResult {
  emotionalTone: string;
  keyInsights: string[];
  recommendations: string[];
  relationshipDynamics: string;
  communicationStyle: string;
  conflictAreas: string[];
  strengths: string[];
  nextSteps: string[];
}

export default function AnalyzerPage() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [analysisInput, setAnalysisInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [inputMethod, setInputMethod] = useState<'text' | 'voice' | 'file'>('text');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAnalysis = async () => {
    if (!analysisInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const prompt = `作为专业的情感关系分析师，请深入分析以下情感内容：

"${analysisInput}"

请提供以下维度的专业分析：
1. 情感基调和氛围
2. 关键洞察和发现
3. 具体的改善建议
4. 关系动态分析
5. 沟通方式评估
6. 潜在冲突领域
7. 关系优势和亮点
8. 后续行动建议

请用专业、温暖、具有建设性的语言回复，帮助当事人更好地理解和改善关系。`;

      const response = await aiServiceManager.generateResponse(prompt);

      // 解析AI回复并结构化
      const result = parseAnalysisResponse(response);
      setAnalysisResult(result);

    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      const prompt = `作为一位温暖、专业的情感咨询师，请回复用户的情感问题。
      
用户说：${userMessage.content}

请提供：
1. 理解和共情的回应
2. 专业的情感分析
3. 具体可行的建议
4. 鼓励和支持

请用温暖、专业、有帮助的语调回复，就像一位资深的心理咨询师。`;

      const response = await aiServiceManager.generateResponse(prompt);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '抱歉，我现在无法回复。请稍后再试。',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  const exportChat = () => {
    const chatText = chatMessages.map(msg =>
      `[${msg.type === 'user' ? '用户' : 'AI助手'}] ${msg.timestamp.toLocaleString()}\n${msg.content}\n\n`
    ).join('');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `情感分析对话记录_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const exampleScenarios = [
    "我和伴侣最近总是因为小事争吵，我觉得我们越来越疏远了...",
    "我在工作中和同事的关系很紧张，不知道该如何改善...",
    "我觉得朋友们都不理解我，我很孤独...",
    "我和家人的沟通总是出现问题，每次对话都不愉快..."
  ];

  return (
    <>
      <SEOHead
        title="智能关系分析师 - AI情感分析、关系诊断、互动建议 | WSNAIL.COM"
        description="AI驱动的智能关系分析工具，提供情感分析、关系诊断、互动建议等功能。输入聊天记录或文本，获得专业的关系分析报告，改善人际关系，提升沟通效果。"
        keywords="智能关系分析,AI情感分析,关系诊断,互动建议,聊天记录分析,情感智能,AI心理分析,人际关系,沟通分析,WSNAIL"
        url="https://wsnail.com/analyzer"
        canonical="https://wsnail.com/analyzer"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "智能关系分析师",
          "description": "AI驱动的情感分析工具",
          "url": "https://wsnail.com/analyzer",
          "applicationCategory": "AI分析工具",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "CNY"
          }
        }}
      />

      <div className="min-h-screen bg-[#FDFBF7]">
        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl font-serif-display font-medium text-gray-800 mb-6 tracking-wide">
                智能情感关系分析师
              </h1>
              <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-8"></div>
            </motion.div>
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto font-light leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              用AI驱动的深度分析，理解彼此真实感受，化解情感冲突，让每一段关系都能在理解中成长。
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-4 text-sm text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-600 font-light">
                <Brain className="w-4 h-4 mr-1" />
                AI智能分析
              </Badge>
              <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-600 font-light">
                <Heart className="w-4 h-4 mr-1" />
                深度情感理解
              </Badge>
              <Badge variant="secondary" className="bg-white border border-gray-200 text-gray-600 font-light">
                <Lock className="w-4 h-4 mr-1" />
                隐私安全保护
              </Badge>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="analysis" className="text-lg py-3">
                <MessageCircle className="w-5 h-5 mr-2" />
                智能分析
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-lg py-3">
                <Heart className="w-5 h-5 mr-2" />
                情感对话
              </TabsTrigger>
            </TabsList>

            {/* Analysis Tab */}
            <TabsContent value="analysis">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <MessageCircle className="w-6 h-6 mr-2 text-pink-600" />
                      告诉我们发生了什么
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      我们会用心聆听，并帮助你们理解彼此的感受 💝
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Input Method Selection */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={inputMethod === 'text' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInputMethod('text')}
                        className="flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        文字输入
                      </Button>
                      <Button
                        variant={inputMethod === 'voice' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInputMethod('voice')}
                        className="flex items-center"
                      >
                        <Mic className="w-4 h-4 mr-1" />
                        语音输入
                      </Button>
                      <Button
                        variant={inputMethod === 'file' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInputMethod('file')}
                        className="flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        文件上传
                      </Button>
                    </div>

                    {/* Text Input */}
                    {inputMethod === 'text' && (
                      <div>
                        <Textarea
                          value={analysisInput}
                          onChange={(e) => setAnalysisInput(e.target.value)}
                          placeholder="请详细描述您的情感困扰或人际关系问题，包括具体的对话内容、情境背景等。我们的AI会深入分析并提供专业建议..."
                          className="min-h-32 resize-none focus:ring-pink-500 focus:border-pink-500"
                          rows={8}
                        />
                        <div className="mt-4 grid grid-cols-1 gap-2">
                          <p className="text-sm font-medium text-gray-700 mb-2">示例场景：</p>
                          {exampleScenarios.map((scenario, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              onClick={() => setAnalysisInput(scenario)}
                              className="text-left justify-start h-auto p-3 text-gray-600 hover:bg-pink-50"
                            >
                              <span className="line-clamp-2">{scenario}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Voice Input */}
                    {inputMethod === 'voice' && (
                      <div className="text-center py-8 space-y-4">
                        <Mic className="w-16 h-16 text-pink-400 mx-auto" />
                        <p className="text-gray-600">语音输入功能即将推出</p>
                        <Button variant="outline" onClick={() => setInputMethod('text')}>
                          改用文字输入
                        </Button>
                      </div>
                    )}

                    {/* File Upload */}
                    {inputMethod === 'file' && (
                      <div className="text-center py-8 space-y-4">
                        <Upload className="w-16 h-16 text-pink-400 mx-auto" />
                        <p className="text-gray-600">文件上传功能即将推出</p>
                        <Button variant="outline" onClick={() => setInputMethod('text')}>
                          改用文字输入
                        </Button>
                      </div>
                    )}

                    {/* Privacy Notice */}
                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-pink-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-pink-800 mb-1">🔒 您的隐私受到保护，所有内容仅在本地处理</p>
                          <p className="text-pink-700">💝 我们致力于帮助每一对伴侣建立更好的关系</p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleAnalysis}
                      disabled={isAnalyzing || !analysisInput.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 text-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                          AI正在深度分析中...
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5 mr-2" />
                          开始智能分析
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Results Section */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                      分析结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisResult ? (
                      <AnalysisResultDisplay result={analysisResult} />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p>输入内容后点击"开始智能分析"</p>
                        <p className="text-sm mt-2">AI将为您提供专业的情感分析</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <Heart className="w-6 h-6 mr-2 text-pink-600" />
                      情感对话助手
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={exportChat}>
                        <Download className="w-4 h-4 mr-1" />
                        导出对话
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearChat}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        清空对话
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    与AI情感助手实时对话，获得专业的情感咨询和建议
                  </p>
                </CardHeader>

                {/* Chat Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p>开始与AI情感助手对话</p>
                      <p className="text-sm mt-2">分享您的情感困扰，获得专业建议</p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${message.type === 'user'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-pink-100' : 'text-gray-500'
                              }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {isChatting && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 px-4 py-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </CardContent>

                {/* Chat Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-3">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="输入您的情感问题或困扰..."
                      className="flex-1 resize-none focus:ring-pink-500 focus:border-pink-500"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend();
                        }
                      }}
                    />
                    <Button
                      onClick={handleChatSend}
                      disabled={isChatting || !chatInput.trim()}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-pink-100 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <img src="/images/logo.svg" alt="WSNAIL.COM" className="h-8 w-auto mr-3" />
                  <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
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
                  <a href="/" className="block text-gray-600 hover:text-pink-600 transition-colors">首页</a>
                  <a href="/ai-tools" className="block text-gray-600 hover:text-pink-600 transition-colors">AI工具库</a>
                  {/* Link removed */}
                  <a href="/analyzer" className="block text-gray-600 hover:text-pink-600 transition-colors">情感分析</a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-4">联系我们</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">邮箱: contact@wsnail.com</p>
                  <div className="flex space-x-4 mt-4">
                    <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                      <span className="sr-only">GitHub</span>
                      {/* GitHub icon */}
                    </a>
                    <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
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

// Analysis Result Display Component
function AnalysisResultDisplay({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Emotional Tone */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-pink-600" />
          情感基调
        </h3>
        <p className="text-gray-600 bg-pink-50 p-3 rounded-lg">{result.emotionalTone}</p>
      </div>

      {/* Key Insights */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          关键洞察
        </h3>
        <ul className="space-y-2">
          {result.keyInsights.map((insight, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-600">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
          改善建议
        </h3>
        <ul className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-600">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Relationship Dynamics */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          关系动态
        </h3>
        <p className="text-gray-600 bg-green-50 p-3 rounded-lg">{result.relationshipDynamics}</p>
      </div>
    </div>
  );
}

// Helper function to parse AI analysis response
function parseAnalysisResponse(response: string): AnalysisResult {
  const sections: { [key: string]: string[] } = {
    "情感基调": [], "关键洞察": [], "改善建议": [], "关系动态": [],
    "沟通方式": [], "潜在冲突": [], "关系优势": [], "后续行动": []
  };

  let currentSection: string | null = null;

  const lines = response.split('\n').map(line => line.trim()).filter(line => line);

  for (const line of lines) {
    const foundSection = Object.keys(sections).find(section => line.includes(section));
    if (foundSection) {
      currentSection = foundSection;
      const content = line.replace(/^[0-9]+\.\s*.*：/, '').trim();
      if (content) sections[currentSection].push(content);
    } else if (currentSection) {
      sections[currentSection].push(line.replace(/^-|•|\*|^\s*/, '').trim());
    }
  }

  return {
    emotionalTone: sections["情感基调"].join(' ') || "未能解析情感基调。",
    keyInsights: sections["关键洞察"].length > 0 ? sections["关键洞察"] : ["未能解析关键洞察。"],
    recommendations: sections["改善建议"].length > 0 ? sections["改善建议"] : ["未能解析改善建议。"],
    relationshipDynamics: sections["关系动态"].join(' ') || "未能解析关系动态。",
    communicationStyle: sections["沟通方式"].join(' ') || "未能解析沟通方式。",
    conflictAreas: sections["潜在冲突"].length > 0 ? sections["潜在冲突"] : ["未能解析潜在冲突领域。"],
    strengths: sections["关系优势"].length > 0 ? sections["关系优势"] : ["未能解析关系优势。"],
    nextSteps: sections["后续行动"].length > 0 ? sections["后续行动"] : ["未能解析后续行动建议。"]
  };
}
