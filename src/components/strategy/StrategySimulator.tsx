import React, { useState, useMemo } from 'react';

// --- 1. 核心逻辑配置区 (这里是你的思维导图逻辑的数字化体现) ---
const calculateStrategies = (inputs) => {
  const {
    userIncome,        // 宏观 - 人均收入水平 (1=穷, 10=富)
    marketSaturation,  // 亚马逊市场 - 头部品牌/饱和度 (1=蓝海, 10=红海/垄断)
    competitorPrice,   // 了解对手 - 价格定位 (1=低价卷王, 10=高价品牌)
    supplyChainReady,  // 合作伙伴 - 供应链/生产能力 (1=无优势, 10=强力工厂)
    productInnovate    // 了解产品 - 自身创新/差异化能力 (1=公模, 10=独家私模)
  } = inputs;

  // --- 你的思维导图逻辑推演 (Logic Chain) ---

  // 1. 成本领先策略 (Cost Leadership)
  // 逻辑：如果大家没钱(收入低) + 市场已经是红海 + 我有强力供应链 = 只能拼价格
  // 修正：如果对手价格已经很低(competitorPrice低)，做成本领先会很难，除非我供应链极强
  let costScore =
    ((10 - userIncome) * 1.5) +      // 越穷越看重价格 (权重高)
    (supplyChainReady * 2.0) +       // 供应链是核心支撑 (权重最高)
    (marketSaturation * 0.5) +       // 市场越饱和，越容易陷入价格战
    ((competitorPrice) * 0.8);       // 对手卖得贵，我做低价才有空间；对手卖得便宜，我很难做

  // 2. 差异化策略 (Differentiation)
  // 逻辑：大家有钱(收入高) + 我有产品创新能力 + 对手虽然强但价格高(有溢价空间)
  let diffScore =
    (userIncome * 1.5) +             // 越富越愿意为特色买单
    (productInnovate * 2.5) +        // 自身的创新能力是决定性因素
    (marketSaturation * 0.5);        // 市场饱和度高时，必须做差异化才能突围

  // 3. 集中/细分战略 (Focus Strategy)
  // 逻辑：市场被巨头垄断(饱和度极高) + 我供应链一般 + 但我有一定创新力 = 躲开巨头做细分
  let focusScore =
    (marketSaturation * 3.0) +       // 只要是垄断市场，首选集中战略 (权重极大)
    ((10 - supplyChainReady) * 1.0) +// 供应链拼不过别人，被迫做细分
    (productInnovate * 1.0);         // 需要一点点特色来切入

  // 归一化处理 (把分数压缩到 0-100 之间)
  const normalize = (val) => {
    // 这里的 45 是根据上面权重估算的最大可能值，用于把分数拉平
    return Math.min(100, Math.max(0, (val / 45) * 100));
  };

  return {
    cost: normalize(costScore),
    diff: normalize(diffScore),
    focus: normalize(focusScore)
  };
};

