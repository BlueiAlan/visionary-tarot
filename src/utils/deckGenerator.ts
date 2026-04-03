import { Card } from '../models/types';

/**
 * 为了 MVP 构建轻量化示范，这里只静态置入22张“大阿尔卡纳”的核心秘力牌。
 * 生产环境应该具备全部的78张牌配置，或者从外部数据源拉取。
 */
const MAJOR_ARCANA_NAMES = [
  "愚者", "魔术师", "女祭司", "女皇", "皇帝", "教皇", "恋人", "战车", 
  "力量", "隐士", "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔",
  "高塔", "星星", "月亮", "太阳", "审判", "世界"
];

// 学术级塔罗对应四大元素
const ELEMENTS: ('FIRE' | 'EARTH' | 'AIR' | 'WATER')[] = [
  'AIR', 'AIR', 'WATER', 'EARTH', 'FIRE', 'EARTH', 'AIR', 'WATER', 
  'FIRE', 'EARTH', 'FIRE', 'AIR', 'WATER', 'WATER', 'FIRE', 'EARTH', 
  'FIRE', 'AIR', 'WATER', 'FIRE', 'FIRE', 'EARTH'
];

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  
  MAJOR_ARCANA_NAMES.forEach((name, idx) => {
    deck.push({
      id: `maj-${idx}`,
      name: name,
      suit: 'MAJOR',
      // 通过 Placeholder 模拟真实的塔罗视觉占位
      imageUrl: `https://via.placeholder.com/300x500/100e0a/D4AF37?text=${encodeURIComponent(name)}`,
      keywords: [name, "核心原型"], 
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
