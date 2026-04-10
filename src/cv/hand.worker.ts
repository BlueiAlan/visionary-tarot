import { Hands, Results } from '@mediapipe/hands';

let hands: Hands | null = null;

const initializeHands = () => {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults((results: Results) => {
        // We only care about multiHandLandmarks to keep data small
        self.postMessage({
            type: 'LANDMARKS',
            data: results.multiHandLandmarks
        });
    });
};

self.addEventListener('message', async (e: MessageEvent) => {
    if (e.data.type === 'INIT') {
        if (!hands) {
            initializeHands();
        }
    } else if (e.data.type === 'PROCESS_FRAME') {
        if (hands) {
            try {
                // e.data.frame is an ImageBitmap
                await hands.send({ image: e.data.frame });
            } catch (err) {
                console.error("Frame processing failed in worker:", err);
            }
        }
    }
});
