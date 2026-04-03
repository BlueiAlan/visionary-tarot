import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export type GestureEventCallback = (results: Results) => void;

/**
 * 【重构说明】
 * 降低了 `modelComplexity` 以解决卡顿问题。这大幅减少了主线程对每一帧进行推理时的阻塞时长。
 */
export class HandTracker {
  private hands: Hands | null = null;
  private camera: Camera | null = null;
  public isRunning = false;

  constructor(private videoElement: HTMLVideoElement, private onResults: GestureEventCallback) {}

  public async initialize() {
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 1, 
      // 【极速优化】：原先为1会导致配置差的设备严重卡顿，0大幅提升帧率和追踪丝滑度
      modelComplexity: 0, 
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.hands.onResults(this.onResults);

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.hands && this.isRunning) {
          // 在 0 级复杂度下帧推理通常不到 10ms，大大缓解卡顿
          await this.hands.send({ image: this.videoElement });
        }
      },
      width: 640,
      height: 480
    });
  }

  public async start() {
    if (!this.camera) await this.initialize();
    this.isRunning = true;
    await this.camera?.start();
  }

  public stop() {
    this.isRunning = false;
    this.camera?.stop();
  }
}
