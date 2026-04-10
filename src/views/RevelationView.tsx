import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { interpretReading } from '../services/interpreter';
import { AppState } from '../models/types';
import html2canvas from 'html2canvas';
import { generateDeck } from '../utils/deckGenerator';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 星之启示录 - 解读结果展示视图
 * 
 * 用户体验流程：
 * 1. 先逐一翻牌展示（每张牌间隔 1.2 秒，带 3D 翻转动画）
 * 2. 所有牌翻完后，在牌面下方开始流式输出解析结果
 * 3. 滚动采用原生 CSS，消除卡顿
 */

// 牌背图片
const backImageUrl = new URL('../assets/images/tarot/Back_of_card.webp', import.meta.url).href;

export const RevelationView: React.FC = () => {
   const { session, apiKey, interpretationText, setInterpretationText, setAppState, resetSession } = useAppStore(state => ({
     session: state.session,
     apiKey: state.apiKey,
     interpretationText: state.interpretationText,
     setInterpretationText: state.setInterpretationText,
     setAppState: state.setAppState,
     resetSession: state.resetSession
   })); // Optimized selector so unnecessary re-renders are prevented

   const [isGenerating, setIsGenerating] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
   const textRef = useRef<HTMLDivElement>(null);
   const exportAreaRef = useRef<HTMLDivElement>(null);
   
   const userHasScrolled = useRef(false);
   const deck = useMemo(() => generateDeck(), []);

   // 逐一翻牌状态：revealedCount 控制当前已翻开多少张牌
   const [revealedCount, setRevealedCount] = useState(0);
   const [allRevealed, setAllRevealed] = useState(false);

   // 逐一翻牌动画
   useEffect(() => {
      if (revealedCount >= session.drawnCards.length) {
        // 所有牌都翻完，等待一小段时间后开始解读
        const timer = setTimeout(() => setAllRevealed(true), 800);
        return () => clearTimeout(timer);
      }

      const timer = setTimeout(() => {
        setRevealedCount(prev => prev + 1);
      }, 1200); // 每张牌间隔 1.2 秒翻开

      return () => clearTimeout(timer);
   }, [revealedCount, session.drawnCards.length]);

   // 所有牌翻完后才开始解读
   useEffect(() => {
     if (!allRevealed) return;

     let isMounted = true;
     
     const runInterpretation = async () => {
       setIsGenerating(true);
       try {
         const generator = interpretReading(session, apiKey);
          let fullText = '';
          let pendingText = '';
          let flushRaf: number | null = null;

          const flush = () => {
              if (!isMounted || !textRef.current) return;
              if (pendingText.length > 0) {
                  textRef.current.appendChild(document.createTextNode(pendingText));
                  pendingText = '';
                  
                  if (!userHasScrolled.current && scrollRef.current) {
                      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                  }
              }
              flushRaf = null;
          };

          for await (const chunk of generator) {
            if (!isMounted) break;
            fullText += chunk;
            pendingText += chunk;
            if (!flushRaf) flushRaf = requestAnimationFrame(flush);
          }
          if (flushRaf) { cancelAnimationFrame(flushRaf); flush(); }
         if (isMounted) {
            setInterpretationText(fullText); // 仅在结束时同步 Zustand，用于最终分享导出
         }
       } catch (err) {
         if (isMounted && textRef.current) {
            textRef.current.textContent = '连接超自然领域时受到严重干扰，启示被吞噬...';
         }
       } finally {
         if (isMounted) {
           setIsGenerating(false);
           setAppState(AppState.INTERPRETED);
         }
       }
     };

     runInterpretation();
     return () => { isMounted = false; };
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [allRevealed]);

   // 凌空滚动支持：使用 requestAnimationFrame 节流优化原生滚动开销
   useEffect(() => {
     let animationFrameId: number | null = null;
     let pendingScrollDelta = 0;

     const doScroll = () => {
        if (scrollRef.current && pendingScrollDelta !== 0) {
            scrollRef.current.scrollTop -= pendingScrollDelta;
            pendingScrollDelta = 0;
        }
        animationFrameId = null;
     };

     const handleGestureScroll = (e: any) => {
        userHasScrolled.current = true;
        pendingScrollDelta += e.detail.dy;
        if (!animationFrameId) animationFrameId = requestAnimationFrame(doScroll);
     };

     window.addEventListener('TAROT_GESTURE_SCROLL', handleGestureScroll);
     return () => {
        window.removeEventListener('TAROT_GESTURE_SCROLL', handleGestureScroll);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
     };
   }, []);

   const handleExport = useCallback(async () => {
     if (!exportAreaRef.current) return;
     try {
       const canvas = await html2canvas(exportAreaRef.current, {
           backgroundColor: '#171026', scale: 2, useCORS: true
       });
       const dataUrl = canvas.toDataURL('image/png');
       const link = document.createElement('a');
       link.download = `命运防伪卷轴-${Date.now()}.png`;
       link.href = dataUrl;
       link.click();
       setAppState(AppState.SEALED_AND_RESET);
     } catch (e) {
       console.error("生成命运卷轴海报失败", e);
     }
   }, [setAppState]);

   return (
      <div style={styles.container}>
         <div 
           ref={scrollRef} 
           className="glass-panel" 
           style={styles.scrollArea}
           onWheel={() => { userHasScrolled.current = true; }}
           onTouchMove={() => { userHasScrolled.current = true; }}
         >
            <h2 style={{ color: 'var(--primary-accent)', letterSpacing: 2, marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              星之启示录
            </h2>

            {/* 逐一翻牌展示区域 */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px', justifyContent: 'center' }}>
               {session.drawnCards.map((drawn, i) => {
                  const cardData = deck.find(c => c.id === drawn.cardId);
                  if (!cardData) return null;
                  const isFlipped = i < revealedCount;

                  return (
                     <motion.div 
                       key={i} 
                       style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.3 }}
                     >
                        {/* 3D 翻转容器 */}
                        <div style={{ width: 140, height: 230, perspective: 800 }}>
                           <motion.div
                             style={{
                               width: '100%', height: '100%',
                               transformStyle: 'preserve-3d',
                               position: 'relative',
                             }}
                             animate={{ rotateY: isFlipped ? 180 : 0 }}
                             transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                           >
                              {/* 牌背 */}
                              <div style={{
                                position: 'absolute', width: '100%', height: '100%',
                                backfaceVisibility: 'hidden',
                                borderRadius: 10,
                                backgroundImage: `url(${backImageUrl})`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                border: '2px solid rgba(165,120,255,0.3)',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                              }} />
                              {/* 牌面 */}
                              <div style={{
                                position: 'absolute', width: '100%', height: '100%',
                                backfaceVisibility: 'hidden',
                                borderRadius: 10,
                                transform: `rotateY(180deg) ${drawn.isReversed ? 'rotateZ(180deg)' : ''}`,
                                backgroundImage: `url(${cardData.imageUrl})`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                border: '2px solid rgba(165,120,255,0.5)',
                                boxShadow: '0 5px 20px rgba(165,120,255,0.3)'
                              }} />
                           </motion.div>
                        </div>
                        {/* 牌名（翻开后才显示） */}
                        <AnimatePresence>
                          {isFlipped && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ delay: 0.5 }}
                              style={{ marginTop: 15, textAlign: 'center' }}
                            >
                               <div style={{ fontWeight: 'bold', color: '#f0ecfc', fontSize: 16 }}>
                                  {cardData.chineseName} {drawn.isReversed ? '(逆位)' : '(正位)'}
                               </div>
                               <div style={{ color: 'var(--primary-accent)', fontSize: 13, marginTop: 4 }}>
                                  {session.selectedSpread?.positions[i]?.meaning}
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </motion.div>
                  );
               })}
            </div>

            {/* 等待翻牌完成的提示 */}
            {!allRevealed && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ✧ 牌灵正在逐一显化中... ✧
                </motion.span>
              </div>
            )}

            {/* 解读文本（翻牌完成后才开始输出） */}
            {allRevealed && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.5 }}
                style={styles.textContent}
              >
                 <span ref={textRef} />
                 {isGenerating && <span style={{ animation: 'blink 1s infinite', color: 'var(--primary-accent)' }}>▍</span>}
              </motion.div>
            )}
            
            {!isGenerating && allRevealed && (
              <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleExport} className="modern-button">
                  盖上火漆印并封存于本地
                </button>
                <button onClick={resetSession} className="modern-button" style={{ background: 'transparent', border: '1px solid var(--primary-accent)' }}>
                  散去迷雾，再次凝神
                </button>
              </div>
            )}
         </div>

         {/* 隐藏的离屏导出专属结构 */}
         <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
            <div ref={exportAreaRef} style={styles.exportContainer}>
               <h1 style={{ color: '#a578ff', marginBottom: 20, fontFamily: 'var(--font-serif)', borderBottom: '2px solid rgba(165, 120, 255, 0.3)', paddingBottom: 10 }}>灵视塔罗 · 命运卷轴</h1>
               
               <div style={{ marginBottom: 30, fontSize: 18, color: '#f0ecfc' }}>
                 <strong>问询者之念：</strong> {session.userQuestion || '（虚空）'} <br/>
                 <strong>连结阵法：</strong> {session.selectedSpread?.name}
               </div>

               <div style={{ display: 'flex', gap: 30, marginBottom: 40, alignItems: 'stretch' }}>
                 {session.drawnCards.map((drawn, i) => {
                    const cardData = deck.find(c => c.id === drawn.cardId);
                    return (
                    <div key={i} style={{ textAlign: 'center', width: 140 }}>
                       <div style={{ 
                         width: 140, height: 230, border: '1px solid rgba(165,120,255,0.4)', 
                         background: cardData ? `url(${cardData.imageUrl}) no-repeat center/cover` : 'linear-gradient(180deg, #1f1f1f, #0f1015)', 
                         transform: drawn.isReversed ? 'rotate(180deg)' : 'none',
                         borderRadius: 12,
                         boxShadow: '0 4px 10px rgba(0,0,0,0.8)'
                       }} />
                       <div style={{ marginTop: 12, fontWeight: 'bold', fontSize: 16, color: '#f0ecfc' }}>
                         {cardData?.chineseName || drawn.cardId}
                         <span style={{ fontSize: 12, color: '#a578ff', marginLeft: 5 }}>
                            {drawn.isReversed ? '逆位' : '正位'}
                         </span>
                       </div>
                       <div style={{ marginTop: 8, fontSize: 13, color: '#a578ff' }}>
                         {session.selectedSpread?.positions[i]?.meaning}
                       </div>
                    </div>
                 )})}
               </div>

               <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#f0ecfc', fontSize: 16 }}>
                  {interpretationText}
               </div>

               <div style={{ marginTop: 60, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                 <div>
                   <em style={{ color: '#aba4c4' }}>愿星月的光辉，引导灵魂穿越这混沌之海。</em>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ 
                     color: '#a578ff', border: '3px double #a578ff', display: 'inline-block', 
                     padding: '15px', borderRadius: '50%', transform: 'rotate(-15deg)', 
                     fontWeight: 'bold', fontSize: 24, textShadow: '0 0 10px rgba(165,120,255,0.3)'
                   }}>灵视秘印</div>
                   <div style={{ marginTop: 15, fontSize: 12, color: '#aba4c4', fontFamily: 'serif' }}>
                     —— 公元二零二六年，星月交辉时刻
                   </div>
                 </div>
               </div>
            </div>
         </div>
      </div>
   );
};

