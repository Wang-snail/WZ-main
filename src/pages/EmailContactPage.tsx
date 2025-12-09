
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const EmailContactPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const email = "support@wsnail.com"; // Assuming this is the email from footer
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(email);
        setCopied(true);
        toast.success(t('contactPage.copied'));
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenMail = () => {
        window.location.href = `mailto:${email}`;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <Card className="max-w-md w-full shadow-lg border-blue-100">
                <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-white pb-8 pt-8 relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="absolute left-4 top-4 hover:bg-white/50"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Button>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{t('contactPage.title')}</CardTitle>
                    <p className="text-gray-600 mt-2">
                        {t('contactPage.subtitle')}
                    </p>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                        <span className="font-mono text-gray-700 font-medium">{email}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            className="text-gray-400 hover:text-blue-600"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>

                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-blue-200 shadow-lg"
                        onClick={handleOpenMail}
                    >
                        <Mail className="w-5 h-5 mr-2" />
                        {t('contactPage.sendEmail')}
                    </Button>

                    <div className="text-center text-sm text-gray-400">
                        {t('contactPage.wechat')} <span className="font-bold text-gray-600">Reaper-B</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmailContactPage;
