import { useEffect, useRef, useCallback } from 'react';
import { faceapi } from '@/utilities/faceApiLoader.js';

export const useFaceRecognitionLoop = (videoRef, canvasRef, faceMatcher, students, onRecognized, isActive) => {
    const rafRef = useRef(null);
    const recentlyRecognized = useRef(new Map());

    const resizeCanvas = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
    }, [videoRef, canvasRef]);

    useEffect(() => {
        if (!isActive || !faceMatcher || !videoRef.current || !canvasRef.current) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        const studentIdSet = new Set(students.map(s => s._id.toString()));

        const detect = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState < 2) {
                rafRef.current = requestAnimationFrame(detect);
                return;
            }

            resizeCanvas();

            const detections = await faceapi
                .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            const dims = { width: canvas.width, height: canvas.height };
            const resized = faceapi.resizeResults(detections, dims);

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const now = Date.now();
            for (const detection of resized) {
                const best = faceMatcher.findBestMatch(detection.descriptor);
                const matched = best.distance < 0.5 && studentIdSet.has(best.label);
                const student = matched ? students.find(s => s._id.toString() === best.label) : null;

                const box = detection.detection.box;
                ctx.strokeStyle = matched ? '#34C759' : '#e0c4a8';
                ctx.lineWidth = 2;
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                if (student) {
                    ctx.fillStyle = '#34C759';
                    ctx.font = 'bold 14px sans-serif';
                    ctx.fillText(student.name, box.x, box.y > 20 ? box.y - 6 : box.y + box.height + 16);

                    const lastSeen = recentlyRecognized.current.get(best.label) || 0;
                    if (now - lastSeen > 3000) {
                        recentlyRecognized.current.set(best.label, now);
                        onRecognized(best.label, student.name);
                    }
                }
            }

            rafRef.current = requestAnimationFrame(detect);
        };

        rafRef.current = requestAnimationFrame(detect);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isActive, faceMatcher, students, onRecognized, videoRef, canvasRef, resizeCanvas]);

    useEffect(() => {
        if (!isActive) recentlyRecognized.current.clear();
    }, [isActive]);
};