const styles = {
  container: {
    width: '100vw',
    height: '100vh', 
    position: 'absolute' as const,
    top: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', 
    zIndex: 200, 
    background: 'rgba(10, 8, 15, 0.98)',
  },
  scrollArea: {
    width: '85%',
    maxWidth: '900px',
    height: '85vh',
    overflowY: 'auto' as const,
    padding: '40px',
    color: 'var(--text-primary)',
    lineHeight: 1.8,
    fontSize: '1.05rem',
    // 使用 CSS 原生平滑滚动，解决卡顿问题
    WebkitOverflowScrolling: 'touch' as any,
    scrollBehavior: 'auto' as const,
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'var(--primary-accent) transparent',
    pointerEvents: 'auto' as const,
    backgroundColor: 'rgba(30, 25, 45, 0.65)',
    border: '1px solid rgba(165, 120, 255, 0.2)'
  },
  textContent: {
    whiteSpace: 'pre-wrap' as const,
    textShadow: '0px 1px 3px rgba(0,0,0,0.8)',
    // 避免大量文本重排导致的卡顿
    willChange: 'contents' as const,
    contain: 'content' as const
  },
  exportContainer: {
    width: '900px',
    padding: '60px',
    background: '#0f1015', 
    fontFamily: '"Noto Serif SC", serif'
  }
};
