import React from 'react';
import { SEO } from '@/components/seo/SEO';
import MarketAnalysisCore from './MarketAnalysisCore';

export default function MarketAnalysis() {
    // 结构化数据
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'WSNAIL 市场分析战略决策系统',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'Web Browser',
        'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'CNY'
        },
        'description': '基于波特五力模型的电商战略决策辅助工具，帮助产品经理和电商运营进行市场分析和竞品调研。',
        'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.8',
            'ratingCount': '120'
        }
    };

    return (
        <>
            <SEO
                title="免费电商战略推演工具 - 市场分析与竞品调研"
                description="专为产品经理和电商运营设计的在线战略推演系统。基于波特五力模型，通过市场饱和度、供应链能力、竞品分析，自动生成成本领先或差异化营销策略。"
                keywords={[
                    '亚马逊选品工具',
                    '电商战略分析',
                    '竞品调研模板',
                    '波特五力模型在线',
                    '产品生命周期管理',
                    '市场分析工具',
                    '电商决策系统',
                    '成本领先战略',
                    '差异化战略'
                ]}
                canonical="https://www.wsnail.com/tools/market-analysis"
                ogTitle="我的产品该打价格战还是差异化？用这个沙盘推演一下"
                ogDescription="输入调研数据，AI自动生成你的电商营销策略书。免费使用，无需注册。"
                structuredData={structuredData}
            />

            <MarketAnalysisCore />

            {/* SEO 内容区域 - 给搜索引擎看 */}
            <SEOContent />
        </>
    );
}

// SEO 内容组件
function SEOContent() {
    return (
        <section className="max-w-4xl mx-auto py-16 px-6 bg-white">
            <article className="prose prose-blue max-w-none">
                <h1>如何使用 WSNAIL 进行市场调研与战略定位？</h1>

                <p className="lead">
                    对于<strong>亚马逊产品经理</strong>和<strong>电商运营</strong>来说，确定是走
                    <strong>成本领先战略</strong>还是<strong>差异化战略</strong>至关重要。
                    WSNAIL 市场分析系统基于<strong>波特五力模型</strong>，帮助您快速完成市场调研和战略定位。
                </p>

                <h2>什么是成本领先战略？</h2>
                <p>
                    成本领先战略是指通过优化供应链、提高生产效率、降低运营成本，
                    以更低的价格占领市场份额。这种策略适合：
                </p>
                <ul>
                    <li>供应链能力强的卖家</li>
                    <li>市场竞争激烈的红海品类</li>
                    <li>标准化程度高的产品</li>
                    <li>价格敏感度高的用户群体</li>
                </ul>

                <h2>如何判断亚马逊市场是否饱和？</h2>
                <p>
                    通过分析以下指标，系统会自动计算市场饱和度评分：
                </p>
                <ul>
                    <li><strong>关键词搜索量</strong>：月搜索量与竞品数量的比值</li>
                    <li><strong>头部卖家占比</strong>：前10名卖家的市场份额</li>
                    <li><strong>新品存活率</strong>：近6个月新品的留存情况</li>
                    <li><strong>价格战程度</strong>：同类产品的价格波动幅度</li>
                </ul>

                <h2>使用指南</h2>
                <p>完整的市场分析流程分为5个步骤：</p>

                <h3>1. 产品分析</h3>
                <p>
                    在左侧"了解产品"面板中，详细输入产品的外观、功能、使用方法和核心元器件信息。
                    这些信息将帮助系统评估产品的<strong>创新程度</strong>和<strong>技术壁垒</strong>。
                </p>

                <h3>2. 用户研究</h3>
                <p>
                    分析目标用户的地区分布、年龄段、购买习惯和收入水平。
                    系统会根据这些数据计算<strong>用户购买力评分</strong>，判断价格策略的空间。
                </p>

                <h3>3. 市场评估</h3>
                <p>
                    评估宏观环境（政策法规、经济趋势）、行业态势（集中度、差异化程度）和供求关系。
                    这是判断<strong>市场饱和度</strong>的关键步骤。
                </p>

                <h3>4. 竞品调研</h3>
                <p>
                    深入分析竞品的产品特点、品牌定位和价格策略。
                    系统会评估<strong>竞品强度</strong>，帮助您找到差异化切入点。
                </p>

                <h3>5. 供应链评估</h3>
                <p>
                    评估合作伙伴的生产能力、配合度和成本结构。
                    <strong>供应链能力</strong>直接决定了成本领先战略的可行性。
                </p>

                <h2>常见问题 (FAQ)</h2>

                <h3>这个工具适合亚马逊 FBA 卖家吗？</h3>
                <p>
                    非常适合。它可以帮助 FBA 卖家：
                </p>
                <ul>
                    <li>计算预期 ROI 和回本周期</li>
                    <li>评估库存周转率</li>
                    <li>制定合理的定价策略</li>
                    <li>根据市场饱和度选择最优竞争策略</li>
                </ul>

                <h3>需要注册登录吗？</h3>
                <p>
                    <strong>完全免费，无需注册</strong>。所有数据都在浏览器本地处理，
                    不会上传到服务器，充分保护您的商业隐私。
                </p>

                <h3>支持哪些电商平台？</h3>
                <p>
                    适用于所有电商平台的产品战略分析，包括：
                </p>
                <ul>
                    <li>亚马逊（Amazon）</li>
                    <li>Shopee（虾皮）</li>
                    <li>TikTok Shop</li>
                    <li>速卖通（AliExpress）</li>
                    <li>Temu</li>
                    <li>独立站（Shopify）</li>
                </ul>

                <h3>推演结果准确吗？</h3>
                <p>
                    系统基于<strong>波特五力模型</strong>和多年电商实战经验设计，
                    但最终决策还需结合您的实际情况。建议将推演结果作为重要参考，
                    而非唯一依据。
                </p>

                <h2>相关工具</h2>
                <p>配合使用这些工具，让您的市场调研更完整：</p>
                <ul>
                    <li><a href="/tools/fba-calculator">亚马逊 FBA 费用计算器</a> - 精确计算物流成本</li>
                    <li><a href="/sales-target">销售额目标追踪系统</a> - 管理业绩目标</li>
                    <li><a href="/processes/amazon-new-product-import">亚马逊新品导入流程 SOP</a> - 标准化上架流程</li>
                </ul>
            </article>
        </section>
    );
}
