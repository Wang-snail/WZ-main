"use client";

import React, { useState, useMemo } from 'react';
import { 
  Box, Users, Globe, Target, Factory, 
  ChevronRight, ChevronDown, Activity, 
  DollarSign, Clock, Zap, AlertTriangle, FileText,
  BarChart3, CheckCircle2
} from 'lucide-react';

// --- 1. 数据结构：完整映射思维导图 (保持不变) ---
const MIND_MAP_STRUCTURE = [
  {
    id: 'product',
    title: '了解产品 (Product)',
    icon: <Box size={18} />,
    color: 'text-amber-600',
    subVariables: [
      { id: 'innovation_score', label: '产品创新/技术壁垒评分', value: 5 } 
    ],
    inputs: [ 
      { id: 'p_appearance', label: '外观/结构 (Appearance/Structure)', placeholder: '描述产品的外观形态、结构特点...' },
      { id: 'p_function', label: '功能配置 (Core/Aux Functions)', placeholder: '核心功能是什么？附带功能占比？' },
      { id: 'p_usage', label: '使用方法 (Usage)', placeholder: '用户如何操作？' },
      { id: 'p_components', label: '核心元器件 (Components)', placeholder: '是什么？产地？影响功能的因素？' }
    ]
  },
  {
    id: 'user',
    title: '了解用户 (User)',
    icon: <Users size={18} />,
    color: 'text-purple-600',
    subVariables: [
      { id: 'purchasing_power', label: '用户购买力/需求评分', value: 5 }
    ],
    inputs: [
      { id: 'u_static', label: '静态属性 (Demographics)', placeholder: '地区分布、年龄、性别...' },
      { id: 'u_behavior', label: '购买行为与习惯 (Habits)', placeholder: '消费习惯、购买频次...' },
      { id: 'u_income', label: '收入情况 (Income)', placeholder: '人均收入水平、可支配支出...' },
      { id: 'u_needs', label: '产品需求特点 (Needs)', placeholder: '痛点、痒点、核心诉求...' }
    ]
  },
  {
    id: 'market',
    title: '分析市场 (Market)',
    icon: <Globe size={18} />,
    color: 'text-blue-600',
    subVariables: [
      { id: 'macro_trend', label: '宏观环境利好度', value: 5 },
      { id: 'market_saturation', label: '市场饱和/垄断程度', value: 5 } // 反向指标
    ],
    inputs: [
      { id: 'm_social', label: '社会/政治环境', placeholder: '政策法规、社会风潮...' },
      { id: 'm_eco', label: '经济环境', placeholder: '人均消费水平、宏观趋势...' },
      { id: 'm_industry', label: '行业态势', placeholder: '集中度、产品差异化程度...' },
      { id: 'm_supply_demand', label: '供求关系', placeholder: '年产量、企业数量...' },
      { id: 'm_chain', label: '产业链/意向供应商', placeholder: '研发能力、认证、品质保障...' },
      { id: 'm_amazon', label: '亚马逊市场数据', placeholder: '关键词容量、月销量...' }
    ]
  },
  {
    id: 'competitor',
    title: '了解对手 (Competitors)',
    icon: <Target size={18} />,
    color: 'text-rose-600',
    subVariables: [
      { id: 'competitor_strength', label: '竞品强度/价格壁垒', value: 5 }
    ],
    inputs: [
      { id: 'c_product', label: '竞品产品分析', placeholder: '外观、参数、价格、核心元器件...' },
      { id: 'c_brand', label: '品牌定位', placeholder: '竞品的市场站位、营销策略...' },
      { id: 'c_partner', label: '合作企业', placeholder: '竞品的供应链来源...' }
    ]
  },
  {
    id: 'partner',
    title: '合作伙伴 (Partners)',
    icon: <Factory size={18} />,
    color: 'text-emerald-600',
    subVariables: [
      { id: 'supply_chain_cap', label: '供应链生产/配合能力', value: 5 }
    ],
    inputs: [
      { id: 'pt_concept', label: '企业理念/配合度', placeholder: '合作意愿、沟通成本...' },
      { id: 'pt_capacity', label: '生产能力/周期', placeholder: '产能产量、供货周期...' },
      { id: 'pt_agreement', label: '协议认可', placeholder: '成本、结款方式...' }
    ]
  }
];

