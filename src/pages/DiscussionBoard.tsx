
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft, Send, Trash2, Shield, User, MessageCircle,
    ChevronUp, ChevronDown, CornerDownRight, MoreHorizontal,
    Smile, Image as ImageIcon, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Reddit 风格的嵌套评论接口
interface NestedReply {
    id: string;
    nickname: string;
    content: string;
    date: string;
    image?: string;
    parentId?: string; // 父评论ID，用于嵌套
    children: NestedReply[]; // 子评论
    collapsed: boolean; // 是否折叠
    upVotes: number; // 点赞数
}

interface Post {
    id: string;
    nickname: string;
    content: string;
    date: string;
    image?: string;
    collapsed: boolean;
    upVotes: number;
    replyCount: number;
    replies: NestedReply[];
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const replyInputRef = useRef<HTMLTextAreaElement>(null);

    // 嵌套回复状态
    const [replyingTo, setReplyingTo] = useState<{ postId: string; replyId?: string; nickname?: string } | null>(null);
    const [replyNickname, setReplyNickname] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);

    // 加载初始数据
    useEffect(() => {
        const savedPosts = localStorage.getItem('discussion_posts');
        if (savedPosts) {
            const parsedPosts = JSON.parse(savedPosts).map((p: any) => ({
                ...p,
                image: p.image || undefined,
                collapsed: false,
                upVotes: p.upVotes || Math.floor(Math.random() * 50) + 1,
                replies: (p.replies || []).map((r: any) => ({
                    ...r,
                    collapsed: false,
                    children: r.children || [],
                    upVotes: r.upVotes || Math.floor(Math.random() * 20) + 1
                }))
            }));
            setPosts(parsedPosts);
        } else {
            const initialPosts: Post[] = [
                {
                    id: '1',
                    nickname: '跨境新人',
                    content: '这个销售目标追踪工具真的太好用了，特别是成本分析部分！',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    image: undefined,
                    collapsed: false,
                    upVotes: 15,
                    replyCount: 1,
                    replies: [
                        {
                            id: '1-1',
                            nickname: '管理员',
                            content: '感谢支持！如果有其他需求欢迎留言。',
                            date: new Date(Date.now() - 80000000).toISOString(),
                            image: undefined,
                            collapsed: false,
                            children: [],
                            upVotes: 8
                        }
                    ]
                },
                {
                    id: '2',
                    nickname: 'Amazon大卖',
                    content: '希望有更多关于选品的工具推荐，博主加油！',
                    date: new Date().toISOString(),
                    image: undefined,
                    collapsed: false,
                    upVotes: 23,
                    replyCount: 0,
                    replies: []
                }
            ];
            setPosts(initialPosts);
            localStorage.setItem('discussion_posts', JSON.stringify(initialPosts));
        }

        const adminStatus = localStorage.getItem('discussion_admin');
        if (adminStatus === 'true') setIsAdmin(true);
    }, []);

    // 保存到 localStorage
    const savePosts = (newPosts: Post[]) => {
        setPosts(newPosts);
        localStorage.setItem('discussion_posts', JSON.stringify(newPosts));
    };

    // 折叠/展开帖子
    const togglePostCollapse = (postId: string) => {
        const updatedPosts = posts.map(post =>
            post.id === postId ? { ...post, collapsed: !post.collapsed } : post
        );
        savePosts(updatedPosts);
    };

    // 折叠/展开回复
    const toggleReplyCollapse = (postId: string, replyId: string) => {
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                const updateReplies = (replies: NestedReply[]): NestedReply[] => {
                    return replies.map(r => {
                        if (r.id === replyId) {
                            return { ...r, collapsed: !r.collapsed };
                        }
                        if (r.children.length > 0) {
                            return { ...r, children: updateReplies(r.children) };
                        }
                        return r;
                    });
                };
                return { ...post, replies: updateReplies(post.replies) };
            }
            return post;
        });
        savePosts(updatedPosts);
    };

    // 递归构建回复树
    const buildReplyTree = (flatReplies: NestedReply[]): NestedReply[] => {
        const replyMap = new Map<string, NestedReply>();
        const roots: NestedReply[] = [];

        // 初始化所有回复
        flatReplies.forEach(r => {
            replyMap.set(r.id, { ...r, children: [] });
        });

        // 构建树形结构
        flatReplies.forEach(r => {
            const reply = replyMap.get(r.id)!;
            if (r.parentId && replyMap.has(r.parentId)) {
                const parent = replyMap.get(r.parentId)!;
                parent.children.push(reply);
            } else {
                roots.push(reply);
            }
        });

        return roots;
    };

    // 扁平化回复（用于保存）
    const flattenReplies = (replies: NestedReply[]): NestedReply[] => {
        const result: NestedReply[] = [];
        const traverse = (rs: NestedReply[]) => {
            rs.forEach(r => {
                const { children, ...rest } = r;
                result.push(rest as NestedReply);
                if (children.length > 0) {
                    traverse(children);
                }
            });
        };
        traverse(replies);
        return result;
    };

    // 发布主帖子
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim() && !content.trim() && !imagePreview) return;

        const newPost: Post = {
            id: Date.now().toString(),
            nickname: nickname.trim(),
            content: content.trim(),
            date: new Date().toISOString(),
            replies: [],
            collapsed: false,
            upVotes: 0,
            replyCount: 0,
            ...(imagePreview && { image: imagePreview })
        };

        savePosts([newPost, ...posts]);
        setContent('');
        setImagePreview(null);
        toast.success(t('discussion.post.success'));
    };

    // 提交回复（支持嵌套）
    const handleReplySubmit = (e: React.FormEvent, postId: string, parentId?: string) => {
        e.preventDefault();
        if (!replyNickname.trim() && !replyContent.trim() && !replyImagePreview) return;

        const newReply: NestedReply = {
            id: Date.now().toString(),
            nickname: replyNickname.trim(),
            content: replyContent.trim(),
            date: new Date().toISOString(),
            collapsed: false,
            upVotes: 0,
            children: [],
            ...(replyImagePreview && { image: replyImagePreview }),
            ...(parentId && { parentId })
        };

        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                if (!parentId) {
                    // 直接回复帖子
                    return {
                        ...post,
                        replies: [...post.replies, newReply],
                        replyCount: post.replyCount + 1
                    };
                } else {
                    // 嵌套回复
                    const addReplyToTree = (replies: NestedReply[]): NestedReply[] => {
                        return replies.map(r => {
                            if (r.id === parentId) {
                                return { ...r, children: [...r.children, newReply] };
                            }
                            if (r.children.length > 0) {
                                return { ...r, children: addReplyToTree(r.children) };
                            }
                            return r;
                        });
                    };
                    return {
                        ...post,
                        replies: addReplyToTree(post.replies),
                        replyCount: post.replyCount + 1
                    };
                }
            }
            return post;
        });

        savePosts(updatedPosts);
        setReplyingTo(null);
        setReplyContent('');
        setReplyImagePreview(null);
        toast.success(t('discussion.reply.success'));
    };

    // 删除帖子
    const handleDelete = (id: string) => {
        if (!window.confirm(t('discussion.admin.deleteConfirm'))) return;
        const updatedPosts = posts.filter(post => post.id !== id);
        savePosts(updatedPosts);
        toast.success(t('discussion.admin.deleted'));
    };

    // 删除回复（递归）
    const handleDeleteReply = (postId: string, replyId: string) => {
        if (!window.confirm(t('discussion.admin.deleteReplyConfirm'))) return;
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                const removeReply = (replies: NestedReply[]): { replies: NestedReply[]; count: number } => {
                    let count = 0;
                    const filtered = replies.filter(r => {
                        if (r.id === replyId) {
                            count = 1 + countChildren(r);
                            return false;
                        }
                        if (r.children.length > 0) {
                            const result = removeReply(r.children);
                            r.children = result.replies;
                            count += result.count;
                        }
                        return true;
                    });
                    return { replies: filtered, count };
                };
                const result = removeReply(post.replies);
                return {
                    ...post,
                    replies: result.replies,
                    replyCount: Math.max(0, post.replyCount - result.count)
                };
            }
            return post;
        });
        savePosts(updatedPosts);
        toast.success(t('discussion.admin.deleted'));
    };

    const countChildren = (reply: NestedReply): number => {
        let count = 1;
        reply.children.forEach(c => {
            count += countChildren(c);
        });
        return count;
    };

    // 点赞
    const handleUpvote = (postId: string, replyId?: string) => {
        const updatedPosts = posts.map(post => {
            if (post.id === postId) {
                if (!replyId) {
                    return { ...post, upVotes: post.upVotes + 1 };
                }
                const updateReplyVotes = (replies: NestedReply[]): NestedReply[] => {
                    return replies.map(r => {
                        if (r.id === replyId) {
                            return { ...r, upVotes: r.upVotes + 1 };
                        }
                        if (r.children.length > 0) {
                            return { ...r, children: updateReplyVotes(r.children) };
                        }
                        return r;
                    });
                };
                return { ...post, replies: updateReplyVotes(post.replies) };
            }
            return post;
        });
        savePosts(updatedPosts);
    };

    // 管理员登录
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

    // 管理员登出
    const handleAdminLogout = () => {
        setIsAdmin(false);
        localStorage.removeItem('discussion_admin');
        toast.success(t('discussion.admin.modeOff'));
    };

    // 图片上传
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 开始回复
    const startReply = (postId: string, replyId?: string, replyNickname?: string) => {
        setReplyingTo({ postId, replyId, nickname: replyNickname });
        if (nickname) setReplyNickname(nickname);
        setReplyContent('');
        setReplyImagePreview(null);
        setTimeout(() => replyInputRef.current?.focus(), 100);
    };

    // 递归渲染回复（Reddit 风格）
    const renderReply = (reply: NestedReply, postId: string, depth: number = 0): React.ReactNode => {
        const isCollapsed = reply.collapsed;
        const hasChildren = reply.children.length > 0;

        return (
            <div
                key={reply.id}
                className={`${depth > 0 ? 'ml-4' : ''} mt-3`}
                style={{ marginLeft: depth > 0 ? '24px' : undefined }}
            >
                {/* Reddit 风格：左侧边栏 */}
                <div className="flex">
                    {/* 缩进线和操作区 */}
                    <div className="flex flex-col items-center mr-2">
                        <button
                            onClick={() => handleUpvote(postId, reply.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        </button>
                        <span className="text-xs font-medium text-gray-700">{reply.upVotes}</span>
                        {hasChildren && (
                            <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                        )}
                    </div>

                    {/* 内容区 */}
                    <div className="flex-1 min-w-0">
                        {/* 评论头部 */}
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => toggleReplyCollapse(postId, reply.id)}
                                className="hover:bg-gray-100 rounded"
                            >
                                {isCollapsed ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                {reply.nickname.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-gray-800">{reply.nickname}</span>
                            <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(reply.date), { addSuffix: true })}
                            </span>
                        </div>

                        {/* 评论内容（折叠时隐藏） */}
                        {!isCollapsed && (
                            <>
                                {reply.content && (
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ml-6">
                                        {reply.content}
                                    </p>
                                )}
                                {reply.image && (
                                    <div className="ml-6 mt-2">
                                        <img
                                            src={reply.image}
                                            alt="Reply"
                                            className="max-w-md rounded-lg border border-gray-200"
                                        />
                                    </div>
                                )}

                                {/* 操作栏 */}
                                <div className="flex items-center gap-3 ml-6 mt-2">
                                    <button
                                        onClick={() => startReply(postId, reply.id, reply.nickname)}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                                    >
                                        <CornerDownRight className="w-3 h-3" />
                                        回复
                                    </button>
                                    <button
                                        onClick={() => handleUpvote(postId, reply.id)}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                                    >
                                        <ChevronUp className="w-3 h-3" />
                                        赞 ({reply.upVotes})
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDeleteReply(postId, reply.id)}
                                            className="text-xs text-red-400 hover:text-red-600"
                                        >
                                            删除
                                        </button>
                                    )}
                                </div>

                                {/* 嵌套回复 */}
                                {hasChildren && (
                                    <div className="mt-2">
                                        {reply.children.map(child => renderReply(child, postId, depth + 1))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* 顶部导航 */}
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

                {/* 管理员登录 */}
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
                    {/* 左侧：发帖表单 */}
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
                                        <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${imagePreview ? 'border-gray-300' : 'border-gray-200 hover:border-blue-300'}`}>
                                            <Textarea
                                                id="content"
                                                placeholder={t('discussion.post.contentPlaceholder')}
                                                value={content}
                                                onChange={(e: any) => setContent(e.target.value)}
                                                required={!imagePreview}
                                                rows={6}
                                                maxLength={500}
                                                className="resize-none border-0 focus:ring-0 focus:outline-none"
                                            />
                                            <div className="text-right text-xs text-gray-400 mt-1">
                                                {content.length}/500
                                            </div>

                                            {imagePreview && (
                                                <div className="mt-3 relative group">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="max-w-full h-auto rounded-md border border-gray-200"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        className="absolute top-2 right-2 h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => setImagePreview(null)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                                            <span>支持拖拽图片</span>
                                            <label className="relative cursor-pointer text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                <ImageIcon className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, setImagePreview)}
                                                    className="hidden"
                                                />
                                                添加图片
                                            </label>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                                        {t('discussion.post.submit')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 右侧：帖子列表 */}
                    <div className="lg:col-span-3 space-y-4">
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
                                <Card key={post.id} className="hover:shadow-md transition-shadow overflow-hidden">
                                    <CardContent className="p-0">
                                        {/* Reddit 风格帖子头部 */}
                                        <div className="flex">
                                            {/* 左侧：投票区 */}
                                            <div className="w-12 bg-gray-50/50 p-3 flex flex-col items-center gap-1 border-r border-gray-100">
                                                <button
                                                    onClick={() => handleUpvote(post.id)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    <ChevronUp className="w-5 h-5 text-gray-400 hover:text-orange-500" />
                                                </button>
                                                <span className="text-sm font-bold text-gray-800">{post.upVotes}</span>
                                                <button
                                                    onClick={() => togglePostCollapse(post.id)}
                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                >
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                </button>
                                            </div>

                                            {/* 右侧：内容区 */}
                                            <div className="flex-1 p-4">
                                                {/* 帖子信息 */}
                                                <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                                        {post.nickname.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{post.nickname}</span>
                                                    <span>·</span>
                                                    <span>{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</span>
                                                </div>

                                                {/* 帖子内容（折叠时只显示标题） */}
                                                {post.collapsed ? (
                                                    <div
                                                        className="cursor-pointer text-gray-600 text-sm"
                                                        onClick={() => togglePostCollapse(post.id)}
                                                    >
                                                        {post.content.substring(0, 100)}...
                                                        <span className="text-blue-500 ml-2">展开</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {post.content && (
                                                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">
                                                                {post.content}
                                                            </p>
                                                        )}
                                                        {post.image && (
                                                            <div className="mb-3">
                                                                <img
                                                                    src={post.image}
                                                                    alt="Post content"
                                                                    className="max-w-full rounded-lg border border-gray-200"
                                                                />
                                                            </div>
                                                        )}

                                                        {/* 操作栏 */}
                                                        <div className="flex items-center gap-4 py-2 border-t border-gray-100">
                                                            <button
                                                                onClick={() => startReply(post.id)}
                                                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                                            >
                                                                <MessageCircle className="w-4 h-4" />
                                                                {post.replyCount} 条回复
                                                            </button>
                                                            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                                                <Share className="w-4 h-4" />
                                                                分享
                                                            </button>
                                                            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                                                <Smile className="w-4 h-4" />
                                                                表情
                                                            </button>
                                                            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                            {isAdmin && (
                                                                <button
                                                                    onClick={() => handleDelete(post.id)}
                                                                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 ml-auto"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* 回复输入框 */}
                                                        {replyingTo?.postId === post.id && (
                                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                                                                <div className="text-xs text-gray-500 mb-2">
                                                                    回复 {replyingTo.nickname ? `@${replyingTo.nickname}` : '帖子'}
                                                                </div>
                                                                <form onSubmit={(e) => handleReplySubmit(e, post.id, replyingTo.replyId)}>
                                                                    <div className="flex gap-2">
                                                                        <Input
                                                                            placeholder={t('discussion.post.nicknameLabel')}
                                                                            value={replyNickname}
                                                                            onChange={(e: any) => setReplyNickname(e.target.value)}
                                                                            className="flex-1 h-8 text-sm"
                                                                            required={!replyImagePreview}
                                                                        />
                                                                        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                                            回复
                                                                        </Button>
                                                                    </div>
                                                                    <div className="mt-2 relative">
                                                                        <Textarea
                                                                            ref={replyInputRef}
                                                                            placeholder={t('discussion.reply.placeholder')}
                                                                            value={replyContent}
                                                                            onChange={(e: any) => setReplyContent(e.target.value)}
                                                                            className="w-full text-sm resize-none border-gray-200"
                                                                            rows={2}
                                                                            required={!replyImagePreview}
                                                                        />
                                                                        {replyImagePreview && (
                                                                            <div className="absolute bottom-2 right-2">
                                                                                <img
                                                                                    src={replyImagePreview}
                                                                                    alt="Preview"
                                                                                    className="h-12 w-12 object-cover rounded border"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => setReplyImagePreview(null)}
                                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex justify-between items-center mt-2">
                                                                        <label className="cursor-pointer text-blue-500 hover:text-blue-700">
                                                                            <ImageIcon className="w-4 h-4" />
                                                                            <input
                                                                                type="file"
                                                                                accept="image/*"
                                                                                onChange={(e) => handleImageUpload(e, setReplyImagePreview)}
                                                                                className="hidden"
                                                                            />
                                                                        </label>
                                                                        <div className="flex gap-2">
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setReplyingTo(null)}
                                                                                className="h-7 text-xs"
                                                                            >
                                                                                取消
                                                                            </Button>
                                                                            <Button
                                                                                type="submit"
                                                                                size="sm"
                                                                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                                                            >
                                                                                发布
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                        )}

                                                        {/* 嵌套回复列表 */}
                                                        {post.replies.length > 0 && (
                                                            <div className="mt-4 space-y-2">
                                                                {buildReplyTree(post.replies).map(reply =>
                                                                    renderReply(reply, post.id)
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
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

// 简单的 Share 组件替代
const Share = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
);

export default DiscussionBoard;
