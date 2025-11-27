import React from 'react';
import { DimensionUnit, WeightUnit, ProductCategory, ProductInput } from '../types';

interface InputSectionProps {
  values: ProductInput;
  onChange: (key: keyof ProductInput, value: any) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ values, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    onChange(name as keyof ProductInput, type === 'number' ? parseFloat(value) || 0 : value);
  };

  const inputClass = "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-sm";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1.5";

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      {/* Category Selection */}
      <div className="mb-5">
        <label className={labelClass}>商品分类</label>
        <div className="relative">
          <select
            name="category"
            value={values.category}
            onChange={handleChange}
            className={`${inputClass} appearance-none font-medium text-gray-700`}
          >
            {Object.values(ProductCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-gray-500">单件重量</label>
          <div className="flex bg-gray-100 rounded p-0.5">
            {Object.values(WeightUnit).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => onChange('weightUnit', unit)}
                className={`text-[10px] px-2 py-0.5 rounded transition-all uppercase font-medium ${
                  values.weightUnit === unit
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <input
            type="number"
            name="weight"
            value={values.weight || ''}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={inputClass}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
            {values.weightUnit}
          </span>
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-gray-500">商品尺寸 (L x W x H)</label>
          <div className="flex bg-gray-100 rounded p-0.5">
            {Object.values(DimensionUnit).map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => onChange('dimUnit', unit)}
                className={`text-[10px] px-2 py-0.5 rounded transition-all uppercase font-medium ${
                  values.dimUnit === unit
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <input
              type="number"
              name="length"
              value={values.length || ''}
              onChange={handleChange}
              placeholder="长"
              min="0"
              step="0.1"
              className={inputClass}
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="width"
              value={values.width || ''}
              onChange={handleChange}
              placeholder="宽"
              min="0"
              step="0.1"
              className={inputClass}
            />
          </div>
          <div className="relative">
            <input
              type="number"
              name="height"
              value={values.height || ''}
              onChange={handleChange}
              placeholder="高"
              min="0"
              step="0.1"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;