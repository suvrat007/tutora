import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { FiPlus } from "react-icons/fi";
import AddStudent from "./AddStudent.jsx";
import StdDataDisplay from "./StdDataDisplay.jsx";
import { AiOutlineClose } from "react-icons/ai";
import useFetchStudents from "@/pages/useFetchStudents.js";
import { useSelector } from "react-redux";
import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import useFilterStudentsBySubject from "./funtions/useFilterStudentsBySubject.js"

const WrapperCard = ({ children }) => (
    <div className="relative bg-[#f3d8b6] rounded-3xl shadow-lg p-2 flex flex-1 justify-center items-center h-full">
      <div className="w-full h-full">{children}</div>
    </div>
);

const StudentData = () => {
  const [showAddStd, setShowAddStd] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
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
  const uniqueSubjects = [
    ...new Set(batches.flatMap((batch) => batch.subject.map((subj) => subj.name.toLowerCase()))),
  ].sort();

  const subjectFilteredStudents = useFilterStudentsBySubject(batches, selectedSubject);

  const filteredStudents = groupedStudents
      .filter((group) => {
        if (selectedBatch && group.batchId !== selectedBatch) return false;
        if ( selectedGrade && !group.students.some((student) => String(student.grade) === String(selectedGrade))) return false;
        return true;
      })
      .flatMap((group) =>
          group.students.map((student) => ({
            ...student,
            batchName: batches.find((b) => b._id === group.batchId)?.name || "No Batch",
          }))
      );

  const displayStudents = selectedSubject ? subjectFilteredStudents : filteredStudents;

  return (
      <>
        <div className="flex flex-col gap-4 p-6 flex-1 overflow-hidden">
          <div className="flex gap-4 h-full">
            <div className="w-[65%] h-full">
              <WrapperCard>
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden">
                  <h2 className="text-xl font-bold text-gray-800 p-4 border-b">
                    All Students in <span>{user?.institute_info?.name || "Org Name"}</span>
                  </h2>
                  <div className="flex flex-wrap gap-4 overflow-y-auto p-4 justify-center">
                    {/* Add Student Card */}
                    <li
                        onClick={() => setShowAddStd(true)}
                        className="w-[12em] h-[15em] cursor-pointer bg-[#fff8f1] border border-dashed border-gray-400 shadow-md rounded-2xl p-4 flex flex-col items-center space-y-2 hover:shadow-xl transition-shadow duration-300 justify-center"
                    >
                      <FiPlus className="text-3xl text-gray-600" />
                      <span className="text-base font-medium text-gray-700">Add Student</span>
                    </li>

                    {/* Student Cards */}
                    {displayStudents.map((student) => (
                        <div
                            key={student._id}
                            onClick={() => setSeeStdDetails({ stdDetails: student, show: true })}
                            className="relative w-[12em] h-[15em] cursor-pointer hover:underline bg-[#fff8f1] border shadow-md rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center"
                        >
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteStudent(student._id);
                              }}
                              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition"
                          >
                            <AiOutlineClose size={20} />
                          </button>
                          <div className="flex flex-col items-center text-center space-y-2 mt-4">
                            <img
                                src="https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                                alt="Student Avatar"
                                className="w-20 h-20 rounded-full object-cover border"
                            />
                            <span className="text-lg font-medium text-gray-800">{student.name}</span>
                            <span className="text-gray-600 text-sm">{student.school_name}</span>
                            <span className="text-gray-600 text-sm">Batch: {student.batchName}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              </WrapperCard>
            </div>

            <div className="w-[35%] h-full">
              <WrapperCard>
                <div className="flex flex-col h-full bg-white rounded-2xl shadow-md p-6 overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Filter Students</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Batch</label>
                      <select
                          value={selectedBatch}
                          onChange={(e) => {
                            setSelectedBatch(e.target.value);
                            setSelectedSubject(""); // clear subject filter if batch is changed
                          }}
                          className="w-full border-2 rounded-2xl text-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c69d74]"
                      >
                        <option value="">All Batches</option>
                        {batches.map((batch) => (
                            <option key={batch._id} value={batch._id}>
                              {batch.name}
                            </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <select
                          value={selectedSubject}
                          onChange={(e) => {
                            setSelectedSubject(e.target.value);
                            setSelectedBatch(""); // clear batch filter if subject is selected
                          }}
                          className="w-full border-2 rounded-2xl text-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c69d74]"
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
                      <label className="text-sm font-medium text-gray-700">Grade</label>
                      <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="w-full border-2 rounded-2xl text-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#c69d74]"
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
                      <div className="mt-4">
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
        )}</>
  );
};

export default StudentData;
