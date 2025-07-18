import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { FiPlus, FiSearch } from "react-icons/fi";
import { AiOutlineClose } from "react-icons/ai";
import AddStudent from "./AddStudent.jsx";
import StdDataDisplay from "./StdDataDisplay.jsx";
import useFetchStudents from "@/pages/useFetchStudents.js";
import { useSelector } from "react-redux";
import useFilterStudentsBySubject from "./funtions/useFilterStudentsBySubject.js";
import WrapperCard from "@/utilities/WrapperCard.jsx";

import { motion, AnimatePresence } from "framer-motion";

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
    const confirmDelete = window.confirm("This will delete this student from the database. Continue?");
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/api/student/delete-student/${studentId}`, {
        withCredentials: true,
      });
      alert("Student successfully deleted.");
      setRerender((prev) => !prev);
      await fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("An error occurred while deleting the student.");
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
              .filter((student) => student.name.toLowerCase().includes(searchName.toLowerCase()))
              .map((student) => ({
                ...student,
                batchName: batches.find((b) => b._id === group.batchId)?.name || "No Batch",
              }))
      );

  const displayStudents = selectedSubject ? subjectFilteredStudents : filteredStudents;

  // Animation variants for student cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
      <>
        <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 flex-1 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left Side: Student Cards */}
            <div className="w-full md:w-[80%] h-full">
              <WrapperCard>
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border border-[#e7c6a5]/50">
                  <h2 className="text-2xl font-bold text-[#4a3a2c] p-6 border-b bg-[#f5e8dc]">
                    All Students in <span>{user?.institute_info?.name || "Org Name"}</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 overflow-y-auto p-6">
                    <li
                        onClick={() => setShowAddStd(true)}
                        className="w-full max-w-[12rem] h-56 cursor-pointer bg-[#fdf5ec] border border-dashed border-[#e7c6a5]/50 shadow-md rounded-xl p-4 flex flex-col items-center space-y-3 hover:shadow-xl hover:scale-105 transition-all duration-300 justify-center"
                    >
                      <FiPlus className="text-4xl text-[#4a3a2c]" />
                      <span className="text-base font-medium text-[#4a3a2c]">Add Student</span>
                    </li>

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
                              className="relative w-full max-w-[12rem] h-56 cursor-pointer bg-[#fdf5ec] border border-[#e7c6a5]/50 shadow-md rounded-xl p-4 hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center"
                          >
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStudent(student._id);
                                }}
                                className="absolute top-2 right-2 text-[#9b8778] hover:text-[#4a3a2c] transition"
                                aria-label="Delete Student"
                            >
                              <AiOutlineClose size={20} />
                            </button>
                            <div className="flex flex-col items-center text-center space-y-3 mt-4">
                              <img
                                  src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                  alt="Student Avatar"
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-[#e7c6a5]/50"
                                  loading="lazy"
                              />
                              <span className="text-base sm:text-lg font-medium text-[#4a3a2c] truncate w-full">
                            {student.name}
                          </span>
                              <span className="text-[#9b8778] text-sm truncate w-full">{student.school_name}</span>
                              <span className="text-[#9b8778] text-sm truncate w-full">Batch: {student.batchName}</span>
                            </div>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </WrapperCard>
            </div>

            <div className="w-full md:w-[35%] h-full">
              <WrapperCard>
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg p-6 overflow-y-auto border border-[#e7c6a5]/50">
                  <h2 className="text-2xl font-bold text-[#4a3a2c] mb-6 bg-[#f5e8dc] p-4 rounded-t-lg">Filter Students</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#4a3a2c]">Search by Name</label>
                      <div className="relative">
                        <FiSearch className="absolute top-3 left-3 text-[#9b8778]" />
                        <input
                            type="text"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            placeholder="Enter student name"
                            className="w-full pl-10 pr-4 py-2 border-2 border-[#e7c6a5]/50 rounded-xl text-[#4a3a2c] text-lg focus:outline-none focus:ring-2 focus:ring-[#e7c6a5] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#4a3a2c]">Batch</label>
                      <select
                          value={selectedBatch}
                          onChange={(e) => {
                            setSelectedBatch(e.target.value);
                            setSelectedSubject("");
                          }}
                          className="w-full border-2 border-[#e7c6a5]/50 rounded-xl text-lg p-2 text-[#4a3a2c] focus:outline-none focus:ring-2 focus:ring-[#e7c6a5] transition"
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
                      <label className="text-sm font-medium text-[#4a3a2c]">Subject</label>
                      <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full border-2 border-[#e7c6a5]/50 rounded-xl text-lg p-2 text-[#4a3a2c] focus:outline-none focus:ring-2 focus:ring-[#e7c6a5] transition"
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
                      <label className="text-sm font-medium text-[#4a3a2c]">Grade</label>
                      <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="w-full border-2 border-[#e7c6a5]/50 rounded-xl text-lg p-2 text-[#4a3a2c] focus:outline-none focus:ring-2 focus:ring-[#e7c6a5] transition"
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

                  {seeStdDetails?.show && (
                      <div className="mt-6">
                        <StdDataDisplay
                            seeStdDetails={seeStdDetails}
                            setSeeStdDetails={setSeeStdDetails}
                            onStudentEdited={() => setRerender((prev) => !prev)}
                        />
                      </div>
                  )}
                </div>
              </WrapperCard>
            </div>
          </div>
        </div>

        {showAddStd && (
            <AddStudent
                onStudentAdded={() => setRerender((prev) => !prev)}
                setSeeStdDetails={setSeeStdDetails}
                setShowAddStd={setShowAddStd}
            />
        )}
      </>
  );
};

export default StudentData;
