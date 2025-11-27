
import React from 'react';
import { CalculationResult, SizeTier } from '../types';
import { formatCurrency, formatWeight, fromInches } from '../utils/conversions';
import { Box, Truck, Scale, AlertCircle, CheckCircle2, ArrowDown, ArrowUp, Ruler, TrendingDown, Target, Zap, Ruler as RulerIcon } from 'lucide-react';

interface ResultSectionProps {
  result: CalculationResult;
  isValid: boolean;
}

const ResultSection: React.FC<ResultSectionProps> = ({ result, isValid }) => {
  if (!isValid) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 border-dashed h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Scale className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-gray-900 font-semibold mb-1">准备计算</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          请在左侧输入商品的长宽高及重量信息，系统将自动匹配分段并计算 FBA 费用。
        </p>
      </div>
    );
  }

  const isSmall = result.tier === SizeTier.SMALL_STANDARD;
  const isLargeStd = result.tier === SizeTier.LARGE_STANDARD;
  const isOversize = result.isOversize;
  const isLowPrice = result.program === 'Low-Price FBA';

  let tierColor = 'bg-gray-100 text-gray-700 border-gray-200';
  let tierIcon = <Box className="w-4 h-4" />;
  
  if (isSmall) {
    tierColor = 'bg-green-50 text-green-700 border-green-200';
    tierIcon = <CheckCircle2 className="w-4 h-4" />;
  } else if (isLargeStd) {
    tierColor = 'bg-blue-50 text-blue-700 border-blue-200';
    tierIcon = <Box className="w-4 h-4" />;
  } else if (isOversize) {
    tierColor = 'bg-orange-50 text-orange-700 border-orange-200';
    tierIcon = <Truck className="w-4 h-4" />;
  }

  const { analysis } = result;
  const weightAnalysis = analysis.shippingWeightAnalysis;
  const lengthPlusGirthDisplay = fromInches(result.lengthPlusGirthInches, result.dimUnit);
  const limit130Display = fromInches(130, result.dimUnit);

  // Percentage of the 130 inch limit
  const girthPercentage = Math.min((result.lengthPlusGirthInches / 130) * 100, 100);
  const isGirthRisk = result.lengthPlusGirthInches > 125;
  const isGirthOver = result.lengthPlusGirthInches > 130;

  return (
    <div className="space-y-4">
      {/* Top Dashboard Cards - Updated to 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fee Card */}
        <div className={`bg-white p-5 rounded-xl border shadow-sm relative overflow-hidden group ${isLowPrice ? 'border-indigo-200' : 'border-gray-200'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Truck className="w-16 h-16 text-orange-600" />
          </div>
          <div className="flex justify-between items-start mb-1">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">FBA 预估费用</p>
             {isLowPrice && (
               <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                 <Zap size={10} fill="currentColor" /> 低价 FBA
               </span>
             )}
          </div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(result.estimatedFee)}
          </div>
          <div className="mt-2 text-xs text-green-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            {result.program}
          </div>
        </div>

        {/* Tier Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">尺寸分段</p>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${tierColor} self-start`}>
            {tierIcon}
            <span className="font-bold text-sm truncate max-w-[120px]" title={result.tier}>{result.tier}</span>
          </div>
          {isOversize && (
            <p className="text-xs text-orange-600 mt-2 font-medium">
              * 超出标准尺寸
            </p>
          )}
        </div>

        {/* Shipping Weight Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">计费重量</p>
           <div className="text-2xl font-bold text-gray-900">
             {formatWeight(result.shippingWeightLbs)}
           </div>
           {weightAnalysis && (
             <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 whitespace-nowrap">
                  档位上限: {weightAnalysis.currentBracketCeiling.toFixed(2)} {weightAnalysis.displayUnit}
                </span>
             </div>
           )}
        </div>

        {/* Girth Verification Card */}
        <div className={`bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-center ${isGirthOver ? 'border-red-200 bg-red-50/10' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-1">
             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
               <RulerIcon size={12} /> 围长验证
             </p>
             <span className="text-[10px] text-gray-400">Limit: {limit130Display.toFixed(0)} {result.dimUnit}</span>
          </div>
          <div className={`text-2xl font-bold ${isGirthOver ? 'text-red-600' : 'text-gray-900'}`}>
             {lengthPlusGirthDisplay.toFixed(1)} <span className="text-sm font-normal text-gray-500">{result.dimUnit}</span>
          </div>
          <div className="mt-3 relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             <div 
               className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isGirthOver ? 'bg-red-500' : isGirthRisk ? 'bg-orange-400' : 'bg-green-500'}`}
               style={{ width: `${girthPercentage}%` }}
             />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>L + 2(W+H)</span>
            {isGirthOver && <span className="text-red-500 font-bold">超出大号大件限制</span>}
          </div>
        </div>
      </div>

      {/* WEIGHT OPTIMIZATION (FEE LEVEL) */}
      {weightAnalysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Optimization (Reduction) */}
          <div className={`rounded-xl border shadow-sm p-4 ${weightAnalysis.reductionToPrevTier ? 'bg-orange-50/30 border-orange-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                 <Target className="w-4 h-4 text-orange-500" />
                 计费重量优化
               </h3>
            </div>
            {weightAnalysis.reductionToPrevTier ? (
              <div>
                <p className="text-xs text-gray-500 mb-2">减少重量可进入更低费率档位：</p>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
                  <span className="text-xs font-medium text-gray-600">目标减重</span>
                  <span className="text-sm font-bold text-orange-600 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" />
                    {weightAnalysis.reductionToPrevTier.toFixed(3)} {weightAnalysis.displayUnit}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">当前已在最小重量档位，无需优化。</p>
            )}
          </div>

          {/* Buffer (Increase) */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/30 shadow-sm p-4">
             <div className="flex justify-between items-start mb-2">
               <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                 <Scale className="w-4 h-4 text-blue-500" />
                 当前档位剩余重量
               </h3>
             </div>
             <div>
                <p className="text-xs text-gray-500 mb-2">在费用上涨前还可以增加：</p>
                <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                  <span className="text-xs font-medium text-gray-600">可用增量</span>
                  <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    {weightAnalysis.bufferToNextTier.toFixed(3)} {weightAnalysis.displayUnit}
                  </span>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* TIER SIZE OPTIMIZATION / BOUNDARY ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Size Downgrade Analysis */}
        <div className={`rounded-xl border shadow-sm overflow-hidden ${analysis.cheaperTier ? 'bg-white border-orange-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
               <TrendingDown className={`w-4 h-4 ${analysis.cheaperTier ? 'text-orange-500' : 'text-gray-400'}`} />
               尺寸分段降级 ({analysis.cheaperTier?.name || '已最小'})
             </h3>
          </div>
          <div className="p-4">
            {!analysis.cheaperTier ? (
              <div className="text-xs text-gray-500 text-center py-2">当前尺寸分段已最小，暂无降级建议。</div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-2">
                  您的商品距离 <span className="font-bold text-gray-700">{analysis.cheaperTier.name}</span> 超出了以下指标：
                </p>
                {analysis.cheaperTier.diffs.map((diff, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-600 font-medium">{diff.label}</span>
                    <div className="flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded">
                      <ArrowDown className="w-3 h-3" />
                      {diff.diff.toFixed(2)} <span className="text-xs font-normal text-orange-600/70">{diff.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Current Tier Size Limits (Buffer) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
             <h3 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
               <Ruler className="w-4 h-4 text-blue-500" />
               当前分段 ({analysis.currentTierLimit?.name}) 限制详情
             </h3>
          </div>
          <div className="p-4">
             {analysis.currentTierLimit ? (
               <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 border-b border-gray-100 pb-2 mb-2">
                    <div className="col-span-4">指标</div>
                    <div className="col-span-4 text-right">当前限制</div>
                    <div className="col-span-4 text-right">剩余空间</div>
                  </div>
                  {analysis.currentTierLimit.diffs.map((diff, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center text-sm">
                      <div className="col-span-4 text-gray-600 font-medium text-xs truncate" title={diff.label}>{diff.label}</div>
                      <div className="col-span-4 text-right font-mono text-xs text-gray-500">
                         {diff.limit.toFixed(2)} <span className="text-[10px]">{diff.unit}</span>
                      </div>
                      <div className="col-span-4 flex items-center justify-end gap-1 text-gray-800 font-mono text-xs">
                        {diff.diff > 0 ? (
                          <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center">
                            +{diff.diff.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded">已超标</span>
                        )}
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center text-center py-6">
                 <p className="text-xs text-gray-500">当前分段为最大尺寸等级，无尺寸上限。</p>
                 <p className="text-[10px] text-gray-400 mt-1">仅受重量阶梯影响。</p>
               </div>
             )}
          </div>
        </div>

      </div>

      {/* Detailed Analysis Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-gray-500" />
            重量与尺寸分析 (Input)
          </h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Dim Factor: 139</span>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dimensions */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">排序后尺寸 ({result.dimUnit})</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block text-xs text-gray-400 mb-1">最长边</span>
                  <span className="font-mono font-medium text-gray-800">{fromInches(result.sortedDimensions.longest, result.dimUnit).toFixed(2)}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block text-xs text-gray-400 mb-1">次长边</span>
                  <span className="font-mono font-medium text-gray-800">{fromInches(result.sortedDimensions.median, result.dimUnit).toFixed(2)}</span>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block text-xs text-gray-400 mb-1">最短边</span>
                  <span className="font-mono font-medium text-gray-800">{fromInches(result.sortedDimensions.shortest, result.dimUnit).toFixed(2)}</span>
                </div>
              </div>
              
              {/* Length + Girth Info (Bottom Reference) */}
              <div className="mt-3 bg-gray-50/50 p-2 rounded border border-gray-100 flex justify-between items-center">
                 <div>
                   <span className="block text-xs text-gray-600 font-medium">长 + 围 (Girth) 详细值</span>
                   <span className="text-[10px] text-gray-400">Longest + 2*(Median + Shortest)</span>
                 </div>
                 <div className="text-right">
                   <span className="font-mono font-medium text-gray-700">{lengthPlusGirthDisplay.toFixed(2)}</span>
                   <span className="text-[10px] text-gray-400 ml-1">{result.dimUnit}</span>
                 </div>
              </div>
            </div>

            {/* Weight Comparison */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">计费重量逻辑</h4>
              <div className="space-y-2">
                <div className={`flex justify-between items-center p-2 rounded border ${result.unitWeightLbs >= result.dimensionalWeightLbs ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                   <span className="text-sm text-gray-600">实际单重</span>
                   <span className="font-mono font-medium">{formatWeight(result.unitWeightLbs)}</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded border ${result.dimensionalWeightLbs > result.unitWeightLbs ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                   <span className="text-sm text-gray-600 flex items-center gap-1">
                     体积重
                     <span className="text-[10px] text-gray-400">(L×W×H)/139</span>
                   </span>
                   <span className="font-mono font-medium">{formatWeight(result.dimensionalWeightLbs)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <AlertCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
        <p>
          计算结果仅供参考。实际费用可能会因亚马逊测量误差、包装膨胀或季节性政策调整而有所不同。服装类、危险品及锂电池商品可能适用不同的费率标准。费率更新日期: 2024/2025。
        </p>
      </div>
    </div>
  );
};

export default ResultSection;