const StrategySimulator = () => {
  // 默认值设为 5
  const [inputs, setInputs] = useState({
    userIncome: 5,
    marketSaturation: 5,
    competitorPrice: 5,
    supplyChainReady: 5,
    productInnovate: 5,
  });

  const [touchedFields, setTouchedFields] = useState(new Set());
  const results = useMemo(() => calculateStrategies(inputs), [inputs]);
  const confidenceLevel = Math.round((touchedFields.size / Object.keys(inputs).length) * 100);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) }));
    setTouchedFields(prev => new Set(prev).add(field));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-50 min-h-screen font-sans text-slate-800">

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">市场进入策略推演 (Market Entry Logic)</h1>
        <p className="text-slate-500 mt-2">基于“供需-对手-供应链”逻辑链的动态仿真</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* 左侧：完全对应你的思维导图节点 */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            关键决策变量
          </h2>

          <div className="space-y-8">
            {/* 对应图中的【宏观趋势 -> 经济环境】 */}
            <InputSlider
              label="宏观：用户收入/购买力"
              description="思维导图节点：宏观趋势 -> 经济环境 -> 收入水平"
              value={inputs.userIncome}
              leftText="低/价格敏感"
              rightText="高/追求品质"
              onChange={(val) => handleInputChange('userIncome', val)}
            />

            {/* 对应图中的【亚马逊市场 -> 微观 -> 头部品牌】 */}
            <InputSlider
              label="市场：头部垄断/饱和度"
              description="思维导图节点：亚马逊市场 -> 微观 -> 头部品牌占有率"
              value={inputs.marketSaturation}
              leftText="分散/蓝海"
              rightText="垄断/红海"
              onChange={(val) => handleInputChange('marketSaturation', val)}
            />

            {/* 对应图中的【了解对手 -> 品牌 -> 价格】 */}
            <InputSlider
              label="对手：竞品价格定位"
              description="思维导图节点：了解对手 -> 品牌 -> 产品价格"
              value={inputs.competitorPrice}
              leftText="极低/卷王"
              rightText="高昂/暴利"
              onChange={(val) => handleInputChange('competitorPrice', val)}
            />

            {/* 对应图中的【合作伙伴 -> 生产能力】 */}
            <InputSlider
              label="自身：供应链/生产优势"
              description="思维导图节点：合作伙伴 -> 生产能力/成本优势"
              value={inputs.supplyChainReady}
              leftText="无优势/外采"
              rightText="源头工厂/极强"
              onChange={(val) => handleInputChange('supplyChainReady', val)}
            />

            {/* 对应图中的【了解产品 -> 功能/核心元器件】 */}
            <InputSlider
              label="自身：产品创新能力"
              description="思维导图节点：了解产品 -> 核心元器件/功能配置"
              value={inputs.productInnovate}
              leftText="公模/同质化"
              rightText="独家/技术壁垒"
              onChange={(val) => handleInputChange('productInnovate', val)}
            />
          </div>
        </div>

        {/* 右侧：推演结果 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>

            <div className="flex justify-between items-end mb-6">
              <h2 className="text-lg font-medium text-slate-300">策略适配度推演</h2>
              <div className="text-right">
                <div className="text-xs text-slate-400">逻辑完备度</div>
                <div className={`text-2xl font-bold ${confidenceLevel < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {confidenceLevel}%
                </div>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <ResultBar
                title="成本领先战略"
                score={results.cost}
                color="bg-blue-500"
                desc="逻辑依据：宏观经济下行 + 强供应链支撑"
              />
              <ResultBar
                title="产品差异化战略"
                score={results.diff}
                color="bg-purple-500"
                desc="逻辑依据：高购买力 + 自身创新 + 避开价格战"
              />
              <ResultBar
                title="集中/细分战略"
                score={results.focus}
                color="bg-emerald-500"
                desc="逻辑依据：市场高度垄断 -> 切割细分市场"
              />
            </div>

            {/* 动态逻辑分析文案 */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide">系统推演结论</div>
              <p className="text-sm leading-relaxed font-light text-slate-200">
                {inputs.marketSaturation > 7 && inputs.productInnovate < 4 && inputs.supplyChainReady < 7 ?
                  "⚠️ 警告：当前市场极度红海，且你方无明显供应链或产品优势。进入风险极高，建议放弃或寻找极度垂直的长尾词。" :
                  (results.cost > results.diff && results.cost > results.focus ?
                    "✅ 推荐路径：你的供应链优势是核心武器。当前宏观环境下，用户对价格敏感。建议利用成本优势清洗市场，通过低价快速起量。" :
                    (results.diff > results.cost ?
                      "✅ 推荐路径：市场存在尚未被满足的痛点。建议利用你的创新能力做高溢价产品，不要陷入对手的低价泥潭。" :
                      "✅ 推荐路径：头部品牌太强，正面硬刚必死。建议通过“集中战略”，只做一个特定的细分人群（如特定的地域或职业），成为小池塘里的大鱼。")
                  )
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputSlider = ({ label, description, value, leftText, rightText, onChange }) => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
      <div className="flex justify-between mb-1">
        <label className="font-semibold text-slate-700">{label}</label>
        <span className="text-indigo-600 font-mono font-bold">{value.toFixed(1)}</span>
      </div>
      <p className="text-xs text-slate-400 mb-4 font-mono">{description}</p>

      <input
        type="range" min="0" max="10" step="0.5" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />

      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>{leftText}</span>
        <span>{rightText}</span>
      </div>
    </div>
  );
}

const ResultBar = ({ title, score, color, desc }) => {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white font-medium">{title}</span>
        <span className="text-white font-mono">{score.toFixed(0)}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 mb-1">
        <div className={`${color} h-2 rounded-full transition-all duration-700 ease-out`} style={{ width: `${score}%` }}></div>
      </div>
      <div className="text-xs text-slate-500">{desc}</div>
    </div>
  );
};

export default StrategySimulator;