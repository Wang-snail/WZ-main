import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AmazonNewProductProcess() {
    const metaInfo = {
        version: 'V1.0',
    };

    const stages = [
        {
            title: '第一阶段：产品概念阶段',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: <span className="text-2xl">💡</span>,
            steps: [
                {
                    id: '01',
                    title: '产品规划',
                    role: '产品部门',
                    content: '产品部门根据运营需求、公司规划，形成产品初步构想，和产品决策层沟通，达成一致。',
                },
                {
                    id: '02',
                    title: '市场调研',
                    role: '产品部门',
                    content: '开展市场调研，并输出《市场调研报告》给到运营部门和产品决策层。',
                    outputs: [
                        '目标市场容量及客户分析',
                        '产品核心卖点和利润分析',
                        '产品竞争力和风险分析',
                        '对标竞品分析（TOP5差评分析）'
                    ]
                },
                {
                    id: '03',
                    title: '产品需求定义',
                    role: '产品部门',
                    content: '进行产品需求定义，输出《产品需求文档》（PRD）。',
                    outputs: [
                        '销售市场国家及认证要求',
                        '产品定位：使用场景、卖点，特定使用人群',
                        '产品规格参数、配置、外观&配色等',
                        '产品功能定义，UI/软硬件交互',
                        '产品包装、配件定义',
                        '竞品品牌型号、链接等'
                    ]
                },
                {
                    id: '04',
                    title: '组织评审（PRD评审）',
                    role: '产品部门（组织）、运营、品质',
                    content: '产品完成PRD后，组织运营、品质对PRD进行评审。部分定义不清或不合理的，需修订后重新评审。',
                    doc: '《PRD评审会议记录》'
                },
                {
                    id: '05',
                    title: '发布PRD',
                    role: '产品部门',
                    content: 'PRD评审通过后，邮件正式发布PRD。后续PRD变更，需重新评审后，再次通过邮件，对PRD版本升级发布。',
                    note: '关键控制点：PRD评审和发布为概念阶段关键输出；运营部门依据此文档制定销售和运营、推广计划等；品质部门待标准制定、样品测试和判定的依据之一。'
                }
            ]
        },
        {
            title: '第二阶段：产品立项阶段',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: <span className="text-2xl">🚀</span>,
            steps: [
                {
                    id: '06',
                    title: '寻找目标产品',
                    role: '产品部门、供应商',
                    content: '产品按照PRD需求，寻找目标产品（功能样），并让供应商提供样品及产品资料。要求：目标产品≥3，样品数：每款≥2。',
                    outputs: ['产品规格书', 'BOM表', '认证报告', '测试报告']
                },
                {
                    id: '07',
                    title: '样品测试',
                    role: '产品、运营（体验）；品质（测试）',
                    content: '目标样品，应由产品、运营进行体验测试，以及品质进行品质测试。',
                    doc: '《体验报告》、《品质测试报告》'
                },
                {
                    id: '08',
                    title: '组织评审（样品测试及变更）',
                    role: '产品部门（组织）、运营、品质',
                    content: '产品、运营、品质分别测试后，应由产品组织评审，对样品测试中发现的问题、解决方案及需求变更进行评审。',
                    doc: '《样品评审会议记录》'
                },
                {
                    id: '09',
                    title: '品质标准输出',
                    role: '品质部门',
                    content: '品质部门应在样品测试和评审后，制定品质标准，并正式释放给采购部门。',
                    doc: '《品质标准》'
                },
                {
                    id: '10',
                    title: '商务条件谈判',
                    role: '采购/商务部门',
                    content: '采购部门应跟运营、产品部门沟通采购计划，以采购计划和品质标准、付款条件等为依据，与供应商进行商务谈判，初步达成一致。'
                },
                {
                    id: '11',
                    title: '参与审厂',
                    role: '采购（组织）、产品、品质',
                    content: '重点产品或采购金额>50万，必须审厂。三方分别输出报告，品质汇总评分，判定是否导入。',
                    doc: '《审厂报告》'
                },
                {
                    id: '12',
                    title: '组织产品立项（立项评审）',
                    role: '产品部门（组织）、运营、采购、品质',
                    content: '样品测试和审厂通过后，产品应组织产品、运营、采购、品质、产品决策层会议进行立项评审。'
                },
                {
                    id: '13',
                    title: '立项决策',
                    role: '产品决策层',
                    content: '由产品决策层最终决策是否下单采购。产品主导签核《产品立项会签表》。',
                    branch: '立项通过 -> 安排打样；不通过 -> 流程结束',
                    doc: '《产品立项会签表》'
                }
            ]
        },
        {
            title: '第三阶段：产品交付阶段',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: <span className="text-2xl">📦</span>,
            steps: [
                {
                    id: '14',
                    title: '安排打样',
                    role: '采购部门',
                    content: '产品立项通过后，由采购主导最终样品打样和样品费用支付事项。',
                    outputs: ['最终样品3套-含包装（1套回签给供方）']
                },
                {
                    id: '15',
                    title: '组织签样',
                    role: '产品部门（组织）、运营、品质',
                    content: '收到最终样品后，由产品组织运营、品质共同签样。公司留两套签样样品（品质一套，运营一套）。',
                    outputs: ['签样3套']
                },
                {
                    id: '16',
                    title: '订单下达',
                    role: '采购/商务部门',
                    content: '最终样品签样完成后，由采购按流程下达订单。'
                },
                {
                    id: '17',
                    title: '生产',
                    role: '供应商（生产）、采购（监控）',
                    content: '供应商收到订单后，应按订单计划生产。采购应监控生产计划，并在生前/生后知会品质和运营。',
                    doc: '验货计划'
                },
                {
                    id: '18',
                    title: '验货',
                    role: '品质部门',
                    content: '品质部门收到验货通知后，了解进度，安排QC外验和到仓验货。QC验货完成后，次日下班前出具报告。',
                    branch: '合格 -> 发货；不合格 -> 整改/重产 (回到步骤17)',
                    doc: '《验货报告》'
                },
                {
                    id: '19',
                    title: '物流运输、入库',
                    role: '采购、物流部门',
                    content: '验货完成后，采购、物流部门应根据计划执行运输、入库。'
                },
                {
                    id: '20',
                    title: '上架销售',
                    role: '运营部门',
                    content: '运营部门根据入仓情况，安排上架销售。流程结束。'
                }
            ]
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
                            返回首页
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
                        <h1 className="text-3xl font-bold text-gray-900">亚马逊新品导入流程 SOP</h1>
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
                                                {step.outputs && (
                                                    <div className="bg-blue-50/50 rounded p-2 text-xs">
                                                        <span className="font-semibold text-blue-700 block mb-1">📋 核心输出/内容：</span>
                                                        <ul className="list-disc list-inside text-blue-600/80 space-y-0.5">
                                                            {step.outputs.map((o, i) => <li key={i}>{o}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                {step.doc && (
                                                    <div className="bg-yellow-50/50 rounded p-2 text-xs h-fit">
                                                        <span className="font-semibold text-yellow-700 block mb-1">📑 输出文档：</span>
                                                        <span className="text-yellow-600/90">{step.doc}</span>
                                                    </div>
                                                )}
                                                {step.branch && (
                                                    <div className="bg-red-50/50 rounded p-2 text-xs md:col-span-2">
                                                        <span className="font-semibold text-red-700 block mb-1">🔀 决策分支：</span>
                                                        <span className="text-red-600/90">{step.branch}</span>
                                                    </div>
                                                )}
                                                {step.note && (
                                                    <div className="bg-gray-50 rounded p-2 text-xs md:col-span-2 border border-dashed border-gray-200">
                                                        <span className="font-semibold text-gray-700 block mb-1">📌 备注：</span>
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
                    <p>© 2022-2025 WSNAIL SOP Management System</p>
                </div>
            </div>
        </div>
    );
}
