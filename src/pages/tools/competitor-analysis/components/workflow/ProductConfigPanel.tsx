/**
 * 产品配置面板组件
 * 用于配置和管理用户的基础产品信息
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Plus, Trash2, Package, DollarSign, Weight, Ruler, Factory, TrendingUp } from 'lucide-react';
import {
  useCompetitorAnalysisStore,
  useShallow
} from '../../store/competitorAnalysisStore';
import { DataStorageService } from '../../services/data/DataStorageService';
import type { BaseProduct } from '../../types';

/**
 * 产品配置表单验证schema
 */
const productConfigSchema = z.object({
  name: z.string()
    .min(1, '产品名称不能为空')
    .max(100, '产品名称不能超过100个字符'),
  cost: z.number()
    .min(0.01, '成本必须大于0')
    .max(100000, '成本不能超过100,000'),
  weight: z.number()
    .min(0.1, '重量必须大于0.1g')
    .max(50000, '重量不能超过50kg'),
  dimensions: z.object({
    length: z.number()
      .min(0.1, '长度必须大于0.1cm')
      .max(1000, '长度不能超过1000cm'),
    width: z.number()
      .min(0.1, '宽度必须大于0.1cm')
      .max(1000, '宽度不能超过1000cm'),
    height: z.number()
      .min(0.1, '高度必须大于0.1cm')
      .max(1000, '高度不能超过1000cm')
  }),
  fixedInvestment: z.number()
    .min(0, '固定投入不能为负数')
    .max(10000000, '固定投入不能超过1000万'),
  estimatedMonthlySales: z.number()
    .min(1, '预估月销量必须至少为1')
    .max(1000000, '预估月销量不能超过100万'),
  features: z.array(z.string().min(1, '功能特性不能为空'))
    .min(1, '至少需要添加一个功能特性')
    .max(20, '功能特性不能超过20个')
});

type ProductConfigFormData = z.infer<typeof productConfigSchema>;

/**
 * 产品配置面板组件
 */
