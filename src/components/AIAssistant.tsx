import { useState, useRef, useEffect } from 'react';
import { X, Send, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🐌 嗨！我是 Kel，住在 WSnail.com 的小精灵！\n\n我可以帮你：\n- 📊 市场分析（CR10/HHI）\n- 🔍 话术检测\n- 💻 代码检查\n- 👥 团队协作指导\n- 🤔 理性分析建议\n\n虽然爬得慢，但思考很深入哦～有什么可以帮你的？',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 构建对话历史（传给后端）
      const history = messages
        .filter(m => m.id !== '1') // 跳过初始欢迎消息
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, history }),
      });

      const json = await res.json() as { success: boolean; data?: { content: string }; error?: string };
      if (!json.success) throw new Error(json.error ?? 'Unknown error');
      const replyText = json.data?.content ?? '抱歉，我没有收到回复。';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '😔 抱歉，我出了点问题，请稍后再试！',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[80vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center">
              <span className="text-xl">🐌</span>
            </div>
            <div>
              <h3 className="font-bold text-primary">Kel - WSnail 小精灵</h3>
              <p className="text-xs text-on-surface-variant">住在 WSnail.com 的聪明蜗牛</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-secondary-container'
                    : 'bg-tertiary-container'
                }`}
              >
                {message.role === 'user' ? (
                  <User size={16} className="text-on-secondary-container" />
                ) : (
                  <span className="text-lg">🐌</span>
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low border border-outline-variant/10'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-tertiary-container flex items-center justify-center">
                <span className="text-lg">🐌</span>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/10">
                <Loader2 size={16} className="animate-spin text-tertiary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low">
          <div className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Enter 发送)"
              className="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={16} />
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
