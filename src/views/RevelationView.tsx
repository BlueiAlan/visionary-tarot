import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { interpretReading } from '../services/interpreter';
import { AppState } from '../models/types';
import html2canvas from 'html2canvas';
import { generateDeck } from '../utils/deckGenerator';

export const RevelationView: React.FC = () => {
   const { session, apiKey, interpretationText, setInterpretationText, setAppState, resetSession } = useAppStore();
   const [isGenerating, setIsGenerating] = useState(false);
   const [displayedText, setDisplayedText] = useState('');
   const scrollRef = useRef<HTMLDivElement>(null);
   const exportAreaRef = useRef<HTMLDivElement>(null);
   
   // 标记是否由用户手动介入了滚动，若手动滚动则不再强制滚到最底端 (解决内容太长无法回看的Bug)
   const userHasScrolled = useRef(false);

   const deck = useMemo(() => generateDeck(), []);

   useEffect(() => {
     let isMounted = true;
     
     const runInterpretation = async () => {
       setIsGenerating(true);
       try {
         const generator = interpretReading(session, apiKey);
         let fullText = '';
         for await (const chunk of generator) {
           if (!isMounted) break;
           fullText += chunk;
           setDisplayedText(fullText);
           setInterpretationText(fullText);
         }
       } catch (err) {
         if (isMounted) setDisplayedText('连接超自然领域时受到严重干扰，启示被吞噬...');
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
   }, []);

   // 只有 AI 正在输出且用户没有刻意向上滚动时，才保持触底
   useEffect(() => {
      if (isGenerating && !userHasScrolled.current) {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        });
      }
   }, [displayedText, isGenerating]);

   // 全局拖拽响应处理 (凌空滚动支持)
   useEffect(() => {
     const handleGestureScroll = (e: any) => {
        const dy = e.detail.dy;
        if (scrollRef.current) {
           userHasScrolled.current = true; // 打破 AI 追踪锁定
           // 这里反转差值来模拟日常触摸板的自然滚动（往下拉是向上看）
           scrollRef.current.scrollTop -= dy;
        }
     };
     window.addEventListener('TAROT_GESTURE_SCROLL', handleGestureScroll);
     return () => window.removeEventListener('TAROT_GESTURE_SCROLL', handleGestureScroll);
   }, []);

   const handleExport = async () => {
     if (!exportAreaRef.current) return;
     try {
       const canvas = await html2canvas(exportAreaRef.current, {
           backgroundColor: '#171026', 
           scale: 2, 
           useCORS: true
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
   };

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
            
            <p style={{ fontSize: 13, color: '#aaa', fontStyle: 'italic', marginBottom: 20 }}>
               (💡 可通过手指捏合光球上下拖动，或使用鼠标滚轮来阅读解析)
            </p>

            {/* 真实塔罗牌面展示 */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px', justifyContent: 'center' }}>
               {session.drawnCards.map((drawn, i) => {
                  const cardData = deck.find(c => c.id === drawn.cardId);
                  if (!cardData) return null;
                  return (
                     <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                           width: 140, height: 230, 
                           backgroundImage: `url(${cardData.imageUrl})`,
                           backgroundSize: 'cover', backgroundPosition: 'center',
                           transform: drawn.isReversed ? 'rotate(180deg)' : 'none',
                           borderRadius: 10,
                           border: '2px solid rgba(165,120,255,0.3)',
                           boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                        }} />
                        <div style={{ marginTop: 15, textAlign: 'center' }}>
                           <div style={{ fontWeight: 'bold', color: '#f0ecfc', fontSize: 16 }}>
                              {cardData.chineseName} {drawn.isReversed ? '(逆位)' : ''}
                           </div>
                           <div style={{ color: 'var(--primary-accent)', fontSize: 13, marginTop: 4 }}>
                              {session.selectedSpread?.positions[i].meaning}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>

            <div style={styles.textContent}>
               {displayedText}
               {isGenerating && <span style={{ animation: 'blink 1s infinite', color: 'var(--primary-accent)' }}>▍</span>}
            </div>
            
            {!isGenerating && (
              <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
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
                         color: '#fff', display: 'flex', flexDirection: 'column',
                         alignItems: 'center', justifyContent: 'center', borderRadius: 12,
                         boxShadow: '0 4px 10px rgba(0,0,0,0.8)'
                       }}>
                       </div>
                       
                       {/* 因为图片可能倒转，所以文字要在外侧保持正向 */}
                       <div style={{ marginTop: 12, fontWeight: 'bold', fontSize: 16, color: '#f0ecfc' }}>
                         {cardData?.chineseName || drawn.cardId}
                         <span style={{ fontSize: 12, color: '#a578ff', marginLeft: 5 }}>
                            {drawn.isReversed ? '逆位' : '正位'}
                         </span>
                       </div>
                       <div style={{ marginTop: 8, fontSize: 13, color: '#a578ff' }}>
                         {session.selectedSpread?.positions[i].meaning}
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
    // 让解析结果界面的底色不仅不一样，还能把底下复杂乱排的牌阵用半透明超深色层盖住，形成视觉分离
    background: 'rgba(10, 8, 15, 0.85)',
    backdropFilter: 'blur(30px)' 
  },
  scrollArea: {
    width: '85%',
    maxWidth: '900px',
    height: '80vh',      // 高度锁定提供真实的内部滚动边界框
    overflowY: 'auto' as const,
    padding: '40px',
    color: 'var(--text-primary)',
    lineHeight: 1.8,
    fontSize: '1.1rem',
    scrollbarWidth: 'thin' as const,
    scrollbarColor: 'var(--primary-accent) transparent',
    // 强制阻止穿透底层牌星盘的意外焦点
    pointerEvents: 'auto' as const,
    backgroundColor: 'rgba(30, 25, 45, 0.65)', // 与底栏拉开色差的面板底霜
    border: '1px solid rgba(165, 120, 255, 0.2)'
  },
  textContent: {
    whiteSpace: 'pre-wrap' as const,
    textShadow: '0px 1px 3px rgba(0,0,0,0.8)'
  },
  exportContainer: {
    width: '900px',
    padding: '60px',
    background: '#0f1015', 
    fontFamily: '"Noto Serif SC", serif'
  }
};
