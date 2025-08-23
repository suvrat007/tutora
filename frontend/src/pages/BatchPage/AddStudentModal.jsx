import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion  } from "framer-motion";
import axiosInstance from "@/utilities/axiosInstance";
import useFetchBatches from "@/pages/useFetchBatches.js";
import useFetchStudents from "@/pages/useFetchStudents.js";
import {  Users} from "lucide-react";
import { AiOutlineClose } from "react-icons/ai";
import toast from 'react-hot-toast';


const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};


const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const placeholderVariants = {
    pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
};

const AddStudentModal = ({ onClose, batch, refreshStudents }) => {
    const groupedStudents = useSelector((state) => state.students.groupedStudents);
    const [noBatchStudents, setNoBatchStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        const group = groupedStudents.find((group) => group.batchId === null);
        if (group && group.students?.length > 0) {
            const filtered = group.students.filter(
                (student) => String(student.grade) === String(batch.forStandard)
            );
            setNoBatchStudents(filtered);
        }
    }, [groupedStudents, batch]);

    const handleSelectStudent = (studentId) => {
        try {
            const isAlreadySelected = selectedStudents.find((s) => s.id === studentId);
            if (isAlreadySelected) {
                setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
            } else {
                setSelectedStudents((prev) => [...prev, { id: studentId, subjectIds: [] }]);
            }
        } catch (error) {
            toast.error("An error occurred while selecting a student.");
        }
    };

    const handleSubjectToggle = (studentId, subjectId) => {
        try {
            setSelectedStudents((prev) =>
                prev.map((student) => {
                    if (student.id === studentId) {
                        const exists = student.subjectIds.includes(subjectId);
                        const updatedSubjects = exists
                            ? student.subjectIds.filter((sid) => sid !== subjectId)
                            : [...student.subjectIds, subjectId];
                        return { ...student, subjectIds: updatedSubjects };
                    }
                    return student;
                })
            );
        } catch (error) {
            toast.error("An error occurred while toggling a subject.");
        }
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
            for (const student of selectedStudents) {
                await axiosInstance.patch(`/api/student/update-student/${student.id}`, {
                    batchId: batch._id,
                    subjectId: student.subjectIds,
                }, { withCredentials: true });
            }

            await fetchStudents();
            await fetchBatches();
            refreshStudents();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to assign students to batch.");
        }
    };

    const isStudentSelected = (id) => selectedStudents.find((s) => s.id === id);
    const selectedStudentObjs = noBatchStudents.filter((std) => isStudentSelected(std._id));

    return (
        <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <div className="bg-[#f8ede3] w-full max-w-2xl rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-6 relative">
                <motion.button
                    whileHover={{ scale: 1.1, color: "#FF3B30" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#e0c4a8] hover:text-[#FF3B30] transition"
                >
                    <AiOutlineClose size={24} />
                </motion.button>
                <h2 className="text-xl font-bold text-[#5a4a3c] mb-4 text-center">
                    Students Without Any Batch (Class {batch.forStandard})
                </h2>
                {selectedStudentObjs.length > 0 && (
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="show"
                        className="flex gap-3 overflow-x-auto pb-2 mb-4 border-b border-[#e6c8a8]"
                    >
                        {selectedStudentObjs.map((student) => (
                            <div key={student._id} className="flex items-center bg-[#f0d9c0] text-[#5a4a3c] px-3 py-1 rounded-full whitespace-nowrap">
                                {student.name}
                                <motion.button
                                    whileHover={{ scale: 1.1, color: "#FF3B30" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSelectStudent(student._id)}
                                    className="ml-2 text-[#e0c4a8] hover:text-[#FF3B30]"
                                >
                                    <AiOutlineClose size={14} />
                                </motion.button>
                            </div>
                        ))}
                    </motion.div>
                )}
                {noBatchStudents.length > 0 ? (
                    <motion.ul
                        variants={fadeInUp}
                        initial="hidden"
                        animate="show"
                        className="divide-y divide-[#e6c8a8] max-h-[50vh] overflow-y-auto"
                    >
                        {noBatchStudents.map((student) => {
                            const isSelected = isStudentSelected(student._id);
                            return (
                                <li key={student._id} className="py-3 px-4">
                                    <div
                                        onClick={() => handleSelectStudent(student._id)}
                                        className={`cursor-pointer px-5 p-2 rounded-lg transition ${isSelected ? 'bg-[#f0d9c0]' : 'hover:bg-[#f0d9c0]'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[#5a4a3c]">{student.name}</span>
                                            <span className="text-sm text-[#7b5c4b]">{student.school_name}</span>
                                            <span className="text-sm text-[#7b5c4b]">Grade: {student.grade}</span>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="mt-2 ml-4">
                                            <p className="text-xs text-[#7b5c4b] mb-1">Select Subjects:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {batch.subject.map((subj) => (
                                                    <label
                                                        key={subj._id}
                                                        className="text-xs flex items-center gap-1 bg-[#f0d9c0] px-2 py-1 rounded hover:bg-[#e0c4a8] cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox h-4 w-4 text-[#e0c4a8]"
                                                            checked={isStudentSelected(student._id)?.subjectIds.includes(subj._id)}
                                                            onChange={() => handleSubjectToggle(student._id, subj._id)}
                                                        />
                                                        <span>{subj.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </motion.ul>
                ) : (
                    <motion.div
                        variants={placeholderVariants}
                        animate="pulse"
                        className="flex flex-col justify-center items-center py-12 text-[#7b5c4b] "
                    >
                        <Users className="text-6xl text-[#e0c4a8] mb-4" />
                        <p className="text-sm">No students found without a batch.</p>
                    </motion.div>
                )}
                {selectedStudents.length > 0 && (
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="show"
                        className="mt-6 text-center"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUpdateStudents}
                            className={`px-6 py-2 rounded-lg transition ${isValidSelection() ? "bg-[#34C759] text-white hover:bg-[#2eb84c]" : "bg-[#e0c4a8] text-[#5a4a3c] cursor-not-allowed"}`}
                            disabled={!isValidSelection()}
                        >
                            Assign to Batch
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
export default AddStudentModal;