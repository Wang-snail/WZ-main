import React from 'react';
import { FeeCategory, FeePeriod, ProductInput, Language } from '../types';
import { FEE_PERIOD_LABELS, CATEGORY_LABELS } from '../constants';
import { TRANSLATIONS } from '../utils/locales';
import { HelpCircle, DollarSign, Package, Box } from 'lucide-react';

interface InputFormProps {
  input: ProductInput;
  onChange: (input: ProductInput) => void;
  lang: Language;
}

export const InputForm: React.FC<InputFormProps> = ({ input, onChange, lang }) => {
  const t = TRANSLATIONS[lang];

  const handleChange = (field: keyof ProductInput, value: any) => {
    onChange({ ...input, [field]: value });
  };

  const handleDimChange = (dim: 'length' | 'width' | 'height' | 'weight', value: string) => {
    const numVal = parseFloat(value) || 0;
    onChange({
      ...input,
      dimensions: {
        ...input.dimensions,
        [dim]: numVal
      }
    });
  };

  const handleNumberChange = (field: keyof ProductInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(field, parseFloat(e.target.value) || 0);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-indigo-600" />
        {t.productDetails}
      </h2>

      <div className="space-y-5">
        
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">{t.productName}</label>
          <input
            type="text"
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 bg-white"
            placeholder="..."
            value={input.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        {/* Category & Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.category}</label>
            <div className="relative">
              <select
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-slate-900"
                value={input.category}
                onChange={(e) => handleChange('category', e.target.value as FeeCategory)}
              >
                {Object.values(FeeCategory).map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat][lang]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
              {t.feeSchedule}
              <span className="tooltip group relative">
                <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                <span className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity w-48 text-center mb-1 z-10">
                  Select the date range to apply specific Amazon fee rules.
                </span>
              </span>
            </label>
            <div className="relative">
              <select
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white text-sm text-slate-900"
                value={input.feePeriod}
                onChange={(e) => handleChange('feePeriod', e.target.value as FeePeriod)}
              >
                {Object.values(FeePeriod).map((p) => (
                  <option key={p} value={p}>{FEE_PERIOD_LABELS[p][lang]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 my-4"></div>

        {/* Pricing & Costs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.sellingPrice}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number" min="0" step="0.01"
                className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                value={input.price}
                onChange={handleNumberChange('price')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.unitCost}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number" min="0" step="0.01"
                className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                value={input.cost}
                onChange={handleNumberChange('cost')}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.shippingToAmz}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number" min="0" step="0.01"
                className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                value={input.shippingCost}
                onChange={handleNumberChange('shippingCost')}
              />
            </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.advertisingCost}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number" min="0" step="0.01"
                className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                value={input.advertisingCost}
                onChange={handleNumberChange('advertisingCost')}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">{t.miscCost}</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="number" min="0" step="0.01"
                className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white"
                value={input.miscCost}
                onChange={handleNumberChange('miscCost')}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 my-4"></div>

        {/* Dimensions */}
        <div>
           <label className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
             <Box className="w-4 h-4" />
             {t.dimensions}
           </label>
           <div className="grid grid-cols-4 gap-2">
             <div className="relative group">
                <input
                  type="number" min="0" step="0.1"
                  className="w-full p-2 text-center border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white"
                  placeholder="L"
                  value={input.dimensions.length}
                  onChange={(e) => handleDimChange('length', e.target.value)}
                />
                <span className="text-xs text-slate-500 absolute -bottom-5 left-0 w-full text-center">L</span>
             </div>
             <div className="relative group">
                <input
                  type="number" min="0" step="0.1"
                  className="w-full p-2 text-center border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white"
                  placeholder="W"
                  value={input.dimensions.width}
                  onChange={(e) => handleDimChange('width', e.target.value)}
                />
                <span className="text-xs text-slate-500 absolute -bottom-5 left-0 w-full text-center">W</span>
             </div>
             <div className="relative group">
                <input
                  type="number" min="0" step="0.1"
                  className="w-full p-2 text-center border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white"
                  placeholder="H"
                  value={input.dimensions.height}
                  onChange={(e) => handleDimChange('height', e.target.value)}
                />
                 <span className="text-xs text-slate-500 absolute -bottom-5 left-0 w-full text-center">H</span>
             </div>
             <div className="relative group">
                <input
                  type="number" min="0" step="0.1"
                  className="w-full p-2 text-center border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white"
                  placeholder="Wt"
                  value={input.dimensions.weight}
                  onChange={(e) => handleDimChange('weight', e.target.value)}
                />
                 <span className="text-xs text-slate-500 absolute -bottom-5 left-0 w-full text-center font-medium">lb</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};