import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function AmazonNewProductProcess() {
    const { t } = useTranslation();

    const metaInfo = {
        version: 'V1.0',
    };

    const stages = [
        {
            title: t('amazonSop.stages.concept'),
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: <span className="text-2xl">💡</span>,
            steps: ['01', '02', '03', '04', '05'].map(id => ({
                id,
                title: t(`amazonSop.steps.${id}.title`),
                role: t(`amazonSop.steps.${id}.role`),
                content: t(`amazonSop.steps.${id}.content`),
                outputs: t(`amazonSop.steps.${id}.outputs`, { returnObjects: true }) as string[] | undefined,
                doc: t(`amazonSop.steps.${id}.doc`, { defaultValue: '' }),
                note: t(`amazonSop.steps.${id}.note`, { defaultValue: '' })
            }))
        },
        {
            title: t('amazonSop.stages.project'),
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: <span className="text-2xl">🚀</span>,
            steps: ['06', '07', '08', '09', '10', '11', '12', '13'].map(id => ({
                id,
                title: t(`amazonSop.steps.${id}.title`),
                role: t(`amazonSop.steps.${id}.role`),
                content: t(`amazonSop.steps.${id}.content`),
                outputs: t(`amazonSop.steps.${id}.outputs`, { returnObjects: true }) as string[] | undefined,
                doc: t(`amazonSop.steps.${id}.doc`, { defaultValue: '' }),
                branch: t(`amazonSop.steps.${id}.branch`, { defaultValue: '' })
            }))
        },
        {
            title: t('amazonSop.stages.delivery'),
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: <span className="text-2xl">📦</span>,
            steps: ['14', '15', '16', '17', '18', '19', '20'].map(id => ({
                id,
                title: t(`amazonSop.steps.${id}.title`),
                role: t(`amazonSop.steps.${id}.role`),
                content: t(`amazonSop.steps.${id}.content`),
                outputs: t(`amazonSop.steps.${id}.outputs`, { returnObjects: true }) as string[] | undefined,
                doc: t(`amazonSop.steps.${id}.doc`, { defaultValue: '' }),
                branch: t(`amazonSop.steps.${id}.branch`, { defaultValue: '' })
            }))
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Navigation */}
                <div className="mb-6">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('amazonSop.backHome')}
                        </Button>
                    </Link>
                </div>

                {/* Header Document Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">{t('amazonSop.title')}</h1>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium border border-blue-100">
                            {metaInfo.version}
                        </span>
                    </div>
                </motion.div>

                {/* Timeline Content */}
                <div className="space-y-12">
                    {stages.map((stage, stageIndex) => (
                        <motion.div
                            key={stage.title}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: stageIndex * 0.1 }}
                        >
                            <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${stage.color} border`}>
                                {stage.icon}
                                <h2 className="text-xl font-bold">{stage.title}</h2>
                            </div>

                            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200">
                                {stage.steps.map((step, index) => (
                                    <div key={step.id} className="relative">
                                        {/* Circle Indicator */}
                                        <div className="absolute -left-[2.15rem] top-1.5 w-6 h-6 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                        </div>

                                        <div className="bg-white rounded-lg border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {step.id}. {step.title}
                                                    </span>
                                                </div>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {step.role}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                                {step.content}
                                            </p>

                                            {/* Detail Blocks */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {step.outputs && Array.isArray(step.outputs) && step.outputs.length > 0 && (
                                                    <div className="bg-blue-50/50 rounded p-2 text-xs">
                                                        <span className="font-semibold text-blue-700 block mb-1">{t('amazonSop.labels.outputs')}</span>
                                                        <ul className="list-disc list-inside text-blue-600/80 space-y-0.5">
                                                            {step.outputs.map((o, i) => <li key={i}>{o}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                {step.doc && (
                                                    <div className="bg-yellow-50/50 rounded p-2 text-xs h-fit">
                                                        <span className="font-semibold text-yellow-700 block mb-1">{t('amazonSop.labels.doc')}</span>
                                                        <span className="text-yellow-600/90">{step.doc}</span>
                                                    </div>
                                                )}
                                                {step.branch && (
                                                    <div className="bg-red-50/50 rounded p-2 text-xs md:col-span-2">
                                                        <span className="font-semibold text-red-700 block mb-1">{t('amazonSop.labels.branch')}</span>
                                                        <span className="text-red-600/90">{step.branch}</span>
                                                    </div>
                                                )}
                                                {step.note && (
                                                    <div className="bg-gray-50 rounded p-2 text-xs md:col-span-2 border border-dashed border-gray-200">
                                                        <span className="font-semibold text-gray-700 block mb-1">{t('amazonSop.labels.note')}</span>
                                                        <span className="text-gray-500">{step.note}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t text-center text-gray-400 text-sm">
                    <p>{t('amazonSop.footer')}</p>
                </div>
            </div>
        </div>
    );
}

