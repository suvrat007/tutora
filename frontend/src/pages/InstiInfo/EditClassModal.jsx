import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance";
import moment from 'moment';
import { notify } from '@/components/ui/Toast.jsx';

const EditClassModal = ({ isOpen, onClose, classInfo, onUpdate }) => {
    const [statusData, setStatusData] = useState({
        held: undefined,
        note: '',
        error: null,
    });
    const [loading, setLoading] = useState(false);

    // Animation variants
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    };

    // Prefill data when classInfo changes
    useEffect(() => {
        if (classInfo) {
            setStatusData({
                held: classInfo.hasHeld !== undefined ? classInfo.hasHeld : undefined,
                note: classInfo.note || '',
                error: null,
            });
        }
    }, [classInfo]);

    const handleStatusChange = (held) => {
        setStatusData(prev => ({ ...prev, held, error: null }));
    };

    const handleInputChange = (e) => {
        setStatusData(prev => ({ ...prev, note: e.target.value, error: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (statusData.held === undefined) {
            setStatusData(prev => ({ ...prev, error: 'Please select Held or Cancelled.' }));
            return;
        }
        if (!statusData.note.trim()) {
            setStatusData(prev => ({
                ...prev,
                error: statusData.held
                    ? 'Please provide details of what was covered in class.'
                    : 'Please provide a reason for cancellation.'
            }));
            return;
        }

        const payload = {
            updates: [{
                batch_id: classInfo.batch_id,
                subject_id: classInfo.subject_id,
                date: moment(classInfo.date).format('YYYY-MM-DD'),
                hasHeld: statusData.held,
                note: statusData.note,
                updated: true,
            }],
        };

        try {
            setLoading(true);
            const response = await axiosInstance.post("/api/classLog/add-class-updates", payload, { withCredentials: true });
            notify("Class updated successfully!", "success");
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            notify(err.response?.data?.message || "Update failed.", "error");
            setStatusData(prev => ({ ...prev, error: err.response?.data?.message || "Update failed." }));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !classInfo) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="relative bg-[#f8ede3] rounded-2xl shadow-xl w-full max-w-md m-4 p-6 space-y-5 border border-[#e6c8a8]"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#5a4a3c] hover:text-[#e0c4a8] focus:outline-none"
                >
                    <X className="w-5 h-5" />
                </motion.button>
                <h2 className="text-2xl font-semibold text-center text-[#5a4a3c]">Update Class Status</h2>

                {statusData.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <span className="block sm:inline">{statusData.error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#7b5c4b]">Batch</label>
                        <p className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg bg-[#f0d9c0] text-sm text-[#5a4a3c]">
                            {classInfo.batchName}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#7b5c4b]">Subject</label>
                        <p className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg bg-[#f0d9c0] text-sm text-[#5a4a3c]">
                            {classInfo.subjectName}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#7b5c4b]">Date</label>
                        <p className="w-full px-4 py-2 border border-[#e6c8a8] rounded-lg bg-[#f0d9c0] text-sm text-[#5a4a3c]">
                            {moment(classInfo.date).format('MMM DD, YYYY')}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#7b5c4b]">Class Status</label>
                        <div className="flex gap-2">
                            {["Held", "Cancelled"].map(label => (
                                <motion.button
                                    key={label}
                                    type="button"
                                    onClick={() => handleStatusChange(label === "Held")}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-3 py-1 rounded-lg border text-sm transition-colors duration-200 ${
                                        statusData.held === (label === "Held")
                                            ? "bg-[#e0c4a8] text-[#5a4a3c] border-[#e6c8a8]"
                                            : "bg-[#f0d9c0] text-[#5a4a3c] border-[#e6c8a8] hover:bg-[#d7b48f]"
                                    }`}
                                >
                                    {label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#7b5c4b]">
                            {statusData.held ? 'What was covered in class?' : 'Why was the class cancelled?'}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                            value={statusData.note}
                            onChange={handleInputChange}
                            className="w-full border border-[#e6c8a8] p-2 rounded-lg text-sm resize-y min-h-[60px] bg-[#f0d9c0] text-[#5a4a3c] focus:ring-[#e0c4a8] focus:outline-none"
                            placeholder={
                                statusData.held
                                    ? "e.g., Chapter 5 completed"
                                    : "e.g., Teacher unavailable"
                            }
                            rows="3"
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 ${
                                loading || statusData.held === undefined
                                    ? "bg-[#e6c8a8]/50 text-[#7b5c4b] cursor-not-allowed"
                                    : "bg-[#e0c4a8] text-[#5a4a3c] hover:bg-[#d7b48f]"
                            }`}
                            disabled={loading || statusData.held === undefined}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4 text-[#5a4a3c]" /> Submitting...
                                </>
                            ) : (
                                "Submit Update"
                            )}
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={onClose}
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-[#e6c8a8] text-[#5a4a3c] py-2 rounded-lg hover:bg-[#d7b48f] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] focus:ring-offset-2 transition duration-150 ease-in-out font-medium"
                        >
                            Cancel
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditClassModal;