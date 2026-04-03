/**
 * 核心实体结构类型定义
 * 本文件包含了所有的业务模型定义，便于严格保障开发过程中的 TS 类型安全。
 */

// ----------------------------------
// 全局状态枚举
// ----------------------------------
export enum AppState {
  INIT = "INIT",                           // 资源预加载
  AWAITING_CONTRACT = "AWAITING_CONTRACT", // 等待灵界链接契约 (获授权)
  SETTING_INTENT = "SETTING_INTENT",       // 输入问题与选择牌阵
  SHUFFLING = "SHUFFLING",                 // 洗牌模式（监测画圈手势）
  DRAWING = "DRAWING",                     // 抽牌模式（等待捏合手势）
  REVEALING = "REVEALING",                 // 卡牌翻转展示
  INTERPRETED = "INTERPRETED",             // 展示解读结果
  SEALED_AND_RESET = "SEALED_AND_RESET"    // 导出完成，等待重置
}

export type InteractionMode = 'GESTURE' | 'TOUCH';

// ----------------------------------
// 卡牌与牌阵配置实体
// ----------------------------------
export interface Card {
  id: string; // 例如: maj-00
  name: string; // 例如: The Fool
  suit: 'MAJOR' | 'WANDS' | 'CUPS' | 'SWORDS' | 'PENTACLES';
  imageUrl: string;
  keywords: string[];
  element?: 'FIRE' | 'EARTH' | 'AIR' | 'WATER';
}

export interface SpreadPosition {
  index: number;
  meaning: string;
  coordinates?: { x: number; y: number; rotation: number };
}

export interface Spread {
  id: string;
  name: string;
  cardCount: number;
  positions: SpreadPosition[];
}

// ----------------------------------
// 占卜会话状态实体
// ----------------------------------
export interface DrawnCard {
  cardId: string;
  isReversed: boolean;
  positionIndex: number;
}

export interface ReadingSession {
  userQuestion: string;
  selectedSpread: Spread | null;
  drawnCards: DrawnCard[];
}
