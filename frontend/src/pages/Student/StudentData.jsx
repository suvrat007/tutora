import SideBar from "../Navbar/SideBar.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import { useState, useEffect } from "react";
import axiosInstance from "../../utilities/axiosInstance.jsx";
import { FiPlus } from "react-icons/fi";
import useGetBatchId from "./funtions/useGetBatchId.js";
import AddStudent from "./AddStudent.jsx";
import StdDataDisplay from "./StdDataDisplay.jsx";
import { AiOutlineClose } from "react-icons/ai";
import useFetchStudents from "@/pages/useFetchStudents.js";
import {useDispatch, useSelector} from "react-redux";

const WrapperCard = ({ children }) => (
  <div className="relative bg-[#f3d8b6] rounded-3xl shadow-lg p-2 flex flex-1 justify-center items-center h-full">
    <div className="w-full h-full">{children}</div>
  </div>
);

const StudentData = () => {
  const [showAddStd, setShowAddStd] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [formTouched, setFormTouched] = useState(false);
  const [seeStdDetails, setSeeStdDetails] = useState(null);
  const [rerender, setRerender] = useState(false);

  const { batchId, orgName } = useGetBatchId(batchName);

  const fetchStudents = async () => {
    setFormTouched(true);
    setError("");
    if (!batchName) {
      setError("Batch name is required to fetch students.");
      return;
    }
    try {
      const response = await axiosInstance.get(`/get-all-students-of-batch/${batchId}`);
      setStudents(response.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students. Try again.");
    }
  };

  const deleteStudent = async (studentId) => {
    const confirmDelete = window.confirm("This will delete this student from the database. Continue?");
    if (!confirmDelete) return;
    try {
      const response = await axiosInstance.delete(`/delete-student/${studentId}`);
      if (response.status !== 200) throw new Error("Failed to delete student");
      alert("Student successfully deleted.");
      setRerender(prev => !prev);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("An error occurred while deleting the student.");
    }
  };

  const std = useSelector(state => state.students)
  setStudents(std)

  return (
    <div className="min-h-screen w-screen bg-[#d3a781] text-white flex justify-center items-start overflow-hidden">
      <div className="bg-[#fee5cf] relative w-full min-h-[95vh] rounded-[2rem] border border-[#e0b890] shadow-2xl overflow-hidden flex mx-2 my-4">
        <SideBar />
        <div className="flex flex-col w-full overflow-hidden">
          <Navbar />
          <div className="flex flex-col gap-4 p-6 flex-1 overflow-hidden">
            <div className="flex gap-4 h-full">
              {/* Left 65% */}
              <div className="w-[65%] h-full">
                <WrapperCard>
                  <div className="flex flex-col h-full bg-white rounded-2xl shadow-md overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-800 p-4 border-b">
                      All Students in <span>{orgName || "Org Name"}</span>
                    </h2>
                    <div className="flex flex-wrap gap-4 overflow-y-auto p-4 justify-center">
                      <li
                        onClick={() => setShowAddStd(prev => !prev)}
                        className="w-[12em] h-[15em] cursor-pointer bg-[#fff8f1] border border-dashed border-gray-400
                          shadow-md rounded-2xl p-4 flex flex-col items-center space-y-2 hover:shadow-xl
                          transition-shadow duration-300 justify-center"
                      >
                        <FiPlus className="text-3xl text-gray-600" />
                        <span className="text-base font-medium text-gray-700">Add Student</span>
                      </li>
                      {students.map((student, index) => (
                        <div
                          key={student._id}
                          onClick={() => setSeeStdDetails({ stdDetails: student, show: true })}
                          className="relative w-[12em] h-[15em] cursor-pointer hover:underline bg-[#fff8f1] border
                          shadow-md rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300 flex flex-col
                          items-center justify-center"
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
                            <span className="text-gray-500 text-sm font-semibold">#{index + 1}</span>
                            <span className="text-lg font-medium text-gray-800">{student.name}</span>
                            <span className="text-gray-600 text-sm">{student.school_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </WrapperCard>
              </div>

              {/* Right 35% */}
              <div className="w-[35%] h-full">
                <WrapperCard>
                  <div className="flex flex-col h-full bg-white rounded-2xl shadow-md p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Students by Batch</h2>
                    <input
                      type="text"
                      placeholder="Enter Batch Name"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="border-2 rounded-2xl text-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#c69d74]"
                    />
                    {formTouched && !batchName && <p className="text-red-500">Batch is required.</p>}
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button
                      className="bg-[#c69d74] text-white px-4 py-2 rounded-lg hover:bg-[#ae835d] transition mt-2"
                      onClick={fetchStudents}
                    >
                      Search
                    </button>

                    {seeStdDetails?.show && (
                      <div className="mt-4">
                        <StdDataDisplay
                          seeStdDetails={seeStdDetails}
                          setSeeStdDetails={setSeeStdDetails}
                          onStudentEdited={() => setRerender(prev => !prev)}
                        />
                      </div>
                    )}
                  </div>
                </WrapperCard>
              </div>
            </div>
          </div>
        </div>

        {showAddStd && (
          <AddStudent
            batchId={batchId}
            onStudentAdded={() => {
              fetchStudents();
              setRerender(prev => !prev);
            }}
            setShowAddStd={setShowAddStd}
          />
        )}
      </div>
    </div>
  );
};

export default StudentData;
