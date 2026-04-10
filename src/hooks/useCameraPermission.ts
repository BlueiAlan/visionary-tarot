import { useState, useCallback } from 'react';

/**
 * 摄像头权限与采集 Hook
 * 
 * 设计思路：
 * 此 Hook 负责请求摄像头权限并获取长期的 MediaStream 对象。
 * 返回的 MediaStream 会被绑定到 <video> 元素上，
 * 而 HandTracker 会直接使用该 <video> 元素进行 requestAnimationFrame 帧截取，
 * 从而抛弃了 MediaPipe 官方的高开销 Camera 类。
 */
export type CameraErrorType = 'NONE' | 'NOT_ALLOWED' | 'NOT_FOUND' | 'SECURE_CONTEXT';

export function useCameraPermission() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorType, setErrorType] = useState<CameraErrorType>('NONE');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const requestCamera = useCallback(async () => {
    // 安全上下文检测
    if (window.isSecureContext === false) {
      setErrorType('SECURE_CONTEXT');
      return;
    }

    try {
      // 捕获真实摄像头数据流，不再 release，而是保存下来绑定给 <video>
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setMediaStream(stream);
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

  return { permissionGranted, errorType, requestCamera, mediaStream };
}
