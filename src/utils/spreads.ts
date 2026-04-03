import { Spread } from '../models/types';

/**
 * 牌阵集合与插槽空间坐标定位
 * coordinates 为在 2.5D 平面透视下的锚点，(0,0) 为显示区中心
 */
export const SPREADS_LIBRARY: Record<string, Spread> = {
  'holy-triangle': {
    id: 'holy-triangle',
    name: '圣三角牌阵',
    cardCount: 3,
    positions: [
      {
        index: 0,
        meaning: '无明过去 (过去的缘由/遗留业力)',
        coordinates: { x: -220, y: 100, rotation: -8 }
      },
      {
        index: 1,
        meaning: '真实现状 (当前的能量/直面困境)',
        coordinates: { x: 0, y: -50, rotation: 0 }
      },
      {
        index: 2,
        meaning: '未定未来 (发展的趋势/可期结果)',
        coordinates: { x: 220, y: 100, rotation: 8 }
      }
    ]
  },
  'single-card': {
    id: 'single-card',
    name: '单张启示',
    cardCount: 1,
    positions: [
      {
        index: 0,
        meaning: '神之启示 (当前问题的聚焦指引)',
        coordinates: { x: 0, y: 0, rotation: 0 }
      }
    ]
  }
};
