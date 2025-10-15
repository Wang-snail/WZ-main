import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { KajianLesson } from '@/types';
import toast from 'react-hot-toast';

interface KajianLessonFormProps {
  lesson?: KajianLesson;
  onSave: (lesson: Omit<KajianLesson, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const KajianLessonForm: React.FC<KajianLessonFormProps> = ({
  lesson,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<KajianLesson, 'id' | 'createdAt' | 'updatedAt'>>({
    title: lesson?.title || '',
    category: lesson?.category || 'other',
    tags: lesson?.tags || [],
    importance: lesson?.importance || 3,
    date: lesson?.date || new Date().toISOString().split('T')[0],
    summary: lesson?.summary || '',
    background: lesson?.background || '',
    process: lesson?.process || '',
    result: lesson?.result || '',
    lesson: lesson?.lesson || '',
    keyPoints: lesson?.keyPoints || [],
    financialData: lesson?.financialData || {
      investment: 0,
      revenue: 0,
      profit: 0,
      roi: 0
    },
    relatedProducts: lesson?.relatedProducts || [],
    relatedLinks: lesson?.relatedLinks || []
  });

  const [newTag, setNewTag] = useState('');
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  // 计算 ROI
  useEffect(() => {
    const { investment, revenue } = formData.financialData || {};
    if (investment && investment > 0) {
      const profit = (revenue || 0) - investment;
      const roi = Math.round((profit / investment) * 100);
      setFormData(prev => ({
        ...prev,
        financialData: {
          ...prev.financialData!,
          profit,
          roi
        }
      }));
    }
  }, [formData.financialData?.investment, formData.financialData?.revenue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.title.trim()) {
      toast.error('请输入标题');
      return;
    }
    if (!formData.summary.trim()) {
      toast.error('请输入摘要');
      return;
    }

    onSave(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        keyPoints: [...prev.keyPoints, newKeyPoint.trim()]
      }));
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  const addProduct = () => {
    if (newProduct.trim()) {
      setFormData(prev => ({
        ...prev,
        relatedProducts: [...(prev.relatedProducts || []), newProduct.trim()]
      }));
      setNewProduct('');
    }
  };

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedProducts: prev.relatedProducts?.filter((_, i) => i !== index) || []
    }));
  };

  const addLink = () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      setFormData(prev => ({
        ...prev,
        relatedLinks: [...(prev.relatedLinks || []), { ...newLink }]
      }));
      setNewLink({ title: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      relatedLinks: prev.relatedLinks?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{lesson ? '编辑经验' : '添加新经验'}</CardTitle>
              <CardDescription>记录你的电商实践经验和教训</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">基本信息</h3>

              <div>
                <label className="block text-sm font-medium mb-2">标题 *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例如：首次尝试直播带货的惨痛失败"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">分类 *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="success">成功案例</option>
                    <option value="failure">失败教训</option>
                    <option value="operation">运营技巧</option>
                    <option value="product">选品经验</option>
                    <option value="marketing">营销推广</option>
                    <option value="other">其他经验</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">重要程度 *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.importance}
                    onChange={(e) => setFormData(prev => ({ ...prev, importance: parseInt(e.target.value) as any }))}
                  >
                    <option value="1">⭐ 1星</option>
                    <option value="2">⭐⭐ 2星</option>
                    <option value="3">⭐⭐⭐ 3星</option>
                    <option value="4">⭐⭐⭐⭐ 4星</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5星</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">日期 *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">摘要 *</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="简短描述这次经验..."
                  required
                />
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium mb-2">标签</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="添加标签..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="pl-3 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 详细内容 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">详细内容</h3>

              <div>
                <label className="block text-sm font-medium mb-2">背景描述</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.background}
                  onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                  placeholder="描述事情的背景..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">实施过程</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.process}
                  onChange={(e) => setFormData(prev => ({ ...prev, process: e.target.value }))}
                  placeholder="描述具体做了什么..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">最终结果</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.result}
                  onChange={(e) => setFormData(prev => ({ ...prev, result: e.target.value }))}
                  placeholder="描述最终的结果..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">经验教训</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={formData.lesson}
                  onChange={(e) => setFormData(prev => ({ ...prev, lesson: e.target.value }))}
                  placeholder="总结经验和教训..."
                />
              </div>

              {/* 关键要点 */}
              <div>
                <label className="block text-sm font-medium mb-2">关键要点</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyPoint}
                    onChange={(e) => setNewKeyPoint(e.target.value)}
                    placeholder="添加关键要点..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPoint())}
                  />
                  <Button type="button" onClick={addKeyPoint} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <span className="flex-1">{index + 1}. {point}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeKeyPoint(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 财务数据 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">财务数据（可选）</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">投入成本（元）</label>
                  <Input
                    type="number"
                    value={formData.financialData?.investment || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      financialData: {
                        ...prev.financialData!,
                        investment: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">产出收益（元）</label>
                  <Input
                    type="number"
                    value={formData.financialData?.revenue || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      financialData: {
                        ...prev.financialData!,
                        revenue: parseFloat(e.target.value) || 0
                      }
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">实际利润（自动计算）</label>
                  <Input
                    type="number"
                    value={formData.financialData?.profit || 0}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ROI %（自动计算）</label>
                  <Input
                    type="number"
                    value={formData.financialData?.roi || 0}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* 相关信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">相关信息（可选）</h3>

              {/* 相关产品 */}
              <div>
                <label className="block text-sm font-medium mb-2">相关产品</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    placeholder="添加相关产品..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                  />
                  <Button type="button" onClick={addProduct} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.relatedProducts?.map((product, index) => (
                    <Badge key={index} variant="outline" className="pl-3 pr-1">
                      {product}
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 相关链接 */}
              <div>
                <label className="block text-sm font-medium mb-2">相关链接</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newLink.title}
                    onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="链接标题..."
                    className="flex-1"
                  />
                  <Input
                    value={newLink.url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="URL..."
                    className="flex-1"
                  />
                  <Button type="button" onClick={addLink} size="sm">
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.relatedLinks?.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <span className="flex-1">
                        {link.title}: <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">{link.url}</a>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Save size={16} />
                保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
