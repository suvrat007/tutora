import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";
import useFetchBatches from "@/pages/useFetchBatches.js";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button.jsx";

const AddStudentModal = ({ onClose, setRerender, batch, refreshStudents }) => {
    const groupedStudents = useSelector((state) => state.students.groupedStudents);
    const [noBatchStudents, setNoBatchStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        const group = groupedStudents.find((group) => group.batchId === null);
        if (group && group.students?.length > 0) {
            const filtered = group.students.filter((student) => String(student.grade) === String(batch.forStandard));
            setNoBatchStudents(filtered);
        }
    }, [groupedStudents, batch]);

    const handleSelectStudent = (studentId) => {
        const isAlreadySelected = selectedStudents.find((s) => s.id === studentId);
        if (isAlreadySelected) {
            setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
        } else {
            setSelectedStudents((prev) => [...prev, { id: studentId, subjectIds: [] }]);
        }
    };

    const handleSubjectToggle = (studentId, subjectId) => {
        setSelectedStudents((prev) =>
            prev.map((student) => {
                if (student.id === studentId) {
                    const exists = student.subjectIds.includes(subjectId);
                    const updatedSubjects = exists ? student.subjectIds.filter((sid) => sid !== subjectId) : [...student.subjectIds, subjectId];
                    return { ...student, subjectIds: updatedSubjects };
                }
                return student;
            })
        );
    };

    const fetchStudents = useFetchStudents();
    const fetchBatches = useFetchBatches();

    const isValidSelection = () => {
        return selectedStudents.every((student) => student.subjectIds.length > 0);
    };

    const handleUpdateStudents = async () => {
        if (!isValidSelection()) {
            toast.error("Please select at least one subject for each selected student.");
            return;
        }

        try {
            await Promise.all(selectedStudents.map(student =>
                axiosInstance.patch(`/api/student/update-student/${student.id}`, {
                    batchId: batch._id,
                    subjectId: student.subjectIds,
                }, { withCredentials: true })
            ));

            await fetchStudents();
            await fetchBatches();
            setRerender((prev) => !prev);
            refreshStudents();
            onClose();
            toast.success("Students assigned successfully!");
        } catch (err) {
            toast.error("Failed to assign students to batch.");
        }
    };

    const isStudentSelected = (id) => selectedStudents.find((s) => s.id === id);
    const selectedStudentObjs = noBatchStudents.filter((std) => isStudentSelected(std._id));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative border border-border">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-light hover:text-error transition">
                    <AiOutlineClose size={24} />
                </button>

                <h2 className="text-xl font-bold text-text mb-4 text-center">Students Without Any Batch (Class {batch.forStandard})</h2>

                <AnimatePresence>
                    {selectedStudentObjs.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-3 overflow-x-auto pb-2 mb-4 border-b border-border">
                            {selectedStudentObjs.map((student) => (
                                <motion.div key={student._id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full whitespace-nowrap">
                                    {student.name}
                                    <button onClick={() => handleSelectStudent(student._id)} className="ml-2 text-error hover:text-red-700">
                                        <AiOutlineClose size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {noBatchStudents.length > 0 ? (
                    <ul className="divide-y divide-border max-h-[50vh] overflow-y-auto">
                        {noBatchStudents.map((student) => {
                            const isSelected = isStudentSelected(student._id);
                            return (
                                <li key={student._id} className="py-3 px-4">
                                    <div onClick={() => handleSelectStudent(student._id)} className={`cursor-pointer rounded p-2 transition ${isSelected ? 'bg-accent-light' : 'hover:bg-background'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-text">{student.name}</span>
                                            <span className="text-sm text-text-light">{student.school_name}</span>
                                            <span className="text-sm text-text-light">Grade: {student.grade}</span>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 ml-4">
                                            <p className="text-xs text-text-light mb-1">Select Subjects:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {batch.subject.map((subj) => (
                                                    <label key={subj._id} className="flex items-center space-x-2 text-text">
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox text-primary"
                                                            checked={isStudentSelected(student._id)?.subjectIds.includes(subj._id)}
                                                            onChange={() => handleSubjectToggle(student._id, subj._id)}
                                                        />
                                                        {subj.name}
                                                    </label>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-text-light">No students found without a batch.</p>
                )}

                {selectedStudents.length > 0 && (
                    <div className="mt-6 text-center">
                        <Button onClick={handleUpdateStudents}>
                            Assign to Batch
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default AddStudentModal;