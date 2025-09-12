// 工具评测数据结构和内容
export interface ToolReview {
  id: string;
  toolName: string;
  category: string;
  rating: number; // 1-5星
  pros: string[];
  cons: string[];
  useCases: string[];
  alternativeTools: string[];
  pricingModel: 'free' | 'freemium' | 'paid' | 'subscription';
  priceRange: string;
  learnDifficulty: 'easy' | 'medium' | 'hard';
  lastUpdated: string;
  reviewContent: {
    overview: string;
    features: {
      name: string;
      description: string;
      rating: number;
    }[];
    userExperience: string;
    performanceAnalysis: string;
    valueForMoney: string;
    conclusion: string;
  };
  screenshots?: string[];
  videoDemo?: string;
  author: {
    name: string;
    expertise: string;
  };
  tags: string[];
}

export const toolReviews: ToolReview[] = [
  {
    id: 'chatgpt-review',
    toolName: 'ChatGPT',
    category: 'AI对话',
    rating: 4.5,
    pros: [
      '对话能力极强，理解上下文',
      '支持多语言，中文表现优秀',
      '可处理多种类型任务',
      '响应速度快',
      '免费版本功能丰富'
    ],
    cons: [
      '知识更新有时间限制',
      '不能联网获取实时信息',
      '偶有事实性错误',
      'Plus版本较贵',
      '高峰期可能限流'
    ],
    useCases: [
      '文案写作和编辑',
      '编程代码助手',
      '学习和答疑',
      '创意头脑风暴',
      '翻译和语言学习'
    ],
    alternativeTools: ['Claude', 'Gemini', '文心一言', '通义千问'],
    pricingModel: 'freemium',
    priceRange: '免费 / $20/月',
    learnDifficulty: 'easy',
    lastUpdated: '2025-09-12',
    reviewContent: {
      overview: 'ChatGPT作为OpenAI推出的对话式AI工具，凭借其强大的自然语言理解和生成能力，成为了全球最受欢迎的AI助手之一。从简单的问答到复杂的内容创作，ChatGPT都展现出了令人印象深刻的性能。',
      features: [
        {
          name: '自然对话',
          description: '能够进行流畅自然的多轮对话，理解上下文和语境',
          rating: 5
        },
        {
          name: '内容创作',
          description: '擅长各类文本创作，包括文章、代码、诗歌等',
          rating: 4.5
        },
        {
          name: '知识问答',
          description: '拥有广泛的知识储备，能回答各领域问题',
          rating: 4
        },
        {
          name: '多语言支持',
          description: '支持包括中文在内的多种语言，翻译质量高',
          rating: 4.5
        },
        {
          name: '代码辅助',
          description: '能够编写、调试和解释代码，支持多种编程语言',
          rating: 4
        }
      ],
      userExperience: 'ChatGPT的用户界面简洁直观，对话体验流畅自然。响应速度通常很快，但在高峰期可能出现延迟。免费版本已经能满足大多数日常需求，Plus版本提供更稳定的服务和更高的使用限额。移动端应用体验良好，支持语音输入。',
      performanceAnalysis: '在文本理解和生成方面，ChatGPT表现出色，能够准确理解复杂指令并给出高质量回复。在编程任务上表现中等偏上，适合学习和简单开发任务。在创意写作方面表现优异，能够产生有趣且富有创意的内容。但在需要最新信息或实时数据的任务上存在局限性。',
      valueForMoney: '免费版本性价比极高，能够满足个人用户的大多数需求。Plus版本虽然价格不菲（$20/月），但提供的稳定性和额外功能对专业用户来说具有一定价值。相比其他同类付费工具，ChatGPT Plus的定价处于合理区间。',
      conclusion: 'ChatGPT是目前最成熟、最易用的AI对话工具之一，特别适合初学者和个人用户。虽然存在一些局限性，但其强大的通用能力和不断的更新迭代使其成为AI工具箱中的必备选择。建议先使用免费版本熟悉功能，有需要再考虑升级Plus。'
    },
    author: {
      name: 'AI工具评测师',
      expertise: 'AI产品分析专家'
    },
    tags: ['AI对话', '内容创作', '编程助手', '学习工具', '通用AI']
  },
  {
    id: 'midjourney-review',
    toolName: 'Midjourney',
    category: 'AI图像生成',
    rating: 4.3,
    pros: [
      '图像质量极高，艺术效果出色',
      '支持多种艺术风格',
      '社区活跃，易于学习',
      '持续更新迭代',
      'Discord集成方便使用'
    ],
    cons: [
      '需要通过Discord使用，不够直观',
      '价格相对较高',
      '没有免费试用',
      '生成速度依赖服务器负载',
      '商业使用需要付费计划'
    ],
    useCases: [
      '数字艺术创作',
      '概念设计和插画',
      '品牌视觉素材',
      '游戏和动画概念图',
      '社交媒体内容创作'
    ],
    alternativeTools: ['DALL-E', 'Stable Diffusion', 'Adobe Firefly', 'Imagen'],
    pricingModel: 'subscription',
    priceRange: '$10-60/月',
    learnDifficulty: 'medium',
    lastUpdated: '2025-09-12',
    reviewContent: {
      overview: 'Midjourney是目前最受欢迎的AI图像生成工具之一，以其卓越的艺术质量和独特的美学风格著称。通过简单的文本描述，用户就能生成令人惊艳的高质量图像，特别在艺术创作和概念设计领域表现突出。',
      features: [
        {
          name: '图像质量',
          description: '生成的图像质量极高，细节丰富，艺术感强',
          rating: 5
        },
        {
          name: '风格多样性',
          description: '支持多种艺术风格，从写实到抽象都能很好掌控',
          rating: 4.5
        },
        {
          name: '参数控制',
          description: '提供丰富的参数选项，可精细调控生成效果',
          rating: 4
        },
        {
          name: '社区支持',
          description: 'Discord社区活跃，容易获得帮助和灵感',
          rating: 4.5
        },
        {
          name: '更新频率',
          description: '版本更新频繁，功能持续改进',
          rating: 4
        }
      ],
      userExperience: 'Midjourney基于Discord运行，这一设计既有优势也有劣势。优势是社区互动性强，用户可以互相学习和交流；劣势是对新用户来说可能不够直观。学习曲线适中，掌握基本提示词技巧后就能创作出优秀作品。生成速度取决于服务器负载，通常在1-2分钟内完成。',
      performanceAnalysis: '在图像质量方面，Midjourney表现卓越，特别是在艺术性和美学方面领先其他工具。对提示词的理解能力很强，能够准确把握用户意图。在处理复杂场景和细节时表现优秀，但在生成文字内容时仍有局限。不同版本模型各有特色，V5.2在写实度上有显著提升。',
      valueForMoney: 'Midjourney的定价对专业用户来说具有合理性，基础计划$10/月可以满足轻度使用需求。对于商业用户，更高级别的计划虽然价格不菲但功能全面。相比雇佣设计师的成本，Midjourney提供了极高的性价比，特别是在概念设计和初期创作阶段。',
      conclusion: 'Midjourney是目前最优秀的AI图像生成工具之一，特别适合设计师、艺术家和内容创作者。虽然学习成本不低且价格不便宜，但其出色的图像质量和丰富的创意可能性使其物有所值。建议对图像质量有高要求的用户选择Midjourney，预算有限的用户可以考虑其他替代方案。'
    },
    author: {
      name: 'AI工具评测师',
      expertise: 'AI图像生成专家'
    },
    tags: ['AI图像生成', '数字艺术', '设计工具', '创意工具', 'Discord']
  },
  {
    id: 'notion-ai-review',
    toolName: 'Notion AI',
    category: 'AI写作',
    rating: 4.1,
    pros: [
      '与Notion完美集成',
      '支持多种写作场景',
      '界面简洁易用',
      '价格相对便宜',
      '支持中文写作'
    ],
    cons: [
      '功能相对基础',
      '创意性不如专业AI写作工具',
      '需要Notion账户',
      '生成速度一般',
      '高级功能有限'
    ],
    useCases: [
      '文档写作和编辑',
      '会议记录整理',
      '头脑风暴和创意',
      '内容大纲制作',
      '工作流程文档'
    ],
    alternativeTools: ['ChatGPT', 'Jasper', 'Copy.ai', 'Writesonic'],
    pricingModel: 'subscription',
    priceRange: '$10/月（Notion AI插件）',
    learnDifficulty: 'easy',
    lastUpdated: '2025-09-12',
    reviewContent: {
      overview: 'Notion AI是Notion推出的AI写作助手，作为Notion工作空间的原生集成功能，为用户提供智能写作和内容生成能力。其最大优势是与Notion的无缝集成，让用户在熟悉的环境中享受AI写作服务。',
      features: [
        {
          name: 'Notion集成',
          description: '原生集成到Notion中，使用体验无缝衔接',
          rating: 5
        },
        {
          name: '写作辅助',
          description: '提供多种写作模板和风格选择',
          rating: 4
        },
        {
          name: '内容生成',
          description: '支持文章、总结、翻译等多种内容生成',
          rating: 3.5
        },
        {
          name: '易用性',
          description: '界面简洁，学习成本低',
          rating: 4.5
        },
        {
          name: '多语言',
          description: '支持包括中文在内的多种语言',
          rating: 4
        }
      ],
      userExperience: 'Notion AI的用户体验非常流畅，特别是对于已经在使用Notion的用户。只需要简单的快捷键就能调用AI功能，生成的内容可以直接在页面中编辑和使用。响应速度适中，界面设计符合Notion的整体风格，学习成本很低。',
      performanceAnalysis: '在基础写作任务上，Notion AI表现良好，能够生成结构清晰、语言流畅的内容。但在创意写作和复杂内容生成方面，相比ChatGPT等专业工具还有差距。翻译功能表现中等，适合简单的翻译需求。总体来说，更适合日常办公和文档整理场景。',
      valueForMoney: 'Notion AI的定价$10/月相对合理，特别是对于重度Notion用户。考虑到其与Notion的完美集成和便利性，这个价格是值得的。但如果仅仅是为了AI写作功能，可能ChatGPT等工具提供更好的性价比。',
      conclusion: 'Notion AI是Notion用户的理想选择，其最大价值在于集成性和便利性。虽然在AI能力上不如专门的AI写作工具，但对于需要在Notion中进行内容创作的用户来说，是一个非常实用的工具。建议重度Notion用户尝试使用。'
    },
    author: {
      name: 'AI工具评测师',
      expertise: '办公软件和生产力工具专家'
    },
    tags: ['AI写作', 'Notion插件', '办公工具', '内容生成', '生产力']
  },
  {
    id: 'canva-ai-review',
    toolName: 'Canva AI',
    category: 'AI设计',
    rating: 4.0,
    pros: [
      '操作简单，零基础可用',
      '模板丰富，设计元素多',
      'AI功能集成度高',
      '支持团队协作',
      '价格亲民'
    ],
    cons: [
      'AI功能相对基础',
      '高级功能需要付费',
      '自定义程度有限',
      '加载速度有时较慢',
      '专业设计功能不足'
    ],
    useCases: [
      '社交媒体图片制作',
      '演示文稿设计',
      '海报和传单设计',
      '品牌视觉素材',
      '简单的动画制作'
    ],
    alternativeTools: ['Adobe Creative Suite', 'Figma', 'Sketch', 'Photoshop'],
    pricingModel: 'freemium',
    priceRange: '免费 / $15/月',
    learnDifficulty: 'easy',
    lastUpdated: '2025-09-12',
    reviewContent: {
      overview: 'Canva AI将人工智能技术集成到了流行的在线设计平台中，让非设计师也能轻松创作出专业水准的视觉内容。通过AI驱动的设计建议、自动布局优化和智能元素推荐，大大降低了设计门槛。',
      features: [
        {
          name: '智能设计',
          description: 'AI自动生成设计方案和布局建议',
          rating: 4
        },
        {
          name: '模板库',
          description: '拥有海量设计模板，涵盖各种场景',
          rating: 4.5
        },
        {
          name: '协作功能',
          description: '支持团队实时协作和评论',
          rating: 4
        },
        {
          name: '易用性',
          description: '界面直观，学习曲线平缓',
          rating: 5
        },
        {
          name: '输出质量',
          description: '支持多种格式输出，质量良好',
          rating: 4
        }
      ],
      userExperience: 'Canva AI的用户体验非常友好，特别适合设计新手。拖拽式操作简单直观，AI功能的集成也很自然。免费版本功能丰富，付费版本提供更多高级功能。在浏览器中运行流畅，也有移动端应用支持。',
      performanceAnalysis: '在简单到中等复杂度的设计任务上，Canva AI表现出色。AI功能能够提供有用的设计建议，自动调整元素布局也很智能。但对于需要高度自定义或复杂设计的项目，功能可能不够强大。色彩搭配和字体推荐功能实用性较高。',
      valueForMoney: 'Canva的免费版本已经非常实用，能够满足大多数个人用户的需求。Pro版本$15/月的价格合理，提供的额外功能和资源对于商业用户很有价值。相比雇佣设计师或购买昂贵的设计软件，Canva提供了极高的性价比。',
      conclusion: 'Canva AI是非设计师用户的理想选择，特别适合小企业主、市场人员和内容创作者。虽然在专业设计能力上有限制，但其易用性和丰富的资源使其成为日常设计工作的优秀工具。建议先使用免费版本，根据需要再考虑升级。'
    },
    author: {
      name: 'AI工具评测师',
      expertise: '设计工具和用户体验专家'
    },
    tags: ['AI设计', '图形设计', '在线工具', '协作工具', '模板设计']
  }
];

// 获取推荐评测
export function getRecommendedReviews(userPreferences: string[] = []): ToolReview[] {
  // 基于用户偏好推荐相关评测
  if (userPreferences.length === 0) {
    return toolReviews.slice(0, 3); // 默认推荐前3个
  }
  
  const filtered = toolReviews.filter(review => 
    userPreferences.some(pref => 
      review.category.includes(pref) || 
      review.tags.some(tag => tag.includes(pref))
    )
  );
  
  return filtered.length > 0 ? filtered : toolReviews.slice(0, 3);
}

// 获取热门评测
export function getPopularReviews(): ToolReview[] {
  return toolReviews.sort((a, b) => b.rating - a.rating).slice(0, 5);
}

// 按分类获取评测
export function getReviewsByCategory(category: string): ToolReview[] {
  return toolReviews.filter(review => review.category === category);
}

// 搜索评测
export function searchReviews(query: string): ToolReview[] {
  const lowercaseQuery = query.toLowerCase();
  return toolReviews.filter(review => 
    review.toolName.toLowerCase().includes(lowercaseQuery) ||
    review.category.toLowerCase().includes(lowercaseQuery) ||
    review.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    review.reviewContent.overview.toLowerCase().includes(lowercaseQuery)
  );
}