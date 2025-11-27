import React, { useState, useEffect } from 'react';
import { DimensionUnit, WeightUnit, ProductCategory, ProductInput, CalculationResult } from './types';
import InputSection from './components/InputSection';
import ResultSection from './components/ResultSection';
import { calculateFBA } from './services/calculatorLogic';
import { Calculator, Package, Box, Container, Info } from 'lucide-react';

const App: React.FC = () => {
  const [input, setInput] = useState<ProductInput>({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    dimUnit: DimensionUnit.CM,
    weightUnit: WeightUnit.KG,
    category: ProductCategory.STANDARD,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleInputChange = (key: keyof ProductInput, value: any) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (input.length > 0 && input.width > 0 && input.height > 0 && input.weight > 0) {
      const res = calculateFBA(input);
      setResult(res);
    } else {
      setResult(null);
    }
  }, [input]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm h-14">
        <div className="max-w-screen-2xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-md">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              亚马逊 FBA <span className="text-orange-600">费用计算器</span>
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            2024/2025 费率标准
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-screen-2xl w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Sidebar: Input & Compact Reference */}
          <div className="lg:col-span-3 space-y-4 sticky top-20">
            <InputSection values={input} onChange={handleInputChange} />

            {/* Compact Quick Tips */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-gray-100">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-700">尺寸分段参考 (最大值)</h3>
              </div>

              <div className="space-y-2">
                {/* Small Standard */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 hover:bg-green-50/50 transition-colors border border-transparent hover:border-green-100 group">
                  <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-green-500 group-hover:border-green-200">
                    <Package size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">小号标准</span>
                      <span className="text-[10px] text-gray-500">≤ 16 oz</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                      15" × 6" × 0.75"
                    </div>
                  </div>
                </div>

                {/* Large Standard */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100 group">
                  <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:border-blue-200">
                    <Box size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">大号标准</span>
                      <span className="text-[10px] text-gray-500">≤ 20 lb</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                      18" × 14" × 8"
                    </div>
                  </div>
                </div>

                {/* Oversize */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/50 hover:bg-orange-50/50 transition-colors border border-transparent hover:border-orange-100 group">
                  <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-orange-500 group-hover:border-orange-200">
                    <Container size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">大件 / 超大</span>
                      <span className="text-[10px] text-gray-500">&gt; 20 lb</span>
                    </div>
                    <div className="text-[10px] text-orange-600/80 font-medium mt-0.5">
                      需计算体积重
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-9">
            <ResultSection result={result!} isValid={!!result} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;