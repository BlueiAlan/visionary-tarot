import { useState, useCallback, useEffect } from 'react';

export function useCameraPermission() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorType, setErrorType] = useState<'NONE' | 'NOT_ALLOWED' | 'NOT_FOUND' | 'SECURE_CONTEXT'>('NONE');

  const requestCamera = useCallback(async () => {
    // 审计1: 检查是否为安全上下文
    if (window.isSecureContext === false) {
      setErrorType('SECURE_CONTEXT');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      setErrorType('NONE');
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorType('NOT_ALLOWED');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorType('NOT_FOUND');
      } else {
        setErrorType('NOT_ALLOWED'); // 兜底
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
  }, [stream]);

  // 绑定 unload 时释放，确保关闭窗口不驻留
  useEffect(() => {
    const handleUnload = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [stream]);

  return { stream, errorType, requestCamera, stopCamera };
}
