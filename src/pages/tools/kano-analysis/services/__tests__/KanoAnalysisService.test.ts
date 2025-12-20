import { describe, it, expect } from 'vitest';
import { KanoAnalysisService, SENTIMENT_TO_KANO_MAPPING, KANO_MATRIX } from '../KanoAnalysisService';
import { OpinionFragment } from '../../store/kanoToolStore';

describe('KanoAnalysisService', () => {
  // 测试数据
  const mockFragments: OpinionFragment[] = [
    {
      id: '1',
      commentId: 'comment1',
      feature: '电池续航',
      rawText: '电池续航太短了，很不满意',
      sentimentType: 'strong_complaint',
      confidence: 0.9,
      position: [0, 10],
      context: '用户对电池续航的强烈不满'
    },
    {
      id: '2',
      commentId: 'comment2',
      feature: '电池续航',
      rawText: '电池续航还可以，基本够用',
      sentimentType: 'neutral',
      confidence: 0.7,
      position: [0, 12],
      context: '用户对电池续航的中性评价'
    },
    {
      id: '3',
      commentId: 'comment3',
      feature: '屏幕显示',
      rawText: '屏幕显示效果超出预期，很惊喜',
      sentimentType: 'strong_praise',
      confidence: 0.95,
      position: [0, 15],
      context: '用户对屏幕显示的惊喜好评'
    },
    {
      id: '4',
      commentId: 'comment4',
      feature: '屏幕显示',
      rawText: '屏幕显示不错，符合期望',
      sentimentType: 'weak_praise',
      confidence: 0.8,
      position: [0, 13],
      context: '用户对屏幕显示的满意评价'
    }
  ];

  describe('情感到Kano映射', () => {
    it('应该正确映射强烈抱怨到必备特性', () => {
      const mapping = SENTIMENT_TO_KANO_MAPPING['strong_complaint'];
      expect(mapping.functional).toBe('理应如此');
      expect(mapping.dysfunctional).toBe('很不喜欢');
      
      const kanoCategory = KANO_MATRIX[mapping.functional][mapping.dysfunctional];
      expect(kanoCategory).toBe('M'); // 必备特性
    });

    it('应该正确映射强烈赞扬到魅力特性', () => {
      const mapping = SENTIMENT_TO_KANO_MAPPING['strong_praise'];
      expect(mapping.functional).toBe('非常喜欢');
      expect(mapping.dysfunctional).toBe('无所谓');
      
      const kanoCategory = KANO_MATRIX[mapping.functional][mapping.dysfunctional];
      expect(kanoCategory).toBe('A'); // 魅力特性
    });

    it('应该正确映射中性情感到无差异特性', () => {
      const mapping = SENTIMENT_TO_KANO_MAPPING['neutral'];
      expect(mapping.functional).toBe('无所谓');
      expect(mapping.dysfunctional).toBe('无所谓');
      
      const kanoCategory = KANO_MATRIX[mapping.functional][mapping.dysfunctional];
      expect(kanoCategory).toBe('I'); // 无差异特性
    });
  });

  describe('analyzeFragments', () => {
    it('应该正确分析观点片段并返回结果', () => {
      const results = KanoAnalysisService.analyzeFragments(mockFragments);
      
      expect(results).toHaveLength(2); // 两个功能：电池续航、屏幕显示
      
      // 检查电池续航功能
      const batteryFeature = results.find(r => r.feature === '电池续航');
      expect(batteryFeature).toBeDefined();
      expect(batteryFeature!.totalVotes).toBe(2);
      expect(batteryFeature!.fragments).toHaveLength(2);
      
      // 检查屏幕显示功能
      const screenFeature = results.find(r => r.feature === '屏幕显示');
      expect(screenFeature).toBeDefined();
      expect(screenFeature!.totalVotes).toBe(2);
      expect(screenFeature!.fragments).toHaveLength(2);
    });

    it('应该正确计算Better和Worse系数', () => {
      const results = KanoAnalysisService.analyzeFragments(mockFragments);
      
      results.forEach(result => {
        expect(result.betterCoefficient).toBeGreaterThanOrEqual(0);
        expect(result.betterCoefficient).toBeLessThanOrEqual(100);
        expect(result.worseCoefficient).toBeLessThanOrEqual(0);
        expect(result.worseCoefficient).toBeGreaterThanOrEqual(-100);
      });
    });

    it('应该按总票数排序结果', () => {
      // 创建不同票数的测试数据
      const testFragments = [
        ...mockFragments,
        {
          id: '5',
          commentId: 'comment5',
          feature: '新功能',
          rawText: '新功能很好用',
          sentimentType: 'weak_praise',
          confidence: 0.8,
          position: [0, 10],
          context: '用户对新功能的好评'
        }
      ];
      
      const results = KanoAnalysisService.analyzeFragments(testFragments);
      
      // 验证排序（票数多的在前）
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].totalVotes).toBeGreaterThanOrEqual(results[i + 1].totalVotes);
      }
    });
  });

  describe('generateKanoTable', () => {
    it('应该生成正确格式的Kano表格数据', () => {
      const results = KanoAnalysisService.analyzeFragments(mockFragments);
      const tableData = KanoAnalysisService.generateKanoTable(results);
      
      expect(tableData).toHaveLength(results.length);
      
      tableData.forEach(row => {
        expect(row.feature).toBeDefined();
        expect(row.percentages).toBeDefined();
        expect(row.finalCategory).toBeDefined();
        expect(row.betterCoefficient).toBeDefined();
        expect(row.worseCoefficient).toBeDefined();
        
        // 验证百分比总和约等于100%（允许舍入误差）
        const total = Object.values(row.percentages).reduce((sum, val) => sum + val, 0);
        expect(total).toBeCloseTo(100, 0);
      });
    });
  });

  describe('getCategoryInfo', () => {
    it('应该返回正确的类别信息', () => {
      const mInfo = KanoAnalysisService.getCategoryInfo('M');
      expect(mInfo.name).toBe('必备特性');
      expect(mInfo.description).toBe('基本型需求，必须具备的功能');
      
      const aInfo = KanoAnalysisService.getCategoryInfo('A');
      expect(aInfo.name).toBe('魅力特性');
      expect(aInfo.description).toBe('兴奋型需求，超出期望的惊喜');
    });

    it('应该为未知类别返回默认信息', () => {
      const unknownInfo = KanoAnalysisService.getCategoryInfo('UNKNOWN');
      expect(unknownInfo.name).toBe('无差异特性');
    });
  });

  describe('generateRecommendations', () => {
    it('应该为不同Kano类别生成相应建议', () => {
      const results = KanoAnalysisService.analyzeFragments(mockFragments);
      const recommendations = KanoAnalysisService.generateRecommendations(results);
      
      expect(recommendations).toBeInstanceOf(Array);
      
      recommendations.forEach(rec => {
        expect(rec.priority).toMatch(/^(high|medium|low)$/);
        expect(rec.category).toBeDefined();
        expect(rec.action).toBeDefined();
        expect(rec.rationale).toBeDefined();
        expect(rec.features).toBeInstanceOf(Array);
      });
    });
  });

  describe('边界情况处理', () => {
    it('应该处理空数组输入', () => {
      const results = KanoAnalysisService.analyzeFragments([]);
      expect(results).toEqual([]);
    });

    it('应该处理未知情感类型', () => {
      const unknownFragment: OpinionFragment = {
        id: '1',
        commentId: 'comment1',
        feature: '测试功能',
        rawText: '测试文本',
        sentimentType: 'unknown_sentiment',
        confidence: 0.5,
        position: [0, 5],
        context: '测试上下文'
      };
      
      const results = KanoAnalysisService.analyzeFragments([unknownFragment]);
      expect(results).toHaveLength(1);
      expect(results[0].finalCategory).toBe('I'); // 默认为无差异特性
    });
  });
});