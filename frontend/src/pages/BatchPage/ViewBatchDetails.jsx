import { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import useFetchStudents from "@/pages/useFetchStudents.js";
import { BookOpen, Users, FileText, IndianRupee } from "lucide-react";
import { AiOutlineClose, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import CreateEditBatch from "@/pages/BatchPage/CreateEditBatch.jsx";
import AddStudentModal from "@/pages/BatchPage/AddStudentModal.jsx";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
    }),
};

const placeholderVariants = {
    pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
};

const ViewBatchDetails = ({ viewDetails, setViewDetails, setRerender }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [students, setStudents] = useState(viewDetails.studentsForBatch);
    const fetchStudents = useFetchStudents();
    const batch = viewDetails.batch;

    const handleCloseDetails = () => {
        setViewDetails({ display: false, batch: null, studentsForBatch: null });
    };

    const handleEditBatch = () => {
        setShowEditModal(true);
    };

    const handleBatchUpdated = () => {
        setRerender((prev) => !prev);
        setShowEditModal(false);
    };

    const refreshStudents = async () => {
        await fetchStudents();
        const newGrouped = useSelector((state) => state.students.groupedStudents);
        const foundGroup = newGrouped.find((group) => group.batchId === batch._id);
        if (foundGroup) setStudents(foundGroup.students || []);
    };

    const getTotalFee = () =>
        students.reduce((sum, student) => sum + (student.fee_status.amount || 0), 0);

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="rounded-3xl  shadow-[0_8px_24px_rgba(0,0,0,0.15)] bg-[#f8ede3] flex flex-col h-auto min-h-[200px] sm:h-full"
        >
            <div className="rounded-t-3xl px-4 sm:px-6 py-4 border-b border-[#e6c8a8] bg-[#f0d9c0]">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#5a4a3c] text-wrap pr-4">
                            {batch.name}
                        </h1>
                    </div>
                    <div className="flex flex-wrap justify-end sm:flex-row gap-2 w-full sm:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddStudentModal(true)}
                            className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] hover:bg-[#34C759] hover:text-white transition min-w-[120px] h-10"
                        >
                            <AiOutlinePlus className="text-lg" />
                            Add Students
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEditBatch}
                            className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] hover:bg-[#e0c4a8] transition min-w-[120px] h-10"
                        >
                            <AiOutlineEdit className="text-lg" />
                            Edit
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCloseDetails}
                            className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg border border-[#e6c8a8] text-sm text-[#5a4a3c] hover:bg-[#FF3B30] hover:text-white transition min-w-[120px] h-10"
                        >
                            <AiOutlineClose className="text-lg" />
                            Go Back
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col lg:flex-row gap-4 p-4 sm:pb-0 h-auto lg:h-[40em] min-h-[150px]">
                {/* Batch Details */}
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="show"
                    className="flex-1 border border-[#e6c8a8] rounded-xl shadow-sm bg-[#f8ede3] flex flex-col h-auto max-h-[200px] sm:max-h-[250px] lg:h-full"
                >
                    <div className="bg-[#f0d9c0] p-4 border-b border-[#e6c8a8] flex-shrink-0">
                        <h2 className="text-lg font-semibold text-[#5a4a3c]">Batch Details</h2>
                    </div>
                    <div className="p-4 text-sm text-[#7b5c4b] space-y-3 overflow-y-auto flex-grow">
                        <p className="flex items-center gap-2">
                            <BookOpen className="text-[#e0c4a8] w-5 h-5 flex-shrink-0" />
                            <span><b>For Class:</b> {batch.forStandard}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <Users className="text-[#e0c4a8] w-5 h-5 flex-shrink-0" />
                            <span><b>Total Students:</b> {students.length}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <FileText className="text-[#e0c4a8] w-5 h-5 flex-shrink-0" />
                            <span><b>Total Subjects:</b> {batch.subject.length}</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <IndianRupee className="text-[#e0c4a8] w-5 h-5 flex-shrink-0" />
                            <span><b>Total Fee:</b> ₹{getTotalFee()}</span>
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="show"
                    className="flex-1 border border-[#e6c8a8] rounded-xl shadow-sm bg-[#f8ede3] flex flex-col h-auto max-h-[200px] sm:max-h-[250px] lg:h-full"
                >
                    <div className="bg-[#f0d9c0] p-4 border-b border-[#e6c8a8] flex-shrink-0">
                        <h2 className="text-lg font-semibold text-[#5a4a3c]">Subjects & Schedule</h2>
                    </div>
                    <div className="p-4 space-y-4 text-sm text-[#7b5c4b] overflow-y-auto flex-grow">
                        {batch.subject.length > 0 ? (
                            batch.subject.map((subj, index) => (
                                <motion.div
                                    key={subj._id}
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="show"
                                    className="border-b border-[#e6c8a8] pb-3 last:border-b-0"
                                >
                                    <div className="font-medium text-[#5a4a3c]">{index + 1}. {subj.name.toUpperCase()}</div>
                                    <div className="ml-4 text-xs">
                                        🕒 {subj.classSchedule?.time || "N/A"}<br />
                                        📅 {subj.classSchedule?.days?.join(", ") || "No days set"}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                variants={placeholderVariants}
                                animate="pulse"
                                className="text-center py-8 overflow-hidden"
                            >
                                <FileText className="text-5xl mx-auto text-[#e0c4a8] mb-4" />
                                <p>No subjects added yet.</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Students Table */}
            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="show"
                className="m-4 mt-0 sm:mt-4 border border-[#e6c8a8] rounded-xl shadow-sm bg-[#f8ede3] flex flex-col h-auto max-h-[240px] sm:max-h-[300px] lg:h-[30vh]"
            >
                <div className="bg-[#f0d9c0] rounded-t-xl p-4 border-b border-[#e6c8a8] flex-shrink-0">
                    <h2 className="text-lg font-semibold text-[#5a4a3c]">Students</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {students.length === 0 ? (
                        <motion.div
                            variants={placeholderVariants}
                            animate="pulse"
                            className="text-[#7b5c4b] text-sm p-6 text-center overflow-hidden"
                        >
                            <Users className="text-6xl text-[#e0c4a8] mb-4 mx-auto" />
                            <p>No students enrolled yet.</p>
                        </motion.div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-[#5a4a3c] min-w-0 border-collapse">
                                <thead className="bg-[#f0d9c0] text-xs uppercase text-[#7b5c4b] sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-3 w-12 text-center border-b border-[#e6c8a8]">#</th>
                                    <th className="px-3 py-3 min-w-[120px] border-b border-[#e6c8a8]">Name</th>
                                    <th className="px-3 py-3 w-20 text-center border-b border-[#e6c8a8] hidden sm:table-cell">Grade</th>
                                    <th className="px-3 py-3 min-w-[150px] border-b border-[#e6c8a8] hidden sm:table-cell">School</th>
                                    <th className="px-3 py-3 min-w-[120px] border-b border-[#e6c8a8] hidden sm:table-cell">Admission Date</th>
                                    <th className="px-3 py-3 min-w-[200px] border-b border-[#e6c8a8] hidden sm:table-cell">Address</th>
                                </tr>
                                </thead>
                                <tbody>
                                <AnimatePresence>
                                    {students.map((student, index) => (
                                        <motion.tr
                                            key={student._id}
                                            custom={index}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            className="border-b border-[#e6c8a8] hover:bg-[#f0d9c0] transition"
                                        >
                                            <td className="px-3 py-3 w-12 text-center">{index + 1}</td>
                                            <td className="px-3 py-3 font-medium text-wrap min-w-[120px]">
                                                <div className="max-w-[120px] truncate" title={student.name}>
                                                    {student.name}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center hidden sm:table-cell">{student.grade}th</td>
                                            <td className="px-3 py-3 hidden sm:table-cell text-wrap">
                                                <div className="max-w-[150px] truncate" title={student.school_name}>
                                                    {student.school_name}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 hidden sm:table-cell">
                                                {new Date(student.admission_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 py-3 hidden sm:table-cell text-wrap">
                                                <div className="max-w-[200px] truncate" title={student.address}>
                                                    {student.address}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Modals */}
            {showEditModal && (
                <CreateEditBatch
                    onClose={() => setShowEditModal(false)}
                    onBatchUpdated={handleBatchUpdated}
                    setRerender={setRerender}
                    batchToEdit={batch}
                />
            )}
            {showAddStudentModal && (
                <AddStudentModal
                    batch={batch}
                    onClose={() => setShowAddStudentModal(false)}
                    setRerender={setRerender}
                    refreshStudents={refreshStudents}
                />
            )}
        </motion.div>
    );
};

export default ViewBatchDetails;