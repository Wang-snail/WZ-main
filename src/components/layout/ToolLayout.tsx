import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ToolLayoutProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    result?: React.ReactNode;
    loading?: boolean;
}

export default function ToolLayout({ title, description, children, result, loading }: ToolLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            返回工具箱
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
                    {description && (
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
                    )}
                </div>

                {/* Input Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
                >
                    {children}
                </motion.div>

                {/* Loading Animation */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600 animate-pulse">AI正在思考中...</p>
                    </div>
                )}

                {/* Result Area */}
                {result && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 mb-12 ring-2 ring-blue-50"
                    >
                        <div className="flex items-center gap-2 mb-6 text-blue-600 font-semibold border-b border-blue-100 pb-4">
                            <Zap className="w-5 h-5" />
                            生成结果
                        </div>
                        <div className="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-lg">
                            {result}
                        </div>
                    </motion.div>
                )}

                {/* Bottom Traffic Driver (WeChat) */}
                <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold mb-2">需要更专业的跨境电商解决方案？</h3>
                            <p className="text-blue-100 mb-6">添加顾问微信，获取 1对1 运营指导和更多内部工具</p>
                            <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-6 rounded-xl shadow-xl">
                                立即添加顾问微信
                            </Button>
                        </div>
                        {/* Placeholder for QRCode */}
                        <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                            <span className="text-sm">二维码占位</span>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
}
