import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../../components/ui/accordion";

export default function DataSecurityFAQ() {
    const faqs = [
        {
            question: "我的店铺数据安全吗？",
            answer: "绝对安全。我们采用企业级银行加密标准（AES-256）保护您的所有数据。您的店铺授权令牌（Token）仅存储在本地或经过多重加密的服务器中，绝不会泄露给第三方。"
        },
        {
            question: "你们会保存我的选品数据吗？",
            answer: "不会。您的搜索记录和选品分析属于您的私有资产。我们严格遵守隐私政策，不会利用用户数据进行自营或出售给竞争对手。"
        },
        {
            question: "可以在什么设备上使用？",
            answer: "WSNAIL是基于云端的SaaS平台，支持电脑、平板和手机。只要有网络，您就可以随时随地查看数据和管理店铺。"
        },
        {
            question: "我可以取消订阅吗？",
            answer: "当然可以。我们提供灵活的订阅方案，您可以随时在后台取消订阅，没有任何隐形费用。"
        }
    ];

    return (
        <section className="py-20 relative z-10 bg-white/50 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        数据安全与常见问题
                    </h2>
                    <p className="text-gray-600">
                        我们深知数据对卖家的重要性，安全是我们的底线
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-lg font-medium text-gray-800 hover:text-blue-600 text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4">
                        <Lock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-800">SSL加密传输</h3>
                        <p className="text-sm text-gray-500">全程HTTPS安全协议</p>
                    </div>
                    <div className="p-4">
                        <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-800">数据隔离存储</h3>
                        <p className="text-sm text-gray-500">用户数据独立存储</p>
                    </div>
                    <div className="p-4">
                        <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-800">隐私保护承诺</h3>
                        <p className="text-sm text-gray-500">严格遵守隐私法规</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
