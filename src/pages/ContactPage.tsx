
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', formData);
            toast.success('留言已提交，我们会尽快联系您！');
            setIsSubmitting(false);
            setFormData({ name: '', contact: '', message: '' });
            // Optional: Go back home or stay here? User usually expects to stay or get a success state.
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-8 hover:bg-gray-100"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回首页
                </Button>

                <Card className="shadow-lg border-blue-100">
                    <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-white pb-8 pt-8">
                        <CardTitle className="text-3xl font-bold text-gray-900">在线留言</CardTitle>
                        <p className="text-gray-600 mt-2">
                            有任何需求或建议？请留下您的联系方式，我们将为您提供专属服务。
                        </p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">您的称呼</Label>
                                <Input
                                    id="name"
                                    placeholder="请输入您的姓名"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact">联系方式</Label>
                                <Input
                                    id="contact"
                                    placeholder="微信 / 手机号 / 邮箱"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    required
                                    className="bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">需求描述</Label>
                                <Textarea
                                    id="message"
                                    placeholder="请详细描述您的需求，例如：我需要一个定制的选品工具..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    rows={5}
                                    className="bg-white resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    '提交中...'
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        提交留言
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ContactPage;
