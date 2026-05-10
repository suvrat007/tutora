import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineClose } from 'react-icons/ai';
import { Loader2, Camera, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFaceModels } from '@/hooks/useFaceModels.js';
import { useWebcam } from '@/hooks/useWebcam.js';
import { useFaceRegistration } from '@/pages/Student/hooks/useFaceRegistration.js';
import { faceapi } from '@/utilities/faceApiLoader.js';

const FaceRegistrationModal = ({ studentId, studentName, hasFace: initialHasFace, onClose, onRegistered }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const previewIntervalRef = useRef(null);

    const { modelsReady, loadingModels, modelError, load } = useFaceModels();
    const { cameraError, startCamera, stopCamera } = useWebcam(videoRef);
    const { capturing, captureProgress, registrationError, hasFace, setHasFace, captureAndSave, deleteFace } = useFaceRegistration(studentId);

    const [status, setStatus] = useState('loading_models');
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        setHasFace(!!initialHasFace);
    }, [initialHasFace, setHasFace]);

    // Load models then start camera
    useEffect(() => {
        load().then(async () => {
            setStatus('starting_camera');
            await startCamera();
            setStatus('ready');
        });
        return () => {
            stopCamera();
            if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
        };
    }, []);

    // Live face detection preview (green box)
    const runPreview = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2 || !modelsReady) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const detection = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }));
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (detection) {
            const scaleX = canvas.width / (video.videoWidth || 640);
            const scaleY = canvas.height / (video.videoHeight || 480);
            const b = detection.box;
            ctx.strokeStyle = '#34C759';
            ctx.lineWidth = 3;
            ctx.strokeRect(b.x * scaleX, b.y * scaleY, b.width * scaleX, b.height * scaleY);
        }
    }, [modelsReady]);

    useEffect(() => {
        if (status === 'ready' && modelsReady) {
            previewIntervalRef.current = setInterval(runPreview, 500);
        }
        return () => {
            if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
        };
    }, [status, modelsReady, runPreview]);

    const handleCapture = async () => {
        setStatus('capturing');
        const ok = await captureAndSave(videoRef);
        if (ok) {
            setStatus('saved');
            toast.success(`Face registered for ${studentName}`);
            setTimeout(() => {
                onRegistered?.();
                onClose();
            }, 1500);
        } else {
            setStatus('ready');
        }
    };

    const handleDelete = async () => {
        const ok = await deleteFace();
        if (ok) {
            toast.success('Face data removed');
            setConfirmDelete(false);
        }
    };

    const getStatusText = () => {
        if (modelError || cameraError) return modelError || cameraError;
        if (status === 'loading_models') return 'Loading AI models…';
        if (status === 'starting_camera') return 'Starting camera…';
        if (status === 'capturing') return captureProgress > 0 ? `Capturing ${captureProgress} of 3…` : 'Detecting face…';
        if (status === 'saved') return 'Face registered!';
        if (registrationError) return registrationError;
        return 'Position your face in the frame, then press Capture.';
    };

    const isLoading = status === 'loading_models' || status === 'starting_camera';
    const isCapturing = status === 'capturing';
    const isSaved = status === 'saved';
    const hasError = !!(modelError || cameraError);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#f8ede3] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-[#8b5e3c]" />
                        <h2 className="text-lg font-semibold text-[#5a4a3c]">
                            {hasFace ? 'Update Face' : 'Register Face'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFace && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Face on file
                            </span>
                        )}
                        <button onClick={onClose} className="text-[#e0c4a8] hover:text-[#FF3B30] transition">
                            <AiOutlineClose className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <p className="px-5 pb-2 text-sm text-[#7b5c4b]">{studentName}</p>

                {/* Webcam area */}
                <div className="relative mx-5 mb-3 rounded-2xl overflow-hidden bg-black aspect-video">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full"
                    />
                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-2">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                            <span className="text-white text-sm">{getStatusText()}</span>
                        </div>
                    )}
                    {isSaved && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 gap-2">
                            <CheckCircle className="w-12 h-12 text-[#34C759]" />
                            <span className="text-white text-sm font-medium">Saved!</span>
                        </div>
                    )}
                </div>

                {/* Status message */}
                <div className="px-5 mb-3 min-h-[1.25rem]">
                    <p className={`text-sm text-center ${hasError || registrationError ? 'text-red-500' : 'text-[#7b5c4b]'}`}>
                        {isCapturing && captureProgress > 0 && (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {getStatusText()}
                            </span>
                        )}
                        {!isCapturing && getStatusText()}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex flex-col gap-2">
                    {!confirmDelete ? (
                        <>
                            <button
                                onClick={handleCapture}
                                disabled={isLoading || isCapturing || isSaved || hasError}
                                className="w-full py-2.5 bg-[#8b5e3c] text-white rounded-full font-medium text-sm hover:bg-[#7a5234] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCapturing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {captureProgress > 0 ? `${captureProgress} / 3` : 'Detecting…'}
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-4 h-4" />
                                        {hasFace ? 'Re-capture Face' : 'Capture Face'}
                                    </>
                                )}
                            </button>
                            {hasFace && (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="w-full py-2 text-sm text-red-500 hover:text-red-700 transition flex items-center justify-center gap-1.5"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete face data
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-center text-[#5a4a3c]">Delete face data for {studentName}?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    className="flex-1 py-2.5 bg-[#e0c4a8] text-[#5a4a3c] rounded-full text-sm font-medium hover:bg-[#d8bca0] transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default FaceRegistrationModal;
