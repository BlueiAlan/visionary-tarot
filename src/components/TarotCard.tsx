import React from 'react';
import { motion } from 'framer-motion';

/**
 * 塔罗卡牌组件
 * 
 * 牌背使用 assets/images/tarot/Back_of_card.webp 真实图片
 * 牌面采用 3D CSS 翻转 (rotateY) 实现正反面切换
 */

// 使用 Vite 动态路径加载牌背资源
const backImageUrl = new URL('../assets/images/tarot/Back_of_card.webp', import.meta.url).href;

interface TarotCardProps {
  cardId: string;
  frontImage: string;
  isReversed?: boolean; 
  isFaceUp?: boolean;   
  x: number;            
  y: number;
  rotateZ?: number;     
  isHovered?: boolean;  
  onClick?: () => void; 
}

export const TarotCard: React.FC<TarotCardProps> = ({ 
  cardId,
  frontImage, 
  isReversed = false, 
  isFaceUp = false, 
  x, 
  y, 
  rotateZ = 0,
  isHovered = false,
  onClick
}) => {
  return (
    <motion.div
      onClick={onClick}
      animate={{
        x,
        y: isHovered ? y - 30 : y,
        rotateZ: rotateZ,
        rotateY: isFaceUp ? 180 : 0, 
        scale: isHovered ? 1.05 : 1
      }}
      transition={{
        type: 'spring', damping: 25, stiffness: 120, mass: 0.8
      }}
      style={{
        width: 150,
        height: 250,
        position: 'absolute',
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        boxShadow: isHovered ? '0 15px 40px rgba(165,120,255,0.4)' : '0 10px 25px rgba(0,0,0,0.8)',
        marginLeft: -75, 
        marginTop: -125
      }}
    >
      {/* 牌背层 - 使用真实牌背图片 */}
      <div 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundImage: `url(${backImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(165, 120, 255, 0.4)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
        }}
      />

      {/* 牌面层 */}
      <div 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: 12,
          overflow: 'hidden',
          transform: `rotateY(180deg) ${isReversed ? 'rotateZ(180deg)' : ''}`,
          backgroundColor: '#1f1a24',
          backgroundImage: frontImage ? `url(${frontImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '1px solid rgba(165, 120, 255, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {!frontImage && (
           <div style={{ textAlign: 'center', color: '#ffd166', fontFamily: 'var(--font-serif)', pointerEvents: 'none' }}>
              <div style={{ fontSize: '36px', marginBottom: 15, textShadow: '0 0 10px rgba(255,209,102,0.4)' }}>
                {isReversed ? '☄️' : '🌟'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{cardId}</div>
              <div style={{ fontSize: '12px', marginTop: 8, color: '#a578ff' }}>The Visionary Tarot</div>
           </div>
        )}
      </div>
    </motion.div>
  );
};
