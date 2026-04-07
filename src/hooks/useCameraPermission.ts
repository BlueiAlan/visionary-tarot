import { useState, useCallback } from 'react';

/**
 * 摄像头权限预探测 Hook
 * 
 * 设计思路：此 Hook 仅负责"权限探测"，不持有长期的 MediaStream。
 * 实际的视频流由 MediaPipe Camera 工具类接管（HandTracker 内部），
 * 避免双引擎争夺同一个 <video> 元素的 srcObject 导致黑屏闪烁。
 * 
 * 探测流程：getUserMedia → 成功则立即释放流 → 标记权限已授予
 * HandTracker 启动时会自己再打开一次摄像头。
 */
export type CameraErrorType = 'NONE' | 'NOT_ALLOWED' | 'NOT_FOUND' | 'SECURE_CONTEXT';

export function useCameraPermission() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorType, setErrorType] = useState<CameraErrorType>('NONE');

  const requestCamera = useCallback(async () => {
    // 安全上下文检测
    if (window.isSecureContext === false) {
      setErrorType('SECURE_CONTEXT');
      return;
    }

    try {
      // 仅探测权限：成功后立即释放流，不占用硬件
      const probeStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      // 释放探测流，真正的流由 HandTracker 的 Camera 实例管理
      probeStream.getTracks().forEach(t => t.stop());
      setPermissionGranted(true);
      setErrorType('NONE');
    } catch (err: any) {
      setPermissionGranted(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorType('NOT_ALLOWED');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorType('NOT_FOUND');
      } else {
        setErrorType('NOT_ALLOWED');
      }
    }
  }, []);

  return { permissionGranted, errorType, requestCamera };
}
