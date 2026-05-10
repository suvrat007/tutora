import { useState, useCallback, useRef, useEffect } from 'react';

export const useWebcam = (videoRef) => {
    const [cameraError, setCameraError] = useState(null);
    const streamRef = useRef(null);

    const startCamera = useCallback(async () => {
        setCameraError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setCameraError('Camera access denied. Please allow camera permissions and try again.');
        }
    }, [videoRef]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [videoRef]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    return { cameraError, startCamera, stopCamera };
};
