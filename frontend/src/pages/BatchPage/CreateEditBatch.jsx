import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "@/utilities/axiosInstance";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { AiOutlineClose, AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CreateEditBatch = ({ onClose, onBatchCreated, onBatchUpdated, setRerender, batchToEdit }) => {
    const isEditMode = !!batchToEdit;
    const getBatches = useFetchBatches();

    const [batchData, setBatchData] = useState({
        name: "",
        forStandard: "",
        subject: [
            {
                name: "",
                startDate: "",
                classSchedule: { time: "", days: [] }
            }
        ]
    });

    useEffect(() => {
        if (isEditMode) {
            setBatchData({
                name: batchToEdit.name,
                forStandard: batchToEdit.forStandard,
                subject: batchToEdit.subject.length
                    ? batchToEdit.subject.map(sub => ({
                        ...sub,
                        startDate: sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : "",
                        classSchedule: {
                            time: sub.classSchedule?.time || "",
                            days: sub.classSchedule?.days ? [...sub.classSchedule.days].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)) : []
                        }
                    }))
                    : [{ name: "", startDate: "", classSchedule: { time: "", days: [] } }]
            });
        }
    }, [batchToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBatchData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubjectChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...batchData.subject];
        updated[index] = { ...updated[index], [name]: value };
        setBatchData(prev => ({ ...prev, subject: updated }));
    };

    const handleScheduleChange = (subjectIndex, e) => {
        const { name, value, checked } = e.target;
        const updated = [...batchData.subject];
        const schedule = { ...updated[subjectIndex].classSchedule };

        if (name === 'days') {
            schedule.days = checked
                ? [...schedule.days, value].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
                : schedule.days.filter(day => day !== value);
        } else if (name === 'selectAllDays') {
            schedule.days = schedule.days.length === daysOfWeek.length
                ? [] // Deselect all if all are selected
                : [...daysOfWeek]; // Select all days
        } else {
            schedule[name] = value;
        }

        updated[subjectIndex].classSchedule = schedule;
        setBatchData(prev => ({ ...prev, subject: updated }));
    };

    const addSubject = () => {
        setBatchData(prev => ({
            ...prev,
            subject: [...prev.subject, { name: "", startDate: "", classSchedule: { time: "", days: [] } }]
        }));
    };

    const removeSubject = (index) => {
        const updated = batchData.subject.filter((_, i) => i !== index);
        setBatchData(prev => ({ ...prev, subject: updated }));
    };

    const isValid = () => {
        if (!batchData.name || !batchData.forStandard) return false;
        return batchData.subject.every(sub =>
            sub.name && sub.startDate && sub.classSchedule.time && sub.classSchedule.days.length
        );
    };

    const handleSubmit = async () => {
        if (!isValid()) return alert("Please fill in all required fields, including the start date for each subject.");
        try {
            const sortedBatchData = {
                ...batchData,
                subject: batchData.subject.map(sub => ({
                    ...sub,
                    classSchedule: {
                        ...sub.classSchedule,
                        days: [...sub.classSchedule.days].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
                    }
                }))
            };
            let response;
            if (isEditMode) {
                response = await axiosInstance.patch(`/api/batch/update-batch/${batchToEdit._id}`, sortedBatchData, { withCredentials: true });
                onBatchUpdated?.();
            } else {
                response = await axiosInstance.post('/api/batch/add-new-batch', sortedBatchData, { withCredentials: true });
                onBatchCreated?.();
            }
            setRerender?.(prev => !prev);
            await getBatches();
            onClose();
        } catch (err) {
            console.error("Error during batch handling:", err);
            alert(`Failed to ${isEditMode ? 'update' : 'create'} batch.`);
        }
    };

    return (
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed text-[#5a4a3c] inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
            <div className="relative w-full max-w-3xl bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e6c8a8] bg-[#f0d9c0]">
                    <h2 className="text-lg font-bold text-[#5a4a3c]">{isEditMode ? 'Edit Batch' : 'Create New Batch'}</h2>
                    <motion.button
                        whileHover={{ scale: 1.1, color: "#FF3B30" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="text-[#e0c4a8] hover:text-[#FF3B30] transition"
                    >
                        <AiOutlineClose size={24} />
                    </motion.button>
                </div>
                <div className="p-6 space-y-6 max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
                    <motion.div variants={fadeInUp} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#5a4a3c] mb-1">Batch Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={batchData.name}
                                onChange={handleChange}
                                className="w-full border border-[#e6c8a8] bg-[#f8ede3] rounded-lg px-3 py-2 text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#5a4a3c] mb-1">Standard / Grade *</label>
                            <input
                                type="text"
                                name="forStandard"
                                value={batchData.forStandard}
                                onChange={handleChange}
                                className="w-full border border-[#e6c8a8] bg-[#f8ede3] rounded-lg px-3 py-2 text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition"
                            />
                        </div>
                    </motion.div>
                    <motion.div variants={fadeInUp} initial="hidden" animate="show">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-semibold text-[#5a4a3c]">Subjects</h3>
                            <motion.button
                                whileHover={{ scale: 1.05, color: "#34C759" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={addSubject}
                                className="flex items-center text-[#e0c4a8] hover:text-[#34C759] text-sm font-medium"
                            >
                                <AiOutlinePlus className="mr-1" /> Add Subject
                            </motion.button>
                        </div>
                        {batchData.subject.map((subj, i) => (
                            <motion.div
                                key={i}
                                variants={fadeInUp}
                                initial="hidden"
                                animate="show"
                                className="border border-[#e6c8a8] p-4 rounded-xl mb-4 relative bg-[#f0d9c0]"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.1, color: "#FF3B30" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => removeSubject(i)}
                                    className="absolute top-2 right-2 text-[#e0c4a8] hover:text-[#FF3B30] disabled:opacity-50"
                                    disabled={batchData.subject.length === 1}
                                >
                                    <AiOutlineMinus size={20} />
                                </motion.button>
                                <div>
                                    <label className="block text-sm font-medium text-[#5a4a3c] mb-1">Subject Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={subj.name}
                                        onChange={(e) => handleSubjectChange(i, e)}
                                        className="w-full border border-[#e6c8a8] bg-[#f8ede3] rounded-lg px-3 py-2 text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition"
                                    />
                                </div>
                                <div className="pt-4">
                                    <label className="block text-sm font-medium text-[#5a4a3c] mb-1">Date of Class Commencement *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={subj.startDate}
                                        onChange={(e) => handleSubjectChange(i, e)}
                                        className="w-full border border-[#e6c8a8] bg-[#f8ede3] rounded-lg px-3 py-2 text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition mb-3"
                                    />
                                    <label className="block text-sm font-medium text-[#5a4a3c] mb-1">Class Time *</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={subj.classSchedule.time}
                                        onChange={(e) => handleScheduleChange(i, e)}
                                        className="w-full border border-[#e6c8a8] bg-[#f8ede3] rounded-lg px-3 py-2 text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition mb-3"
                                    />
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-[#5a4a3c]">Days *</label>
                                        <motion.button
                                            whileHover={{ scale: 1.05, color: "#34C759" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => handleScheduleChange(i, { target: { name: 'selectAllDays', value: '' } })}
                                            className="text-[#e0c4a8] hover:text-[#34C759] text-sm font-medium"
                                        >
                                            {subj.classSchedule.days.length === daysOfWeek.length ? 'Deselect All Days' : 'Select All Days'}
                                        </motion.button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {daysOfWeek.map(day => (
                                            <label key={day} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="days"
                                                    value={day}
                                                    checked={subj.classSchedule.days.includes(day)}
                                                    onChange={(e) => handleScheduleChange(i, e)}
                                                    className="h-4 w-4 text-[#e0c4a8] border-[#e6c8a8] rounded"
                                                />
                                                <span className="text-sm text-[#5a4a3c]">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
                <div className="flex justify-end px-6 py-4 border-t border-[#e6c8a8] bg-[#f0d9c0] rounded-2xl">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        className="bg-[#34C759] text-white px-6 py-2 rounded-lg hover:bg-[#2eb84c] transition"
                    >
                        {isEditMode ? 'Update Batch' : 'Create Batch'}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default CreateEditBatch;