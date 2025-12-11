import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Plus, Search, Filter, Clock, MessageSquare, User, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';

// 模拟论坛帖子数据
const initialPosts = [
  {
    id: 1,
    title: '如何快速采集商品信息？',
    content: '大家好，我想了解一下有什么工具可以快速采集淘宝/1688商品信息？',
    author: '电商小白',
    time: '2小时前',
    replies: 12,
    category: '问题',
    tags: ['商品信息采集', '工具推荐']
  },
  {
    id: 2,
    title: '分享一个批量处理图片的小技巧',
    content: '我发现了一个批量处理商品图片的好方法，可以大幅提升效率...',
    author: '运营高手',
    time: '5小时前',
    replies: 8,
    category: '技巧',
    tags: ['图片处理', '效率提升']
  },
  {
    id: 3,
    title: '新发布了商品上架工作流',
    content: '我刚刚制作了一个完整的商品上架工作流，从采集到发布全流程自动化...',
    author: '工具开发者',
    time: '1天前',
    replies: 15,
    category: '分享',
    tags: ['工作流', '自动化']
  },
  {
    id: 4,
    title: '如何避免1688到咸鱼搬运的风险？',
    content: '最近在做1688到咸鱼的搬运，但担心会遇到一些风险，大家有什么建议？',
    author: '新手卖家',
    time: '1天前',
    replies: 6,
    category: '需求',
    tags: ['风险控制', '合规']
  },
  {
    id: 5,
    title: '反馈：数据提取工具的建议',
    content: '数据提取工具很好用，但希望能增加对更多网站的支持...',
    author: '高级用户',
    time: '2天前',
    replies: 4,
    category: '反馈',
    tags: ['工具优化', '需求']
  }
];

const categories = [
  '全部', '问题', '需求', '技巧', '分享', '反馈'
];

export default function ForumPage() {
  const { t } = useTranslation();
  const [posts] = useState(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === '全部' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-layout">
      {/* 论坛页面头部 */}
      <section className="page-header">
        <div className="max-w-7xl mx-auto container-padding py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t('nav.forum')}
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                无需账号，直接交流，分享你的经验和问题
              </p>
            </div>
            <Button onClick={() => setShowNewPostModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              发布问题（无需账号）
            </Button>
          </motion.div>

          {/* 搜索栏 */}
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索帖子标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <div className="page-content">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧分类 */}
          <aside className="page-sidebar">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">帖子分类</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold text-gray-900 mb-2">近期热门</h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                    数据提取工具使用技巧
                  </div>
                  <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                    如何避免搬运风险？
                  </div>
                  <div className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                    商品信息采集最佳实践
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* 中间帖子列表 */}
          <main className="page-main">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                共 {filteredPosts.length} 个帖子
              </p>
            </div>

            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="tool-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">{post.title}</h3>
                        <span className="ml-3 category-tag bg-gray-100 text-gray-800">
                          {post.category}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="category-tag bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-4">{post.author}</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="mr-4">{post.time}</span>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        <span>{post.replies} 条回复</span>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="ml-4">
                      查看
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p>还没有相关帖子</p>
                <p className="mt-2 text-sm">快来发布第一个帖子吧！</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 新帖子模态框 */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">发布新帖子（无需账号）</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                  <input
                    type="text"
                    placeholder="输入你的昵称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input
                    type="text"
                    placeholder="输入帖子标题"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                  <textarea
                    rows={6}
                    placeholder="分享你的想法、问题或建议..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPostModal(false)}
                  >
                    取消
                  </Button>
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    发布
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}