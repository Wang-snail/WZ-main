import React from 'react';
import { ProfitResult, ProductInput, Language } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS } from '../constants';
import { TRANSLATIONS } from '../utils/locales';
import { Info } from 'lucide-react';

interface ResultsDashboardProps {
  result: ProfitResult;
  input: ProductInput;
  lang: Language;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, input, lang }) => {
  const t = TRANSLATIONS[lang];
  const isProfitable = result.netProfit > 0;
  
  // Calculate "Others" (Storage + Closing + Misc)
  const otherCosts = result.breakdown.storageFee + result.breakdown.closingFee + input.miscCost;

  const pieData = [
    { name: t.prodCost, value: input.cost, color: CATEGORY_COLORS['Product Cost'] },
    { name: t.headhaul, value: input.shippingCost, color: CATEGORY_COLORS['Headhaul'] },
    { name: t.tailhaul, value: result.breakdown.fulfillmentFee, color: CATEGORY_COLORS['Tailhaul'] },
    { name: t.commission, value: result.breakdown.referralFee, color: CATEGORY_COLORS['Commission'] },
    { name: t.ads, value: input.advertisingCost, color: CATEGORY_COLORS['Ads'] },
    { name: t.other, value: otherCosts, color: CATEGORY_COLORS['Other Costs'] },
    { name: t.profit, value: Math.max(0, result.netProfit), color: CATEGORY_COLORS['Profit'] },
  ].filter(d => d.value > 0);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="space-y-6">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 rounded-xl border ${isProfitable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className="text-sm font-medium text-slate-500 mb-1">{t.netProfit}</div>
          <div className={`text-3xl font-bold ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
            {fmt(result.netProfit)}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">{t.margin}</div>
          <div className={`text-3xl font-bold ${result.margin >= 15 ? 'text-emerald-600' : result.margin > 0 ? 'text-amber-500' : 'text-red-600'}`}>
            {result.margin.toFixed(2)}%
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">{t.roi}</div>
          <div className="text-3xl font-bold text-slate-800">
            {result.roi.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Breakdown Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-500" /> {t.costBreakdown}
          </h3>
          
          <div className="space-y-3">
             {/* Product Cost */}
             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-blue-500"></span> {t.prodCost}
                </span>
                <span className="font-medium text-slate-800">{fmt(input.cost)}</span>
             </div>
             
             {/* Headhaul */}
             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> {t.headhaul}
                </span>
                <span className="font-medium text-slate-800">{fmt(input.shippingCost)}</span>
             </div>

             {/* Tailhaul (FBA) */}
             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> {t.tailhaul}
                </span>
                <span className="font-medium text-slate-800">{fmt(result.breakdown.fulfillmentFee)}</span>
             </div>

             {/* Commission */}
             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span> {t.commission}
                </span>
                <span className="font-medium text-slate-800">{fmt(result.breakdown.referralFee)}</span>
             </div>

             {/* Ads */}
             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span> {t.ads}
                </span>
                <span className="font-medium text-slate-800">{fmt(input.advertisingCost)}</span>
             </div>

             {/* Others */}
             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> {t.other}
                </span>
                <span className="font-medium text-slate-800">{fmt(otherCosts)}</span>
             </div>
             
             {/* Total */}
             <div className="flex justify-between items-center pt-2 -mx-2 px-2 rounded bg-slate-50 mt-2">
                <span className="text-slate-700 font-bold">{t.totalCogs} + {t.totalAmzFees}</span>
                <span className="font-bold text-slate-800">{fmt(result.totalCost + result.breakdown.totalFees)}</span>
             </div>
          </div>
          
           {/* Enhanced visibility for size tier section */}
           <div className="mt-6 p-3 bg-gray-100 rounded-lg border border-gray-200 text-xs text-gray-700">
             <span className="font-semibold">{t.sizeTier}:</span> <span className="font-bold text-gray-900 ml-1">{result.sizeTier}</span>
          </div>
        </div>

        {/* Visualization */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">{t.distribution}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => fmt(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};