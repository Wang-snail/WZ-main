
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send, Trash2, Shield, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Reply {
    id: string;
    nickname: string;
    content: string;
    date: string;
}

interface Post {
    id: string;
    nickname: string;
    content: string;
    date: string;
    replies: Reply[];
}

const DiscussionBoard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [nickname, setNickname] = useState('');
    const [content, setContent] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');

    // Reply State
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyNickname, setReplyNickname] = useState('');
    const [replyContent, setReplyContent] = useState('');

    // Load posts from localStorage on mount
    useEffect(() => {
        const savedPosts = localStorage.getItem('discussion_posts');
        if (savedPosts) {
            // Migrate old data if it doesn't have replies
            const parsedPosts = JSON.parse(savedPosts).map((p: any) => ({
                ...p,
                replies: p.replies || []
            }));
            setPosts(parsedPosts);
        } else {
            const initialPosts: Post[] = [
                {
                    id: '1',
                    nickname: '跨境新人',
                    content: '这个销售目标追踪工具真的太好用了，特别是成本分析部分！',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    replies: [
                        {
                            id: '1-1',
                            nickname: '管理员',
                            content: '感谢支持！如果有其他需求欢迎留言。',
                            date: new Date(Date.now() - 80000000).toISOString()
                        }
                    ]
                },
                {
                    id: '2',
                    nickname: 'Amazon大卖',
                    content: '希望由于更多关于选品的工具推荐，博主加油！',
                    date: new Date().toISOString(),
                    replies: []
                }
            ];
            setPosts(initialPosts);
            localStorage.setItem('discussion_posts', JSON.stringify(initialPosts));
        }

        // Check admin status
        const adminStatus = localStorage.getItem('discussion_admin');
        if (adminStatus === 'true') setIsAdmin(true);
    }, []);

    const savePosts = (newPosts: Post[]) => {
        setPosts(newPosts);
        localStorage.setItem('discussion_posts', JSON.stringify(newPosts));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim() || !content.trim()) return;

        const newPost: Post = {
            id: Date.now().toString(),
            nickname: nickname.trim(),
            content: content.trim(),
            date: new Date().toISOString(),
            replies: []
        };

        savePosts([newPost, ...posts]);
        setContent('');
        toast.success(t('discussion.post.success'));
    };

    const handleReplySubmit = (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!replyNickname.trim() || !replyContent.trim()) return;

        const newReply: Reply = {
            id: Date.now().toString(),
            nickname: replyNickname.trim(),
            content: replyContent.trim(),
            date: new Date().toISOString()
        };

        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    replies: [...post.replies, newReply]
                };
            }
            return post;
        });

        savePosts(updatedPosts);
        setReplyingTo(null);
        setReplyContent('');
        toast.success(t('discussion.reply.success'));
    };

    const handleDelete = (id: string) => {
        if (!window.confirm(t('discussion.admin.deleteConfirm'))) return;
        const updatedPosts = posts.filter(post => post.id !== id);
        savePosts(updatedPosts);
        toast.success(t('discussion.admin.deleted'));
    };

    const handleDeleteReply = (postId: string, replyId: string) => {
        if (!window.confirm(t('discussion.admin.deleteReplyConfirm'))) return;
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    replies: post.replies.filter(reply => reply.id !== replyId)
                };
            }
            return post;
        });
        savePosts(updatedPosts);
        toast.success(t('discussion.admin.deleted'));
    };

    const handleAdminLogin = () => {
        if (adminPassword === 'admin888') {
            setIsAdmin(true);
            localStorage.setItem('discussion_admin', 'true');
            setShowAdminLogin(false);
            setAdminPassword('');
            toast.success(t('discussion.admin.modeOn'));
        } else {
            toast.error('Admin Password Error');
        }
    };

    const handleAdminLogout = () => {
        setIsAdmin(false);
        localStorage.removeItem('discussion_admin');
        toast.success(t('discussion.admin.modeOff'));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('discussion.backHome')}
                    </Button>

                    <div className="flex items-center gap-2">
                        {isAdmin ? (
                            <Button variant="outline" size="sm" onClick={handleAdminLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                                <Shield className="w-4 h-4 mr-2" />
                                {t('discussion.admin.logout')}
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => setShowAdminLogin(!showAdminLogin)} className="text-gray-400">
                                <Shield className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Admin Login Dialog */}
                {showAdminLogin && !isAdmin && (
                    <Card className="mb-6 border-orange-200 bg-orange-50 max-w-md mx-auto">
                        <CardContent className="flex items-center gap-4 py-4">
                            <Input
                                type="password"
                                placeholder={t('discussion.admin.placeholder')}
                                value={adminPassword}
                                onChange={(e: any) => setAdminPassword(e.target.value)}
                                className="bg-white"
                            />
                            <Button onClick={handleAdminLogin}>{t('discussion.admin.login')}</Button>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Input Form (Takes 1/4 space on large screens) */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4 shadow-md border-blue-100">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-4">
                                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-blue-600" />
                                    {t('discussion.post.new')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nickname">{t('discussion.post.nicknameLabel')}</Label>
                                        <Input
                                            id="nickname"
                                            placeholder={t('discussion.post.nicknamePlaceholder')}
                                            value={nickname}
                                            onChange={(e: any) => setNickname(e.target.value)}
                                            required
                                            maxLength={20}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">{t('discussion.post.contentLabel')}</Label>
                                        <Textarea
                                            id="content"
                                            placeholder={t('discussion.post.contentPlaceholder')}
                                            value={content}
                                            onChange={(e: any) => setContent(e.target.value)}
                                            required
                                            rows={6}
                                            maxLength={500}
                                            className="resize-none"
                                        />
                                        <div className="text-right text-xs text-gray-400">
                                            {content.length}/500
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                        {t('discussion.post.submit')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Post List */}
                    <div className="lg:col-span-3 space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {t('discussion.title')}
                            <span className="text-sm font-normal text-gray-500 ml-2">({posts.length} {t('discussion.post.count')})</span>
                        </h2>

                        {posts.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-100">
                                {t('discussion.post.emptyList')}
                            </div>
                        ) : (
                            posts.map((post) => (
                                <Card key={post.id} className="hover:shadow-md transition-shadow group">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {post.nickname.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{post.nickname}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {format(new Date(post.date), 'yyyy-MM-dd HH:mm')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-400 hover:text-blue-600"
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === post.id ? null : post.id);
                                                        // Auto-fill nickname if user already typed one in the main form or previous reply
                                                        if (nickname) setReplyNickname(nickname);
                                                    }}
                                                >
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                    {t('discussion.reply.action')}
                                                </Button>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(post.id)}
                                                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap pl-10 mb-4">
                                            {post.content}
                                        </p>

                                        {/* Replies List */}
                                        {post.replies && post.replies.length > 0 && (
                                            <div className="ml-10 bg-gray-50 rounded-lg p-3 space-y-3">
                                                {post.replies.map(reply => (
                                                    <div key={reply.id} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0 flex justify-between group/reply">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-sm text-gray-800">{reply.nickname}</span>
                                                                <span className="text-xs text-gray-400">{format(new Date(reply.date), 'yyyy-MM-dd HH:mm')}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{reply.content}</p>
                                                        </div>
                                                        {isAdmin && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteReply(post.id, reply.id)}
                                                                className="h-6 w-6 text-red-300 hover:text-red-600 opacity-0 group-hover/reply:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reply Input Area */}
                                        {replyingTo === post.id && (
                                            <div className="ml-10 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                                <form onSubmit={(e) => handleReplySubmit(e, post.id)}>
                                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                                        <div className="col-span-1">
                                                            <Input
                                                                placeholder={t('discussion.post.nicknameLabel')}
                                                                value={replyNickname}
                                                                onChange={(e: any) => setReplyNickname(e.target.value)}
                                                                className="bg-white h-8 text-sm"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Input
                                                                placeholder={t('discussion.reply.placeholder')}
                                                                value={replyContent}
                                                                onChange={(e: any) => setReplyContent(e.target.value)}
                                                                className="bg-white h-8 text-sm"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setReplyingTo(null)}
                                                            className="h-7 text-xs"
                                                        >
                                                            {t('discussion.reply.cancel')}
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            size="sm"
                                                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            {t('discussion.reply.submit')}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscussionBoard;
