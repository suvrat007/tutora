import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import axiosInstance from "@/utilities/axiosInstance";
import moment from 'moment';

const EditClassModal = ({ isOpen, onClose, classInfo, onUpdate }) => {
    const [statusData, setStatusData] = useState({
        held: undefined,
        note: '',
        error: null,
    });
    const [loading, setLoading] = useState(false);

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
            alert("Class updated successfully!");
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            setStatusData(prev => ({ ...prev, error: err.response?.data?.message || "Update failed." }));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !classInfo) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 space-y-5 border border-green-200"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold text-center text-gray-800">Update Class Status</h2>

                {statusData.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{statusData.error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Batch</label>
                        <p className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700">
                            {classInfo.batchName}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <p className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700">
                            {classInfo.subjectName}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <p className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700">
                            {moment(classInfo.date).format('MMM DD, YYYY')}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Class Status</label>
                        <div className="flex gap-2">
                            {["Held", "Cancelled"].map(label => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleStatusChange(label === "Held")}
                                    className={`px-3 py-1 rounded-lg border text-sm transition-colors duration-200 ${
                                        statusData.held === (label === "Held")
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            {statusData.held ? 'What was covered in class?' : 'Why was the class cancelled?'}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                            value={statusData.note}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded-md text-sm resize-y min-h-[60px]"
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
                        <button
                            type="submit"
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors duration-200 ${
                                loading || statusData.held === undefined
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                            disabled={loading || statusData.held === undefined}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                                </>
                            ) : (
                                "Submit Update"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditClassModal;