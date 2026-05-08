import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { FiPlus, FiSearch } from "react-icons/fi";
import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";
import { Link2, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WrapperCard from "@/components/ui/WrapperCard.jsx";
import useFetchStudents from "@/hooks/useFetchStudents.js";
import { useSelector } from "react-redux";
import useFilterStudentsBySubject from "./funtions/useFilterStudentsBySubject.js";
import StdDataDisplay from "@/pages/Student/StdDataDisplay.jsx";
import AddStudent from "@/pages/Student/AddStudent.jsx";
import PendingApprovals from "@/pages/Student/PendingApprovals.jsx";
import ConfirmationModal from "@/components/ui/ConfirmationModal.jsx";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const placeholderVariants = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const StudentData = () => {
  const [showAddStd, setShowAddStd] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [searchName, setSearchName] = useState("");
  const [seeStdDetails, setSeeStdDetails] = useState({ show: false, stdDetails: null });
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const user = useSelector((state) => state.user);

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/register/${user?._id}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      toast.success('Registration link copied!');
      setTimeout(() => setLinkCopied(false), 2500);
    }).catch(() => toast.error('Could not copy link'));
  };
  const batches = useSelector((state) => state.batches);
  const groupedStudents = useSelector((state) => state.students.groupedStudents);
  const fetchStudents = useFetchStudents();

  const handleStudentAdded = () => {};
  const handleStudentEdited = () => {};

  const deleteAllInBatch = async () => {
    if (!selectedBatch) return;
    setIsDeletingAll(true);
    try {
      await axiosInstance.delete(`student/delete-all-by-batch/${selectedBatch}`, { withCredentials: true });
      toast.success("All students in this batch deleted.");
      await fetchStudents();
      setSelectedBatch("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete students.");
    } finally {
      setIsDeletingAll(false);
      setShowDeleteAllModal(false);
    }
  };

  const deleteStudent = async (studentId) => {
    if (isDeleting) return; // Prevent multiple delete requests

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`student/delete-student/${studentId}`, {
        withCredentials: true,
      });

      toast.success("Student successfully deleted.");

      // Refresh the student data
      await fetchStudents();

      // Close the student details if the deleted student was being viewed
      setSeeStdDetails(prev => {
        if (prev.stdDetails?._id === studentId) {
          return { show: false, stdDetails: null };
        }
        return prev;
      });

    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "An error occurred while deleting the student.");
    } finally {
      setIsDeleting(false);
      setStudentToDelete(null);
    }
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
              .filter((student) => {
                if (!searchName) return true;
                const term = searchName.toLowerCase();
                return (
                  student.name.toLowerCase().includes(term) ||
                  student.contact_info?.phoneNumbers?.student?.includes(searchName) ||
                  student.contact_info?.phoneNumbers?.mom?.includes(searchName) ||
                  student.contact_info?.phoneNumbers?.dad?.includes(searchName)
                );
              })
              .map((student) => ({
                ...student,
                batchName: batches.find((b) => b._id === group.batchId)?.name || "No Batch",
              }))
      );

  const displayStudents = selectedSubject ? subjectFilteredStudents : filteredStudents;

  return (
      <>
        <div className="w-full flex flex-col gap-4 h-full p-4 mx-auto overflow-y-auto">
          {/* Pending student registrations */}
          <PendingApprovals />

          {/* Main content: student grid + filters */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 flex-1 min-h-0">
          {/* Students List */}
          <div className="w-full lg:w-2/3">
            <WrapperCard>
              <div className="flex flex-col h-full bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-[#e6c8a8] bg-[#f0d9c0] flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#5a4a3c] min-w-0">
                    All Students in <span className="break-words">{user?.institute_info?.name || "Org Name"}</span>
                  </h2>
                  <button
                    onClick={copyRegistrationLink}
                    title="Copy student registration link"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#e6c8a8] bg-white text-[#5a4a3c] hover:bg-[#f0d9c0] transition-colors flex-shrink-0"
                  >
                    {linkCopied ? (
                      <><Check className="w-3.5 h-3.5 text-green-600" /> Copied!</>
                    ) : (
                      <><Link2 className="w-3.5 h-3.5" /> Share Registration Link</>
                    )}
                  </button>
                </div>
                {displayStudents.length === 0 ? (
                    <motion.div
                        variants={placeholderVariants}
                        animate="pulse"
                        onClick={() => setShowAddStd(true)}
                        className="flex flex-col items-center justify-center flex-1 min-h-0 text-[#7b5c4b] cursor-pointer hover:bg-[#f0d9c0] transition-colors rounded-lg m-4"
                    >
                      <FiPlus className="text-4xl sm:text-5xl text-[#e0c4a8] mb-4" />
                      <p className="text-sm sm:text-base text-center">No students found. Adjust filters or </p>
                      <p className="text-sm sm:text-base text-center font-medium">Click here to add a new student</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 p-3 sm:p-4 overflow-y-auto flex-1 min-h-0">
                      <motion.div
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          onClick={() => setShowAddStd(true)}
                          className="w-full max-w-[12rem] h-48 sm:h-56 cursor-pointer bg-[#f8ede3] border border-dashed border-[#e6c8a8] shadow-md rounded-xl p-3 sm:p-4 flex flex-col items-center space-y-2 sm:space-y-3 hover:shadow-lg hover:scale-105 transition-all duration-300 justify-center mx-auto"
                      >
                        <FiPlus className="text-3xl sm:text-4xl text-[#e0c4a8]" />
                        <span className="text-sm sm:text-base font-medium text-[#5a4a3c]">Add Student</span>
                      </motion.div>
                      <AnimatePresence>
                        {displayStudents.map((student, index) => (
                            <motion.div
                                key={student._id}
                                custom={index}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                onClick={() => setSeeStdDetails({ stdDetails: student, show: true })}
                                className="relative w-full max-w-[12rem] h-48 sm:h-56 cursor-pointer bg-[#f8ede3] border border-[#e6c8a8] shadow-md rounded-xl p-3 sm:p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center justify-between mx-auto overflow-hidden"
                            >
                              <motion.button
                                  whileHover={{ scale: 1.1, color: "#FF3B30" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStudentToDelete(student._id);
                                  }}
                                  disabled={isDeleting}
                                  className="absolute top-2 right-2 text-[#e0c4a8] hover:text-[#FF3B30] transition disabled:opacity-50 z-10"
                                  aria-label="Delete Student"
                              >
                                <AiOutlineClose className="w-4 h-4 sm:w-5 sm:h-5" />
                              </motion.button>

                              <div className="flex flex-col items-center text-center space-y-2 mt-6 min-w-0 w-full">
                                <motion.img
                                    src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                    alt="Student Avatar"
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border border-[#e6c8a8] flex-shrink-0"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    loading="lazy"
                                />

                                <div className="w-full min-w-0 space-y-1">
                                  <div
                                      className="text-sm sm:text-base font-medium text-[#5a4a3c] w-full overflow-hidden"
                                      title={student.name}
                                  >
                                    <div className="truncate px-1">
                                      {student.name}
                                    </div>
                                  </div>

                                  <div
                                      className="text-xs sm:text-sm text-[#7b5c4b] w-full overflow-hidden"
                                      title={student.school_name}
                                  >
                                    <div className="truncate px-1">
                                      {student.school_name}
                                    </div>
                                  </div>

                                  <div
                                      className="text-xs sm:text-sm text-[#7b5c4b] w-full overflow-hidden"
                                      title={`Batch: ${student.batchName}`}
                                  >
                                    <div className="truncate px-1">
                                      Batch: {student.batchName}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                )}
              </div>
            </WrapperCard>
          </div>

          {/* Filters */}
          <div className="w-full lg:w-1/3">
            <WrapperCard>
              <div className="relative flex flex-col h-full bg-[#f8ede3] rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                <div className="text-xl sm:text-2xl font-bold text-[#5a4a3c] bg-[#f0d9c0] p-4 sm:p-6 rounded-t-3xl border-b border-[#e6c8a8]">
                  <h2>Filter Students</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 sm:p-4 overflow-y-auto items-end">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-[#5a4a3c] mb-1">Search by name or phone</label>
                    <div className="relative">
                      <FiSearch className="absolute top-1/2 -translate-y-1/2 left-3 text-[#e0c4a8] w-4 h-4" />
                      <input
                          type="text"
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                          placeholder="Name or phone number"
                          className="w-full pl-9 pr-3 py-2.5 border border-[#e6c8a8] bg-white rounded-full text-sm text-[#5a4a3c] focus:outline-none focus:ring-2 focus:ring-[#e0c4a8] transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#5a4a3c] mb-1">Batch</label>
                    <Dropdown
                        value={selectedBatch}
                        onChange={(e) => {
                          setSelectedBatch(e.target.value);
                          setSelectedSubject("");
                        }}
                        options={[
                            { label: "All Batches", value: "" },
                            ...batches.map(b => ({ label: `${b.name} (Class ${b.forStandard})`, value: b._id }))
                        ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#5a4a3c] mb-1">Subject</label>
                    <Dropdown
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        options={[
                            { label: "All Subjects", value: "" },
                            ...uniqueSubjects.map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))
                        ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-[#5a4a3c] mb-1">Grade</label>
                    <Dropdown
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        options={[
                            { label: "All Grades", value: "" },
                            ...uniqueGrades.map(g => ({ label: `Class ${g}`, value: g }))
                        ]}
                    />
                  </div>
                </div>

                {/* Delete all students in selected batch */}
                {selectedBatch && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <button
                      onClick={() => setShowDeleteAllModal(true)}
                      disabled={isDeletingAll}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete All Students in {batches.find(b => b._id === selectedBatch)?.name || 'Batch'}
                    </button>
                  </div>
                )}

                {/* Student Details Overlay */}
                {seeStdDetails?.show && (
                    <div className="absolute inset-0 z-50 p-3 sm:p-4 bg-[#f8ede3] rounded-3xl overflow-y-auto shadow-xl">
                      <StdDataDisplay
                          seeStdDetails={seeStdDetails}
                          setSeeStdDetails={setSeeStdDetails}
                          onStudentEdited={handleStudentEdited}
                      />
                    </div>
                )}
              </div>
            </WrapperCard>
          </div>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddStd && (
            <AddStudent
                onStudentAdded={handleStudentAdded}
                setSeeStdDetails={setSeeStdDetails}
                setShowAddStd={setShowAddStd}
            />
        )}

        {/* Delete single student */}
        {studentToDelete && (
            <ConfirmationModal
                message="This will delete this student from the database. This action cannot be undone. Continue?"
                onConfirm={() => deleteStudent(studentToDelete)}
                onCancel={() => setStudentToDelete(null)}
                isLoading={isDeleting}
            />
        )}

        {/* Delete all students in batch */}
        {showDeleteAllModal && (
            <ConfirmationModal
                message={`This will permanently delete ALL students in "${batches.find(b => b._id === selectedBatch)?.name}". This cannot be undone. Continue?`}
                onConfirm={deleteAllInBatch}
                onCancel={() => setShowDeleteAllModal(false)}
                isLoading={isDeletingAll}
            />
        )}
      </>
  );
};

export default StudentData;