import { useEffect, useState, useRef } from 'react';
import { Results } from '@mediapipe/hands';
import { HandTracker } from '../cv/HandTracker';
import { useAppStore } from '../store/useAppStore';
import { useMotionValue } from 'framer-motion';
import { AppState } from '../models/types';

/** 单例摄像头共享：避免每次进入仪式都请求权限导致闪烁 */
let globalStream: MediaStream | null = null;
export async function getGlobalStream() {
  if (!globalStream) {
    globalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
  }
  return globalStream;
}

// 离开关闭窗口、或组件严重卸载时，强制销毁硬件流，清除指示灯缓存
window.addEventListener('beforeunload', () => {
    if (globalStream) {
        globalStream.getTracks().forEach(track => track.stop());
        globalStream = null;
    }
});

export function useGestureEngine(videoRef: React.RefObject<HTMLVideoElement>) {
  const orbX = useMotionValue(-100);
  const orbY = useMotionValue(-100);
  
  const [isPinching, setIsPinching] = useState(false);
  const { setInteractionMode } = useAppStore();
  
  const emptyFramesRef = useRef(0);
  const [confidenceFallback, setConfidenceFallback] = useState(false);
  
  const pathRef = useRef<{x: number, y: number, time: number}[]>([]);
  const isShufflingRef = useRef(false);
  
  // 拖动滚屏参数缓存
  const lastPinchPosRef = useRef<{y: number} | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    let tracker: HandTracker;

    const initCamera = async () => {
      try {
        const stream = await getGlobalStream();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('相机权限获取失败', err);
      }
    };
    initCamera();

    const onResults = (results: Results) => {
      if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        emptyFramesRef.current += 1;
        if (emptyFramesRef.current > 150) { 
          if (!confidenceFallback) {
             setConfidenceFallback(true);
             setInteractionMode('TOUCH');
          }
        }
        lastPinchPosRef.current = null;
        return;
      }
      
      emptyFramesRef.current = 0; 
      if (confidenceFallback) {
         setConfidenceFallback(false);
         setInteractionMode('GESTURE');
      }

      const landmarks = results.multiHandLandmarks[0];
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      
      const px = (1 - indexTip.x) * window.innerWidth;
      const py = indexTip.y * window.innerHeight;
      
      orbX.set(px);
      orbY.set(py);

      // --- 圆周意图检测（画圈洗牌） ---
      const now = Date.now();
      pathRef.current.push({ x: px, y: py, time: now });
      pathRef.current = pathRef.current.filter(p => now - p.time < 1200);

      const appState = useAppStore.getState().appState;

      if (pathRef.current.length > 20 && !isShufflingRef.current && appState === AppState.SHUFFLING) {
        let totalAngle = 0;
        for (let i = 0; i < pathRef.current.length - 2; i += 2) {
          const p1 = pathRef.current[i];
          const p2 = pathRef.current[i+1];
          const p3 = pathRef.current[i+2];
          const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
          const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
          const dot = v1.x * v2.x + v1.y * v2.y;
          const det = v1.x * v2.y - v1.y * v2.x;
          totalAngle += Math.atan2(det, dot);
        }
        if (Math.abs(totalAngle) > Math.PI * 1.4) {
           isShufflingRef.current = true;
           window.dispatchEvent(new CustomEvent('TAROT_CIRCLE_GESTURE'));
           pathRef.current = [];
           setTimeout(() => { isShufflingRef.current = false; }, 1500);
        }
      }

      // --- 捏合意图检测 ---
      const distance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
      );
      const currentlyPinching = distance < 0.04;
      
      // --- 凌空拖拽滚屏检测（用于最后的查阅文档页） ---
      if (currentlyPinching && (appState === AppState.REVEALING || appState === AppState.INTERPRETED)) {
         if (!lastPinchPosRef.current) {
            lastPinchPosRef.current = { y: py };
         } else {
            // 计算两帧之间的 Y 轴差值，派发为滚轮事件
            const dy = py - lastPinchPosRef.current.y;
            // 控制滚动灵敏度乘数
            window.dispatchEvent(new CustomEvent('TAROT_GESTURE_SCROLL', { detail: { dy: dy * 1.5 } }));
            lastPinchPosRef.current.y = py;
         }
      } else {
         lastPinchPosRef.current = null;
      }

      setIsPinching(prev => {
        if (prev !== currentlyPinching) return currentlyPinching;
        return prev;
      });
    };

    tracker = new HandTracker(videoRef.current, onResults);
    tracker.start();

    return () => tracker.stop();
  }, [videoRef, confidenceFallback, setInteractionMode, orbX, orbY]);

  return { orbX, orbY, isPinching, confidenceFallback };
}
