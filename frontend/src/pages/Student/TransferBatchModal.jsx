import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import axiosInstance from '@/utilities/axiosInstance';
import toast from 'react-hot-toast';

const TransferBatchModal = ({ student, batches, onClose, onTransferred }) => {
    const [targetBatchId, setTargetBatchId] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const currentBatch = batches.find(b => b._id === student.batchId);
    const targetBatch = batches.find(b => b._id === targetBatchId);

    const availableBatches = useMemo(
        () => batches.filter(b => b._id !== student.batchId),
        [batches, student.batchId]
    );

    const handleBatchChange = (batchId) => {
        setTargetBatchId(batchId);
        setSelectedSubjects([]);
    };

    const toggleSubject = (subjectId) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId) ? prev.filter(s => s !== subjectId) : [...prev, subjectId]
        );
    };

    const handleSubmit = async () => {
        if (!targetBatchId) {
            toast.error('Please select a target batch');
            return;
        }
        setIsLoading(true);
        try {
            await axiosInstance.post(`student/transfer-batch/${student._id}`, {
                newBatchId: targetBatchId,
                newSubjectIds: selectedSubjects,
            }, { withCredentials: true });
            toast.success(`${student.name} transferred to ${targetBatch?.name}`);
            await onTransferred();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Transfer failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#f8ede3] rounded-2xl shadow-xl w-full max-w-md border border-[#e6c8a8]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-[#f0d9c0] rounded-t-2xl border-b border-[#e6c8a8]">
                    <h2 className="text-base font-bold text-[#5a4a3c]">Transfer Student</h2>
                    <button onClick={onClose} className="text-[#7b5c4b] hover:text-[#5a4a3c]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Student + current batch */}
                    <div className="flex items-center gap-3 bg-[#f0d9c0] rounded-xl px-4 py-3 border border-[#e6c8a8]">
                        <div className="w-9 h-9 rounded-full bg-[#e0c4a8] border border-[#d0b498] flex items-center justify-center text-sm font-bold text-[#5a4a3c] shrink-0">
                            {student.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#5a4a3c] truncate">{student.name}</p>
                            <p className="text-xs text-[#7b5c4b]">
                                Currently in: <span className="font-medium">{currentBatch?.name || 'No Batch'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-[#c47d3e]" />
                    </div>

                    {/* Target batch */}
                    <div>
                        <label className="block text-xs font-bold text-[#7b5c4b] uppercase tracking-wider mb-1.5">
                            Transfer to Batch
                        </label>
                        <select
                            value={targetBatchId}
                            onChange={e => handleBatchChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#e6c8a8] bg-white text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8]"
                        >
                            <option value="">Select a batch…</option>
                            {availableBatches.map(b => (
                                <option key={b._id} value={b._id}>
                                    {b.name} — Class {b.forStandard}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subject selection for target batch */}
                    <AnimatePresence>
                        {targetBatch && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="block text-xs font-bold text-[#7b5c4b] uppercase tracking-wider mb-1.5">
                                    Enrol in Subjects (optional)
                                </label>
                                {targetBatch.subject?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {targetBatch.subject.map(s => (
                                            <button
                                                key={s._id}
                                                type="button"
                                                onClick={() => toggleSubject(s._id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                                                    selectedSubjects.includes(s._id)
                                                        ? 'bg-[#c47d3e] text-white border-[#c47d3e]'
                                                        : 'bg-[#f0d9c0] text-[#5a4a3c] border-[#e6c8a8] hover:bg-[#e0c4a8]'
                                                }`}
                                            >
                                                {s.name}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#7b5c4b]">No subjects in this batch yet.</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Warning */}
                    <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                            All past attendance and test records from <strong>{currentBatch?.name || 'the current batch'}</strong> will be preserved and visible in the student's profile.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-5 pb-5">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2 text-sm font-medium text-[#5a4a3c] bg-[#e0c4a8] rounded-xl hover:bg-[#d7b48f] transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!targetBatchId || isLoading}
                        className="flex-1 py-2 text-sm font-medium text-white bg-[#c47d3e] rounded-xl hover:bg-[#b06c30] transition disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Transfer
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TransferBatchModal;
