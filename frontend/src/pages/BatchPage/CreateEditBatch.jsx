import { AiOutlineClose, AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import useFetchBatches from "@/pages/useFetchBatches.js";

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
                name: batchToEdit.name,
                forStandard: batchToEdit.forStandard,
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
        if (!isValid()) return alert("Please fill in all required fields.");
        try {
            let response;
            if (isEditMode) {
                response = await axiosInstance.patch(`/api/batch/update-batch/${batchToEdit._id}`, batchData, { withCredentials: true });
                onBatchUpdated?.();
            } else {
                response = await axiosInstance.post('/api/batch/add-new-batch', batchData, { withCredentials: true });
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
        <div className="fixed text-black inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold">{isEditMode ? 'Edit Batch' : 'Create New Batch'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500">
                        <AiOutlineClose size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Batch Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={batchData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Standard / Grade *</label>
                            <input
                                type="text"
                                name="forStandard"
                                value={batchData.forStandard}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-semibold">Subjects</h3>
                            <button onClick={addSubject} className="flex items-center text-blue-600 text-sm font-medium">
                                <AiOutlinePlus className="mr-1" /> Add Subject
                            </button>
                        </div>
                        {batchData.subject.map((subj, i) => (
                            <div key={i} className="border p-4 rounded-xl mb-4 relative">
                                <button
                                    onClick={() => removeSubject(i)}
                                    className="absolute top-2 right-2 text-red-500"
                                    disabled={batchData.subject.length === 1}
                                >
                                    <AiOutlineMinus size={20} />
                                </button>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={subj.name}
                                        onChange={(e) => handleSubjectChange(i, e)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div className="pt-4">
                                    <label className="block text-sm font-medium mb-1">Class Time *</label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={subj.classSchedule.time}
                                        onChange={(e) => handleScheduleChange(i, e)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
                                    />
                                    <label className="block text-sm font-medium mb-1">Days *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {daysOfWeek.map(day => (
                                            <label key={day} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="days"
                                                    value={day}
                                                    checked={subj.classSchedule.days.includes(day)}
                                                    onChange={(e) => handleScheduleChange(i, e)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
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
                <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        {isEditMode ? 'Update Batch' : 'Create Batch'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateEditBatch;