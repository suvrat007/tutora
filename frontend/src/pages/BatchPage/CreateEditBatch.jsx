import { AiOutlineClose, AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CreateEditBatch = ({ onClose, onBatchCreated, setRerender, batchToEdit, handleBatchUpdated }) => {
    const isEditMode = !!batchToEdit;
    const [batchData, setBatchData] = useState({
        name: "",
        normalized_name: "",
        forStandard: "",
        subject: [
            {
                name: "",
                classSchedule: [
                    {
                        time: "",
                        days: []
                    }
                ]
            }
        ]
    });

    useEffect(() => {
        if (isEditMode) {
            setBatchData({
                ...batchToEdit,
                normalized_name: batchToEdit.normalized_name || batchToEdit.name.trim().toLowerCase().replace(/\s+/g, ""),
                subject: batchToEdit.subject.length > 0 ? batchToEdit.subject : [
                    {
                        name: "",
                        classSchedule: [{ time: "", days: [] }]
                    }
                ]
            });
        }
    }, [batchToEdit]);

    const handleBatchChange = (e) => {
        const { name, value } = e.target;
        let updatedValue = value;
        if (name === 'name') {
            updatedValue = value;
            setBatchData((prev) => ({
                ...prev,
                [name]: updatedValue,
                normalized_name: value.trim().toLowerCase().replace(/\s+/g, "")
            }));
        } else {
            setBatchData((prev) => ({ ...prev, [name]: updatedValue }));
        }
    };

    const handleSubjectChange = (index, e) => {
        const { name, value } = e.target;
        const updatedSubjects = [...batchData.subject];
        updatedSubjects[index][name] = value;
        setBatchData((prev) => ({ ...prev, subject: updatedSubjects }));
    };

    const handleScheduleChange = (subjectIndex, scheduleIndex, e) => {
        const { name, value, checked } = e.target;
        const updatedSubjects = [...batchData.subject];
        if (name === 'days') {
            if (checked) {
                updatedSubjects[subjectIndex].classSchedule[scheduleIndex].days.push(value);
            } else {
                updatedSubjects[subjectIndex].classSchedule[scheduleIndex].days =
                    updatedSubjects[subjectIndex].classSchedule[scheduleIndex].days.filter(day => day !== value);
            }
        } else {
            updatedSubjects[subjectIndex].classSchedule[scheduleIndex][name] = value;
        }
        setBatchData((prev) => ({ ...prev, subject: updatedSubjects }));
    };

    const addSubject = () => {
        setBatchData((prev) => ({
            ...prev,
            subject: [...prev.subject, { name: "", classSchedule: [{ time: "", days: [] }] }]
        }));
    };

    const removeSubject = (index) => {
        const updatedSubjects = batchData.subject.filter((_, idx) => idx !== index);
        setBatchData((prev) => ({ ...prev, subject: updatedSubjects }));
    };

    const validateForm = () => {
        if (!batchData.name || !batchData.forStandard) {
            alert("Please fill in all required fields.");
            return false;
        }
        for (const subject of batchData.subject) {
            if (!subject.name || subject.classSchedule.some(s => !s.time || s.days.length === 0)) {
                alert("Please complete all subject and schedule details.");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            let response;
            if (isEditMode) {
                response = await axiosInstance.put(`/update-batch/${batchToEdit._id}`, batchData);
                console.log("Batch updated:", response.data);
                if (handleBatchUpdated) {
                    handleBatchUpdated(response.data);
                }
            } else {
                response = await axiosInstance.post('/add-new-batch', batchData);
                console.log("Batch created:", response.data);
                setRerender(prev => !prev);
            }
            if (onBatchCreated) onBatchCreated();
            onClose();
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} batch:`, err);
            alert(`Failed to ${isEditMode ? 'update' : 'create'} batch.`);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">
                        {isEditMode ? 'Edit Batch' : 'Create New Batch'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors duration-200">
                        <AiOutlineClose size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Batch Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={batchData.name}
                                onChange={handleBatchChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Normalized Name (auto)</label>
                            <input
                                type="text"
                                value={batchData.normalized_name}
                                disabled
                                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Standard / Grade (numeric value only)*</label>
                            <input
                                type="text"
                                name="forStandard"
                                value={batchData.forStandard}
                                onChange={handleBatchChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Subjects */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center justify-between">
                            Subjects
                            <button
                                onClick={addSubject}
                                className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                            >
                                <AiOutlinePlus className="mr-1" /> Add Subject
                            </button>
                        </h3>
                        {batchData.subject.map((subj, subjIdx) => (
                            <div
                                key={subjIdx}
                                className="border border-gray-200 p-4 rounded-xl mb-4 bg-white shadow-sm space-y-4 relative"
                            >
                                <button
                                    onClick={() => removeSubject(subjIdx)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                                    disabled={batchData.subject.length === 1}
                                    title="Remove Subject"
                                >
                                    <AiOutlineMinus size={20} />
                                </button>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={subj.name}
                                        onChange={(e) => handleSubjectChange(subjIdx, e)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {subj.classSchedule.map((schedule, schedIdx) => (
                                    <div key={schedIdx} className="border-t border-gray-100 pt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Time *</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={schedule.time}
                                            onChange={(e) => handleScheduleChange(subjIdx, schedIdx, e)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Days *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {daysOfWeek.map(day => (
                                                <label key={day} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        name="days"
                                                        value={day}
                                                        checked={schedule.days.includes(day)}
                                                        onChange={(e) => handleScheduleChange(subjIdx, schedIdx, e)}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-600">{day}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                        {isEditMode ? 'Update Batch' : 'Create Batch'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateEditBatch;