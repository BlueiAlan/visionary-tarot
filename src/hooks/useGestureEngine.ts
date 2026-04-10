import { useEffect, useState, useRef } from 'react';
import { Results } from '@mediapipe/hands';
import { HandTracker } from '../cv/HandTracker';
import { useAppStore } from '../store/useAppStore';
import { useMotionValue } from 'framer-motion';
import { AppState } from '../models/types';
import { useCameraPermission } from './useCameraPermission';

/**
 * 手势引擎 Hook
 * 
 * 架构设计：
 * 1. 使用 useCameraPermission 获取稳定的 MediaStream
 * 2. 挂载到 <video> 上后，通过 HandTracker 以 rAF + Web Worker 的方式进行原生帧推理
 * 3. 避免原来双引擎黑屏问题并极大提升并发性能
 */
export function useGestureEngine(videoRef: React.RefObject<HTMLVideoElement>) {
  const orbX = useMotionValue(-100);
  const orbY = useMotionValue(-100);
  
  const [isPinching, setIsPinching] = useState(false);
  const { setInteractionMode } = useAppStore();
  
  const emptyFramesRef = useRef(0);
  const [confidenceFallback, setConfidenceFallback] = useState(false);
  
  const pathRef = useRef<{x: number, y: number, time: number}[]>([]);
  const isShufflingRef = useRef(false);
  
  const lastPinchPosRef = useRef<{y: number} | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);

  // 第一步：权限探测与获取流
  const { permissionGranted, errorType, requestCamera, mediaStream } = useCameraPermission();

  useEffect(() => {
    requestCamera();
  }, [requestCamera]);

  // 处理获取到的流并初始化追踪
  useEffect(() => {
    if (!videoRef.current || !permissionGranted || !mediaStream) return;

    // 将视频流给到 video 元素
    videoRef.current.srcObject = mediaStream;

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
      
      // 注意：摄像头镜像翻转，所以这里做 1 - x
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
            const dy = py - lastPinchPosRef.current.y;
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

    const tracker = new HandTracker(videoRef.current, onResults);
    trackerRef.current = tracker;
    
    // 等待 video 加载完 meta 并有了宽度后再启动 worker
    const startTracker = () => {
        if (!tracker.isRunning) {
            tracker.start();
        }
    };
    
    videoRef.current.addEventListener('loadedmetadata', startTracker);

    if (videoRef.current.readyState >= 1) { // HAVE_METADATA
        startTracker();
    }

    // 强制播放放在监听器挂载后
    videoRef.current.play().catch(e => console.error('Video play error:', e));

    return () => {
      tracker.stop();
      trackerRef.current = null;
      videoRef.current?.removeEventListener('loadedmetadata', startTracker);
    };
  }, [videoRef, permissionGranted, mediaStream, confidenceFallback, setInteractionMode, orbX, orbY]);

  return { orbX, orbY, isPinching, confidenceFallback, cameraError: errorType };
}