const ProductConfigPanel: React.FC = () => {
  // 状态管理 - 使用 inline selectors 修复无限循环问题
  const baseProduct = useCompetitorAnalysisStore(s => s.baseProduct);
  const preferences = useCompetitorAnalysisStore(s => s.preferences);

  const {
    setCurrentStep,
    setStepStatus
  } = useCompetitorAnalysisStore(useShallow((state: any) => ({
    setCurrentStep: state.setCurrentStep,
    setStepStatus: state.setStepStatus
  })));

  const {
    setLoading,
    setError
  } = useCompetitorAnalysisStore(useShallow((state: any) => ({
    setLoading: state.setLoading,
    setError: state.setError
  })));

  const setBaseProduct = useCompetitorAnalysisStore(s => s.setBaseProduct);

  // 本地状态
  const [savedProducts, setSavedProducts] = useState<BaseProduct[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [showProductList, setShowProductList] = useState(false);

  // 表单管理
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<ProductConfigFormData>({
    resolver: zodResolver(productConfigSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      cost: 0,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      fixedInvestment: 0,
      estimatedMonthlySales: 100,
      features: []
    }
  });

  // 监听表单数据变化
  const watchedData = watch();
  const currentFeatures = watch('features') || [];

  /**
   * 组件初始化
   */
  useEffect(() => {
    loadSavedProducts();
  }, []); // 只在组件挂载时加载一次

  /**
   * 当 baseProduct 变化时填充表单
   */
  useEffect(() => {
    if (baseProduct) {
      populateForm(baseProduct);
      setIsEditing(true);
    }
  }, [baseProduct]); // 移除 populateForm 依赖，因为它是稳定的函数

  /**
   * 加载已保存的产品列表
   */
  const loadSavedProducts = async () => {
    try {
      setLoading(true);
      const products = await DataStorageService.getAllBaseProducts();
      setSavedProducts(products);
    } catch (error) {
      console.error('Failed to load saved products:', error);
      setError({
        type: 'STORAGE_ERROR' as any,
        message: '加载产品列表失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date(),
        retryable: true
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 填充表单数据
   */
  const populateForm = (product: BaseProduct) => {
    reset({
      name: product.name,
      cost: product.cost,
      weight: product.weight,
      dimensions: product.dimensions,
      fixedInvestment: product.fixedInvestment,
      estimatedMonthlySales: product.estimatedMonthlySales,
      features: product.features
    });
  };

  /**
   * 生成产品ID
   */
  const generateProductId = (): string => {
    return `product-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  /**
   * 计算产品体积
   */
  const calculateVolume = (dimensions: { length: number; width: number; height: number }): number => {
    return dimensions.length * dimensions.width * dimensions.height;
  };

  /**
   * 添加功能特性
   */
  const addFeature = () => {
    if (newFeature.trim() && !currentFeatures.includes(newFeature.trim())) {
      const updatedFeatures = [...currentFeatures, newFeature.trim()];
      setValue('features', updatedFeatures);
      setNewFeature('');
    }
  };

  /**
   * 删除功能特性
   */
  const removeFeature = (index: number) => {
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    setValue('features', updatedFeatures);
  };

  /**
   * 提交表单
   */
  const onSubmit = async (data: ProductConfigFormData) => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const productData: BaseProduct = {
        id: baseProduct?.id || generateProductId(),
        name: data.name,
        cost: data.cost,
        weight: data.weight,
        dimensions: {
          length: data.dimensions?.length || 0,
          width: data.dimensions?.width || 0,
          height: data.dimensions?.height || 0
        },
        fixedInvestment: data.fixedInvestment,
        estimatedMonthlySales: data.estimatedMonthlySales,
        features: data.features,
        createdAt: baseProduct?.createdAt || now,
        updatedAt: now
      };

      // 保存到数据库
      await DataStorageService.saveBaseProduct(productData);

      // 更新状态
      setBaseProduct(productData);
      setStepStatus('config', 'completed');

      // 刷新产品列表
      await loadSavedProducts();

      // 自动进入下一步
      setTimeout(() => {
        setCurrentStep('input');
      }, 1000);

    } catch (error) {
      console.error('Failed to save product:', error);
      setError({
        type: 'STORAGE_ERROR' as any,
        message: '保存产品信息失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date(),
        retryable: true
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 选择已保存的产品
   */
  const selectSavedProduct = (product: BaseProduct) => {
    setBaseProduct(product);
    populateForm(product);
    setIsEditing(true);
    setShowProductList(false);
    setStepStatus('config', 'completed');
  };

  /**
   * 删除已保存的产品
   */
  const deleteSavedProduct = async (productId: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;

    try {
      setLoading(true);
      await DataStorageService.deleteBaseProduct(productId);
      await loadSavedProducts();

      // 如果删除的是当前选中的产品，清空表单
      if (baseProduct?.id === productId) {
        setBaseProduct(null);
        reset();
        setIsEditing(false);
        setStepStatus('config', 'pending');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError({
        type: 'STORAGE_ERROR' as any,
        message: '删除产品失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date(),
        retryable: true
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 创建新产品
   */
  const createNewProduct = () => {
    setBaseProduct(null);
    reset();
    setIsEditing(false);
    setShowProductList(false);
    setStepStatus('config', 'pending');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">产品配置</h2>
            <p className="text-sm text-gray-600">配置您的产品基础信息，用于竞品对比分析</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowProductList(!showProductList)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Package className="w-4 h-4 mr-2" />
            选择已有产品
          </button>

          <button
            type="button"
            onClick={createNewProduct}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建产品
          </button>
        </div>
      </div>

      {/* 已保存产品列表 */}
      {showProductList && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">已保存的产品</h3>
          {savedProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无已保存的产品</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => selectSavedProduct(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                      <p className="text-sm text-gray-600">成本: ${product.cost}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedProduct(product.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 产品配置表单 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 产品名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              产品名称 *
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例如：便携挂脖风扇 F-2025"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* BOM成本 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              BOM成本 ({preferences.defaultCurrency}) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('cost', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="8.50"
            />
            {errors.cost && (
              <p className="mt-1 text-sm text-red-600">{errors.cost.message}</p>
            )}
          </div>
        </div>

        {/* 物理规格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 重量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Weight className="w-4 h-4 inline mr-1" />
              重量 ({preferences.defaultWeightUnit}) *
            </label>
            <input
              type="number"
              step="0.1"
              {...register('weight', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="220"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
            )}
          </div>

          {/* 尺寸 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-1" />
              尺寸 ({preferences.defaultDimensionUnit}) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.1"
                {...register('dimensions.length', { valueAsNumber: true })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="长"
              />
              <input
                type="number"
                step="0.1"
                {...register('dimensions.width', { valueAsNumber: true })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="宽"
              />
              <input
                type="number"
                step="0.1"
                {...register('dimensions.height', { valueAsNumber: true })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="高"
              />
            </div>
            {(errors.dimensions?.length || errors.dimensions?.width || errors.dimensions?.height) && (
              <p className="mt-1 text-sm text-red-600">请填写完整的尺寸信息</p>
            )}
            {watchedData.dimensions && watchedData.dimensions.length !== undefined && watchedData.dimensions.width !== undefined && watchedData.dimensions.height !== undefined && (
              <p className="mt-1 text-xs text-gray-500">
                体积: {calculateVolume(watchedData.dimensions as { length: number; width: number; height: number }).toFixed(2)} cm³
              </p>
            )}
          </div>
        </div>

        {/* 投资信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 固定投入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Factory className="w-4 h-4 inline mr-1" />
              固定投入 ({preferences.defaultCurrency}) *
            </label>
            <input
              type="number"
              step="1"
              {...register('fixedInvestment', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5000"
            />
            <p className="mt-1 text-xs text-gray-500">包括模具、认证等一次性投入</p>
            {errors.fixedInvestment && (
              <p className="mt-1 text-sm text-red-600">{errors.fixedInvestment.message}</p>
            )}
          </div>

          {/* 预估月销量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              预估月销量 (件) *
            </label>
            <input
              type="number"
              step="1"
              {...register('estimatedMonthlySales', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="500"
            />
            <p className="mt-1 text-xs text-gray-500">用于计算投资回报周期</p>
            {errors.estimatedMonthlySales && (
              <p className="mt-1 text-sm text-red-600">{errors.estimatedMonthlySales.message}</p>
            )}
          </div>
        </div>

        {/* 功能特性 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            功能特性 *
          </label>

          {/* 添加功能特性 */}
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入功能特性，如：2000mAh电池"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              添加
            </button>
          </div>

          {/* 功能特性列表 */}
          <div className="flex flex-wrap gap-2">
            {currentFeatures.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {errors.features && (
            <p className="mt-1 text-sm text-red-600">{errors.features.message}</p>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={createNewProduct}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            重置
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? '更新产品' : '保存产品'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductConfigPanel;