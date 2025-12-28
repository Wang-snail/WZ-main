import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Zap,
  BookOpen,
  ArrowRight,
  Grid,
  List,
  Send,
  User,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Trophy,
  Flame,
  Star
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// Reddit-style 分类
const discussionCategories = [
  { id: 'hot', name: '热门', icon: Flame, color: 'text-orange-500' },
  { id: 'new', name: '最新', icon: Clock, color: 'text-blue-500' },
  { id: 'top', name: '精华', icon: Trophy, color: 'text-amber-500' },
  { id: 'question', name: '问题求助', icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
  { id: 'share', name: '经验分享', icon: Users, color: 'bg-green-100 text-green-600' },
  { id: 'workflow', name: '工作流', icon: Zap, color: 'bg-purple-100 text-purple-600' }
];

// 模拟讨论数据
const initialDiscussions = [
  {
    id: 1,
    type: 'question',
    title: '如何快速采集商品信息？有什么工具推荐吗',
    content: '大家好，我是刚入门的新手，想了解一下有什么工具可以快速采集淘宝/1688商品信息？最好是免费的...',
    author: '电商小白',
    avatar: '🐧',
    time: '2小时前',
    upvotes: 45,
    replies: 12,
    tags: ['工具推荐', '商品采集']
  },
  {
    id: 2,
    type: 'share',
    title: '分享一个批量处理图片提升效率的小技巧',
    content: '我 发现了一个批量处理商品图片的好方法，可以大幅提升效率！主要是用PS的动作功能配合批量处理...',
    author: '运营高手',
    avatar: '🚀',
    time: '5小时前',
    upvotes: 128,
    replies: 8,
    tags: ['效率提升', '图片处理']
  },
  {
    id: 3,
    type: 'workflow',
    title: '新发布了自动化商品上架工作流 v2.0',
    content: '我刚刚制作了一个完整的商品上架工作流，从采集到发布全流程自动化，支持批量处理和自动翻译...',
    author: '工具开发者',
    avatar: '⚡',
    time: '1天前',
    upvotes: 256,
    replies: 15,
    tags: ['工作流', '自动化', 'v2.0']
  },
  {
    id: 4,
    type: 'question',
    title: '如何避免1688到其他平台搬运的风险？',
    content: '最近在做1688到其他平台的搬运，但担心会遇到一些合规风险，大家有什么经验和建议吗？',
    author: '新手卖家',
    avatar: '📦',
    time: '1天前',
    upvotes: 67,
    replies: 6,
    tags: ['风险控制', '合规']
  },
  {
    id: 5,
    type: 'share',
    title: 'FBA费用计算心得：教你如何选出利润最高的产品',
    content: '研究了三个月FBA费用计算，总结了一套选品利润计算的方法，分享给大家...',
    author: '数据分析控',
    avatar: '📊',
    time: '2天前',
    upvotes: 189,
    replies: 23,
    tags: ['FBA', '选品', '利润计算']
  }
];

const popularCommunities = [
  { name: '亚马逊运营圈', members: 12580, posts: 3420 },
  { name: '选品讨论', members: 8920, posts: 2150 },
  { name: '广告投放技巧', members: 6540, posts: 1890 },
  { name: '跨境物流', members: 4320, posts: 980 },
  { name: '独立站运营', members: 5680, posts: 1420 }
];

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  upvotes: number;
}

