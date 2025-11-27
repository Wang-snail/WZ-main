import React, { useState } from 'react';
import { ProductInput, ProfitResult, Language } from '../types';
import { analyzeProfitability } from '../services/geminiService';
import { Sparkles, Loader2, Play } from 'lucide-react';
import { TRANSLATIONS } from '../utils/locales';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  input: ProductInput;
  result: ProfitResult;
  lang: Language;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ input, result, lang }) => {
  const t = TRANSLATIONS[lang];
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    // We pass the current language to the service to guide the AI's response language
    const text = await analyzeProfitability({ ...input, lang } as any, result); 
    setAnalysis(text);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm mt-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            {t.aiTitle}
          </h3>
          <p className="text-sm text-indigo-700 mt-1">
            {t.aiDesc}
          </p>
        </div>
        {!analysis && !loading && (
            <button 
                onClick={handleAnalyze}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
                <Play className="w-4 h-4" /> {t.analyze}
            </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 text-indigo-600">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <span className="text-sm font-medium">{t.analyzing}</span>
        </div>
      )}

      {analysis && (
        <div className="prose prose-sm prose-indigo max-w-none bg-white/50 p-4 rounded-lg border border-indigo-100">
            <ReactMarkdown>{analysis}</ReactMarkdown>
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleAnalyze}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium underline"
                >
                    {t.refresh}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};