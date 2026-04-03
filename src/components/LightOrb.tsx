import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface LightOrbProps {
  orbX: MotionValue<number>;
  orbY: MotionValue<number>;
  active: boolean;    
  isVisible: boolean; 
}

export const LightOrb: React.FC<LightOrbProps> = ({ orbX, orbY, active, isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="light-orb"
      animate={{
        scale: active ? 0.7 : 1, // 捏合收缩
      }}
      transition={{ 
        type: 'spring', 
        damping: 20,     // 增强跟手性
        stiffness: 400, 
        mass: 0.2 
      }}
      style={{
        // 使用物理弹簧挂载运动值，完全脱离 CPU 的重排
        x: orbX,
        y: orbY,
        marginLeft: -15, // 控制球体中心在手指尖对准位置
        marginTop: -15,
        position: 'fixed',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: active 
           ? 'radial-gradient(circle, #FFEAEA 20%, #A52A2A 70%, transparent)' 
           : 'radial-gradient(circle, #FFFFFF 20%, #a578ff 70%, transparent)',
        boxShadow: active ? '0 0 30px #A52A2A' : '0 0 20px #a578ff',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};
