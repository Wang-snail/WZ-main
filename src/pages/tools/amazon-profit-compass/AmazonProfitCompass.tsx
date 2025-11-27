import React, { useState, useMemo, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { TheoryExplainer } from './components/TheoryExplainer';
import { AIAdvisor } from './components/AIAdvisor';
import { ProductInput, FeeCategory, FeePeriod, ProfitResult, Language } from './types';
import { calculateProfit } from './utils/calculationLogic';
import { TRANSLATIONS } from './utils/locales';
import { Calculator, Globe } from 'lucide-react';

const INITIAL_INPUT: ProductInput = {
  name: '',
  price: 29.99,
  cost: 8.50,
  category: FeeCategory.KITCHEN,
  dimensions: {
    length: 10,
    width: 8,
    height: 2,
    weight: 1.5
  },
  shippingCost: 0.50,
  advertisingCost: 2.00,
  miscCost: 0.20,
  feePeriod: FeePeriod.STANDARD_2024
};

function App() {
  const [input, setInput] = useState<ProductInput>(INITIAL_INPUT);
  const [lang, setLang] = useState<Language>(Language.EN);

  // Detect language on mount
  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) setLang(Language.ZH);
    else if (browserLang.startsWith('ja')) setLang(Language.JA);
    else if (browserLang.startsWith('ru')) setLang(Language.RU);
    else if (browserLang.startsWith('fr')) setLang(Language.FR);
    else setLang(Language.EN);
  }, []);

  const result: ProfitResult = useMemo(() => {
    return calculateProfit(input, lang);
  }, [input, lang]);

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{t.appTitle}</h1>
              <span className="text-xs text-slate-500 font-medium">{t.appSubtitle}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
               <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">
                 <Globe className="w-4 h-4" />
                 <span className="uppercase">{lang}</span>
               </button>
               {/* Dropdown */}
               <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 shadow-lg rounded-lg py-1 hidden group-hover:block">
                 {(Object.values(Language) as Language[]).map((l) => (
                   <button
                     key={l}
                     onClick={() => setLang(l)}
                     className={`block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-600 ${lang === l ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'}`}
                   >
                     {l === Language.ZH ? '中文' : l === Language.EN ? 'English' : l === Language.JA ? '日本語' : l === Language.FR ? 'Français' : 'Русский'}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <InputForm input={input} onChange={setInput} lang={lang} />
          </div>

          {/* Right Column: Results & Theory */}
          <div className="lg:col-span-7 space-y-6">
              <ResultsDashboard result={result} input={input} lang={lang} />
              
              <TheoryExplainer result={result} lang={lang} />

              <AIAdvisor input={input} result={result} lang={lang} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;