interface Discussion {
  id: number;
  type: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  time: string;
  upvotes: number;
  replies: number;
  tags: string[];
  replyList?: Reply[];
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [selectedCategory, setSelectedCategory] = useState('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'question', tags: '' });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [upvotedIds, setUpvotedIds] = useState<number[]>([]);

  const filteredDiscussions = discussions
    .filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      if (selectedCategory === 'hot') return b.upvotes - a.upvotes;
      if (selectedCategory === 'new') return 0; // 时间排序
      if (selectedCategory === 'top') return b.upvotes - a.upvotes;
      return b.upvotes - a.upvotes;
    });

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return;
    }

    const newDiscussion: Discussion = {
      id: Date.now(),
      type: newPost.type,
      title: newPost.title,
      content: newPost.content,
      author: '匿名用户',
      avatar: '👤',
      time: '刚刚',
      upvotes: 0,
      replies: 0,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    setDiscussions([newDiscussion, ...discussions]);
    setShowNewPost(false);
    setNewPost({ title: '', content: '', type: 'question', tags: '' });
  };

  const handleReply = (discussionId: number) => {
    if (!replyContent.trim()) return;

    const updatedDiscussions = discussions.map(d => {
      if (d.id === discussionId) {
        const newReply: Reply = {
          id: Date.now().toString(),
          author: '匿名用户',
          avatar: '👤',
          content: replyContent,
          time: '刚刚',
          upvotes: 0
        };
        return {
          ...d,
          replies: d.replies + 1,
          replyList: [...(d.replyList || []), newReply]
        };
      }
      return d;
    });

    setDiscussions(updatedDiscussions);
    setReplyContent('');
    setReplyingTo(null);
  };

  const handleUpvote = (id: number) => {
    if (upvotedIds.includes(id)) {
      setUpvotedIds(prev => prev.filter(i => i !== id));
      setDiscussions(prev => prev.map(d =>
        d.id === id ? { ...d, upvotes: d.upvotes - 1 } : d
      ));
    } else {
      setUpvotedIds(prev => [...prev, id]);
      setDiscussions(prev => prev.map(d =>
        d.id === id ? { ...d, upvotes: d.upvotes + 1 } : d
      ));
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return discussionCategories.find(c => c.id === categoryId) || discussionCategories[0];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Reddit-style Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 hidden sm:block">跨境讨论</span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索讨论..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white focus:border-orange-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowNewPost(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                发布
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            {/* Sort Tabs */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
              {discussionCategories.slice(0, 3).map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    {cat.name}
                  </button>
                );
              })}
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              {discussionCategories.slice(3).map((cat) => {
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Discussion List */}
            <div className="space-y-3">
              {filteredDiscussions.map((discussion, index) => {
                const category = getCategoryInfo(discussion.type);

                return (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors flex"
                  >
                    {/* Vote Section - Reddit style */}
                    <div className="w-12 bg-gray-50 rounded-l-lg flex flex-col items-center py-3 gap-1">
                      <button
                        onClick={() => handleUpvote(discussion.id)}
                        className={`p-1 rounded hover:bg-gray-200 transition ${
                          upvotedIds.includes(discussion.id) ? 'text-orange-500' : 'text-gray-400'
                        }`}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <span className={`text-sm font-bold ${
                        upvotedIds.includes(discussion.id) ? 'text-orange-500' : 'text-gray-900'
                      }`}>
                        {discussion.upvotes}
                      </span>
                      <button className="p-1 rounded hover:bg-gray-200 transition text-gray-400">
                        <ArrowDown className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3">
                      {/* Meta info */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1 hover:bg-gray-100 px-1 rounded cursor-pointer">
                          <span className="text-sm">{discussion.avatar}</span>
                          <span className="font-medium text-gray-700">{discussion.author}</span>
                        </span>
                        <span>•</span>
                        <span>{discussion.time}</span>
                        {discussion.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {discussion.tags[0]}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-orange-600">
                        {discussion.title}
                      </h3>

                      {/* Content preview */}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {discussion.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setExpandedId(expandedId === discussion.id ? null : discussion.id)}
                          className="flex items-center gap-1.5 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{discussion.replies} 评论</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded text-sm">
                          <Share className="w-4 h-4" />
                          <span>分享</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded text-sm">
                          <Bookmark className="w-4 h-4" />
                          <span>收藏</span>
                        </button>
                        <button className="ml-auto text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expanded Comments */}
                      {expandedId === discussion.id && (
                        <div className="mt-4 border-t pt-4">
                          {/* Reply Input */}
                          <div className="flex gap-2 mb-4">
                            <Input
                              placeholder="写下你的评论..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleReply(discussion.id)}
                              disabled={!replyContent.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Comments List */}
                          {discussion.replyList && discussion.replyList.length > 0 && (
                            <div className="space-y-3">
                              {discussion.replyList.map((reply) => (
                                <div key={reply.id} className="flex gap-2">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                                    {reply.avatar}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs mb-1">
                                      <span className="font-medium">{reply.author}</span>
                                      <span className="text-gray-500">{reply.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-700">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {filteredDiscussions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无相关讨论</p>
                  <Button
                    onClick={() => setShowNewPost(true)}
                    className="mt-4 bg-orange-500 hover:bg-orange-600"
                  >
                    发起第一个讨论
                  </Button>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-72 hidden lg:block space-y-4">
            {/* About Community */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase">
                  关于社区
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  跨境电商从业者交流社区，分享运营经验、讨论问题、获取帮助。
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    12.5K 成员
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    3.2K 帖子
                  </span>
                </div>
                <Button
                  onClick={() => setShowNewPost(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  发布新帖子
                </Button>
              </CardContent>
            </Card>

            {/* Popular Communities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase">
                  热门社区
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {popularCommunities.map((community, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {community.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {community.members.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-500 uppercase">
                  快捷入口
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <Link
                    to="/tools"
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Grid className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">工具中心</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link
                    to="/wiki"
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">行业信息</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">发布新帖子</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分类
                </label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {discussionCategories.slice(3).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标题
                </label>
                <Input
                  placeholder="请输入标题..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <Textarea
                  placeholder="请输入内容..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[150px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签（用逗号分隔）
                </label>
                <Input
                  placeholder="例如：亚马逊,FBA,选品"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                取消
              </Button>
              <Button
                onClick={handleCreatePost}
                className="bg-orange-500 hover:bg-orange-600"
                disabled={!newPost.title.trim() || !newPost.content.trim()}
              >
                发布
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Helper components
function Share({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function Bookmark({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}
