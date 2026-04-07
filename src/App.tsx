import { useState } from 'react';
import './index.css';
import { useAppStore } from './store/useAppStore';
import { AppState } from './models/types';
import { RitualSpaceView } from './views/RitualSpaceView';
import { RevelationView } from './views/RevelationView';
import { SPREADS_LIBRARY } from './utils/spreads';
import { motion } from 'framer-motion';

function App() {
  const { appState, setAppState, setSessionSpread, setSessionQuestion, apiKey, setApiKey } = useAppStore();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [questionInput, setQuestionInput] = useState('');

  const handleContractAccept = () => {
    setSessionSpread(SPREADS_LIBRARY['holy-triangle']);
    setSessionQuestion(questionInput || '请求全方位的运势指引');
    if (keyInput !== apiKey) setApiKey(keyInput);
    
    setAppState(AppState.SHUFFLING); 
  };

  return (
    <div className="app-container">
      
      {/* 阶段 1：更高颜值的玻璃态登录契约页 */}
      {(appState === AppState.INIT || appState === AppState.AWAITING_CONTRACT || appState === AppState.SETTING_INTENT) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel" 
          style={{ maxWidth: 460, width: '90%', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <h1 style={{ letterSpacing: 6, margin: '0 0 10px 0', fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '2rem' }}>灵 界 链 引</h1>
          <p style={{ color: 'var(--primary-accent)', fontSize: '0.9rem', marginBottom: 30, letterSpacing: 1 }}>"将心灵之声寄存于此，开启未知的占星场"</p>
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, letterSpacing: 1 }}>所念何事 (意图注入)</span>
              <textarea 
                 value={questionInput}
                 onChange={e => setQuestionInput(e.target.value)}
                 placeholder="我在事业上的未来三个月趋势..."
                 className="modern-input"
                 style={{ height: 80 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, letterSpacing: 1 }}>超自然算力凭证 (Gemini API Key · 可不填)</span>
              <input 
                 type="password"
                 value={keyInput}
                 onChange={e => setKeyInput(e.target.value)}
                 placeholder="若留空将采用本地古老奥秘辞典..."
                 className="modern-input"
              />
            </div>

            <button onClick={handleContractAccept} className="modern-button" style={{ marginTop: 10 }}>
               推开次元之门
            </button>
          </div>
        </motion.div>
      )}

      {/* 沉浸式塔罗洗牌与抽牌界面 (3D引擎层) */}
      {(appState === AppState.SHUFFLING || appState === AppState.DRAWING || appState === AppState.REVEALING || appState === AppState.INTERPRETED || appState === AppState.SEALED_AND_RESET) && (
        <RitualSpaceView />
      )}
      
      {/* 释理解牌全屏遮罩层 */}
      {(appState === AppState.REVEALING || appState === AppState.INTERPRETED || appState === AppState.SEALED_AND_RESET) && (
        <RevelationView />
      )}
      
    </div>
  );
}

export default App;
