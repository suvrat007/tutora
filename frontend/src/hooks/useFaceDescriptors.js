import { useState, useCallback } from 'react';
import { faceapi } from '@/utilities/faceApiLoader.js';
import axiosInstance from '@/utilities/axiosInstance.jsx';

export const useFaceDescriptors = () => {
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [hasFaceData, setHasFaceData] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchDescriptors = useCallback(async (batchId) => {
        setLoading(true);
        try {
            const params = batchId ? { batchId } : {};
            const { data } = await axiosInstance.get('/student/face-descriptors', { params });

            if (!data.length) {
                setHasFaceData(false);
                setFaceMatcher(null);
                return;
            }

            const labeled = data.map(({ _id, name, descriptor }) =>
                new faceapi.LabeledFaceDescriptors(_id.toString(), [new Float32Array(descriptor)])
            );
            setFaceMatcher(new faceapi.FaceMatcher(labeled, 0.5));
            setHasFaceData(true);
        } catch (err) {
            console.error('Failed to fetch face descriptors:', err);
            setHasFaceData(false);
        } finally {
            setLoading(false);
        }
    }, []);

    return { faceMatcher, hasFaceData, loading, fetchDescriptors };
};
