import { create } from 'zustand';
import { AppState, InteractionMode, ReadingSession, DrawnCard, Spread } from '../models/types';

/**
 * Zustand 全局状态管理器
 * 跨层级统筹应用的交互流程和配置
 */
interface AppStoreState {
  // App 环境与系统配置
  appState: AppState;
  interactionMode: InteractionMode;
  audioEnabled: boolean;
  apiKey: string;
  
  // 占卜会话核心数据
  session: ReadingSession;
  interpretationText: string;

  // 状态修改器 Actions
  setAppState: (state: AppState) => void;
  setInteractionMode: (mode: InteractionMode) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setApiKey: (key: string) => void;
  
  // 占卜流程专用的修改器 Actions
  setSessionQuestion: (question: string) => void;
  setSessionSpread: (spread: Spread) => void;
  addDrawnCard: (card: DrawnCard) => void;
  setInterpretationText: (text: string) => void;
  resetSession: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  appState: AppState.INIT,
  interactionMode: 'GESTURE', // 默认激活手势模式
  audioEnabled: true,
  
  // 在初始化时安全地从 LocalStorage 中读取并还原被稍微混淆过的 API Key
  apiKey: (() => {
    try {
      const stored = localStorage.getItem('tarot_gemini_key');
      return stored ? atob(stored).split('|')[0] : '';
    } catch {
      return '';
    }
  })(),
  
  session: {
    userQuestion: '',
    selectedSpread: null,
    drawnCards: [],
  },
  interpretationText: '',

  setAppState: (state) => set({ appState: state }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setApiKey: (key) => {
    // 粗略客户端混淆后写入本地缓存，防止直接被简单的 XSS 读取明文
    const encryptedKey = btoa(`${key}|${Date.now()}|${Math.random().toString(36).substring(2)}`);
    localStorage.setItem('tarot_gemini_key', encryptedKey);
    set({ apiKey: key });
  },
  
  setSessionQuestion: (userQuestion) => set((state) => ({ session: { ...state.session, userQuestion } })),
  setSessionSpread: (selectedSpread) => set((state) => ({ session: { ...state.session, selectedSpread } })),
  addDrawnCard: (card) => set((state) => ({ session: { ...state.session, drawnCards: [...state.session.drawnCards, card] } })),
  setInterpretationText: (text) => set({ interpretationText: text }),
  
  resetSession: () => set({
    appState: AppState.AWAITING_CONTRACT, // 重置返回到契约等待页（或直接设意图阶段）
    session: { userQuestion: '', selectedSpread: null, drawnCards: [] },
    interpretationText: ''
  })
}));
