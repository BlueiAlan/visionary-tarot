import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useGestureEngine } from '../hooks/useGestureEngine';
import { LightOrb } from '../components/LightOrb';
import { TarotCard } from '../components/TarotCard';
import { generateDeck, shuffleDeck } from '../utils/deckGenerator';
import { Card, DrawnCard, AppState } from '../models/types';
import { motion } from 'framer-motion';

export const RitualSpaceView: React.FC = () => {
  const { appState, session, setAppState, addDrawnCard, interactionMode } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { orbX, orbY, isPinching, isHandDetected, confidenceFallback, cameraError } = useGestureEngine(videoRef);
  const [deck, setDeck] = useState<Card[]>([]);
  const [dismissedError, setDismissedError] = useState(false);
  
  const deckCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  useEffect(() => {
    setDeck(shuffleDeck(generateDeck()));
  }, []);

  const checkIsOrbOverDeck = useCallback(() => {
     const cx = orbX.get();
     const cy = orbY.get();
     const dist = Math.sqrt(Math.pow(cx - deckCenter.x, 2) + Math.pow(cy - deckCenter.y, 2));
     return dist < 180; 
  }, [deckCenter.x, deckCenter.y, orbX, orbY]);

  // 全局事件挂断响应画圈手势
  useEffect(() => {
    const handleGestureShuffle = () => {
      if (useAppStore.getState().appState === AppState.SHUFFLING) {
        setDeck(prevDeck => [...shuffleDeck(prevDeck)]);
        setTimeout(() => setAppState(AppState.DRAWING), 800);
      }
    };
    window.addEventListener('TAROT_CIRCLE_GESTURE', handleGestureShuffle);
    return () => window.removeEventListener('TAROT_CIRCLE_GESTURE', handleGestureShuffle);
  }, [setAppState]);

  const handleShuffleClick = () => {
    window.dispatchEvent(new CustomEvent('TAROT_CIRCLE_GESTURE'));
  };

  const handleDrawSingleCard = useCallback(() => {
    if (appState !== AppState.DRAWING) return;
    const maxDraws = session.selectedSpread?.cardCount || 1;
    if (session.drawnCards.length >= maxDraws) return;
    
    const topCardIdx = deck.length - 1 - session.drawnCards.length;
    const topCard = deck[topCardIdx]; 
    if (!topCard) return;

    const newDrawnCard: DrawnCard = {
      cardId: topCard.id,
      isReversed: Math.random() > 0.5,
      positionIndex: session.drawnCards.length 
    };

    addDrawnCard(newDrawnCard);

    if (session.drawnCards.length + 1 >= maxDraws) {
      setTimeout(() => setAppState(AppState.REVEALING), 1500); 
    }
  }, [appState, deck, session, addDrawnCard, setAppState]);

  useEffect(() => {
    if (appState === AppState.DRAWING && isPinching && checkIsOrbOverDeck()) {
      handleDrawSingleCard();
    }
  }, [isPinching, appState, checkIsOrbOverDeck, handleDrawSingleCard]);


  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      {cameraError !== 'NONE' && !dismissedError && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', 
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="glass-panel" style={{ padding: 30, maxWidth: 400, textAlign: 'center' }}>
            <h2 style={{ color: '#ff6b6b' }}>视觉通道已被阻断</h2>
            <p style={{ color: '#ccc', margin: '20px 0', fontSize: 14 }}>
              系统未获得您的摄像仪轨权限，或您的环境并非安全上下文 (要求 HTTPS 或 Localhost)。
              <br/><br/>
              为了获得最佳沉浸体验，请点击浏览器地址栏左侧的锁头图标，允许摄像头权限并刷新页面。
            </p>
            <button className="modern-button" onClick={() => window.location.reload()}>刷新重新获取</button>
            <p style={{ marginTop: 15, fontSize: 12, color: 'var(--text-secondary)' }}>您依然可以点击屏幕中心直接洗牌/抽牌继续旅程。</p>
            <button className="modern-button" style={{ marginTop: 10, background: 'transparent', border: '1px solid #aaa' }} 
              onClick={() => setDismissedError(true)}
            >忽略并继续 (使用鼠标)</button>
          </div>
        </div>
      )}

      {/* Override display when error is dismissed. We don't have a state for dismissal here, so let's manage it simply by letting them push through or we can add a local state. */}

      <div style={{
          position: 'absolute', top: 40, width: '100%', display: 'flex', 
          flexDirection: 'column', alignItems: 'center', zIndex: 50, pointerEvents: 'none'
      }}>
        {appState === AppState.SHUFFLING && (
          <motion.div className="glass-panel" initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} style={{ textAlign: 'center', pointerEvents: 'auto', padding: '20px 40px' }}>
            <h2 style={{ color: 'var(--secondary-accent)', margin: '0 0 10px 0', letterSpacing: 2 }}>「第一仪轨：命运之轮 洗牌」</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>举起你的手，在镜头前方用食指凌空画出一个“圆圈”，扰乱磁场。</p>
            <button className="modern-button" onClick={handleShuffleClick}>手指识别失灵？点击触控洗牌</button>
          </motion.div>
        )}

        {appState === AppState.DRAWING && (
          <motion.div className="glass-panel" initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} style={{ textAlign: 'center', pointerEvents: 'none', padding: '20px 40px' }}>
            <h2 style={{ color: 'var(--secondary-accent)', margin: '0 0 10px 0', letterSpacing: 2 }}>「第二仪轨：高维之手 抽取」</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>悬于卡牌上空，用<strong>食指与拇指捏合</strong>，感知牌灵。<br/>尚需指引 {session.selectedSpread!.cardCount - session.drawnCards.length} 次命运方向。</p>
          </motion.div>
        )}
      </div>

      <div style={{
          position: 'absolute', bottom: 30, right: 30, width: 220, height: 165, 
          borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 40
      }}>
        <video 
          ref={videoRef} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          playsInline muted autoPlay
        />
        {(confidenceFallback || interactionMode === 'TOUCH') && (
          <div style={{ position: 'absolute', bottom: 10, left: 0, width: '100%', textAlign: 'center', fontSize: 12, color: '#ff6b6b', background: 'rgba(0,0,0,0.6)', padding: '4px 0' }}>
            ⚠ 视觉追踪信号弱 (触摸辅助开)
          </div>
        )}
      </div>

      <div className="tarot-board" style={{ width: '100%', height: '100%', position: 'relative', perspective: 1200, display: (appState === AppState.REVEALING || appState === AppState.INTERPRETED || appState === AppState.SEALED_AND_RESET) ? 'none' : 'block' }}>
        {deck.map((card, idx) => {
          const isDrawnIndex = session.drawnCards.findIndex(dc => dc.cardId === card.id);
          const isDrawn = isDrawnIndex !== -1;
          const isTargetTopCard = idx === deck.length - 1 - session.drawnCards.length;
          
          let targetX = deckCenter.x;
          let targetY = deckCenter.y;
          let targetZRot = idx * 0.5 - 10; 
          let isFaceUp = false;

          if (isDrawn && session.selectedSpread) {
            const posConfig = session.selectedSpread.positions[isDrawnIndex];
            targetX = posConfig.coordinates?.x ? deckCenter.x + posConfig.coordinates.x : deckCenter.x;
            targetY = posConfig.coordinates?.y ? deckCenter.y + posConfig.coordinates.y - 120 : deckCenter.y - 120; // 优化位置适配解压
            targetZRot = posConfig.coordinates?.rotation || 0;
            isFaceUp = appState === AppState.REVEALING || appState === AppState.INTERPRETED;
          }

          if (!isDrawn) {
            targetX += (idx - deck.length / 2) * 0.4; 
            targetY -= (idx - deck.length / 2) * 0.3; 
          }

          return (
            <TarotCard 
               key={card.id}
               cardId={card.id}
               frontImage={card.imageUrl}
               x={targetX}
               y={targetY}
               rotateZ={targetZRot}
               isReversed={isDrawn ? session.drawnCards[isDrawnIndex].isReversed : false}
               isFaceUp={isFaceUp}
               onClick={() => {
                 if (appState === AppState.DRAWING && isTargetTopCard) handleDrawSingleCard();
               }}
            />
          );
        })}
      </div>

      <LightOrb 
        orbX={orbX} 
        orbY={orbY} 
        active={isPinching} 
        isVisible={interactionMode === 'GESTURE'}
        isHandDetected={isHandDetected}
        intentText={(function() {
          if (!isHandDetected) return '寻找手部中...';
          if (appState === AppState.SHUFFLING) return '食指画圈来洗牌';
          if (appState === AppState.DRAWING) return checkIsOrbOverDeck() ? '可以捏合抽牌' : '移至牌堆上方';
          if (appState === AppState.INTERPRETED || appState === AppState.REVEALING) return '捏合拖放滚屏';
          return '';
        })()}
      />
    </div>
  );
};

