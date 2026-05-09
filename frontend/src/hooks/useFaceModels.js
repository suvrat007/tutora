import { useState, useCallback } from 'react';
import { loadFaceModels } from '@/utilities/faceApiLoader.js';

export const useFaceModels = () => {
    const [modelsReady, setModelsReady] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [modelError, setModelError] = useState(null);

    const load = useCallback(async () => {
        if (modelsReady) return;
        setLoadingModels(true);
        setModelError(null);
        try {
            await loadFaceModels();
            setModelsReady(true);
        } catch (err) {
            setModelError('Failed to load AI models. Check your connection and try again.');
        } finally {
            setLoadingModels(false);
        }
    }, [modelsReady]);

    return { modelsReady, loadingModels, modelError, load };
};
