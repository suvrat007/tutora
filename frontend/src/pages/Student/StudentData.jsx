import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { FiPlus, FiSearch } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import AddStudent from "./AddStudent.jsx";
import StdDataDisplay from "./StdDataDisplay.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";
import { useSelector } from "react-redux";
import useFilterStudentsBySubject from "./funtions/useFilterStudentsBySubject.js";
import { motion, AnimatePresence } from "framer-motion";
import LazyLoad from "react-lazyload";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";

const StudentData = () => {
    const [showAddStd, setShowAddStd] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("");
    const [searchName, setSearchName] = useState("");
    const [rerender, setRerender] = useState(false);
    const [seeStdDetails, setSeeStdDetails] = useState({ show: false, stdDetails: null });

    const user = useSelector((state) => state.user);
    const batches = useSelector((state) => state.batches);
    const groupedStudents = useSelector((state) => state.students.groupedStudents);
    const fetchStudents = useFetchStudents();

    useEffect(() => {
        fetchStudents();
    }, [rerender]);

    const deleteStudent = async (studentId) => {
        toast.custom((t) => (
            <div className="bg-white p-4 rounded-md shadow-lg flex flex-col gap-2">
                <p className="text-text">This will delete this student from the database. Continue?</p>
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="destructive" onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            await axiosInstance.delete(`/api/student/delete-student/${studentId}`, { withCredentials: true });
                            toast.success("Student successfully deleted.");
                            setRerender((prev) => !prev);
                            await fetchStudents();
                        } catch (error) {
                            toast.error("An error occurred while deleting the student.");
                        }
                    }}>Yes</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>No</Button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const uniqueGrades = [...new Set(batches.map((batch) => batch.forStandard))].sort();
    const uniqueSubjects = selectedBatch
        ? batches.find((batch) => batch._id === selectedBatch)?.subject.map((subj) => subj.name.toLowerCase()) || []
        : [...new Set(batches.flatMap((batch) => batch.subject.map((subj) => subj.name.toLowerCase())))].sort();

    const subjectFilteredStudents = useFilterStudentsBySubject(batches, selectedSubject, selectedBatch);

    const filteredStudents = groupedStudents
        .filter((group) => {
            if (selectedBatch && group.batchId !== selectedBatch) return false;
            if (selectedGrade && !group.students.some((student) => String(student.grade) === String(selectedGrade))) return false;
            return true;
        })
        .flatMap((group) =>
            group.students
                .filter((student) => student.name.toLowerCase().includes(searchName.toLowerCase()))
                .map((student) => ({
                    ...student,
                    batchName: batches.find((b) => b._id === group.batchId)?.name || "No Batch",
                }))
        );

    const displayStudents = selectedSubject ? subjectFilteredStudents : filteredStudents;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 flex-1 overflow-hidden bg-background"
        >
            <div className="flex flex-col md:flex-row gap-6 h-full">
                <div className="w-full md:w-[80%] h-full">
                    <div className="flex flex-col h-full bg-white rounded-2xl shadow-soft overflow-hidden border border-border">
                        <h2 className="text-2xl font-bold text-text p-6 border-b border-border bg-background">
                            All Students in <span>{user?.institute_info?.name || "Org Name"}</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 overflow-y-auto p-6">
                            <motion.li
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAddStd(true)}
                                className="w-full max-w-[12rem] h-56 cursor-pointer bg-background border border-dashed border-border shadow-soft rounded-xl p-4 flex flex-col items-center space-y-3 justify-center"
                            >
                                <FiPlus className="text-4xl text-primary" />
                                <span className="text-base font-medium text-primary">Add Student</span>
                            </motion.li>

                            <AnimatePresence>
                                {displayStudents.map((student, index) => (
                                    <LazyLoad key={student._id} height={200} offset={100} once>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.02 }}
                                            onClick={() => setSeeStdDetails({ stdDetails: student, show: true })}
                                            className="relative w-full max-w-[12rem] h-56 cursor-pointer bg-background border border-border shadow-soft rounded-xl p-4 hover:shadow-medium transition-all duration-300 flex flex-col items-center justify-center"
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteStudent(student._id);
                                                }}
                                                className="absolute top-2 right-2 text-text-light hover:text-error"
                                            >
                                                <AiOutlineClose size={20} />
                                            </button>
                                            <div className="flex flex-col items-center text-center space-y-3 mt-4">
                                                <img
                                                    src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                                    alt="Student Avatar"
                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-border"
                                                    loading="lazy"
                                                />
                                                <span className="text-base sm:text-lg font-medium text-text truncate w-full">
                                                    {student.name}
                                                </span>
                                                <span className="text-text-light text-sm truncate w-full">{student.school_name}</span>
                                                <span className="text-text-light text-sm truncate w-full">Batch: {student.batchName}</span>
                                            </div>
                                        </motion.div>
                                    </LazyLoad>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-[35%] h-full">
                    <div className="flex flex-col h-full bg-white rounded-2xl shadow-soft p-6 overflow-y-auto border border-border">
                        <h2 className="text-2xl font-bold text-text mb-6 bg-background p-4 -mx-6 -mt-6 rounded-t-2xl">Filter Students</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-text">Search by Name</label>
                                <div className="relative">
                                    <FiSearch className="absolute top-3 left-3 text-text-light" />
                                    <Input
                                        type="text"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        placeholder="Enter student name"
                                        className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text">Batch</label>
                                <select
                                    value={selectedBatch}
                                    onChange={(e) => {
                                        setSelectedBatch(e.target.value);
                                        setSelectedSubject("");
                                    }}
                                    className="w-full border border-border rounded-xl text-base p-2 text-text focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                                >
                                    <option value="">All Batches</option>
                                    {batches.map((batch) => (
                                        <option key={batch._id} value={batch._id}>
                                            {batch.name} (Class {batch.forStandard})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text">Subject</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full border border-border rounded-xl text-base p-2 text-text focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                                >
                                    <option value="">All Subjects</option>
                                    {uniqueSubjects.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text">Grade</label>
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => setSelectedGrade(e.target.value)}
                                    className="w-full border border-border rounded-xl text-base p-2 text-text focus:outline-none focus:ring-2 focus:ring-primary transition bg-background"
                                >
                                    <option value="">All Grades</option>
                                    {uniqueGrades.map((grade) => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {seeStdDetails?.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <StdDataDisplay
                                seeStdDetails={seeStdDetails}
                                setSeeStdDetails={setSeeStdDetails}
                                onStudentEdited={() => setRerender((prev) => !prev)}
                            />
                        </motion.div>
                    </motion.div>
                )}

                {showAddStd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <AddStudent
                                onStudentAdded={() => setRerender((prev) => !prev)}
                                setSeeStdDetails={setSeeStdDetails}
                                setShowAddStd={setShowAddStd}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentData;
