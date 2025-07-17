import { AiOutlineClose, AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CreateEditBatch = ({ onClose, onBatchCreated, onBatchUpdated, setRerender, batchToEdit }) => {
    const isEditMode = !!batchToEdit;
    const  getBatches  = useFetchBatches();

    const [batchData, setBatchData] = useState({
        name: "",
        forStandard: "",
        subject: [
            {
                name: "",
                classSchedule: { time: "", days: [] }
            }
        ]
    });

    useEffect(() => {
        if (isEditMode) {
            setBatchData({
                ...batchToEdit,
                subject: batchToEdit.subject.length
                    ? batchToEdit.subject.map(sub => ({
                        ...sub,
                        classSchedule: {
                            time: sub.classSchedule?.time || "",
                            days: sub.classSchedule?.days || []
                        }
                    }))
                    : [{ name: "", classSchedule: { time: "", days: [] } }]
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
                ? [...schedule.days, value]
                : schedule.days.filter(day => day !== value);
        } else {
            schedule[name] = value;
        }

        updated[subjectIndex].classSchedule = schedule;
        setBatchData(prev => ({ ...prev, subject: updated }));
    };

    const addSubject = () => {
        setBatchData(prev => ({
            ...prev,
            subject: [...prev.subject, { name: "", classSchedule: { time: "", days: [] } }]
        }));
    };

    const removeSubject = (index) => {
        const updated = batchData.subject.filter((_, i) => i !== index);
        setBatchData(prev => ({ ...prev, subject: updated }));
    };

    const isValid = () => {
        if (!batchData.name || !batchData.forStandard) return false;
        return batchData.subject.every(sub =>
            sub.name && sub.classSchedule.time && sub.classSchedule.days.length
        );
    };

    const handleSubmit = async () => {
        if (!isValid()) return toast.error("Please fill in all required fields.");
        try {
            let response;
            if (isEditMode) {
                response = await axiosInstance.patch(`/api/batch/update-batch/${batchToEdit._id}`, batchData, { withCredentials: true });
                toast.success("Batch updated successfully!");
            } else {
                response = await axiosInstance.post('/api/batch/add-new-batch', batchData, { withCredentials: true });
                toast.success("Batch created successfully!");
            }
            setRerender?.(prev => !prev);
            await getBatches();
            onClose();
        } catch (err) {
            console.error("Error during batch handling:", err);
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} batch.`);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed text-text inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
                    <h2 className="text-lg font-bold">{isEditMode ? 'Edit Batch' : 'Create New Batch'}</h2>
                    <button onClick={onClose} className="text-text-light hover:text-error">
                        <AiOutlineClose size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Batch Name *</label>
                            <Input type="text" name="name" value={batchData.name} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Standard / Grade *</label>
                            <Input type="text" name="forStandard" value={batchData.forStandard} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-semibold">Subjects</h3>
                            <Button onClick={addSubject} size="sm" variant="outline"><AiOutlinePlus className="mr-1" /> Add Subject</Button>
                        </div>
                        {batchData.subject.map((subj, i) => (
                            <div key={i} className="border border-border p-4 rounded-xl mb-4 relative bg-background">
                                <button onClick={() => removeSubject(i)} className="absolute top-2 right-2 text-error" disabled={batchData.subject.length === 1}>
                                    <AiOutlineMinus size={20} />
                                </button>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject Name *</label>
                                    <Input type="text" name="name" value={subj.name} onChange={(e) => handleSubjectChange(i, e)} />
                                </div>
                                <div className="pt-4">
                                    <label className="block text-sm font-medium mb-1">Class Time *</label>
                                    <Input type="time" name="time" value={subj.classSchedule.time} onChange={(e) => handleScheduleChange(i, e)} className="mb-3" />
                                    <label className="block text-sm font-medium mb-1">Days *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {daysOfWeek.map(day => (
                                            <label key={day} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    value={day}
                                                    checked={subj.classSchedule.days.includes(day)}
                                                    onChange={(e) => handleScheduleChange(i, e)}
                                                    className="h-4 w-4 text-primary"
                                                />
                                                <span className="text-sm">{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end px-6 py-4 border-t border-border bg-background">
                    <Button onClick={handleSubmit}>{isEditMode ? 'Update Batch' : 'Create Batch'}</Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CreateEditBatch;