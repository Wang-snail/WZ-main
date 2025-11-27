import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { ProfitResult, Language } from '../types';
import { TRANSLATIONS } from '../utils/locales';

interface TheoryExplainerProps {
  result: ProfitResult;
  lang: Language;
}

export const TheoryExplainer: React.FC<TheoryExplainerProps> = ({ result, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        {t.theoryTitle}
      </h3>
      <p className="text-sm text-slate-500 mb-6">{t.theorySubtitle}</p>
      
      <div className="space-y-4">
        {result.calculationTrace.map((step, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-2 md:gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                {/* Step Indicator and Title */}
                <div className="md:w-1/3 flex flex-col justify-start">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider whitespace-nowrap">
                            {t.step} {index + 1}
                        </span>
                    </div>
                    <h4 className="font-semibold text-slate-700 text-sm leading-tight">{step.label}</h4>
                    {step.note && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{step.note}</p>}
                </div>

                {/* Formula and Result */}
                <div className="flex-1 flex flex-col justify-center border-l-0 md:border-l border-slate-100 pl-0 md:pl-4 mt-2 md:mt-0 min-w-0">
                     <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400 mb-1">
                        {t.formula}
                     </div>
                     <code className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded w-fit max-w-full break-all whitespace-pre-wrap mb-2 block">
                        {step.formula}
                     </code>
                     <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{step.result}</span>
                     </div>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 italic">
        * Logic extracted from Amazon Seller Central (G8CXLSH94WNPB9R4). Rates vary by date and region.
      </div>
    </div>
  );
};