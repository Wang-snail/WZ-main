// 示例争议数据，用于快速体验
export interface ExampleCase {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}

export const exampleCases: ExampleCase[] = [
  {
    id: 'time-management',
    title: '时间分配争议',
    description: '关于工作与陪伴时间的分歧',
    content: `最近我们因为时间安排产生了分歧。我觉得他工作太忙了，总是加班到很晚，周末也要处理工作的事情。我们已经好久没有一起看电影、散步或者好好聊天了。我感觉自己像是一个人在谈恋爱，很孤独，也很失落。

但是他说他现在这个项目很重要，关系到他的职业发展和晋升机会。他说他不是不想陪我，而是真的没有时间。他觉得我应该理解他，支持他的事业。他说等这段忙碌期过去就好了，但是我觉得总是有各种理由。

我希望他能够平衡一下工作和生活，给我们的关系多一些时间。而他希望我能更加理解他的工作压力，不要给他额外的负担。`,
    category: 'time'
  },
  {
    id: 'communication-style',
    title: '沟通方式问题',
    description: '关于表达和倾听方式的冲突',
    content: `我们在沟通方式上经常产生矛盾。每次遇到问题，我希望能够马上坐下来好好谈一谈，把事情说清楚。我觉得有问题就应该直接说出来，不要憋在心里。但是每次我想要沟通的时候，他总是很沉默，不愿意多说话。

他说我说话的时候总是很激动，语气很重，让他感觉压力很大。他说他需要时间思考，不能马上就回应我。他更喜欢冷静一段时间后再讨论。但是我觉得冷处理就是在逃避问题，会让矛盾越积越深。

我感觉他不够关心我的感受，不愿意跟我分享他的想法。而他觉得我太急躁了，不给他思考的空间。我们都希望能够改善沟通方式，但是不知道该怎么办。`,
    category: 'communication'
  },
  {
    id: 'money-values',
    title: '金钱观念差异',
    description: '关于消费和储蓄理念的分歧',
    content: `我们在金钱管理上有很大的分歧。我比较喜欢存钱，觉得应该为将来做打算，每个月都要存一部分钱。我不太愿意花钱买一些我觉得不必要的东西，比如昂贵的衣服、电子产品或者频繁的外出就餐。

但是她觉得赚钱就是为了花钱，应该享受当下的生活。她经常买一些我觉得不实用的东西，比如化妆品、装饰品，还喜欢和朋友聚餐、旅行。她说我太小气了，不懂得生活的乐趣。

我担心这样下去我们会没有积蓄，将来遇到什么急事就麻烦了。而她觉得我太节俭了，让她感觉生活很压抑。她希望我能够放松一点，偶尔也享受一下生活。我们都希望能够找到一个平衡点，但是很难达成一致。`,
    category: 'money'
  },
  {
    id: 'family-responsibility',
    title: '家庭责任分工',
    description: '关于家务和责任分配的争议',
    content: `我们在家庭责任分工上经常有争议。我觉得家务活应该两个人一起分担，不应该都落在一个人身上。但是实际情况是我承担了大部分的家务，包括做饭、洗衣服、打扫卫生等等。我每天下班回家还要忙这些事情，感觉很累。

他说他工作比较忙，而且不太会做家务。他觉得我做得比他好，所以更适合做这些事情。但是我觉得这不是借口，家务活可以学，也应该分担。我希望他能够主动承担一些家务，而不是总是等我安排。

他觉得我太计较了，说他也有在帮忙，只是方式不一样。他会负责一些重活，比如搬东西、修理电器等等。但是我觉得这些事情相比日常家务来说频率太低了。我们都希望能够找到一个公平的分工方式。`,
    category: 'family'
  },
  {
    id: 'social-circle',
    title: '社交圈子问题',
    description: '关于朋友关系和社交活动的分歧',
    content: `我们在朋友和社交方面有一些分歧。我比较喜欢和朋友聚会，觉得维持友谊很重要。我经常会和朋友一起吃饭、看电影、聊天，有时候也会参加一些聚会活动。但是他觉得我花在朋友身上的时间太多了，影响了我们的相处时间。

他比较内向，不太喜欢社交活动。他更愿意和我两个人安静地待在家里，或者只是两个人出去。他说我的朋友太多太杂，有些人他不太喜欢。他特别不喜欢我和异性朋友的接触，觉得界限不够清楚。

我觉得他太占有欲了，不应该限制我的社交自由。朋友对我来说很重要，我不想因为谈恋爱就失去朋友。而他觉得恋爱了就应该把对方放在第一位，不应该把太多精力分给其他人。我们在这个问题上经常争吵。`,
    category: 'social'
  },
  {
    id: 'future-planning',
    title: '未来规划分歧',
    description: '关于人生方向和未来计划的不同看法',
    content: `我们对未来的规划有很大的分歧。我希望能够早点结婚，然后在几年内要孩子，过上稳定的家庭生活。我觉得我们已经在一起很久了，应该考虑下一步了。我也希望能够在父母附近定居，这样方便照顾老人。

但是他觉得现在还太早，他想要先专注于事业发展，积累更多的经验和财富。他说结婚生子是很大的责任，需要做好充分的准备。他还想要多旅行、多体验不同的生活方式，不想这么早就被家庭束缚。

我担心如果一直等下去，最后可能会错过最好的时机。而且我觉得感情到了一定程度就应该有所承诺。他觉得我太着急了，爱情不应该有时间压力。我们在这个问题上很难达成一致，这让我感到很焦虑。`,
    category: 'future'
  }
];

// 根据类别获取示例
export function getExamplesByCategory(category: string): ExampleCase[] {
  return exampleCases.filter(example => example.category === category);
}

// 获取随机示例
export function getRandomExample(): ExampleCase {
  const randomIndex = Math.floor(Math.random() * exampleCases.length);
  return exampleCases[randomIndex];
}

// 搜索示例
export function searchExamples(keyword: string): ExampleCase[] {
  const lowerKeyword = keyword.toLowerCase();
  return exampleCases.filter(example => 
    example.title.toLowerCase().includes(lowerKeyword) ||
    example.description.toLowerCase().includes(lowerKeyword) ||
    example.content.toLowerCase().includes(lowerKeyword)
  );
}
