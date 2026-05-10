import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let loadingPromise = null;

export const loadFaceModels = () => {
    if (modelsLoaded) return Promise.resolve();
    if (loadingPromise) return loadingPromise;
    loadingPromise = Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]).then(() => {
        modelsLoaded = true;
    }).catch((err) => {
        loadingPromise = null;
        throw err;
    });
    return loadingPromise;
};

export { faceapi };