export default function MindMapStrategySystem() {
  const [data, setData] = useState(MIND_MAP_STRUCTURE);
  const [inputs, setInputs] = useState({});
  const [expanded, setExpanded] = useState(['product', 'market']);

  const handleInputChange = (nodeId, text) => {
    setInputs(prev => ({ ...prev, [nodeId]: text }));
  };

  const handleSliderChange = (sectionIndex, varIndex, newValue) => {
    const newData = [...data];
    newData[sectionIndex].subVariables[varIndex].value = parseFloat(newValue);
    setData(newData);
  };

  // --- 核心：推演运算引擎 (升级版) ---
  const results = useMemo(() => {
    const getVar = (secId, varId) => {
      const section = data.find(s => s.id === secId);
      const variable = section.subVariables.find(v => v.id === varId);
      return variable ? variable.value : 5;
    };

    const innovation = getVar('product', 'innovation_score');
    const purchasingPower = getVar('user', 'purchasing_power');
    // const macro = getVar('market', 'macro_trend'); 
    const saturation = getVar('market', 'market_saturation');
    const compStrength = getVar('competitor', 'competitor_strength');
    const supplyChain = getVar('partner', 'supply_chain_cap');

    // 1. 计算原始得分 (Weighted Scores)
    // 成本领先: 供应链强(0.5) + 购买力弱(0.3) + 市场饱和(0.2)
    const rawCost = (supplyChain * 0.5) + ((10 - purchasingPower) * 0.3) + (saturation * 0.2);
    
    // 差异化: 创新强(0.5) + 购买力强(0.3) + 竞品强(0.2)
    const rawDiff = (innovation * 0.5) + (purchasingPower * 0.3) + (compStrength * 0.2);
    
    // 集中/细分: 饱和度极高(0.6) + 供应链弱(0.2) + 创新弱(0.2)
    const rawFocus = (saturation * 0.6) + ((10 - supplyChain) * 0.2) + ((10 - innovation) * 0.2);

    // 2. 归一化为百分比 (0-100%) 用于进度条
    // 假设满分大概是 10分左右，我们将其映射到 100%
    const normalize = (val) => Math.min(100, Math.max(10, val * 10));
    
    const scores = {
      cost: normalize(rawCost),
      diff: normalize(rawDiff),
      focus: normalize(rawFocus)
    };

    // 3. 确定最终赢家
    let bestStrategyKey = 'cost';
    let maxScore = scores.cost;
    
    if (scores.diff > maxScore) { bestStrategyKey = 'diff'; maxScore = scores.diff; }
    if (scores.focus > maxScore) { bestStrategyKey = 'focus'; maxScore = scores.focus; }

    const strategyMap = {
      cost: { title: "成本领先战略", color: "bg-blue-500", text: "text-blue-400" },
      diff: { title: "产品差异化战略", color: "bg-purple-500", text: "text-purple-400" },
      focus: { title: "集中/细分战略", color: "bg-emerald-500", text: "text-emerald-400" }
    };

    const winner = strategyMap[bestStrategyKey];

    // 4. 生成详细报告
    let investment, roi, features;
    
    if (bestStrategyKey === "cost") {
      investment = "高 (库存与周转主导)";
      roi = "10% - 18% (薄利多销模式)";
      features = "极致性价比 / 基础功能扎实 / 极简包装";
    } else if (bestStrategyKey === "diff") {
      investment = "高 (研发与开模主导)";
      roi = "30% - 50% (品牌与技术溢价)";
      features = "高颜值外观 / 独家专利功能 / 卓越用户体验";
    } else {
      investment = "低 (小批量精准试错)";
      roi = "20% - 35% (垂直人群定价)";
      features = "针对特定痛点 / 垂直场景专用 / 社区属性强";
    }

    // 生命周期
    const timeToMarket = innovation > 7 ? "4-6 个月 (研发期长)" : "1-2 个月 (快速上架)";
    const sunsetTime = saturation > 8 ? "12 个月 (快速迭代)" : "24-36 个月 (长线运营)";
    const iteration = compStrength > 7 ? "每 3 个月微调" : "每 6-9 个月";

    // 决策逻辑文本
    const reasoning = [];
    if (supplyChain > 8) reasoning.push("供应链评分极高，这是成本控制和快速反应的核心底牌。");
    if (purchasingPower < 4) reasoning.push("检测到目标用户购买力有限，价格将成为第一决策要素。");
    if (saturation > 8) reasoning.push("市场头部垄断严重（红海），正面硬刚风险巨大，迫使策略转向细分或极致差异化。");
    if (innovation > 8) reasoning.push("具备极强的技术/设计壁垒，这是建立护城河的最佳时机。");
    if (reasoning.length === 0) reasoning.push("各项指标较为均衡，建议结合实际资金储备进行更细致的权衡。");

    return {
      scores,
      winner,
      bestStrategyKey,
      financial: { investment, roi },
      lifecycle: { timeToMarket, sunsetTime, iteration },
      reasoning,
      features
    };
  }, [data]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      
      {/* --- Column 1: Input Stream (Left) --- */}
      <div className="w-[30%] h-full flex flex-col border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold flex items-center gap-2 text-slate-700">
            <FileText size={18} /> 调研信息录入
          </h2>
          <p className="text-xs text-slate-400 mt-1">对应思维导图叶子节点</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {data.map((section) => (
            <div key={section.id} className="border border-slate-100 rounded-lg overflow-hidden">
              <button 
                onClick={() => setExpanded(prev => prev.includes(section.id) ? prev.filter(i => i !== section.id) : [...prev, section.id])}
                className={`w-full flex items-center justify-between p-3 bg-slate-50 text-sm font-bold ${section.color}`}
              >
                <div className="flex items-center gap-2">{section.icon} {section.title}</div>
                {expanded.includes(section.id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
              </button>
              
              {expanded.includes(section.id) && (
                <div className="p-3 space-y-4 bg-white">
                  {section.inputs.map((input) => (
                    <div key={input.id}>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">{input.label}</label>
                      <textarea 
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-16 transition-all"
                        placeholder={input.placeholder}
                        value={inputs[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="h-10"></div>
        </div>
      </div>

      {/* --- Column 2: Logic Engine (Center) --- */}
      <div className="w-[30%] h-full flex flex-col border-r border-slate-200 bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold flex items-center gap-2 text-slate-700">
            <Activity size={18} /> 程度量化分析
          </h2>
          <p className="text-xs text-slate-400 mt-1">对应思维导图二级节点 (0-10分)</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {data.map((section, sIdx) => (
            <div key={section.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
              <div className={`text-sm font-bold mb-4 flex items-center gap-2 ${section.color}`}>
                {section.icon} {section.title}
              </div>
              <div className="space-y-6">
                {section.subVariables.map((variable, vIdx) => (
                  <div key={variable.id}>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600">{variable.label}</label>
                      <span className="text-xs font-mono font-bold text-blue-600">{variable.value}</span>
                    </div>
                    <input 
                      type="range" min="0" max="10" step="0.5" 
                      value={variable.value}
                      onChange={(e) => handleSliderChange(sIdx, vIdx, e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                      <span>弱 / 低 / 差</span>
                      <span>强 / 高 / 好</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Column 3: Strategic Output (Right - Updated) --- */}
      <div className="w-[40%] h-full bg-slate-900 text-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-indigo-400" /> 
            战略决策书
          </h2>
          <p className="text-xs text-slate-500 mt-1">Live Strategy Simulation</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. 动态无极进度条 (The Probability Bars) */}
          <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <BarChart3 size={14} /> 战略匹配度模型
            </h3>
            
            <div className="space-y-5">
              <StrategyProgress 
                title="成本领先战略" 
                percent={results.scores.cost} 
                isWinner={results.bestStrategyKey === 'cost'}
                color="bg-blue-500"
              />
              <StrategyProgress 
                title="产品差异化战略" 
                percent={results.scores.diff} 
                isWinner={results.bestStrategyKey === 'diff'}
                color="bg-purple-500"
              />
              <StrategyProgress 
                title="集中/细分战略" 
                percent={results.scores.focus} 
                isWinner={results.bestStrategyKey === 'focus'}
                color="bg-emerald-500"
              />
            </div>
          </div>

          {/* 2. 最终决策卡片 (The Verdict) */}
          <div className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl relative overflow-hidden">
             {/* 装饰光效 */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 ${results.winner.color.replace('bg-', 'bg-')}`}></div>
            
            <div className="relative z-10">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Recommended Strategy</div>
              <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${results.winner.text}`}>
                <CheckCircle2 size={24} />
                {results.winner.title}
              </h2>
              
              <div className="text-sm text-slate-300 bg-slate-900/50 p-3 rounded border border-slate-700/50 leading-relaxed">
                <span className="font-bold text-white">推演逻辑：</span>
                {results.reasoning.join(" ")}
              </div>
            </div>
          </div>

          {/* 3. 财务与生命周期 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={12}/> 预估投入</div>
              <div className="text-sm font-bold text-white">{results.financial.investment}</div>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Activity size={12}/> 产出 (毛利)</div>
              <div className="text-xl font-mono font-bold text-emerald-400">{results.financial.roi}</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
              <Clock size={14}/> 生命周期管理
            </h3>
            <div className="bg-slate-800 rounded-lg border border-slate-700 divide-y divide-slate-700">
              <div className="p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">预计上架时间</span>
                <span className="text-sm font-bold text-blue-300">{results.lifecycle.timeToMarket}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">建议退市时间</span>
                <span className="text-sm font-bold text-rose-300">{results.lifecycle.sunsetTime}</span>
              </div>
              <div className="p-3 flex justify-between items-center">
                <span className="text-xs text-slate-400">迭代频率建议</span>
                <span className="text-sm font-bold text-amber-300">{results.lifecycle.iteration}</span>
              </div>
            </div>
          </div>

          {/* 4. 产品特点定义 */}
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
            <div className="text-xs text-blue-300 uppercase mb-2 flex items-center gap-1"><Zap size={12}/> 产品核心形态定义</div>
            <div className="text-base font-bold text-white">{results.features}</div>
          </div>

          {/* 风险提示 */}
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-xs mt-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            该模型基于您输入的变量推演，仅供决策参考。任何商业决策请务必结合实际资金状况执行。
          </div>
          
          <div className="h-10"></div>
        </div>
      </div>
    </div>
  );
}

// --- 子组件：平滑过渡的进度条 ---
function StrategyProgress({ title, percent, isWinner, color }) {
  return (
    <div className={`transition-all duration-500 ${isWinner ? 'opacity-100 scale-[1.02]' : 'opacity-50 hover:opacity-80'}`}>
      <div className="flex justify-between text-sm mb-1.5">
        <span className={`font-medium ${isWinner ? 'text-white' : 'text-slate-400'}`}>
          {title}
        </span>
        <span className="font-mono text-slate-300 text-xs">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
        <div 
          className={`h-full ${color} transition-all duration-700 ease-out relative`} 
          style={{ width: `${percent}%` }}
        >
          {isWinner && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
        </div>
      </div>
    </div>
  );
}