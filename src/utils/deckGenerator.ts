import { Card } from '../models/types';

/**
 * 为了 MVP 构建轻量化示范，这里只静态置入22张“大阿尔卡纳”的核心秘力牌。
 * 生产环境应该具备全部的78张牌配置，或者从外部数据源拉取。
 */
const MAJOR_ARCANA = [
  { cn: "愚者", en: "The_Fool" },
  { cn: "魔术师", en: "The_Magician" },
  { cn: "女祭司", en: "The_High_Priestess" },
  { cn: "女皇", en: "The_Empress" },
  { cn: "皇帝", en: "The_Emperor" },
  { cn: "教皇", en: "The_Hierophant" },
  { cn: "恋人", en: "The_Lovers" },
  { cn: "战车", en: "The_Chariot" },
  { cn: "力量", en: "Strength" },
  { cn: "隐士", en: "The_Hermit" },
  { cn: "命运之轮", en: "Wheel_of_Fortune" },
  { cn: "正义", en: "Justice" },
  { cn: "倒吊人", en: "The_Hanged_Man" },
  { cn: "死神", en: "Death" },
  { cn: "节制", en: "Temperance" },
  { cn: "恶魔", en: "The_Devil" },
  { cn: "高塔", en: "The_Tower" },
  { cn: "星星", en: "The_Star" },
  { cn: "月亮", en: "The_Moon" },
  { cn: "太阳", en: "The_Sun" },
  { cn: "审判", en: "Judgement" },
  { cn: "世界", en: "The_World" }
];

// 学术级塔罗对应四大元素
const ELEMENTS: ('FIRE' | 'EARTH' | 'AIR' | 'WATER')[] = [
  'AIR', 'AIR', 'WATER', 'EARTH', 'FIRE', 'EARTH', 'AIR', 'WATER', 
  'FIRE', 'EARTH', 'FIRE', 'AIR', 'WATER', 'WATER', 'FIRE', 'EARTH', 
  'FIRE', 'AIR', 'WATER', 'FIRE', 'FIRE', 'EARTH'
];

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  
  MAJOR_ARCANA.forEach((item, idx) => {
    // 动态生成 imageUrl (vite alias/relative path) 解决加载问题
    const imageUrl = new URL(`../assets/images/tarot/${item.en}.webp`, import.meta.url).href;

    deck.push({
      id: `maj-${idx}`,
      name: item.en.replace(/_/g, ' '),
      chineseName: item.cn,
      suit: 'MAJOR',
      imageUrl: imageUrl, // 使用真实的占卜牌面资产
      imageFileName: `${item.en}.webp`,
      keywords: [item.cn, "核心原型"], 
      chineseKeywords: [item.cn, "核心原型"],
      element: ELEMENTS[idx]
    });
  });

  return deck;
}

/**
 * 严格洗牌算法
 * 该 Fisher-Yates 会彻底打乱内存中的牌堆对象顺序
 * 如果后续项目向高度加密方向发展，可引入 Web Crypto API 生成随机种子替代 Math.random()
 */
export function shuffleDeck<T>(deck: T[]): T[] {
  const array = [...deck];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // 元素换位
  }
  return array;
}
