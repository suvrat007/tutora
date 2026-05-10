import { useRef, useEffect, useCallback } from 'react';
import { Loader2, CameraOff, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFaceModels } from '@/hooks/useFaceModels.js';
import { useWebcam } from '@/hooks/useWebcam.js';
import { useFaceDescriptors } from '@/hooks/useFaceDescriptors.js';
import { useFaceRecognitionLoop } from '@/pages/Attendence/hooks/useFaceRecognitionLoop.js';

const FaceScanPanel = ({ students, batchId, presentIds, onStudentRecognized, onClose, canMark }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const { modelsReady, loadingModels, modelError, load } = useFaceModels();
    const { cameraError, startCamera, stopCamera } = useWebcam(videoRef);
    const { faceMatcher, hasFaceData, loading: descriptorsLoading, fetchDescriptors } = useFaceDescriptors();

    useEffect(() => {
        load();
        fetchDescriptors(batchId);
    }, [batchId]);

    useEffect(() => {
        if (modelsReady) startCamera();
        return () => stopCamera();
    }, [modelsReady]);

    const handleRecognized = useCallback((studentId, studentName) => {
        if (!canMark) return;
        const alreadyPresent = presentIds.has(studentId);
        if (!alreadyPresent) {
            onStudentRecognized(studentId);
            toast.success(`${studentName} — Present`, {
                position: 'bottom-right',
                autoClose: 2000,
                hideProgressBar: true,
            });
        }
    }, [canMark, presentIds, onStudentRecognized]);

    useFaceRecognitionLoop(
        videoRef,
        canvasRef,
        modelsReady && faceMatcher ? faceMatcher : null,
        students,
        handleRecognized,
        modelsReady && !!faceMatcher
    );

    const recognizedStudents = students.filter(s => presentIds.has(s._id.toString()));
    const isLoading = loadingModels || descriptorsLoading;

    const statusMessage = () => {
        if (modelError) return modelError;
        if (cameraError) return cameraError;
        if (loadingModels) return 'Loading AI models…';
        if (descriptorsLoading) return 'Loading face data…';
        if (!hasFaceData) return 'No face data registered for this batch. Go to Student Data to register faces.';
        if (!modelsReady) return 'Preparing…';
        return 'Scanning… Show a student\'s face to the camera.';
    };

    return (
        <div className="bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-[#5a4a3c]">Face Scan Mode</h3>
                <button onClick={onClose} className="text-[#e0c4a8] hover:text-[#FF3B30] transition">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Webcam */}
            <div className="relative mx-4 rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '4/3' }}>
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                    </div>
                )}
                {(cameraError || modelError || !hasFaceData) && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-3">
                        <CameraOff className="w-6 h-6 text-[#e0c4a8]" />
                    </div>
                )}
            </div>

            {/* Status */}
            <p className="px-4 pt-2 text-xs text-[#7b5c4b] text-center leading-relaxed">{statusMessage()}</p>

            {/* Recognized counter */}
            {hasFaceData && (
                <p className="px-4 pt-1 text-xs font-medium text-[#8b5e3c] text-center">
                    {recognizedStudents.length} of {students.length} marked present via face scan
                </p>
            )}

            {/* Recognized list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 mt-2 space-y-1">
                {recognizedStudents.length > 0 && (
                    <>
                        <p className="text-xs font-medium text-[#5a4a3c] mb-1">Recognized:</p>
                        {recognizedStudents.map(s => (
                            <div key={s._id} className="flex items-center gap-2 text-sm text-[#5a4a3c]">
                                <CheckCircle className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
                                <span className="truncate">{s.name}</span>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default FaceScanPanel;
