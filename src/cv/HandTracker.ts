import { Results } from '@mediapipe/hands';

export type GestureEventCallback = (results: Results) => void;

/**
 * 【重构说明】
 * - 使用 Web Worker (hand.worker.ts) 将 MediaPipe 推理移出主线程
 * - 直接使用 requestAnimationFrame 和 createImageBitmap 捕获视频帧，无需 @mediapipe/camera_utils 阻塞主线程
 */
export class HandTracker {
    private worker: Worker | null = null;
    public isRunning = false;
    private animationFrameId: number = 0;
    private isWorkerBusy = false;

    constructor(private videoElement: HTMLVideoElement, private onResults: GestureEventCallback) { }

    public async initialize() {
        // Initialize the Web Worker
        this.worker = new Worker(new URL('./hand.worker.ts', import.meta.url), { type: 'module' });
        
        this.worker.postMessage({ type: 'INIT' });

        this.worker.onmessage = (e: MessageEvent) => {
            if (e.data.type === 'LANDMARKS') {
                this.isWorkerBusy = false;
                // Construct pseudo-Results object to match the expected formatting in useGestureEngine
                this.onResults({
                    multiHandLandmarks: e.data.data,
                    multiHandWorldLandmarks: [],
                    multiHandedness: [],
                    image: this.videoElement as any
                });
            }
        };
    }

    private processFrame = async () => {
        if (!this.isRunning || !this.worker || this.videoElement.videoWidth === 0) {
            if (this.isRunning) {
                this.animationFrameId = requestAnimationFrame(this.processFrame);
            }
            return;
        }

        if (this.isWorkerBusy) {
            this.animationFrameId = requestAnimationFrame(this.processFrame);
            return;
        }

        try {
            this.isWorkerBusy = true;
            // Transform the video frame into an ImageBitmap to send across the boundary
            const bitmap = await createImageBitmap(this.videoElement);
            this.worker.postMessage({ type: 'PROCESS_FRAME', frame: bitmap }, [bitmap]);
        } catch (e) {
            console.error("Failed to capture video frame for worker:", e);
            this.isWorkerBusy = false;
        }

        // Keep loop running
        this.animationFrameId = requestAnimationFrame(this.processFrame);
    };

    public async start() {
        if (!this.worker) await this.initialize();
        this.isRunning = true;
        
        // Native starting instead of Camera_utils. We assume video is playing if useCameraPermission granted it.
        // the useCameraPermission sets srcObject.
        this.processFrame();
    }

    public stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

