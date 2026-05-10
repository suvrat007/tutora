import { useState, useCallback } from 'react';
import { faceapi } from '@/utilities/faceApiLoader.js';
import axiosInstance from '@/utilities/axiosInstance.jsx';

export const useFaceRegistration = (studentId) => {
    const [capturing, setCapturing] = useState(false);
    const [captureProgress, setCaptureProgress] = useState(0);
    const [registrationError, setRegistrationError] = useState(null);
    const [hasFace, setHasFace] = useState(false);

    const captureAndSave = useCallback(async (videoRef) => {
        setCapturing(true);
        setCaptureProgress(0);
        setRegistrationError(null);
        const samples = [];

        try {
            for (let i = 1; i <= 3; i++) {
                const detection = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (!detection) {
                    setRegistrationError('No face detected. Look directly at the camera.');
                    setCapturing(false);
                    return false;
                }
                samples.push(detection.descriptor);
                setCaptureProgress(i);
                if (i < 3) await new Promise(r => setTimeout(r, 300));
            }

            // Average the 3 descriptors for a more stable representation
            const averaged = new Float32Array(128);
            for (let i = 0; i < 128; i++) {
                averaged[i] = (samples[0][i] + samples[1][i] + samples[2][i]) / 3;
            }

            await axiosInstance.patch(`/student/face-descriptor/${studentId}`, {
                descriptor: Array.from(averaged)
            });

            setHasFace(true);
            return true;
        } catch (err) {
            setRegistrationError('Failed to save face data. Please try again.');
            return false;
        } finally {
            setCapturing(false);
        }
    }, [studentId]);

    const deleteFace = useCallback(async () => {
        try {
            await axiosInstance.delete(`/student/face-descriptor/${studentId}`);
            setHasFace(false);
            return true;
        } catch (err) {
            setRegistrationError('Failed to delete face data.');
            return false;
        }
    }, [studentId]);

    return { capturing, captureProgress, registrationError, hasFace, setHasFace, captureAndSave, deleteFace };
};
