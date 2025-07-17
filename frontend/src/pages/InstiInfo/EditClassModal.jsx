import { useEffect, useState  } from 'react';
import { motion  } from 'framer-motion';
import {
    X, Loader2
} from 'lucide-react';
import axiosInstance from '@/utilities/axiosInstance';
import moment from 'moment';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button.jsx';

const EditClassModal = ({ isOpen, onClose, classInfo, onUpdate }) => {
    const [statusData, setStatusData] = useState({
        held: undefined,
        note: '',
        error: null,
    });
    const [loading, setLoading] = useState(false);

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
            toast.error('Please select Held or Cancelled.');
            return;
        }
        if (!statusData.note.trim()) {
            toast.error(statusData.held
                ? 'Please provide details of what was covered in class.'
                : 'Please provide a reason for cancellation.');
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
            await axiosInstance.post("/api/classLog/add-class-updates", payload, { withCredentials: true });
            toast.success("Class updated successfully!");
            onUpdate();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !classInfo) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50"
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative bg-[#f4e3d0] rounded-lg shadow-xl w-full max-w-md m-4 p-6 space-y-5 border border-[#ddb892]"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[#6b4c3b] hover:text-[#4a3a2c] focus:outline-none"
                >
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold text-center text-[#4a3a2c]">Update Class Status</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#6b4c3b]">Batch</label>
                        <p className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-sm text-[#4a3a2c]">
                            {classInfo.batchName}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#6b4c3b]">Subject</label>
                        <p className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-sm text-[#4a3a2c]">
                            {classInfo.subjectName}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#6b4c3b]">Date</label>
                        <p className="w-full px-4 py-2 border border-[#ddb892] rounded-md bg-[#e7c6a5] text-sm text-[#4a3a2c]">
                            {moment(classInfo.date).format('MMM DD, YYYY')}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#6b4c3b]">Class Status</label>
                        <div className="flex gap-2">
                            {["Held", "Cancelled"].map(label => (
                                <Button
                                    key={label}
                                    type="button"
                                    onClick={() => handleStatusChange(label === "Held")}
                                    className={`${statusData.held === (label === "Held")
                                        ? "bg-[#d7b48f] text-[#4a3a2c]"
                                        : "bg-[#e7c6a5] text-[#4a3a2c] border border-[#ddb892] hover:bg-[#d7b48f]/50"} 
                                        px-3 py-1 rounded-lg text-sm transition-colors duration-200`}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[#6b4c3b]">
                            {statusData.held ? 'What was covered in class?' : 'Why was the class cancelled?'}
                            <span className="text-red-600 ml-1">*</span>
                        </label>
                        <textarea
                            value={statusData.note}
                            onChange={handleInputChange}
                            className="w-full border border-[#ddb892] p-2 rounded-md text-sm resize-y min-h-[60px] bg-[#e7c6a5] text-[#4a3a2c]"
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
                        <Button
                            type="submit"
                            className="flex-1 bg-[#d7b48f] text-[#4a3a2c] hover:bg-[#d7b48f]/80 transition-colors duration-200"
                            disabled={loading || statusData.held === undefined}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" /> Submitting...
                                </>
                            ) : (
                                "Submit Update"
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-[#e7c6a5] text-[#4a3a2c] border border-[#ddb892] hover:bg-[#e7c6a5]/80 transition-colors duration-200"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};
export default EditClassModal