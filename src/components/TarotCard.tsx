import React from 'react';
import { motion } from 'framer-motion';

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
      {/* 牌背层 - 重构为炫酷的宇宙深渊法阵背纹 */}
      <div 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #110c1c, #09060f)',
          border: '1px solid rgba(165, 120, 255, 0.4)',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: `
            radial-gradient(circle at center, rgba(165, 120, 255, 0.15) 0%, transparent 60%),
            conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(165, 120, 255, 0.05) 90deg, transparent 180deg, rgba(165, 120, 255, 0.05) 270deg, transparent 360deg)
          `,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{
          width: '70%',
          height: '80%',
          border: '1px solid rgba(165, 120, 255, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
           <div style={{
              width: '40px', height: '40px', 
              border: '2px solid rgba(165,120,255,0.6)', 
              transform: 'rotate(45deg)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
           }}>
              <div style={{
                 width: '20px', height: '20px', 
                 background: 'rgba(165,120,255,0.8)', 
                 borderRadius: '50%',
                 boxShadow: '0 0 10px var(--primary-accent)'
              }} />
           </div>
        </div>
      </div>

      {/* 牌面层 (解决纯透明且无法得知究竟抽了哪张面貌的问题) */}
      <div 
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          borderRadius: 12,
          overflow: 'hidden',
          transform: `rotateY(180deg) ${isReversed ? 'rotateZ(180deg)' : ''}`,
          backgroundColor: '#1f1a24', // 防止缺失图片导致的纯透明丑陋情况
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
