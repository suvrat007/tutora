import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import axiosInstance from "@/utilities/axiosInstance.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";
import useFetchBatches from "@/pages/useFetchBatches.js";

const AddStudentModal = ({ onClose, setRerender, batch, refreshStudents }) => {
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
                    const updatedSubjects = exists
                        ? student.subjectIds.filter((sid) => sid !== subjectId)
                        : [...student.subjectIds, subjectId];
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
            alert("Please select at least one subject for each selected student.");
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
            setRerender((prev) => !prev);
            refreshStudents();
            onClose();
        } catch (err) {
            console.error("Error updating students:", err);
            alert("Failed to assign students to batch.");
        }
    };

    const isStudentSelected = (id) => selectedStudents.find((s) => s.id === id);
    const selectedStudentObjs = noBatchStudents.filter((std) => isStudentSelected(std._id));

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                >
                    <AiOutlineClose size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Students Without Any Batch (Class {batch.forStandard})
                </h2>

                {selectedStudentObjs.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 mb-4 border-b">
                        {selectedStudentObjs.map((student) => (
                            <div key={student._id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full whitespace-nowrap">
                                {student.name}
                                <button
                                    onClick={() => handleSelectStudent(student._id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                >
                                    <AiOutlineClose size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {noBatchStudents.length > 0 ? (
                    <ul className="divide-y max-h-[50vh] overflow-y-auto">
                        {noBatchStudents.map((student) => {
                            const isSelected = isStudentSelected(student._id);
                            return (
                                <li
                                    key={student._id}
                                    className="py-3 px-4"
                                >
                                    <div
                                        onClick={() => handleSelectStudent(student._id)}
                                        className={`cursor-pointer rounded transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-800">{student.name}</span>
                                            <span className="text-sm text-gray-600">{student.school_name}</span>
                                            <span className="text-sm text-gray-600">Grade: {student.grade}</span>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="mt-2 ml-4">
                                            <p className="text-xs text-gray-600 mb-1">Select Subjects:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {batch.subject.map((subj) => (
                                                    <label
                                                        key={subj._id}
                                                        className="text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="form-checkbox"
                                                            checked={
                                                                isStudentSelected(student._id)?.subjectIds.includes(subj._id)
                                                            }
                                                            onChange={() => handleSubjectToggle(student._id, subj._id)}
                                                        />
                                                        {subj.name}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-gray-600">No students found without a batch.</p>
                )}

                {selectedStudents.length > 0 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleUpdateStudents}
                            className={`px-6 py-2 rounded-lg transition ${
                                isValidSelection()
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                            }`}
                            disabled={!isValidSelection()}
                        >
                            Assign to Batch
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddStudentModal;